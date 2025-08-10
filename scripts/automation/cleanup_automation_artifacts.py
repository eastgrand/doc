#!/usr/bin/env python3
"""
Cleanup Automation Artifacts
Remove intermediate and temporary files created during automation pipeline
while preserving important results.
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime, timedelta
import argparse
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class AutomationCleanup:
    def __init__(self, dry_run=False, keep_days=7):
        """
        Initialize cleanup utility
        
        Args:
            dry_run: If True, only show what would be deleted
            keep_days: Keep project folders newer than this many days
        """
        self.dry_run = dry_run
        self.keep_days = keep_days
        self.project_root = Path("/Users/voldeck/code/mpiq-ai-chat")
        self.total_size_freed = 0
        self.files_deleted = 0
        self.dirs_deleted = 0
        
    def get_size(self, path):
        """Get size of file or directory in bytes"""
        if path.is_file():
            return path.stat().st_size
        elif path.is_dir():
            total = 0
            for item in path.rglob('*'):
                if item.is_file():
                    total += item.stat().st_size
            return total
        return 0
    
    def format_size(self, bytes):
        """Format bytes to human readable size"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024.0:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.1f} TB"
    
    def should_keep_project(self, project_dir):
        """Determine if project directory should be kept"""
        # Always keep the latest project
        if project_dir.name.endswith('_v3') or project_dir.name == 'HRB':
            return True
            
        # Check age
        try:
            mtime = datetime.fromtimestamp(project_dir.stat().st_mtime)
            age = datetime.now() - mtime
            return age.days < self.keep_days
        except:
            return True  # Keep if we can't determine age
    
    def cleanup_projects(self):
        """Clean up old project directories"""
        logger.info("🗂️  Cleaning up project directories...")
        
        projects_dir = self.project_root / "projects"
        if not projects_dir.exists():
            return
            
        for project_dir in projects_dir.iterdir():
            if not project_dir.is_dir():
                continue
                
            if self.should_keep_project(project_dir):
                logger.info(f"   ✅ Keeping: {project_dir.name}")
            else:
                size = self.get_size(project_dir)
                if self.dry_run:
                    logger.info(f"   🗑️  Would delete: {project_dir.name} ({self.format_size(size)})")
                    self.total_size_freed += size
                    self.dirs_deleted += 1
                else:
                    logger.info(f"   🗑️  Deleting: {project_dir.name} ({self.format_size(size)})")
                    shutil.rmtree(project_dir)
                    self.total_size_freed += size
                    self.dirs_deleted += 1
    
    def cleanup_intermediate_endpoints(self):
        """Clean up intermediate endpoint files"""
        logger.info("\n📊 Cleaning up intermediate endpoints...")
        
        # Clean automation/generated_endpoints directory
        gen_endpoints_dir = self.project_root / "scripts" / "automation" / "generated_endpoints"
        if gen_endpoints_dir.exists():
            # Keep deployment_ready directory but clean individual files
            for file in gen_endpoints_dir.glob("*.json"):
                # Skip important summary files
                if file.name in ['comprehensive_generation_summary.json', 'scoring_results.json']:
                    logger.info(f"   ✅ Keeping: {file.name}")
                    continue
                    
                size = self.get_size(file)
                if self.dry_run:
                    logger.info(f"   🗑️  Would delete: {file.name} ({self.format_size(size)})")
                    self.total_size_freed += size
                    self.files_deleted += 1
                else:
                    logger.info(f"   🗑️  Deleting: {file.name} ({self.format_size(size)})")
                    file.unlink()
                    self.total_size_freed += size
                    self.files_deleted += 1
            
            # Clean upload script if exists
            upload_script = gen_endpoints_dir / "upload_endpoints.sh"
            if upload_script.exists():
                size = self.get_size(upload_script)
                if not self.dry_run:
                    upload_script.unlink()
                    self.total_size_freed += size
                    self.files_deleted += 1
    
    def cleanup_duplicate_endpoints(self):
        """Clean up duplicate endpoint files in scoring directory"""
        logger.info("\n🔄 Cleaning up duplicate endpoints in scoring...")
        
        scoring_dir = self.project_root / "scripts" / "scoring"
        if scoring_dir.exists():
            for file in scoring_dir.glob("*.json"):
                size = self.get_size(file)
                if self.dry_run:
                    logger.info(f"   🗑️  Would delete: {file.name} ({self.format_size(size)})")
                    self.total_size_freed += size
                    self.files_deleted += 1
                else:
                    logger.info(f"   🗑️  Deleting: {file.name} ({self.format_size(size)})")
                    file.unlink()
                    self.total_size_freed += size
                    self.files_deleted += 1
    
    def cleanup_backups(self):
        """Clean up old backup files"""
        logger.info("\n💾 Cleaning up old backups...")
        
        # Clean .backup files older than keep_days
        for backup_file in self.project_root.rglob("*.backup"):
            try:
                mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
                age = datetime.now() - mtime
                if age.days > self.keep_days:
                    size = self.get_size(backup_file)
                    if self.dry_run:
                        logger.info(f"   🗑️  Would delete: {backup_file.name} ({self.format_size(size)})")
                    else:
                        logger.info(f"   🗑️  Deleting: {backup_file.name} ({self.format_size(size)})")
                        backup_file.unlink()
                        self.total_size_freed += size
                        self.files_deleted += 1
            except:
                pass
    
    def cleanup_temp_files(self):
        """Clean up temporary files"""
        logger.info("\n🗑️  Cleaning up temporary files...")
        
        patterns = [
            "*.pyc",
            "*~",
            ".DS_Store",
            "__pycache__",
            "*.tmp",
            "*.log"
        ]
        
        for pattern in patterns:
            for temp_file in self.project_root.rglob(pattern):
                # Skip important log files
                if temp_file.name in ['deployment.log', 'automation.log']:
                    continue
                    
                try:
                    if temp_file.is_file():
                        size = self.get_size(temp_file)
                        if not self.dry_run:
                            temp_file.unlink()
                            self.total_size_freed += size
                            self.files_deleted += 1
                    elif temp_file.is_dir() and temp_file.name == "__pycache__":
                        size = self.get_size(temp_file)
                        if not self.dry_run:
                            shutil.rmtree(temp_file)
                            self.total_size_freed += size
                            self.dirs_deleted += 1
                except:
                    pass
    
    def cleanup_layer_backups(self):
        """Clean up layer configuration backups"""
        logger.info("\n📋 Cleaning up layer configuration backups...")
        
        config_dir = self.project_root / "config"
        if config_dir.exists():
            # Keep only the most recent backup
            backups = sorted(config_dir.glob("layers*.backup"))
            if len(backups) > 1:
                for backup in backups[:-1]:  # Keep the last one
                    size = self.get_size(backup)
                    if self.dry_run:
                        logger.info(f"   🗑️  Would delete: {backup.name} ({self.format_size(size)})")
                    else:
                        logger.info(f"   🗑️  Deleting: {backup.name} ({self.format_size(size)})")
                        backup.unlink()
                        self.total_size_freed += size
                        self.files_deleted += 1
    
    def run(self):
        """Run all cleanup tasks"""
        logger.info("🧹 Starting Automation Cleanup...")
        if self.dry_run:
            logger.info("   (DRY RUN - no files will be deleted)")
        logger.info(f"   Keeping files newer than {self.keep_days} days")
        logger.info("=" * 60)
        
        # Run cleanup tasks
        self.cleanup_projects()
        self.cleanup_intermediate_endpoints()
        self.cleanup_duplicate_endpoints()
        self.cleanup_backups()
        self.cleanup_temp_files()
        self.cleanup_layer_backups()
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("✨ Cleanup Summary:")
        if self.dry_run:
            logger.info(f"   Would delete {self.files_deleted} files and {self.dirs_deleted} directories")
            logger.info(f"   Would free up {self.format_size(self.total_size_freed)}")
            logger.info("\n   Run without --dry-run to actually delete files")
        else:
            logger.info(f"   Deleted {self.files_deleted} files and {self.dirs_deleted} directories")
            logger.info(f"   Freed up {self.format_size(self.total_size_freed)}")

def main():
    parser = argparse.ArgumentParser(description="Clean up automation artifacts")
    parser.add_argument("--dry-run", action="store_true", 
                       help="Show what would be deleted without actually deleting")
    parser.add_argument("--keep-days", type=int, default=7,
                       help="Keep project folders newer than this many days (default: 7)")
    parser.add_argument("--aggressive", action="store_true",
                       help="More aggressive cleanup (keep only 1 day)")
    
    args = parser.parse_args()
    
    if args.aggressive:
        args.keep_days = 1
    
    cleanup = AutomationCleanup(dry_run=args.dry_run, keep_days=args.keep_days)
    cleanup.run()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Blob Storage Uploader for Automation Pipeline
Upload endpoint files to Vercel Blob storage and update URL mappings
"""

import os
import json
import requests
import logging
from pathlib import Path
from typing import Dict, Optional, List, Tuple
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class BlobUploader:
    """Upload endpoint files to Vercel Blob storage and manage URL mappings"""
    
    def __init__(self, project_root: Path = None, project_prefix: str = None):
        self.project_root = project_root or Path(__file__).resolve().parents[2]
        # Allow env to override prefix; default to 'energy' for consistency
        env_prefix = os.getenv('BLOB_PREFIX')
        self.project_prefix = project_prefix or env_prefix or 'energy'
        # Unified blob URLs file
        self.blob_urls_file = self.project_root / "public" / "data" / "blob-urls.json"
        self.blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        self.uploaded_endpoints = []
        self.failed_uploads = []
        self.uploaded_boundaries = []
        self.failed_boundary_uploads = []
        
        # Ensure blob-urls.json exists
        self.blob_urls_file.parent.mkdir(parents=True, exist_ok=True)
        if not self.blob_urls_file.exists():
            self.blob_urls_file.write_text('{}')
    
    def load_existing_blob_urls(self) -> Dict[str, str]:
        """Load existing blob URL mappings"""
        try:
            with open(self.blob_urls_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning(f"Could not load existing blob URLs: {e}")
            return {}
    
    def save_blob_urls(self, blob_urls: Dict[str, str]) -> bool:
        """Save blob URL mappings to file"""
        try:
            # Sort the URLs for consistent output
            sorted_urls = dict(sorted(blob_urls.items()))
            
            with open(self.blob_urls_file, 'w') as f:
                json.dump(sorted_urls, f, indent=2)
            
            logger.info(f"✅ Updated blob URL mappings: {self.blob_urls_file}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to save blob URLs: {e}")
            return False
    
    def upload_to_vercel_blob(self, file_name: str, data: Dict, file_type: str = "endpoint") -> Optional[str]:
        """Upload data to Vercel Blob storage"""
        if not self.blob_token:
            logger.error("❌ BLOB_READ_WRITE_TOKEN environment variable not set")
            return None
        
        try:
            # Convert data to JSON string
            json_data = json.dumps(data, indent=2, default=str)
            
            # Prepare the upload
            url = "https://blob.vercel-storage.com"
            # Use different paths for different file types
            if file_type == "boundary":
                filename = f"{self.project_prefix}/boundaries/{file_name}.json"
            else:
                filename = f"{self.project_prefix}/{file_name}.json"
            
            # Upload to Vercel Blob
            response = requests.put(
                f"{url}/{filename}",
                headers={
                    'Authorization': f'Bearer {self.blob_token}',
                    'Content-Type': 'application/json'
                },
                data=json_data
            )
            
            if response.status_code == 200:
                blob_info = response.json()
                blob_url = blob_info.get('url')
                
                if blob_url:
                    size_mb = len(json_data) / (1024 * 1024)
                    logger.info(f"✅ Uploaded {file_name} ({size_mb:.1f}MB) to blob storage")
                    return blob_url
                else:
                    logger.error(f"❌ No URL returned for {file_name}")
                    return None
            else:
                logger.error(f"❌ Failed to upload {file_name}: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error uploading {file_name} to blob storage: {e}")
            return None
    
    def upload_endpoints(self, endpoints_data: Dict[str, Dict], 
                        force_reupload: bool = False) -> Tuple[int, int]:
        """
        Upload multiple endpoints to blob storage
        
        Args:
            endpoints_data: Dict mapping endpoint names to their data
            force_reupload: If True, reupload all endpoints even if they exist
            
        Returns:
            Tuple of (successful_uploads, failed_uploads)
        """
        logger.info(f"🚀 Starting blob upload for {len(endpoints_data)} endpoints...")
        
        # Load existing mappings
        existing_blob_urls = self.load_existing_blob_urls()
        updated_blob_urls = existing_blob_urls.copy()
        
        successful_uploads = 0
        failed_uploads = 0
        
        # Sort endpoints by size (smaller first for faster initial feedback)
        sorted_endpoints = []
        for endpoint_name, data in endpoints_data.items():
            size_estimate = len(json.dumps(data, default=str))
            sorted_endpoints.append((endpoint_name, data, size_estimate))
        
        sorted_endpoints.sort(key=lambda x: x[2])
        
        for endpoint_name, data, size_estimate in sorted_endpoints:
            size_mb = size_estimate / (1024 * 1024)
            
            # Check if already uploaded (unless force reupload)
            if not force_reupload and endpoint_name in existing_blob_urls:
                logger.info(f"⏭️  Skipping {endpoint_name} (already uploaded, {size_mb:.1f}MB)")
                continue
            
            logger.info(f"📤 Uploading {endpoint_name} ({size_mb:.1f}MB)...")
            
            blob_url = self.upload_to_vercel_blob(endpoint_name, data, "endpoint")
            
            if blob_url:
                updated_blob_urls[endpoint_name] = blob_url
                self.uploaded_endpoints.append(endpoint_name)
                successful_uploads += 1
            else:
                self.failed_uploads.append(endpoint_name)
                failed_uploads += 1
        
        # Save updated blob URLs
        if successful_uploads > 0 or force_reupload:
            self.save_blob_urls(updated_blob_urls)
        
        return successful_uploads, failed_uploads
    
    def upload_from_directory(self, endpoints_dir: Path, 
                             endpoint_patterns: List[str] = None,
                             force_reupload: bool = False) -> Tuple[int, int]:
        """
        Upload endpoint files from a directory
        
        Args:
            endpoints_dir: Directory containing endpoint JSON files
            endpoint_patterns: List of endpoint names to upload (None = all)
            force_reupload: If True, reupload all endpoints even if they exist
            
        Returns:
            Tuple of (successful_uploads, failed_uploads)
        """
        if not endpoints_dir.exists():
            logger.error(f"❌ Endpoints directory not found: {endpoints_dir}")
            return 0, 0
        
        endpoints_data = {}
        
        # Load endpoint files
        for json_file in endpoints_dir.glob("*.json"):
            endpoint_name = json_file.stem
            
            # Filter by patterns if specified
            if endpoint_patterns and endpoint_name not in endpoint_patterns:
                continue
            
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    endpoints_data[endpoint_name] = data
            except Exception as e:
                logger.error(f"❌ Failed to load {json_file}: {e}")
                continue
        
        if not endpoints_data:
            logger.warning("⚠️  No endpoint files found to upload")
            return 0, 0
        
        return self.upload_endpoints(endpoints_data, force_reupload)
    
    def upload_boundary_files(self, boundaries_dir: Path = None, 
                             force_reupload: bool = False) -> Tuple[int, int]:
        """
        Upload boundary files from the boundaries directory
        
        Args:
            boundaries_dir: Directory containing boundary JSON files
            force_reupload: If True, reupload all files even if they exist
            
        Returns:
            Tuple of (successful_uploads, failed_uploads)
        """
        if boundaries_dir is None:
            boundaries_dir = self.project_root / "public" / "data" / "boundaries"
        
        if not boundaries_dir.exists():
            logger.info("📍 No boundaries directory found - skipping boundary file upload")
            return 0, 0
        
        # Load existing mappings
        existing_blob_urls = self.load_existing_blob_urls()
        updated_blob_urls = existing_blob_urls.copy()
        
        successful_uploads = 0
        failed_uploads = 0
        
        # Find boundary files (excluding backup files)
        boundary_files = []
        for json_file in boundaries_dir.glob("*.json"):
            if "backup" not in json_file.name.lower() and "summary" not in json_file.name.lower():
                boundary_files.append(json_file)
        
        if not boundary_files:
            logger.info("📍 No boundary files found to upload")
            return 0, 0
        
        logger.info(f"🗺️  Found {len(boundary_files)} boundary files to upload")
        
        for json_file in boundary_files:
            boundary_name = json_file.stem
            
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                
                size_mb = json_file.stat().st_size / (1024 * 1024)
                
                # Check if already uploaded (unless force reupload) - use boundary prefix
                boundary_key = f"boundaries/{boundary_name}"
                if not force_reupload and boundary_key in existing_blob_urls:
                    logger.info(f"⏭️  Skipping {boundary_name} (already uploaded, {size_mb:.1f}MB)")
                    continue
                
                logger.info(f"📤 Uploading boundary file {boundary_name} ({size_mb:.1f}MB)...")
                
                blob_url = self.upload_to_vercel_blob(boundary_name, data, "boundary")
                
                if blob_url:
                    updated_blob_urls[boundary_key] = blob_url
                    self.uploaded_boundaries.append(boundary_name)
                    successful_uploads += 1
                    logger.info(f"✅ Boundary file {boundary_name} uploaded successfully")
                else:
                    self.failed_boundary_uploads.append(boundary_name)
                    failed_uploads += 1
                    
            except Exception as e:
                logger.error(f"❌ Failed to process boundary file {json_file}: {e}")
                self.failed_boundary_uploads.append(boundary_name)
                failed_uploads += 1
                continue
        
        # Save updated blob URLs
        if successful_uploads > 0:
            self.save_blob_urls(updated_blob_urls)
        
        return successful_uploads, failed_uploads
    
    def generate_upload_summary(self) -> str:
        """Generate a summary of the upload process"""
        total_uploaded = len(self.uploaded_endpoints) + len(self.uploaded_boundaries)
        total_failed = len(self.failed_uploads) + len(self.failed_boundary_uploads)
        
        summary = f"""
📊 BLOB UPLOAD SUMMARY
{"=" * 50}
✅ Successfully uploaded: {total_uploaded}
   • Endpoints: {len(self.uploaded_endpoints)}
   • Boundary files: {len(self.uploaded_boundaries)}
❌ Failed uploads: {total_failed}
   • Endpoints: {len(self.failed_uploads)}
   • Boundary files: {len(self.failed_boundary_uploads)}
📁 Blob URLs file: {self.blob_urls_file}

"""
        
        if self.uploaded_endpoints:
            summary += "✅ Uploaded endpoints:\n"
            for endpoint in self.uploaded_endpoints:
                summary += f"   • {endpoint}\n"
            summary += "\n"
            
        if self.uploaded_boundaries:
            summary += "🗺️  Uploaded boundary files:\n"
            for boundary in self.uploaded_boundaries:
                summary += f"   • {boundary}\n"
            summary += "\n"
        
        if self.failed_uploads:
            summary += "❌ Failed endpoint uploads:\n"
            for endpoint in self.failed_uploads:
                summary += f"   • {endpoint}\n"
            summary += "\n"
            
        if self.failed_boundary_uploads:
            summary += "❌ Failed boundary uploads:\n"
            for boundary in self.failed_boundary_uploads:
                summary += f"   • {boundary}\n"
            summary += "\n"
        
        summary += "🔗 Endpoints are now accessible via blob storage URLs\n"
        if self.uploaded_boundaries:
            summary += "🗺️  Geographic visualizations will load boundary data from blob storage\n"
        summary += "📋 Client applications will automatically use blob storage for large files\n"
        
        return summary


def main():
    """Command-line interface for blob uploader"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Upload endpoint files to Vercel Blob storage")
    parser.add_argument("--endpoints-dir", 
                       default="/Users/voldeck/code/mpiq-ai-chat/public/data/endpoints",
                       help="Directory containing endpoint JSON files")
    parser.add_argument("--endpoints", nargs="+", 
                       help="Specific endpoints to upload (default: all)")
    parser.add_argument("--force", action="store_true",
                       help="Force reupload even if endpoints already exist in blob storage")
    parser.add_argument("--include-boundaries", action="store_true", default=True,
                       help="Include boundary files in upload (default: True)")
    parser.add_argument("--project-root",
                       help="Project root directory (default: auto-detect)")
    parser.add_argument("--project-prefix", default="hrb",
                       help="Project prefix for blob storage paths (default: hrb)")
    
    args = parser.parse_args()
    
    # Initialize uploader
    project_root = Path(args.project_root) if args.project_root else None
    uploader = BlobUploader(project_root, args.project_prefix)
    
    # Check for blob token
    if not uploader.blob_token:
        logger.error("❌ BLOB_READ_WRITE_TOKEN environment variable must be set")
        logger.info("💡 Set it in your .env.local file or environment")
        return 1
    
    # Upload endpoints
    endpoints_dir = Path(args.endpoints_dir)
    successful, failed = uploader.upload_from_directory(
        endpoints_dir, 
        args.endpoints, 
        args.force
    )
    
    # Upload boundary files if requested
    boundary_successful, boundary_failed = 0, 0
    if args.include_boundaries:
        logger.info("🗺️  Uploading boundary files...")
        boundary_successful, boundary_failed = uploader.upload_boundary_files(
            force_reupload=args.force
        )
    
    # Print summary
    print(uploader.generate_upload_summary())
    
    total_successful = successful + boundary_successful
    total_failed = failed + boundary_failed
    
    return 0 if total_failed == 0 else 1


if __name__ == "__main__":
    exit(main())
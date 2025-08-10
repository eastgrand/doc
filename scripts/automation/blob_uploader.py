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
    
    def __init__(self, project_root: Path = None):
        self.project_root = project_root or Path("/Users/voldeck/code/mpiq-ai-chat")
        self.blob_urls_file = self.project_root / "public" / "data" / "blob-urls.json"
        self.blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        self.uploaded_endpoints = []
        self.failed_uploads = []
        
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
    
    def upload_to_vercel_blob(self, endpoint_name: str, data: Dict) -> Optional[str]:
        """Upload endpoint data to Vercel Blob storage"""
        if not self.blob_token:
            logger.error("❌ BLOB_READ_WRITE_TOKEN environment variable not set")
            return None
        
        try:
            # Convert data to JSON string
            json_data = json.dumps(data, indent=2, default=str)
            
            # Prepare the upload
            url = "https://blob.vercel-storage.com"
            filename = f"endpoints/{endpoint_name}.json"
            
            # Upload to Vercel Blob
            response = requests.put(
                url,
                params={
                    'filename': filename
                },
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
                    logger.info(f"✅ Uploaded {endpoint_name} ({size_mb:.1f}MB) to blob storage")
                    return blob_url
                else:
                    logger.error(f"❌ No URL returned for {endpoint_name}")
                    return None
            else:
                logger.error(f"❌ Failed to upload {endpoint_name}: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error uploading {endpoint_name} to blob storage: {e}")
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
            
            blob_url = self.upload_to_vercel_blob(endpoint_name, data)
            
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
    
    def generate_upload_summary(self) -> str:
        """Generate a summary of the upload process"""
        summary = f"""
📊 BLOB UPLOAD SUMMARY
{"=" * 50}
✅ Successfully uploaded: {len(self.uploaded_endpoints)}
❌ Failed uploads: {len(self.failed_uploads)}
📁 Blob URLs file: {self.blob_urls_file}

"""
        
        if self.uploaded_endpoints:
            summary += "✅ Uploaded endpoints:\n"
            for endpoint in self.uploaded_endpoints:
                summary += f"   • {endpoint}\n"
            summary += "\n"
        
        if self.failed_uploads:
            summary += "❌ Failed uploads:\n"
            for endpoint in self.failed_uploads:
                summary += f"   • {endpoint}\n"
            summary += "\n"
        
        summary += "🔗 Endpoints are now accessible via blob storage URLs\n"
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
    parser.add_argument("--project-root",
                       help="Project root directory (default: auto-detect)")
    
    args = parser.parse_args()
    
    # Initialize uploader
    project_root = Path(args.project_root) if args.project_root else None
    uploader = BlobUploader(project_root)
    
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
    
    # Print summary
    print(uploader.generate_upload_summary())
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    exit(main())
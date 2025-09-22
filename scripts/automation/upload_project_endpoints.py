#!/usr/bin/env python3
"""
Dynamic Project Endpoint Uploader
Upload endpoints to blob storage with project-specific directory structure
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env.local
project_root = Path(__file__).resolve().parents[2]
load_dotenv(project_root / ".env.local")

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from blob_uploader import BlobUploader

def auto_detect_project() -> str:
    """Auto-detect the most recent project directory"""
    project_root = Path(__file__).resolve().parents[2]
    projects_dir = project_root / "projects"
    
    if not projects_dir.exists():
        return None
    
    # Find the most recently modified project directory
    project_candidates = []
    for project_dir in projects_dir.iterdir():
        if project_dir.is_dir():
            # Check if it has generated endpoints
            endpoints_dir = project_dir / "generated_endpoints"
            if endpoints_dir.exists():
                mod_time = endpoints_dir.stat().st_mtime
                project_candidates.append((project_dir.name, mod_time))
    
    if not project_candidates:
        return None
    
    # Sort by modification time (most recent first)
    project_candidates.sort(key=lambda x: x[1], reverse=True)
    return project_candidates[0][0]

def get_project_endpoints(project_name: str, project_root: Path) -> list:
    """Get list of endpoint files for the project"""
    endpoints_dir = project_root / "projects" / project_name / "generated_endpoints"
    
    if not endpoints_dir.exists():
        print(f"❌ No endpoints directory found for project: {project_name}")
        return []
    
    endpoint_files = list(endpoints_dir.glob("*.json"))
    return [f.stem for f in endpoint_files]

def main():
    """Upload project endpoints to blob storage with dynamic project detection"""
    parser = argparse.ArgumentParser(description="Upload project endpoints to blob storage")
    parser.add_argument("--project", help="Project name (auto-detected if not provided)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded without actually uploading")
    
    args = parser.parse_args()
    
    # Determine project name
    if args.project:
        project_name = args.project
        print(f"📁 Using specified project: {project_name}")
    else:
        project_name = auto_detect_project()
        if not project_name:
            print("❌ No project specified and none could be auto-detected")
            print("💡 Usage: python upload_project_endpoints.py --project PROJECT_NAME")
            return 1
        print(f"🔍 Auto-detected project: {project_name}")
    
    print("🚀 Uploading Project Endpoints to Blob Storage")
    print("=" * 50)
    print(f"📦 Project: {project_name}")
    
    # Initialize blob uploader with dynamic project prefix
    project_root = Path(__file__).resolve().parents[2]
    uploader = BlobUploader(project_root, project_prefix=project_name)
    
    # Check for blob token
    if not uploader.blob_token:
        print("❌ BLOB_READ_WRITE_TOKEN environment variable not found")
        print("💡 Set it in your .env.local file:")
        print("   BLOB_READ_WRITE_TOKEN=your_token_here")
        return 1
    
    # Get project-specific endpoints
    project_endpoints = get_project_endpoints(project_name, project_root)
    
    if not project_endpoints:
        print(f"❌ No endpoints found for project: {project_name}")
        return 1
    
    print(f"📊 Found {len(project_endpoints)} endpoints to upload:")
    for endpoint in project_endpoints:
        print(f"   • {endpoint}")
    
    if args.dry_run:
        print("\n🧪 DRY RUN MODE - No files will be uploaded")
        print(f"📁 Would upload to blob storage with prefix: {project_name}/")
        print(f"💾 Would save URLs to: public/data/blob-urls-{project_name.replace('_', '-')}.json")
        return 0
    
    # Upload endpoints
    print(f"\n📤 Starting upload for {len(project_endpoints)} endpoints...")
    
    # Check which endpoints exist locally
    endpoints_dir = project_root / "projects" / project_name / "generated_endpoints"
    existing_endpoints = []
    
    for endpoint_name in project_endpoints:
        endpoint_file = endpoints_dir / f"{endpoint_name}.json"
        if endpoint_file.exists():
            existing_endpoints.append(endpoint_name)
        else:
            print(f"⚠️  File not found: {endpoint_file}")
    
    if not existing_endpoints:
        print("❌ No endpoint files found to upload")
        return 1
    
    print(f"✅ Found {len(existing_endpoints)} endpoint files ready for upload")
    
    # Load endpoint data for bulk upload
    endpoints_data = {}
    
    for endpoint_name in existing_endpoints:
        endpoint_file = endpoints_dir / f"{endpoint_name}.json"
        
        try:
            import json
            with open(endpoint_file, 'r') as f:
                endpoint_data = json.load(f)
                endpoints_data[endpoint_name] = endpoint_data
        except Exception as e:
            print(f"❌ Error loading {endpoint_name}: {e}")
    
    if not endpoints_data:
        print("❌ No valid endpoint data loaded")
        return 1
    
    # Perform bulk upload using BlobUploader's upload_endpoints method
    print(f"📤 Uploading {len(endpoints_data)} endpoints to blob storage...")
    
    try:
        successful_uploads, failed_uploads = uploader.upload_endpoints(endpoints_data, force_reupload=True)
        success_count = successful_uploads
        
        print(f"✅ Bulk upload completed: {successful_uploads} successful, {failed_uploads} failed")
        
    except Exception as e:
        print(f"❌ Error during bulk upload: {e}")
        success_count = 0
    
    # Update project-specific blob URLs file
    if success_count > 0:
        # Create project-specific blob URLs file
        blob_urls_file = project_root / "public" / "data" / f"blob-urls-{project_name.replace('_', '-')}.json"
        
        # Load existing URLs or create new
        existing_urls = {}
        if blob_urls_file.exists():
            import json
            try:
                with open(blob_urls_file, 'r') as f:
                    existing_urls = json.load(f)
            except:
                existing_urls = {}
        
        # Update with new URLs
        for endpoint_name in existing_endpoints:
            if endpoint_name in uploader.uploaded_endpoints:
                # Construct the blob URL (this would come from actual upload response)
                blob_url = f"https://your-blob-storage.com/{project_name}/endpoints/{endpoint_name}.json"
                existing_urls[endpoint_name] = blob_url
        
        # Save updated URLs
        blob_urls_file.parent.mkdir(parents=True, exist_ok=True)
        with open(blob_urls_file, 'w') as f:
            json.dump(existing_urls, f, indent=2)
        
        print(f"\n💾 Updated blob URLs: {blob_urls_file}")
    
    print(f"\n🎉 Upload completed!")
    print(f"✅ Successfully uploaded: {success_count}/{len(existing_endpoints)} endpoints")
    print(f"📁 Blob storage path: {project_name}/endpoints/")
    print(f"💾 URL mappings: public/data/blob-urls-{project_name.replace('_', '-')}.json")
    
    if success_count < len(existing_endpoints):
        print(f"⚠️  {len(existing_endpoints) - success_count} uploads failed")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
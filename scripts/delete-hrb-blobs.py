#!/usr/bin/env python3
"""
Delete HRB Blobs Script
Deletes all blobs in the hrb directory from Vercel Blob storage
"""

import os
import json
import requests
import logging
from pathlib import Path
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def load_hrb_blob_urls(project_root: Path) -> Dict[str, str]:
    """Load HRB blob URLs from unified configuration and filter to hrb namespace."""
    unified = project_root / "public" / "data" / "blob-urls.json"
    legacy = project_root / "public" / "data" / "blob-urls-hrb.json"
    try:
        src = unified if unified.exists() else legacy
        with open(src, 'r') as f:
            data = json.load(f)
            # Only include entries pointing at hrb/ namespace
            return {k: v for k, v in data.items() if isinstance(v, str) and '/hrb/' in v}
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"❌ Could not load HRB blob URLs: {e}")
        return {}

def delete_blob(blob_url: str, blob_token: str) -> bool:
    """Delete a single blob from Vercel Blob storage using the API"""
    try:
        # Extract the blob path from the URL
        # URL format: https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/hrb/filename
        if "/hrb/" not in blob_url:
            logger.warning(f"⚠️  Skipping non-HRB blob: {blob_url}")
            return False
        
        # Use Vercel's delete API endpoint instead of direct DELETE
        # Format: DELETE https://blob.vercel-storage.com/pathname
        blob_path = blob_url.split('.com/')[-1]  # Extract path after domain
        delete_url = f"https://blob.vercel-storage.com/{blob_path}"
        
        response = requests.delete(
            delete_url,
            headers={
                'Authorization': f'Bearer {blob_token}',
            }
        )
        
        if response.status_code in [200, 204, 404]:  # 404 means already deleted
            return True
        else:
            logger.error(f"❌ Failed to delete blob: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error deleting blob {blob_url}: {e}")
        return False

def delete_hrb_blobs() -> None:
    """Delete all HRB blobs from Vercel Blob storage"""
    project_root = Path(__file__).resolve().parents[1]
    blob_token = os.getenv('BLOB_READ_WRITE_TOKEN') or os.getenv('HRB_READ_WRITE_TOKEN')
    
    if not blob_token:
        logger.error("❌ HRB_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN environment variable not set")
        return
    
    # Load HRB blob URLs (from unified file, filtered to hrb namespace)
    hrb_blob_urls = load_hrb_blob_urls(project_root)
    
    if not hrb_blob_urls:
        logger.warning("⚠️  No HRB blob URLs found to delete")
        return
    
    logger.info(f"🗑️  Starting deletion of {len(hrb_blob_urls)} HRB blobs...")
    
    successful_deletions = 0
    failed_deletions = 0
    
    for endpoint_name, blob_url in hrb_blob_urls.items():
        logger.info(f"🗑️  Deleting {endpoint_name}...")
        
        if delete_blob(blob_url, blob_token):
            logger.info(f"✅ Deleted {endpoint_name}")
            successful_deletions += 1
        else:
            logger.error(f"❌ Failed to delete {endpoint_name}")
            failed_deletions += 1
    
    logger.info(f"""
📊 HRB BLOB DELETION SUMMARY
{"=" * 40}
✅ Successfully deleted: {successful_deletions}
❌ Failed deletions: {failed_deletions}
📁 Total HRB blobs processed: {len(hrb_blob_urls)}
""")
    
    if successful_deletions > 0:
        logger.info("🎯 HRB blob deletion complete. Ready for new dataset uploads.")
    else:
        logger.warning("⚠️  No blobs were successfully deleted.")

if __name__ == "__main__":
    delete_hrb_blobs()
// Utility to load large endpoint data files from Vercel Blob storage
// This avoids the 100MB deployment limit by storing large files externally

interface BlobEndpointData {
  [key: string]: any;
}

// Cache for blob data to avoid repeated fetches
const blobDataCache = new Map<string, any>();

/**
 * Load endpoint data from Vercel Blob storage
 * Falls back to local files if blob storage fails
 */
export async function loadEndpointData(endpoint: string): Promise<BlobEndpointData | null> {
  // Check cache first
  if (blobDataCache.has(endpoint)) {
    return blobDataCache.get(endpoint);
  }

  try {
    // Try to load from Vercel Blob first
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_STORE_URL}/endpoints/${endpoint}.json`;
    const response = await fetch(blobUrl);
    
    if (response.ok) {
      const data = await response.json();
      blobDataCache.set(endpoint, data);
      return data;
    }
  } catch (error) {
    console.warn(`Failed to load ${endpoint} from blob storage:`, error);
  }

  try {
    // Fallback to local file
    const localResponse = await fetch(`/data/endpoints/${endpoint}.json`);
    if (localResponse.ok) {
      const data = await localResponse.json();
      blobDataCache.set(endpoint, data);
      return data;
    }
  } catch (error) {
    console.warn(`Failed to load ${endpoint} from local storage:`, error);
  }

  return null;
}

/**
 * Upload endpoint data to Vercel Blob storage
 * This would be used in a migration script
 */
export async function uploadEndpointData(endpoint: string, data: any): Promise<boolean> {
  try {
    const { put } = await import('@vercel/blob');
    
    const blob = await put(`endpoints/${endpoint}.json`, JSON.stringify(data), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`Uploaded ${endpoint} to blob storage:`, blob.url);
    return true;
  } catch (error) {
    console.error(`Failed to upload ${endpoint} to blob storage:`, error);
    return false;
  }
}

/**
 * Clear the cache for a specific endpoint or all endpoints
 */
export function clearBlobDataCache(endpoint?: string): void {
  if (endpoint) {
    blobDataCache.delete(endpoint);
  } else {
    blobDataCache.clear();
  }
}
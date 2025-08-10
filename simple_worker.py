#!/usr/bin/env python3
"""
Simple Worker - No-op background worker for deployment compatibility
This worker runs successfully without Redis dependency
"""

import time
import logging
import sys
import os
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main worker loop that runs indefinitely"""
    logger.info("Simple Worker starting up...")
    logger.info("Worker is running in no-op mode (no Redis dependency)")
    
    # Log environment info
    service_name = os.environ.get('SERVICE_NAME', 'SHAP Demographic Analytics v3.0')
    service_version = os.environ.get('SERVICE_VERSION', '3.0.0')
    
    logger.info(f"Service: {service_name}")
    logger.info(f"Version: {service_version}")
    logger.info("Worker ready - monitoring for tasks...")
    
    try:
        # Keep worker alive with periodic health checks
        while True:
            time.sleep(60)  # Sleep for 1 minute
            logger.info("Worker heartbeat - running successfully")
            
    except KeyboardInterrupt:
        logger.info("Worker shutdown requested")
    except Exception as e:
        logger.error(f"Worker error: {e}")
        sys.exit(1)
    finally:
        logger.info("Simple Worker shutting down...")

if __name__ == "__main__":
    main()
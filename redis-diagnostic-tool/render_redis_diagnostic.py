#!/usr/bin/env python3
"""
Render Redis Diagnostic
A standalone script to diagnose Redis connectivity on Render

This script is designed to be deployed to Render as a separate web service
to directly test Redis connectivity from within the Render environment.
"""

import os
import sys
import time
import json
import logging
from datetime import datetime
import redis
from flask import Flask, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("redis-diagnostic")

# Create Flask app
app = Flask(__name__)

def get_redis_client(connect_timeout=3):
    """Create a Redis client with the configured environment variables and strict timeout"""
    # Get Redis URL from environment or use default
    redis_url = os.environ.get('REDIS_URL', 
                              'rediss://default:AVnAAAIjcDEzZjMwMjdiYWI5MjA0NjY3YTQ4ZjRjZjZjNWZhNTdmM3AxMA@ruling-stud-22976.upstash.io:6379')
    
    # Get Redis configuration from environment with stricter defaults
    redis_timeout = int(os.environ.get('REDIS_TIMEOUT', '3'))
    redis_socket_keepalive = os.environ.get('REDIS_SOCKET_KEEPALIVE', 'true').lower() == 'true'
    redis_pool_size = int(os.environ.get('REDIS_CONNECTION_POOL_SIZE', '2')) # Reduced pool size
    redis_health_check_interval = int(os.environ.get('REDIS_HEALTH_CHECK_INTERVAL', '30'))
    
    logger.info(f"Creating Redis client with timeout={redis_timeout}s, connect_timeout={connect_timeout}s")
    
    # Create Redis client with very strict timeouts
    client = redis.from_url(
        redis_url,
        socket_timeout=redis_timeout,
        socket_keepalive=redis_socket_keepalive,
        socket_connect_timeout=connect_timeout,
        health_check_interval=redis_health_check_interval,
        retry_on_timeout=True,
        max_connections=redis_pool_size,
        encoding='utf-8',  # Handle encoding/decoding automatically
        decode_responses=True  # Decode responses
    )
    
    return client

@app.route('/')
def home():
    """Home page with basic info"""
    return jsonify({
        "service": "Redis Diagnostic Tool",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": [
            "/ping",
            "/env",
            "/test/basic",
            "/test/connection",
            "/test/operations"
        ]
    })

@app.route('/env')
def show_environment():
    """Show Redis environment variables without connecting to Redis"""
    redis_url = os.environ.get('REDIS_URL', 'Not set')
    # Mask the password in the URL
    if redis_url != 'Not set':
        parts = redis_url.split('@')
        if len(parts) > 1:
            protocol_and_auth = parts[0].split(':')
            if len(protocol_and_auth) > 2:  # Has username and password
                masked_url = f"{protocol_and_auth[0]}:{protocol_and_auth[1]}:***@{parts[1]}"
            else:  # Just has password
                masked_url = f"{protocol_and_auth[0]}:***@{parts[1]}"
        else:
            masked_url = redis_url
    else:
        masked_url = redis_url
        
    redis_env = {
        "REDIS_URL": masked_url,
        "REDIS_TIMEOUT": os.environ.get('REDIS_TIMEOUT', 'Not set'),
        "REDIS_SOCKET_KEEPALIVE": os.environ.get('REDIS_SOCKET_KEEPALIVE', 'Not set'),
        "REDIS_CONNECTION_POOL_SIZE": os.environ.get('REDIS_CONNECTION_POOL_SIZE', 'Not set'),
        "REDIS_HEALTH_CHECK_INTERVAL": os.environ.get('REDIS_HEALTH_CHECK_INTERVAL', 'Not set'),
        "REDIS_CONNECT_TIMEOUT": os.environ.get('REDIS_CONNECT_TIMEOUT', 'Not set'),
        "REDIS_RETRY_ON_TIMEOUT": os.environ.get('REDIS_RETRY_ON_TIMEOUT', 'Not set')
    }
    
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "host_info": {
            "hostname": os.environ.get('HOSTNAME', 'unknown'),
            "render_service_id": os.environ.get('RENDER_SERVICE_ID', 'unknown'),
            "render_instance_id": os.environ.get('RENDER_INSTANCE_ID', 'unknown')
        },
        "redis_environment": redis_env,
        "python_version": sys.version
    })

@app.route('/ping')
def ping():
    """Simple ping endpoint for health checks"""
    return jsonify({
        "ping": "pong",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/test/basic')
def test_basic():
    """Test basic Redis connectivity with a strict timeout"""
    import threading
    import queue
    
    start_time = time.time()
    result_queue = queue.Queue()
    
    def test_with_timeout():
        try:
            # Create Redis client with a very strict timeout
            client = get_redis_client(connect_timeout=2)
            
            # Test PING operation
            ping_start = time.time()
            ping_result = client.ping()
            ping_time = time.time() - ping_start
            
            result_queue.put({
                "success": True,
                "ping_successful": ping_result,
                "ping_time_ms": round(ping_time * 1000, 2),
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            result_queue.put({
                "success": False,
                "error": str(e),
                "error_type": e.__class__.__name__,
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
    
    # Run the test in a separate thread with a timeout
    test_thread = threading.Thread(target=test_with_timeout)
    test_thread.daemon = True
    test_thread.start()
    
    try:
        # Wait for the result with a timeout
        result = result_queue.get(timeout=5)
    except queue.Empty:
        # If the queue is empty after 5 seconds, the test timed out
        result = {
            "success": False,
            "error": "Test timed out after 5 seconds",
            "error_type": "Timeout",
            "total_time_ms": round((time.time() - start_time) * 1000, 2),
            "timestamp": datetime.now().isoformat()
        }
    
    return jsonify(result)

@app.route('/test/connection')
def test_connection():
    """Test Redis connection details with timeout protection"""
    import threading
    import queue
    
    start_time = time.time()
    result_queue = queue.Queue()
    
    def test_with_timeout():
        try:
            # Create Redis client with a very strict timeout
            client = get_redis_client(connect_timeout=2)
            
            # Get connection pool info
            pool = client.connection_pool
            
            # Check connection settings
            conn_settings = {}
            if hasattr(pool, 'connection_kwargs'):
                conn_settings = pool.connection_kwargs
            
            # Test Redis connection with INFO command
            info_start = time.time()
            redis_info = client.info()
            info_time = time.time() - info_start
            
            # Extract relevant Redis info
            redis_version = redis_info.get('redis_version', 'unknown')
            connected_clients = redis_info.get('connected_clients', 'unknown')
            used_memory_human = redis_info.get('used_memory_human', 'unknown')
            
            result_queue.put({
                "success": True,
                "connection_pool": {
                    "max_connections": getattr(pool, 'max_connections', 'unknown'),
                    "connection_class": pool.connection_class.__name__ if hasattr(pool, 'connection_class') else 'unknown',
                    "connection_settings": {
                        "socket_timeout": conn_settings.get('socket_timeout', 'unknown'),
                        "socket_connect_timeout": conn_settings.get('socket_connect_timeout', 'unknown'),
                        "socket_keepalive": conn_settings.get('socket_keepalive', 'unknown'),
                        "health_check_interval": conn_settings.get('health_check_interval', 'unknown')
                    }
                },
                "redis_info": {
                    "version": redis_version,
                    "connected_clients": connected_clients,
                    "used_memory": used_memory_human
                },
                "info_command_time_ms": round(info_time * 1000, 2),
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            result_queue.put({
                "success": False,
                "error": str(e),
                "error_type": e.__class__.__name__,
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
    
    # Run the test in a separate thread with a timeout
    test_thread = threading.Thread(target=test_with_timeout)
    test_thread.daemon = True
    test_thread.start()
    
    try:
        # Wait for the result with a timeout
        result = result_queue.get(timeout=5)
    except queue.Empty:
        # If the queue is empty after 5 seconds, the test timed out
        result = {
            "success": False,
            "error": "Test timed out after 5 seconds",
            "error_type": "Timeout",
            "total_time_ms": round((time.time() - start_time) * 1000, 2),
            "timestamp": datetime.now().isoformat()
        }
    
    return jsonify(result)

@app.route('/test/operations')
def test_operations():
    """Test Redis operations with timeout protection"""
    import threading
    import queue
    
    start_time = time.time()
    result_queue = queue.Queue()
    
    def test_with_timeout():
        try:
            # Create Redis client with strict timeout
            client = get_redis_client(connect_timeout=2)
            operation_times = {}
            
            # Generate a unique test key
            test_key = f"diagnostic_test_{int(time.time())}"
            test_value = f"Diagnostic test at {datetime.now().isoformat()}"
            
            # Test SET operation
            set_start = time.time()
            set_result = client.set(test_key, test_value)
            operation_times["set"] = round((time.time() - set_start) * 1000, 2)
            
            # Test GET operation
            get_start = time.time()
            get_result = client.get(test_key)
            operation_times["get"] = round((time.time() - get_start) * 1000, 2)
            
            # Test SETEX operation
            setex_start = time.time()
            setex_result = client.setex(f"{test_key}_ex", 60, f"{test_value} with expiry")
            operation_times["setex"] = round((time.time() - setex_start) * 1000, 2)
            
            # Test TTL operation
            ttl_start = time.time()
            ttl_result = client.ttl(f"{test_key}_ex")
            operation_times["ttl"] = round((time.time() - ttl_start) * 1000, 2)
            
            # Test DEL operation
            del_start = time.time()
            del_result = client.delete(test_key, f"{test_key}_ex")
            operation_times["del"] = round((time.time() - del_start) * 1000, 2)
            
            result_queue.put({
                "success": True,
                "operations": {
                    "set": {
                        "success": set_result,
                        "time_ms": operation_times["set"]
                    },
                    "get": {
                        "success": get_result == test_value,  # With decode_responses=True, no need to decode
                        "value": get_result,
                        "time_ms": operation_times["get"]
                    },
                    "setex": {
                        "success": setex_result,
                        "time_ms": operation_times["setex"]
                    },
                    "ttl": {
                        "seconds": ttl_result,
                        "time_ms": operation_times["ttl"]
                    },
                    "del": {
                        "count": del_result,
                        "time_ms": operation_times["del"]
                    }
                },
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            result_queue.put({
                "success": False,
                "error": str(e),
                "error_type": e.__class__.__name__,
                "total_time_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.now().isoformat()
            })
    
    # Run the test in a separate thread with a timeout
    test_thread = threading.Thread(target=test_with_timeout)
    test_thread.daemon = True
    test_thread.start()
    
    try:
        # Wait for the result with a timeout
        result = result_queue.get(timeout=8)  # Longer timeout for operations test
    except queue.Empty:
        # If the queue is empty after timeout, the test timed out
        result = {
            "success": False,
            "error": "Test timed out after 8 seconds",
            "error_type": "Timeout",
            "total_time_ms": round((time.time() - start_time) * 1000, 2),
            "timestamp": datetime.now().isoformat()
        }
    
    return jsonify(result)

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get('PORT', '8080'))
    
    # Start Flask app
    app.run(host='0.0.0.0', port=port) 
#!/usr/bin/env python3
"""
Upstash Redis Connection Test (Python)

Tests connectivity to the specific Upstash Redis instance using the full URL

Usage: python3 test_upstash_redis.py
"""

import redis
import time
import re
from datetime import datetime

# Redis connection URL
REDIS_URL = "rediss://default:AVnAAAIjcDEzZjMwMjdiYWI5MjA0NjY3YTQ4ZjRjZjZjNWZhNTdmM3AxMA@ruling-stud-22976.upstash.io:6379"
# Mask the password in output
MASKED_URL = re.sub(r"(:.*@)", ":***@", REDIS_URL)

def format_uptime(seconds):
    """Format seconds into days, hours, minutes"""
    if not seconds:
        return "unknown"
    
    sec_num = int(seconds)
    days = sec_num // 86400
    hours = (sec_num % 86400) // 3600
    minutes = (sec_num % 3600) // 60
    
    return f"{days} days, {hours} hours, {minutes} minutes"

def main():
    """Run Redis connection tests"""
    print(f"🔄 Testing connection to Upstash Redis...")
    print(f"URL: {MASKED_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    print("====================================")
    
    try:
        # Create Redis client
        print("🔄 Creating Redis client...")
        client = redis.from_url(
            REDIS_URL,
            socket_timeout=10,
            socket_connect_timeout=10,
            socket_keepalive=True,
            decode_responses=True
        )
        
        # Connect and ping
        print("🔄 Testing Redis connection...")
        connect_start = time.time()
        ping_result = client.ping()
        connect_time = (time.time() - connect_start) * 1000  # ms
        
        print(f"✅ Connected successfully in {connect_time:.2f}ms!")
        print(f"✅ PING result: {ping_result}")
        
        # Test SET operation
        print("🔄 Testing SET operation...")
        set_start = time.time()
        client.set("python_test", f"Connection successful at {datetime.now().isoformat()}")
        set_time = (time.time() - set_start) * 1000  # ms
        print(f"✅ SET operation completed in {set_time:.2f}ms")
        
        # Test GET operation
        print("🔄 Testing GET operation...")
        get_start = time.time()
        value = client.get("python_test")
        get_time = (time.time() - get_start) * 1000  # ms
        print(f"✅ GET operation completed in {get_time:.2f}ms. Value: {value}")
        
        # Test multiple rapid operations for stability
        print("🔄 Testing 5 rapid PING operations...")
        ping_times = []
        
        for i in range(5):
            start = time.time()
            client.ping()
            ping_time = (time.time() - start) * 1000  # ms
            ping_times.append(ping_time)
            print(f"✅ PING {i+1}/5 completed in {ping_time:.2f}ms")
        
        # Calculate average and jitter
        avg_ping = sum(ping_times) / len(ping_times)
        max_ping = max(ping_times)
        min_ping = min(ping_times)
        jitter = max_ping - min_ping
        
        print(f"📊 Average ping: {avg_ping:.2f}ms")
        print(f"📊 Ping jitter: {jitter:.2f}ms (min: {min_ping:.2f}ms, max: {max_ping:.2f}ms)")
        
        # Get Redis info
        print("🔄 Getting Redis server info...")
        try:
            info = client.info()
            
            # Extract key metrics
            metrics = {
                "version": info.get("redis_version", "unknown"),
                "mode": info.get("redis_mode", "unknown"),
                "clients": info.get("connected_clients", "unknown"),
                "memory": info.get("used_memory_human", "unknown"),
                "uptime": info.get("uptime_in_seconds", "unknown")
            }
            
            print("📊 Redis server info:")
            print(f"  • Version: {metrics['version']}")
            print(f"  • Mode: {metrics['mode']}")
            print(f"  • Connected clients: {metrics['clients']}")
            print(f"  • Memory usage: {metrics['memory']}")
            print(f"  • Uptime: {format_uptime(metrics['uptime'])}")
        except Exception as e:
            print(f"❌ Could not retrieve Redis info: {str(e)}")
        
        # Result summary
        print("\n====================================")
        print("✅ ALL TESTS PASSED")
        print("Redis connection is working correctly!")
        print("====================================")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("Redis connection test failed")
        print("\nPossible causes:")
        print("1. Authentication failure - check your password")
        print("2. TLS/SSL configuration issue")
        print("3. Firewall blocking connection")
        print("4. Max connections limit reached on Redis instance")
        print("5. Redis service might be down or restarting")
    
    finally:
        # Close the connection if it exists
        if 'client' in locals():
            print("🔄 Closing Redis connection...")
            client.close()
            print("✅ Redis connection closed")

if __name__ == "__main__":
    main() 
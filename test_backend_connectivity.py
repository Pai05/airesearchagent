#!/usr/bin/env python
"""
Test backend connectivity and API health
Usage: python test_backend_connectivity.py <backend_url>
Example: python test_backend_connectivity.py https://airesearchagent-an30.onrender.com
"""

import sys
import requests
from typing import Optional

def test_backend(backend_url: str) -> bool:
    """Test if backend is accessible and healthy"""
    backend_url = backend_url.rstrip('/')
    
    tests = [
        ("Health Check", f"{backend_url}/health"),
        ("API Config", f"{backend_url}/api/config"),
    ]
    
    print(f"\n🔍 Testing Backend: {backend_url}\n")
    
    all_passed = True
    for test_name, url in tests:
        try:
            print(f"  [{test_name}] {url}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"    ✅ Success (200)")
            else:
                print(f"    ❌ Failed ({response.status_code})")
                all_passed = False
        except requests.exceptions.Timeout:
            print(f"    ❌ Timeout (backend may be sleeping)")
            all_passed = False
        except requests.exceptions.ConnectionError:
            print(f"    ❌ Connection Error (backend unreachable)")
            all_passed = False
        except Exception as e:
            print(f"    ❌ Error: {e}")
            all_passed = False
    
    print()
    if all_passed:
        print("✅ Backend is healthy and reachable!\n")
        return True
    else:
        print("❌ Backend has issues. Check the URL and Render service status.\n")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_backend_connectivity.py <backend_url>")
        print("Example: python test_backend_connectivity.py https://airesearchagent-an30.onrender.com")
        sys.exit(1)
    
    backend_url = sys.argv[1]
    success = test_backend(backend_url)
    sys.exit(0 if success else 1)

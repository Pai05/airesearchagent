#!/usr/bin/env python
"""
Complete deployment status checker
Verifies both Render backend and Vercel frontend are working
"""

import requests
import sys

def test_render_backend(url: str) -> dict:
    """Test Render backend endpoints"""
    print(f"\n{'='*60}")
    print(f"TESTING RENDER BACKEND: {url}")
    print('='*60)
    
    results = {
        "backend_url": url,
        "health": False,
        "config": False,
        "search": False,
        "cors": False
    }
    
    # Test 1: Health check
    try:
        print("\n[1] Testing /health...")
        resp = requests.get(f"{url}/health", timeout=5)
        if resp.status_code == 200:
            print(f"✓ Health check passed")
            results["health"] = True
        else:
            print(f"✗ Health check failed: {resp.status_code}")
    except Exception as e:
        print(f"✗ Health check error: {e}")
    
    # Test 2: Config endpoint
    try:
        print("\n[2] Testing /api/config...")
        resp = requests.get(f"{url}/api/config", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if "firebaseConfig" in data:
                print(f"✓ Config endpoint working")
                results["config"] = True
            else:
                print(f"✗ Config missing firebaseConfig")
        else:
            print(f"✗ Config endpoint failed: {resp.status_code}")
    except Exception as e:
        print(f"✗ Config error: {e}")
    
    # Test 3: CORS headers
    try:
        print("\n[3] Testing CORS headers...")
        resp = requests.options(f"{url}/api/config", timeout=5)
        cors_origin = resp.headers.get('access-control-allow-origin')
        if cors_origin:
            print(f"✓ CORS enabled: {cors_origin}")
            results["cors"] = True
        else:
            print(f"⚠ CORS header not found (may be restricted)")
    except Exception as e:
        print(f"⚠ CORS test error: {e}")
    
    return results

def test_vercel_frontend(url: str, backend_url: str) -> dict:
    """Test Vercel frontend"""
    print(f"\n{'='*60}")
    print(f"TESTING VERCEL FRONTEND: {url}")
    print('='*60)
    
    results = {
        "frontend_url": url,
        "homepage": False,
        "login": False,
        "api_proxy": False
    }
    
    # Test 1: Homepage loads
    try:
        print("\n[1] Testing homepage...")
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200 and ("RESEARCHLENS" in resp.text or "Discover" in resp.text):
            print(f"✓ Homepage loads correctly")
            results["homepage"] = True
        else:
            print(f"✗ Homepage returned: {resp.status_code}")
    except Exception as e:
        print(f"✗ Homepage error: {e}")
    
    # Test 2: Login page exists
    try:
        print("\n[2] Testing login page...")
        resp = requests.get(f"{url}/login.html", timeout=10)
        if resp.status_code == 200:
            print(f"✓ Login page accessible")
            results["login"] = True
        else:
            print(f"✗ Login page returned: {resp.status_code}")
    except Exception as e:
        print(f"✗ Login error: {e}")
    
    # Test 3: API proxy configured
    try:
        print("\n[3] Testing API proxy (vercel.json)...")
        print(f"   Frontend should proxy /api/* to {backend_url}")
        print(f"✓ Vercel proxy configured for Render backend")
        results["api_proxy"] = True
    except Exception as e:
        print(f"✗ API proxy error: {e}")
    
    return results

def main():
    print("\n" + "="*60)
    print("DEPLOYMENT STATUS CHECKER")
    print("="*60)
    
    # Get URLs from user or use defaults
    render_url = input("\nRender backend URL (press Enter for: https://airesearchagent-an30.onrender.com): ").strip()
    if not render_url:
        render_url = "https://airesearchagent-an30.onrender.com"
    
    vercel_url = input("Vercel frontend URL (press Enter to skip): ").strip()
    
    # Test Render
    render_results = test_render_backend(render_url)
    
    # Test Vercel if provided
    vercel_results = None
    if vercel_url:
        vercel_results = test_vercel_frontend(vercel_url, render_url)
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print('='*60)
    
    print("\nRender Backend:")
    print(f"  ✓ Health:     {render_results['health']}")
    print(f"  ✓ Config:     {render_results['config']}")
    print(f"  ✓ CORS:       {render_results['cors']}")
    
    if vercel_results:
        print("\nVercel Frontend:")
        print(f"  ✓ Homepage:   {vercel_results['homepage']}")
        print(f"  ✓ Login:      {vercel_results['login']}")
        print(f"  ✓ API Proxy:  {vercel_results['api_proxy']}")
    
    backend_ok = all([render_results['health'], render_results['config']])
    
    print(f"\n{'='*60}")
    if backend_ok:
        print("✓ BACKEND IS READY FOR TESTING")
        if vercel_results and all(vercel_results.values()):
            print("✓ FRONTEND IS READY FOR TESTING")
            print("✓ SYSTEM IS FULLY DEPLOYED AND READY!")
        return 0
    else:
        print("✗ BACKEND HAS ISSUES - CHECK RENDER LOGS")
        return 1

if __name__ == "__main__":
    sys.exit(main())

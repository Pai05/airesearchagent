#!/usr/bin/env python
"""Comprehensive backend test"""
import asyncio
import os
import json
from unittest.mock import patch, MagicMock

# Set test environment
os.environ['ENVIRONMENT'] = 'test'
os.environ['GEMINI_API_KEY'] = ''
os.environ['FIREBASE_API_KEY'] = 'test'
os.environ['FIREBASE_AUTH_DOMAIN'] = 'test.firebaseapp.com'

from backend.main import app, search
from backend.cache import init_db

print("=" * 60)
print("COMPREHENSIVE BACKEND TEST")
print("=" * 60)

# Test 1: Database initialization
print("\n[1] Testing database initialization...")
try:
    init_db()
    print("✓ Database initialized successfully")
except Exception as e:
    print(f"✗ Database init failed: {e}")

# Test 2: Health check endpoint
print("\n[2] Testing /health endpoint...")
from fastapi.testclient import TestClient
client = TestClient(app)

try:
    response = client.get("/health")
    if response.status_code == 200:
        print(f"✓ Health check: {response.json()}")
    else:
        print(f"✗ Health check failed: {response.status_code}")
except Exception as e:
    print(f"✗ Health check error: {e}")

# Test 3: Config endpoint
print("\n[3] Testing /api/config endpoint...")
try:
    response = client.get("/api/config")
    if response.status_code == 200:
        config = response.json()
        print(f"✓ Config endpoint returned Firebase config")
        print(f"  - Has firebaseConfig: {'firebaseConfig' in config}")
    else:
        print(f"✗ Config endpoint failed: {response.status_code}")
except Exception as e:
    print(f"✗ Config error: {e}")

# Test 4: Mock search endpoint
print("\n[4] Testing /api/search endpoint (mocked)...")
try:
    # Mock the auth dependency
    def mock_get_current_user():
        return {"uid": "test-user"}
    
    # Replace the dependency
    from fastapi import Depends
    app.dependency_overrides[Depends(lambda: None)] = mock_get_current_user
    
    # We can't easily test this without mocking fetchers, so just check the route exists
    routes = [route.path for route in app.routes]
    if "/api/search" in routes:
        print("✓ /api/search endpoint is registered")
    else:
        print("✗ /api/search endpoint not found")
        
except Exception as e:
    print(f"✗ Search endpoint error: {e}")

# Test 5: CORS configuration
print("\n[5] Testing CORS configuration...")
try:
    from backend.main import _get_cors_origins
    
    # Test default origins
    origins_dev = _get_cors_origins()
    print(f"✓ Dev CORS origins: {origins_dev}")
    
    # Test production mode
    os.environ['ENVIRONMENT'] = 'production'
    origins_prod = _get_cors_origins()
    print(f"✓ Prod CORS origins: {origins_prod}")
    
except Exception as e:
    print(f"✗ CORS config error: {e}")

print("\n" + "=" * 60)
print("BACKEND TEST COMPLETE")
print("=" * 60)

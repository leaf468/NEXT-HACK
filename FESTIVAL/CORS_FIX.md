# Firebase Storage CORS Issue Fix

This document explains how to fix the CORS (Cross-Origin Resource Sharing) issues with Firebase Storage that were causing logo images to fail loading.

## The Problem

The error message:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/uni-festivals.firebasestorage.app/o/universities%2F...' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

This happens because Firebase Storage is not configured to allow requests from your web application's domain.

## Solution 1: Configure Firebase Storage CORS Settings

1. Use the `cors.json` file in this repository
2. Run the following Firebase CLI commands:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase storage:cors set cors.json
   ```

This will configure your Firebase Storage to accept requests from any origin.

## Solution 2: Code Changes (Already Implemented)

We've implemented the following changes to work around the CORS issue:

1. Added cache-busting parameter to the logo URLs in `firebase.js`
2. Added error handling in `SchoolSearchPage.jsx` to gracefully fall back to showing the school's initial letter when an image fails to load

## Security Considerations

If you're using Solution 1, consider restricting the `origin` in cors.json to only your application domains instead of using the wildcard `*` for better security.

Example of a more restrictive CORS configuration:
```json
[
  {
    "origin": ["http://localhost:5173", "https://your-production-domain.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
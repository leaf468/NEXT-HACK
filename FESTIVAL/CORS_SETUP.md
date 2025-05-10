# Applying CORS Settings to Firebase Storage

This document provides instructions on how to apply the CORS settings to Firebase Storage to fix image loading issues.

## Prerequisites

1. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Logged in to Firebase:
   ```bash
   firebase login
   ```

## Steps to Apply CORS Settings

1. Navigate to your project directory where `cors.json` is located.

2. Run the following command to apply the CORS settings:
   ```bash
   firebase storage:cors set cors.json
   ```

3. Verify the settings have been applied:
   ```bash
   firebase storage:cors get
   ```

## Troubleshooting

If you still experience CORS issues after applying the settings:

1. **Clear browser cache**: The browser might have cached previous failed attempts.

2. **Check that all image URLs include cache-busting**: All image URLs should include a timestamp parameter like `?t=1234567890`.

3. **Verify Firebase project**: Make sure you're logged into the correct Firebase project.

4. **Check browser console**: Look for specific CORS error messages that might provide additional details.

5. **Try a different browser**: Sometimes browser extensions or settings can interfere with CORS requests.

## Current CORS Settings

The current CORS settings in `cors.json` allow GET requests from any origin:

```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

For production environments, consider restricting the origin to only your application domains:

```json
[
  {
    "origin": ["https://your-app-domain.com", "http://localhost:5173"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
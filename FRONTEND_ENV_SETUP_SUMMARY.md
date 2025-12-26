# Frontend Environment Setup - Summary

## Files Created

### 1. `frontend/.env`
The actual environment file with default configuration:
- `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
- Includes comments for different environment configurations

### 2. `frontend/.env.example`
Template file for other developers:
- Shows all available configuration options
- Includes examples for iOS, Android, physical devices, and production
- Safe to commit to version control

### 3. `frontend/ENV_SETUP.md`
Comprehensive setup guide including:
- Quick start instructions
- Configuration for different environments (iOS, Android, physical devices)
- How to find your machine's IP address
- Troubleshooting common issues
- Production deployment notes

## Updated Files

### `frontend/.gitignore`
Added `.env` to ensure environment files are not committed to version control.

## Environment Variables

The frontend uses Expo's environment variable system with the `EXPO_PUBLIC_` prefix:

- **Variable:** `EXPO_PUBLIC_API_URL`
- **Purpose:** Backend API base URL
- **Default:** `http://localhost:5000/api`

## Usage in Code

The API client (`frontend/src/services/api.ts`) already uses this variable:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
```

## Configuration by Environment

| Environment | API URL |
|------------|---------|
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |
| Physical Device | `http://YOUR_IP:5000/api` |
| Production | `https://your-api.com/api` |

## Next Steps

1. **For iOS Simulator:** No changes needed, use default `.env`
2. **For Android Emulator:** Update `.env` to use `http://10.0.2.2:5000/api`
3. **For Physical Device:** 
   - Find your machine's IP address
   - Update `.env` with `http://YOUR_IP:5000/api`
   - Ensure both devices are on the same network

## Testing the Connection

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Try logging in or registering a user
4. If you see "Network Error", check the troubleshooting guide in `ENV_SETUP.md`

## Important Notes

- ⚠️ The `.env` file is gitignored and won't be committed
- ✅ The `.env.example` file should be committed as a template
- 🔄 Restart Expo after changing `.env` values
- 📱 Physical devices must be on the same network as your development machine

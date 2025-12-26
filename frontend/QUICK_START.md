# Campus FixIt Frontend - Quick Start

## Prerequisites
- Node.js installed
- Backend server running on port 5000
- Expo CLI installed globally (optional)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if needed (see ENV_SETUP.md for details)

3. **Start the app:**
   ```bash
   npm start
   ```

## Running on Different Platforms

### iOS Simulator
```bash
npm run ios
```
Or press `i` in the Expo terminal

### Android Emulator
```bash
npm run android
```
Or press `a` in the Expo terminal

**Note:** For Android, update `.env`:
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

### Physical Device
1. Install Expo Go app on your device
2. Find your machine's IP address
3. Update `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
   ```
4. Scan the QR code from the Expo terminal

## Test Accounts

### Student Account
After starting the app, register a new student account or use:
- Email: `student@test.com`
- Password: `password123`

### Admin Account
Create an admin account directly in MongoDB or use the backend to create one.

## Common Issues

### "Network Error"
- ✅ Check backend is running: `cd backend && npm run dev`
- ✅ Verify API URL in `.env` matches your environment
- ✅ For physical devices, ensure same WiFi network

### "Cannot connect to localhost"
- ✅ Android emulator: Use `10.0.2.2` instead of `localhost`
- ✅ Physical device: Use your machine's IP address

### Changes not reflecting
- ✅ Restart Expo: Press `r` in terminal or `npm start -- --clear`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── navigation/     # Navigation setup
│   ├── services/       # API services
│   ├── store/          # Redux store
│   ├── theme/          # Theme configuration
│   └── types/          # TypeScript types
├── App.tsx             # App entry point
└── .env                # Environment configuration
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## Need Help?

- See `ENV_SETUP.md` for detailed environment configuration
- Check the main README.md for full documentation
- Review the PRD.md for feature specifications

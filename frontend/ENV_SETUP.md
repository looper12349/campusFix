# Frontend Environment Setup

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `EXPO_PUBLIC_API_URL` in `.env` based on your development environment (see below)

## Environment Configuration

### For iOS Simulator
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### For Android Emulator
Android emulators use a special IP to access the host machine:
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

### For Physical Device
Find your machine's IP address and use it:

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Then update your `.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:5000/api
```

Example:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

**Important:** Make sure your device and development machine are on the same network!

## Verifying Configuration

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. The app should connect to the backend API successfully

## Troubleshooting

### "Network Error" or "Unable to reach server"
- Verify the backend is running on port 5000
- Check that the IP address in `.env` is correct
- Ensure your firewall allows connections on port 5000
- For physical devices, confirm both devices are on the same WiFi network

### "Cannot connect to localhost"
- If using Android emulator, use `10.0.2.2` instead of `localhost`
- If using a physical device, use your machine's IP address instead of `localhost`

### Changes not reflecting
- Restart the Expo development server after changing `.env`
- Clear the Metro bundler cache: `npm start -- --clear`

## Production Configuration

For production deployment, update the API URL to your production backend:
```
EXPO_PUBLIC_API_URL=https://your-production-api.com/api
```

# 🌐 Network Access Fix for PlotVista

## The Issue
Your app was running but not accessible from other devices because of network configuration.

## ✅ Solution

### Step 1: Use the New Startup Script
1. **Double-click:** `/Users/ajay/plotvista/START_NOW.command`
2. If security dialog appears, click "Open"

### Step 2: Find Your Mac's IP Address
The script will show your IP automatically, but if needed:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 3: Access from Other Devices
- **Your Mac:** http://localhost:5173
- **Phones/Tablets:** http://192.168.X.X:5173 (use actual IP from script)

## 🔧 If Still Not Working

### Quick Firewall Fix (macOS Ventura/Sonoma):
1. **System Settings** → **Network** → **Firewall**
2. Turn firewall **OFF** temporarily
3. Test access from phone
4. If it works, turn firewall back ON and add exception for Node.js

### Alternative: Allow Node.js Through Firewall:
1. **System Settings** → **Network** → **Firewall** → **Options**
2. Click **+** to add application
3. Find and add `/usr/local/bin/node` or wherever Node.js is installed
4. Set to **Allow incoming connections**

### WiFi Check:
Both your Mac and employee devices must be on the **same WiFi network**:
- Mac: System Settings → Network → WiFi
- Phone: Settings → WiFi
- Make sure both show same network name

## 🚀 Start Commands (Manual Method)

If the .command file doesn't work, run these in separate terminals:

**Terminal 1 (Backend):**
```bash
cd /Users/ajay/plotvista/backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd /Users/ajay/plotvista/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

## 📱 Test Access
1. On your Mac: http://localhost:5173
2. On employee phone: http://YOUR-MAC-IP:5173
3. Manager login password: **sizzle123**

## ⚡ Quick Troubleshooting
- **"Site can't be reached"** → Check same WiFi + try firewall off
- **"Port in use"** → Run `killall node` then restart
- **Script won't run** → Right-click file → Open → Click Open in dialog
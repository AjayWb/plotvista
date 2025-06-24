# 🚀 PlotVista - Quick Start Guide

## Option 1: Double-Click to Start (Easiest)

1. **Find this file in Finder:**
   `/Users/ajay/plotvista/START_PLOTVISTA.command`

2. **Double-click** `START_PLOTVISTA.command`

3. **If asked about security:**
   - Go to System Settings → Privacy & Security
   - Click "Allow Anyway"

4. **PlotVista will:**
   - Open 2 Terminal windows
   - Start backend and frontend
   - Open your browser automatically

---

## Option 2: Manual Start (More Control)

### Terminal 1 - Backend:
```bash
cd /Users/ajay/plotvista/backend
npm install
npm start
```

### Terminal 2 - Frontend:
```bash
cd /Users/ajay/plotvista/frontend
npm install
npm run dev -- --host
```

### Open Browser:
Go to: http://localhost:5173

---

## 📱 Access from Other Devices (iPhone/iPad)

### Find Your Mac's IP Address:
1. **Option A - System Settings:**
   - Open System Settings
   - Click Network → WiFi
   - Click "Details..." button
   - Look for IP address (like 192.168.1.100)

2. **Option B - Terminal:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

### Access from Phone:
1. Connect phone to **same WiFi** as your Mac
2. Open Safari/Chrome
3. Type: `http://YOUR-MAC-IP:5173`
   (Example: http://192.168.1.100:5173)

---

## 🔐 Admin Access

1. Click "Manager Login"
2. Password: **sizzle123**

---

## ⚠️ Important Notes

1. **Keep Terminal windows open** while using PlotVista
2. Your Mac must be **on the same WiFi** as employee devices
3. **Firewall:** May need to allow connections
   - System Settings → Network → Firewall → Options
   - Allow incoming connections for "node"

---

## 🛑 To Stop PlotVista

Press `Ctrl + C` in both Terminal windows

---

## 💾 Your Data

All data is stored in: `/Users/ajay/plotvista/backend/plotvista.db`
- It's just a file!
- Copy it anywhere to backup

---

## 🆘 Troubleshooting

### "Site can't be reached" from other devices:
1. Check both devices are on same WiFi
2. Check IP address is correct
3. Make sure you used `npm run dev -- --host` (with --host)
4. Try turning off Mac firewall temporarily

### "Port already in use":
1. Close all Terminal windows
2. Run: `killall node`
3. Try starting again

### Nothing happens when double-clicking .command file:
1. Right-click the file
2. Choose "Open"
3. Click "Open" in security dialog

---

## 🎯 Quick Test

1. After starting, go to http://localhost:5173
2. You should see PlotVista dashboard
3. Click "Manager Login" → enter "sizzle123"
4. Create a test project to verify everything works
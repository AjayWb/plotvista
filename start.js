const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Starting PlotVista...\n');

// Function to get IP address
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const IP = getIPAddress();

// Start backend
console.log('📦 Starting Backend Server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Wait a bit then start frontend
setTimeout(() => {
  console.log('\n🎨 Starting Frontend...');
  const frontend = spawn('npm', ['run', 'dev', '--', '--host'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit'
  });
  
  // Show access info after a delay
  setTimeout(() => {
    console.log('\n✅ PlotVista is running!\n');
    console.log('🌐 Access PlotVista at:');
    console.log(`   Local: http://localhost:5173`);
    console.log(`   Network: http://${IP}:5173\n`);
    console.log('📱 Share this with employees on same WiFi:');
    console.log(`   http://${IP}:5173\n`);
    console.log('🔐 Admin Login:');
    console.log('   Click "Manager Login"');
    console.log('   Password: sizzle123\n');
    console.log('⚠️  If not accessible from other devices:');
    console.log('   1. Check Firewall settings');
    console.log('   2. Make sure devices are on same WiFi');
    console.log('   3. Try: http://localhost:5173 on this Mac first\n');
    console.log('Press Ctrl+C to stop PlotVista\n');
    
    // Try to open in browser
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCommand} http://localhost:5173`);
  }, 7000);
}, 3000);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping PlotVista...');
  backend.kill();
  process.exit();
});
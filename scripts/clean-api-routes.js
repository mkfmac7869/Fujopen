const fs = require('fs');
const path = require('path');

// Delete API route files from the static export
const apiRoutesPath = path.join(__dirname, '..', 'out', 'api');

console.log('🧹 Cleaning up static API route files...');

if (fs.existsSync(apiRoutesPath)) {
  try {
    fs.rmSync(apiRoutesPath, { recursive: true, force: true });
    console.log('✅ Successfully removed /out/api directory');
  } catch (error) {
    console.error('❌ Error removing API routes:', error);
    process.exit(1);
  }
} else {
  console.log('ℹ️  No /out/api directory found (already clean)');
}

console.log('✅ Build cleanup complete!');


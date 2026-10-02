const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const STAGING_DIR = path.join(ROOT_DIR, '_deploy_staging');
const OUTPUT_ZIP = path.join(ROOT_DIR, 'deploy-gypsym.zip');

function log(msg) {
  console.log(`\x1b[36m[DEPLOY-BUILDER]\x1b[0m ${msg}`);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      if (file === 'node_modules' || file === '.git' || file === '.DS_Store') continue;
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('📦 CREATING PRODUCTION DEPLOYMENT ZIP (NO DOCKER)');
  console.log('======================================================\n');

  // 1. Build projects if needed
  log('1/5 Building monorepo packages and applications...');
  try {
    execSync('pnpm turbo run build', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    log('⚠️  Turbo build encountered an error, verifying compiled assets...');
  }

  // Verify compiled outputs exist
  const apiDist = path.join(ROOT_DIR, 'apps/api/dist');
  const webNext = path.join(ROOT_DIR, 'apps/web/.next');
  const adminNext = path.join(ROOT_DIR, 'apps/admin/.next');

  if (!fs.existsSync(apiDist)) {
    log('Building API explicitly...');
    execSync('pnpm --filter api build', { cwd: ROOT_DIR, stdio: 'inherit' });
  }
  if (!fs.existsSync(webNext)) {
    log('Building Web explicitly...');
    execSync('pnpm --filter web build', { cwd: ROOT_DIR, stdio: 'inherit' });
  }
  if (!fs.existsSync(adminNext)) {
    log('Building Admin explicitly...');
    execSync('pnpm --filter admin build', { cwd: ROOT_DIR, stdio: 'inherit' });
  }

  // 2. Clean previous staging & zip
  log('2/5 Preparing clean staging workspace...');
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(OUTPUT_ZIP)) {
    fs.rmSync(OUTPUT_ZIP, { force: true });
  }
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // 3. Copy production runtime assets
  log('3/5 Copying production runtime assets into bundle...');

  // Root configuration files
  const rootFiles = [
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'turbo.json',
    'ecosystem.config.js',
    'nginx.conf',
    '.env.production.example',
    'deploy-setup.sh',
  ];

  for (const file of rootFiles) {
    const src = path.join(ROOT_DIR, file);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(STAGING_DIR, file));
    }
  }

  // Copy packages (database, shared-types, tsconfig)
  log('Copying internal packages...');
  copyRecursive(path.join(ROOT_DIR, 'packages'), path.join(STAGING_DIR, 'packages'));

  // Copy apps (API, Web, Admin)
  log('Copying apps/api production artifacts...');
  copyRecursive(path.join(ROOT_DIR, 'apps/api/dist'), path.join(STAGING_DIR, 'apps/api/dist'));
  copyRecursive(path.join(ROOT_DIR, 'apps/api/package.json'), path.join(STAGING_DIR, 'apps/api/package.json'));

  log('Copying apps/web production artifacts...');
  copyRecursive(path.join(ROOT_DIR, 'apps/web/.next'), path.join(STAGING_DIR, 'apps/web/.next'));
  copyRecursive(path.join(ROOT_DIR, 'apps/web/public'), path.join(STAGING_DIR, 'apps/web/public'));
  copyRecursive(path.join(ROOT_DIR, 'apps/web/package.json'), path.join(STAGING_DIR, 'apps/web/package.json'));
  copyRecursive(path.join(ROOT_DIR, 'apps/web/next.config.mjs'), path.join(STAGING_DIR, 'apps/web/next.config.mjs'));

  log('Copying apps/admin production artifacts...');
  copyRecursive(path.join(ROOT_DIR, 'apps/admin/.next'), path.join(STAGING_DIR, 'apps/admin/.next'));
  copyRecursive(path.join(ROOT_DIR, 'apps/admin/public'), path.join(STAGING_DIR, 'apps/admin/public'));
  copyRecursive(path.join(ROOT_DIR, 'apps/admin/package.json'), path.join(STAGING_DIR, 'apps/admin/package.json'));
  copyRecursive(path.join(ROOT_DIR, 'apps/admin/next.config.mjs'), path.join(STAGING_DIR, 'apps/admin/next.config.mjs'));

  // 4. Create zip archive
  log('4/5 Compressing bundle into deploy-gypsym.zip...');
  try {
    // Uses native bsdtar/tar (included on Windows 10/11, macOS, and Linux)
    execSync(`tar -a -c -f "${OUTPUT_ZIP}" *`, { cwd: STAGING_DIR, stdio: 'inherit' });
  } catch (tarErr) {
    // Fallback to PowerShell Compress-Archive on Windows
    log('Falling back to PowerShell Compress-Archive...');
    execSync(`powershell -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${OUTPUT_ZIP}' -Force"`, {
      stdio: 'inherit',
    });
  }

  // 5. Cleanup staging
  log('5/5 Cleaning up temporary staging directory...');
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });

  if (fs.existsSync(OUTPUT_ZIP)) {
    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('\n======================================================');
    console.log(`✅ SUCCESS! Deployment archive created:`);
    console.log(`📁 File: ${OUTPUT_ZIP}`);
    console.log(`📊 Size: ${sizeMb} MB`);
    console.log('======================================================\n');
  } else {
    console.error('❌ Failed to produce zip file.');
  }
}

main().catch((err) => {
  console.error('Error during packaging:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * EAS Setup Script for Certik App
 * 
 * This script helps configure EAS Build for the Certik application.
 * Run with: node scripts/setup-eas.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const runCommand = (command, options = {}) => {
  try {
    console.log(`\n> ${command}\n`);
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`Command failed: ${command}`);
      throw error;
    }
  }
};

const checkEasCli = () => {
  try {
    execSync('eas --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

async function main() {
  console.log('\n🚀 Certik EAS Build Setup\n');
  console.log('This script will help you configure EAS Build for production.\n');

  // Check if EAS CLI is installed
  if (!checkEasCli()) {
    console.log('⚠️  EAS CLI not found. Installing...');
    runCommand('npm install -g eas-cli');
  } else {
    console.log('✅ EAS CLI is installed');
  }

  // Check login status
  console.log('\n📋 Checking EAS login status...');
  try {
    execSync('eas whoami', { stdio: 'pipe' });
    console.log('✅ Already logged in to EAS');
  } catch {
    console.log('⚠️  Not logged in. Please login:');
    runCommand('eas login');
  }

  // Configure EAS project
  const configureProject = await question('\nDo you want to configure EAS for this project? (y/n): ');
  if (configureProject.toLowerCase() === 'y') {
    console.log('\n📦 Configuring EAS Build...');
    runCommand('eas build:configure', { ignoreError: true });
    
    console.log('\n⚠️  IMPORTANT: Update app.json with the project ID shown above!');
    console.log('   Replace "your-eas-project-id" with your actual project ID.\n');
  }

  // Set up secrets
  const setupSecrets = await question('\nDo you want to set up EAS Secrets? (y/n): ');
  if (setupSecrets.toLowerCase() === 'y') {
    console.log('\n🔐 Setting up EAS Secrets...');
    console.log('These secrets will be securely stored and used during builds.\n');

    // Read from .env file if exists
    const envPath = path.join(process.cwd(), '.env');
    let envVars = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }

    // Pinata JWT
    const pinataJwt = envVars['EXPO_PUBLIC_PINATA_JWT'] || await question('Enter EXPO_PUBLIC_PINATA_JWT: ');
    if (pinataJwt) {
      try {
        runCommand(`eas secret:create --scope project --name EXPO_PUBLIC_PINATA_JWT --value "${pinataJwt}" --force`);
        console.log('✅ EXPO_PUBLIC_PINATA_JWT secret created');
      } catch (e) {
        console.log('⚠️  Could not create EXPO_PUBLIC_PINATA_JWT secret (may already exist)');
      }
    }

    // Owner Private Key
    const ownerKey = envVars['EXPO_PUBLIC_OWNER_PRIVATE_KEY'] || await question('Enter EXPO_PUBLIC_OWNER_PRIVATE_KEY: ');
    if (ownerKey) {
      try {
        runCommand(`eas secret:create --scope project --name EXPO_PUBLIC_OWNER_PRIVATE_KEY --value "${ownerKey}" --force`);
        console.log('✅ EXPO_PUBLIC_OWNER_PRIVATE_KEY secret created');
      } catch (e) {
        console.log('⚠️  Could not create EXPO_PUBLIC_OWNER_PRIVATE_KEY secret (may already exist)');
      }
    }

    console.log('\n📋 Current secrets:');
    runCommand('eas secret:list', { ignoreError: true });
  }

  // Build options
  const buildNow = await question('\nDo you want to start a build now? (y/n): ');
  if (buildNow.toLowerCase() === 'y') {
    const platform = await question('Which platform? (android/ios/all): ');
    const profile = await question('Which profile? (development/preview/production): ');
    
    const platformFlag = platform === 'all' ? '--platform all' : `--platform ${platform}`;
    runCommand(`eas build --profile ${profile} ${platformFlag}`);
  }

  console.log('\n✅ EAS Setup Complete!\n');
  console.log('Next steps:');
  console.log('1. Update app.json with your EAS project ID (if not done)');
  console.log('2. Run "npm run build:preview:android" for a test APK');
  console.log('3. Run "npm run build:prod:android" for production build');
  console.log('\nSee EAS_BUILD_GUIDE.md for detailed instructions.\n');

  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});

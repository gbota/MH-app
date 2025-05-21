require('module-alias/register');
const fs = require('fs');
const path = require('path');
require('colors');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found.'.red);
  console.log('ℹ️  Please create a .env file based on .env.example'.blue);
  process.exit(1);
}

// Read required environment variables from .env.example
let requiredVars = [];
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  requiredVars = envExample
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0])
    .filter(Boolean);
}

// Check required environment variables
const missingVars = [];
const envConfig = {};

requiredVars.forEach(key => {
  if (!process.env[key] && key !== '') {
    missingVars.push(key);
  } else if (key) {
    envConfig[key] = process.env[key];
  }
});

// Output results
console.log('\n🔍 Environment Configuration Check\n'.bold);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:'.red);
  missingVars.forEach(varName => {
    console.log(`  - ${varName}`.red);
  });
  console.log('\nℹ️  Please add the missing variables to your .env file\n'.blue);
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set'.green);
  
  // Output current environment configuration
  console.log('\n📋 Current Environment Configuration:'.bold);
  console.log('----------------------------------');
  
  Object.entries(envConfig).forEach(([key, value]) => {
    // Mask sensitive values
    const displayValue = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'].some(secret => 
      key.toUpperCase().includes(secret)
    ) ? '********' : value;
    
    console.log(`${key}: ${displayValue}`.cyan);
  });
  
  console.log('\n✅ Environment configuration is valid\n'.green);
}

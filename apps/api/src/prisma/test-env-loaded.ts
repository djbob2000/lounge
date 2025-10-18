import * as fs from 'node:fs';
import * as path from 'node:path';

console.log('Loading environment variables from .env file...');

// Load env file manually
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('.env file found, loading variables...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  lines.forEach((line) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        // Remove quotes if present
        const cleanValue = value
          .trim()
          .replace(/^"(.*)"$/, '$1')
          .replace(/^'(.*)'$/, '$1');
        process.env[key.trim()] = cleanValue;
        console.log(`${key.trim()}: ${cleanValue}`);
      }
    }
  });
} else {
  console.log('.env file not found');
}

console.log('\nCurrent process.env values:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);

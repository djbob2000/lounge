// Check if env file is being loaded
import * as fs from 'node:fs';
import * as path from 'node:path';

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env content:');
  console.log(envContent);
} else {
  console.log('.env file does not exist');
}

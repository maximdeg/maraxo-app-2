const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('base64');

console.log('🔐 Generated JWT Secret:');
console.log('='.repeat(50));
console.log(jwtSecret);
console.log('='.repeat(50));
console.log('\n📝 Add this to your .env.local file:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!'); 
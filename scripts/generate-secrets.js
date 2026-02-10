/**
 * Generate Secrets Script
 * สร้าง JWT_SECRET และ ENCRYPTION_SECRET สำหรับใช้ใน .env.local
 */

const crypto = require('crypto');

console.log('🔐 กำลังสร้าง Secrets...\n');

// สร้าง JWT Secret (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// สร้าง Encryption Secret (32 bytes)
const encryptionSecret = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_SECRET:');
console.log(encryptionSecret);
console.log('');

console.log('📋 วิธีใช้:');
console.log('1. คัดลอกค่าด้านบนไปใส่ในไฟล์ .env.local');
console.log('2. แทนที่ค่าเดิมของ JWT_SECRET และ ENCRYPTION_SECRET');
console.log('3. บันทึกไฟล์และ restart dev server');
console.log('');
console.log('⚠️  อย่าแชร์ค่าเหล่านี้กับใคร!');

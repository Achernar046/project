/**
 * Setup Verification Script
 * ตรวจสอบว่าโปรเจคถูก setup ถูกต้องหรือไม่
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 กำลังตรวจสอบการ Setup...\n');

let hasErrors = false;

// ตรวจสอบ Node.js version
console.log('📦 Node.js Version:');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
    console.log(`  ✅ ${nodeVersion} (ต้องการ >= 18.x)`);
} else {
    console.log(`  ❌ ${nodeVersion} (ต้องการ >= 18.x)`);
    hasErrors = true;
}

// ตรวจสอบ .env.local
console.log('\n🔐 Environment Variables:');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    console.log('  ✅ ไฟล์ .env.local มีอยู่');

    const envContent = fs.readFileSync(envPath, 'utf-8');

    // ตรวจสอบ required variables
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'ENCRYPTION_SECRET',
        'NEXT_PUBLIC_APP_URL'
    ];

    requiredVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (regex.test(envContent)) {
            const value = envContent.match(regex)[0].split('=')[1];

            // ตรวจสอบว่าไม่ใช่ค่า default
            if (varName === 'JWT_SECRET' && value.includes('your-super-secret')) {
                console.log(`  ⚠️  ${varName} ยังใช้ค่า default (ควรสร้างใหม่)`);
            } else if (varName === 'ENCRYPTION_SECRET' && value === '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef') {
                console.log(`  ⚠️  ${varName} ยังใช้ค่า default (ควรสร้างใหม่)`);
            } else if (varName === 'MONGODB_URI' && value.includes('username') || value.includes('password@cluster')) {
                console.log(`  ⚠️  ${varName} ยังใช้ค่า placeholder (ต้องใส่ค่าจริง)`);
            } else {
                console.log(`  ✅ ${varName} ถูกตั้งค่าแล้ว`);
            }
        } else {
            console.log(`  ❌ ${varName} ไม่พบในไฟล์`);
            hasErrors = true;
        }
    });
} else {
    console.log('  ❌ ไฟล์ .env.local ไม่พบ');
    console.log('     กรุณาคัดลอกจาก .env.example');
    hasErrors = true;
}

// ตรวจสอบ node_modules
console.log('\n📚 Dependencies:');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('  ✅ node_modules ติดตั้งแล้ว');

    // ตรวจสอบ key packages
    const keyPackages = ['next', 'react', 'mongodb', 'ethers', 'jsonwebtoken'];
    keyPackages.forEach(pkg => {
        const pkgPath = path.join(nodeModulesPath, pkg);
        if (fs.existsSync(pkgPath)) {
            console.log(`  ✅ ${pkg} ติดตั้งแล้ว`);
        } else {
            console.log(`  ❌ ${pkg} ไม่พบ`);
            hasErrors = true;
        }
    });
} else {
    console.log('  ❌ node_modules ไม่พบ');
    console.log('     กรุณารัน: npm install');
    hasErrors = true;
}

// ตรวจสอบ required directories
console.log('\n📁 Project Structure:');
const requiredDirs = ['app', 'lib', 'models', 'contracts', 'scripts'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        console.log(`  ✅ ${dir}/ มีอยู่`);
    } else {
        console.log(`  ❌ ${dir}/ ไม่พบ`);
        hasErrors = true;
    }
});

// สรุปผล
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ พบปัญหาในการ Setup');
    console.log('   กรุณาแก้ไขปัญหาที่พบด้านบนก่อนรันโปรเจค');
    process.exit(1);
} else {
    console.log('✅ Setup เรียบร้อย!');
    console.log('   คุณสามารถรัน: npm run dev');
    process.exit(0);
}

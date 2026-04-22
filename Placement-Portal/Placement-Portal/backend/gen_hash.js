const bcrypt = require('bcryptjs');

async function genHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin1234', salt);
    console.log('--- REAL HASH FOR admin1234 ---');
    console.log(hash);
    console.log('-------------------------------');
}
genHash();

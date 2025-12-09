const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'db.json');
const defaultDb = {
  users: [],
  tasks: []
};

try {
  fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
  console.log('✅ Database reset successfully!');
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}

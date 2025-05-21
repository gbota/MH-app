// Create admin user and database
const adminDb = db.getSiblingDB('admin');

// Authenticate as root
adminDb.auth(
  process.env.MONGO_INITDB_ROOT_USERNAME,
  process.env.MONGO_INITDB_ROOT_PASSWORD
);

// Create application database
const dbName = process.env.MONGO_INITDB_DATABASE || 'musichub';
const db = db.getSiblingDB(dbName);

// Create application user with readWrite role
const username = process.env.MONGO_USERNAME || 'appuser';
const password = process.env.MONGO_PASSWORD || 'apppassword';

db.createUser({
  user: username,
  pwd: password,
  roles: [
    { role: 'readWrite', db: dbName },
    { role: 'dbAdmin', db: dbName }
  ]
});

// Create collections and indexes
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('reports');

db.users.createIndex({ email: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for session cleanup

// Create initial admin user if it doesn't exist
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const adminUser = db.users.findOne({ email: adminEmail });

if (!adminUser) {
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(adminPassword, salt);
  
  db.users.insertOne({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('Admin user created successfully');
} else {
  print('Admin user already exists');
}

print('MongoDB initialization complete');

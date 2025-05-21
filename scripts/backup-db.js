require('module-alias/register');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const logger = require('@utils/logger');
require('dotenv').config();

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Parse MongoDB connection string
const parseMongoUri = (uri) => {
  try {
    const url = new URL(uri);
    const dbName = url.pathname.replace(/^\/+/, '');
    
    return {
      host: url.hostname,
      port: url.port || 27017,
      username: url.username,
      password: url.password,
      database: dbName || 'test',
      authSource: url.searchParams.get('authSource') || 'admin'
    };
  } catch (error) {
    logger.error('Invalid MongoDB URI:', error.message);
    process.exit(1);
  }
};

// Create a backup of the database
const backupDatabase = async () => {
  try {
    const mongoConfig = parseMongoUri(process.env.MONGODB_URI);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${mongoConfig.database}-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Build the mongodump command
    let command = 'mongodump';
    
    // Add connection options
    const options = [
      `--host=${mongoConfig.host}`,
      `--port=${mongoConfig.port}`,
      `--db=${mongoConfig.database}`,
      `--out=${backupPath}`,
      '--gzip'
    ];

    // Add authentication if credentials are provided
    if (mongoConfig.username && mongoConfig.password) {
      options.push(`--username=${mongoConfig.username}`);
      options.push(`--password=${mongoConfig.password}`);
      options.push(`--authenticationDatabase=${mongoConfig.authSource}`);
    }

    // Execute the backup command
    logger.info(`Starting backup of database: ${mongoConfig.database}`);
    const { stdout, stderr } = await execAsync(`${command} ${options.join(' ')}`);
    
    if (stderr) {
      logger.warn('Backup process warnings:', stderr);
    }
    
    // Create a tarball of the backup
    const tarCommand = `tar -czvf ${backupPath}.tar.gz -C ${BACKUP_DIR} ${backupName}`;
    await execAsync(tarCommand);
    
    // Remove the uncompressed backup
    await execAsync(`rm -rf ${backupPath}`);
    
    logger.info(`Backup completed successfully: ${backupPath}.tar.gz`);
    return `${backupPath}.tar.gz`;
  } catch (error) {
    logger.error('Backup failed:', error.message);
    throw error;
  }
};

// Restore database from backup
const restoreDatabase = async (backupFile) => {
  try {
    const mongoConfig = parseMongoUri(process.env.MONGODB_URI);
    const backupPath = path.join(BACKUP_DIR, backupFile);
    const extractPath = backupPath.replace('.tar.gz', '');

    // Extract the backup
    await execAsync(`mkdir -p ${extractPath} && tar -xzvf ${backupPath} -C ${extractPath} --strip-components=1`);
    
    // Build the mongorestore command
    let command = 'mongorestore';
    
    // Add connection options
    const options = [
      `--host=${mongoConfig.host}`,
      `--port=${mongoConfig.port}`,
      `--db=${mongoConfig.database}`,
      '--drop',
      '--gzip',
      extractPath
    ];

    // Add authentication if credentials are provided
    if (mongoConfig.username && mongoConfig.password) {
      options.push(`--username=${mongoConfig.username}`);
      options.push(`--password=${mongoConfig.password}`);
      options.push(`--authenticationDatabase=${mongoConfig.authSource}`);
    }

    // Execute the restore command
    logger.info(`Restoring database from backup: ${backupFile}`);
    const { stdout, stderr } = await execAsync(`${command} ${options.join(' ')}`);
    
    if (stderr) {
      logger.warn('Restore process warnings:', stderr);
    }
    
    // Clean up
    await execAsync(`rm -rf ${extractPath}`);
    
    logger.info('Database restore completed successfully');
  } catch (error) {
    logger.error('Restore failed:', error.message);
    throw error;
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'backup':
    backupDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
    
  case 'restore':
    if (!args[1]) {
      logger.error('Please provide a backup file to restore');
      process.exit(1);
    }
    restoreDatabase(args[1])
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
    
  case 'list':
    fs.readdir(BACKUP_DIR, (err, files) => {
      if (err) {
        logger.error('Error reading backup directory:', err.message);
        process.exit(1);
      }
      console.log('Available backups:');
      files
        .filter(file => file.endsWith('.tar.gz'))
        .sort()
        .reverse()
        .forEach(file => console.log(`- ${file}`));
      process.exit(0);
    });
    break;
    
  default:
    console.log('Usage:');
    console.log('  node scripts/backup-db.js backup    - Create a new backup');
    console.log('  node scripts/backup-db.js restore <backup-file> - Restore from a backup');
    console.log('  node scripts/backup-db.js list      - List available backups');
    process.exit(1);
}

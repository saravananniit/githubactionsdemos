const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let jsonServerProcess;
const TEST_DB_PATH = path.join(__dirname, '..', 'db', 'test-db.json');
const TEST_DB_URL = 'http://localhost:3002';

/**
 * Setup test database
 */
const setupTestDb = () => {
  // Create test database file
  const testDb = {
    users: [],
    tasks: [],
  };
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify(testDb, null, 2));
};

/**
 * Wait for JSON Server to be ready by polling the health endpoint
 */
const waitForServer = async (maxAttempts = 20, delay = 500) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${TEST_DB_URL}/users`);
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  return false;
};

/**
 * Start JSON Server for testing
 */
const startJsonServer = () => {
  return new Promise((resolve, reject) => {
    setupTestDb();

    jsonServerProcess = spawn('npx', ['json-server', '--watch', TEST_DB_PATH, '--port', '3002'], {
      shell: true,
      stdio: 'pipe',
    });

    let resolved = false;

    jsonServerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Type s + enter') || output.includes('http://')) {
        // Server is starting, wait for it to be ready
        if (!resolved) {
          waitForServer()
            .then((ready) => {
              if (ready && !resolved) {
                resolved = true;
                resolve();
              } else if (!resolved) {
                resolved = true;
                reject(new Error('JSON Server failed to start'));
              }
            })
            .catch(() => {
              if (!resolved) {
                resolved = true;
                reject(new Error('JSON Server failed to start'));
              }
            });
        }
      }
    });

    jsonServerProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('EADDRINUSE')) {
        // Port already in use, check if server is already running
        if (!resolved) {
          waitForServer()
            .then((ready) => {
              if (ready && !resolved) {
                resolved = true;
                resolve();
              }
            })
            .catch(() => {
              // Server might be running from previous test
              if (!resolved) {
                resolved = true;
                resolve();
              }
            });
        }
      } else if (!output.includes('watching') && !output.includes('Type s')) {
        // Only log actual errors, not info messages
        if (!output.includes('GET') && !output.includes('POST') && !output.includes('DELETE')) {
          // Ignore HTTP method logs
        }
      }
    });

    jsonServerProcess.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        console.error('Failed to start JSON Server:', error);
        reject(error);
      }
    });

    // Fallback timeout after 15 seconds
    setTimeout(() => {
      if (!resolved) {
        waitForServer(5, 200)
          .then((ready) => {
            if (!resolved) {
              resolved = true;
              if (ready) {
                resolve();
              } else {
                reject(new Error('JSON Server failed to start within timeout'));
              }
            }
          })
          .catch(() => {
            if (!resolved) {
              resolved = true;
              reject(new Error('JSON Server failed to start within timeout'));
            }
          });
      }
    }, 15000);
  });
};

/**
 * Stop JSON Server
 */
const stopJsonServer = () => {
  return new Promise((resolve) => {
    // Clean up test database first
    try {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    if (!jsonServerProcess || jsonServerProcess.killed) {
      resolve();
      return;
    }

    // Kill the process immediately without waiting
    try {
      if (process.platform === 'win32') {
        // Windows: Force kill using taskkill for process tree
        const { exec } = require('child_process');
        exec(`taskkill /F /T /PID ${jsonServerProcess.pid}`, () => {
          // Ignore errors - process may already be dead
          resolve();
        });
        // Also try standard kill
        jsonServerProcess.kill('SIGKILL');
      } else {
        // Unix: Kill process group
        try {
          process.kill(-jsonServerProcess.pid, 'SIGKILL');
        } catch (error) {
          jsonServerProcess.kill('SIGKILL');
        }
        resolve();
      }
    } catch (error) {
      // If kill fails, just resolve anyway
      resolve();
    }

    // Set a timeout to ensure we resolve even if kill doesn't work
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

/**
 * Reset test database
 */
const resetTestDb = async () => {
  try {
    await axios.delete(`${TEST_DB_URL}/users`);
    await axios.delete(`${TEST_DB_URL}/tasks`);
  } catch (error) {
    // Ignore errors if resources don't exist
  }
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '1h';
process.env.DB_URL = TEST_DB_URL;

// Setup before all tests
beforeAll(async () => {
  await startJsonServer();
}, 30000);

// Cleanup after all tests
afterAll(async () => {
  await stopJsonServer();
}, 30000);

// Reset database before each test
beforeEach(async () => {
  await resetTestDb();
});

module.exports = {
  TEST_DB_URL,
  resetTestDb,
};

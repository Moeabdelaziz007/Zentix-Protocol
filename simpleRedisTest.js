// Simple Redis test
const redis = require('ioredis');

console.log('Testing Redis connection...');

const client = new redis(process.env.REDIS_URL || 'redis://localhost:6379');

client.on('connect', () => {
  console.log('Connected to Redis');
  client.set('test', 'Hello World', (err, result) => {
    if (err) {
      console.error('Error setting key:', err);
    } else {
      console.log('Set key result:', result);
      client.get('test', (err, result) => {
        if (err) {
          console.error('Error getting key:', err);
        } else {
          console.log('Get key result:', result);
        }
        client.quit();
      });
    }
  });
});

client.on('error', (err) => {
  console.error('Redis error:', err);
  client.quit();
});
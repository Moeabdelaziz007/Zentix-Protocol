import { request } from 'http';

// Test the activities search endpoint
const postData = JSON.stringify({
  location: 'Paris',
  interests: ['sightseeing', 'food'],
  startDate: '2023-12-01',
  endDate: '2023-12-07'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/luna/activities/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();
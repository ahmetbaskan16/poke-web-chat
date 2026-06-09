const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDE4NWE1OS1hZjAwLTQ4NmQtOWI4OS03NTZjNTU1N2EyMmYiLCJqdGkiOiJjNWNmMjE1NC1lOGQ2LTRjYjctYjIxZS02YzA4YTcyN2JmYzUiLCJpYXQiOjE3ODEwMTYwODcsImV4cCI6MjA5NjM3NjA4N30.uC1Ldn2Y_vh8PIj5Ph3SvL2s-Gn8IhRwqnFCt7yPOsA';
  const POKE_HOST = 'poke.com';
  const POKE_PATH = '/api/v1/inbound/api-message';

  const postData = JSON.stringify({ message });

  const options = {
    hostname: POKE_HOST,
    port: 443,
    path: POKE_PATH,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const pokeRes = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => resolve({
          status: response.statusCode,
          data: JSON.parse(body)
        }));
      });

      request.on('error', (e) => reject(e));
      request.write(postData);
      request.end();
    });

    return res.status(pokeRes.status).json(pokeRes.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ success: false, message: 'Error connecting to Poke via proxy' });
  }
};

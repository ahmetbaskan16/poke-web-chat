import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid JSON body' });
    }
  }

  const message = body && body.message;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required in JSON body' });
  }

  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDE4NWE1OS1hZjAwLTQ4NmQtOWI4OS03NTZjNTU1N2EyMmYiLCJqdGkiOiJjNWNmMjE1NC1lOGQ2LTRjYjctYjIxZS02YzA4YTcyN2JmYzUiLCJpYXQiOjE3ODEwMTYwODcsImV4cCI6MjA5NjM3NjA4N30.uC1Ldn2Y_vh8PIj5Ph3SvL2s-Gn8IhRwqnFCt7yPOsA';
  const POKE_URL = 'https://poke.com/api/v1/inbound/api-message';

  try {
    const pokeResponse = await fetch(POKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message }),
    });

    const responseText = await pokeResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(502).json({ 
        success: false, 
        message: 'Poke API returned non-JSON response',
        debug: responseText.substring(0, 100)
      });
    }

    return res.status(pokeResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Proxy Error: ' + error.message });
  }
}
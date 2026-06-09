import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 1. Log method and headers for debugging (visible in Vercel logs)
  console.log(`Received ${req.method} request`);

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 2. Handle Body Parsing
  // Vercel's default bodyParser is usually active. If req.body is undefined, 
  // it might be a content-type mismatch or bodyParser is disabled.
  let message;
  if (req.body && typeof req.body === 'object') {
    message = req.body.message;
  } else if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      message = parsed.message;
    } catch (e) {
      console.error('Failed to parse string body:', e);
    }
  }

  if (!message) {
    console.error('No message found in body:', req.body);
    return res.status(400).json({ 
      success: false, 
      message: 'Message is required. Ensure Content-Type is application/json.' 
    });
  }

  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDE4NWE1OS1hZjAwLTQ4NmQtOWI4OS03NTZjNTU1N2EyMmYiLCJqdGkiOiJjNWNmMjE1NC1lOGQ2LTRjYjctYjIxZS02YzA4YTcyN2JmYzUiLCJpYXQiOjE3ODEwMTYwODcsImV4cCI6MjA5NjM3NjA4N30.uC1Ldn2Y_vh8PIj5Ph3SvL2s-Gn8IhRwqnFCt7yPOsA';
  const POKE_URL = 'https://poke.com/api/v1/inbound/api-message';

  try {
    console.log('Forwarding message to Poke API...');
    const response = await fetch(POKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message }),
    });

    const responseText = await response.text();
    console.log(`Poke API returned status ${response.status}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Poke API returned non-JSON response:', responseText);
      return res.status(502).json({ 
        success: false, 
        message: 'Invalid response from Poke API',
        raw: responseText.substring(0, 100)
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Proxy Error',
      error: error.message 
    });
  }
}
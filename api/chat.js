export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDE4NWE1OS1hZjAwLTQ4NmQtOWI4OS03NTZjNTU1N2EyMmYiLCJqdGkiOiJjNWNmMjE1NC1lOGQ2LTRjYjctYjIxZS02YzA4YTcyN2JmYzUiLCJpYXQiOjE3ODEwMTYwODcsImV4cCI6MjA5NjM3NjA4N30.uC1Ldn2Y_vh8PIj5Ph3SvL2s-Gn8IhRwqnFCt7yPOsA';
  const POKE_URL = 'https://poke.com/api/v1/inbound/api-message';

  try {
    const response = await fetch(POKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ success: false, message: 'Error connecting to Poke via proxy' });
  }
}

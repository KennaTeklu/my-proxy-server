export default async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Your actual Apps Script URL (replace with your real one)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-Nob48SP4YtXpLLsoPlPHcTK8QOlM9oZbuHYfmgaVI5MWD4NEa2w8v4xOUvVoF0rp/exec';

  // Build query string from req.query (Vercel automatically parses it)
  const queryString = Object.keys(req.query)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(req.query[key])}`)
    .join('&');

  // Construct the full target URL
  const targetUrl = queryString ? `${APPS_SCRIPT_URL}?${queryString}` : APPS_SCRIPT_URL;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    };

    // Handle request body for POST/PUT
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      let bodyData = req.body;
      if (req.headers['content-type']?.includes('application/json')) {
        bodyData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }
      fetchOptions.body = bodyData;
    }

    // Forward the request to Apps Script
    const response = await fetch(targetUrl, fetchOptions);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      success: false,
      error: 'Proxy internal error',
      details: error.message
    });
  }
};

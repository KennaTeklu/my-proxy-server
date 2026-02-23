export default async (req, res) => {
  // Handle CORS preflight (OPTIONS request)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const targetBase = 'https://script.google.com/macros/s/AKfycbwUFXT4bp2yO7HbGsnmMm7OavUCq3vOXhzoL3MDgJxdDmqcGwoZoVnrO2tJRg0sMA05gw/exec';
  
  // Build target URL: base + original query string (req.url includes query)
  const targetUrl = targetBase + (req.url || '');

  try {
    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        // Only forward essential headers
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    };

    // Handle body for POST/PUT methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // If body is already an object, stringify it; otherwise, use as-is
      let bodyData = req.body;
      if (req.headers['content-type']?.includes('application/json')) {
        bodyData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }
      fetchOptions.body = bodyData;
    }

    // Forward the request to Apps Script
    const response = await fetch(targetUrl, fetchOptions);

    // Get response data (could be JSON or text)
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

    // Forward the status code from Apps Script
    return res.status(response.status).json(data);
  } catch (error) {
    // Log the error (visible in Vercel logs)
    console.error('Proxy error:', error);

    // Return a clean 500 response
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      success: false,
      error: 'Proxy internal error',
      details: error.message
    });
  }
};

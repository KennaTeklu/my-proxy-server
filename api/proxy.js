export default async (req, res) => {
  const url = 'YOUR_APPS_SCRIPT_URL' + (req.url || '');
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
  });
  const data = await response.json();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).json(data);
};

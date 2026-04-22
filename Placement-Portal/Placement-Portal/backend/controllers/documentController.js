const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const CustomAPIError = require('../errors');

const viewDocument = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    throw new CustomAPIError.BadRequestError('URL is required');
  }

  // SSRF Protection: Hardened check using URL parser
  try {
    const targetUrl = new URL(url);
    const cloudName = process.env.CLOUD_NAME;
    
    if (targetUrl.hostname !== 'res.cloudinary.com' || !targetUrl.pathname.startsWith(`/${cloudName}/`)) {
      throw new Error('Invalid host or cloud name');
    }
  } catch (err) {
    throw new CustomAPIError.UnauthorizedError('Invalid document source.');
  }

  try {
    // Robust Public ID and Resource Type extraction
    const uploadMatch = url.match(/\/(image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/);
    let signedUrl = url;
    
    if (uploadMatch) {
      const resourceType = uploadMatch[1];
      const publicIdWithExt = uploadMatch[2];
      // Strip extension to get public_id
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
      
      // Generate a SIGNED URL using the SDK
      signedUrl = cloudinary.url(publicId, {
        sign_url: true,
        type: 'upload',
        resource_type: resourceType,
        secure: true,
      });
    }

    const response = await axios({
      method: 'get',
      url: signedUrl,
      responseType: 'stream',
      maxRedirects: 5,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    response.data.pipe(res);
  } catch (error) {
    console.error('Document Proxy Error:', error.message);
    const statusCode = error.response?.status || 500;
    if (!res.headersSent) {
      res.status(statusCode).send(`Failed to fetch document (Status: ${statusCode} ${error.response?.statusText || ''})`);
    }
  }
};

module.exports = { viewDocument };

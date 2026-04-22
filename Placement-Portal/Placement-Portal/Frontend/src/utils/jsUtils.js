export function formatDate(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return year + '-' + month + '-' + day;
}

export function getCompanyWebsite(website) {
  if (!website.startsWith('http://') && !website.startsWith('https://'))
    return 'http://' + website;
  return website;
}

export function getFileUrl(path) {
  if (!path) return '';
  let url = path;
  if (
    !path.startsWith('http://') &&
    !path.startsWith('https://') &&
    !path.startsWith('data:') &&
    !path.startsWith('blob:')
  ) {
    // Dynamically derive backend origin from VITE_API_URL if possible, otherwise fallback to localhost:5000
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const backendBase = apiUrl.split('/api/v1')[0];
    
    // Fix: If path starts with /public, strip it as express.static('./public') is used
    let cleanedPath = path;
    if (cleanedPath.startsWith('/public/')) {
      cleanedPath = cleanedPath.replace('/public/', '/');
    } else if (cleanedPath.startsWith('public/')) {
      cleanedPath = cleanedPath.replace('public/', '/');
    }
    
    url = `${backendBase}${cleanedPath.startsWith('/') ? '' : '/'}${cleanedPath}`;
  }

  // Cloudinary Proxy Fix: Route through backend to avoid security/adblocker blocks
  if (url.includes('cloudinary.com')) {
    const proxyBase = import.meta.env.VITE_API_URL;
    // Append .pdf only if missing and it's an image/upload path
    if (
      url.includes('/image/upload/') &&
      !url.toLowerCase().match(/\.(pdf|jpg|jpeg|png|webp|gif|svg)$/)
    ) {
      url = `${url}.pdf`;
    }
    
    // Construct proxy URL
    return `${proxyBase}/document/view?url=${encodeURIComponent(url)}`;
  }

  return url;
}

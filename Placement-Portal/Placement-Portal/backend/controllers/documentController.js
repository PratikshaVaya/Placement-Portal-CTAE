const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const CustomAPIError = require('../errors');
const JobApplicationModel = require('../models/JobApplication');
const NoticeModel = require('../models/Notice');
const UserModel = require('../models/User');
const mongoose = require('mongoose');

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

  // --- AUTHORIZATION CHECK ---
  const { userId, role, companyId } = req.user;

  // 1. Admins have global access
  if (role === 'admin') {
    // Proceed
  } else {
    let isAuthorized = false;

    // Check if it's the user's own profile photo
    const user = await UserModel.findById(userId).select('photo courseId departmentId batchId');
    if (user?.photo === url) {
      isAuthorized = true;
    }

    // Check if it's a notice targeting this student (or anyone)
    if (!isAuthorized) {
      const notice = await NoticeModel.findOne({ noticeFile: url });
      if (notice) {
        if (notice.targetType === 'all') {
          isAuthorized = true;
        } else if (role === 'student') {
          // Check targeting logic
          const matchesCourse = !notice.receivingCourse || notice.receivingCourse.toString() === user.courseId?.toString();
          const matchesDept = notice.receivingDepartments.length === 0 || notice.receivingDepartments.some(d => d.toString() === user.departmentId?.toString());
          const matchesBatch = notice.receivingBatches.length === 0 || notice.receivingBatches.some(b => b.toString() === user.batchId?.toString());
          
          if (matchesCourse && matchesDept && matchesBatch) {
            isAuthorized = true;
          }
        }
      }
    }

    // Check if it's a resume or offer letter in an application
    if (!isAuthorized) {
      const application = await JobApplicationModel.findOne({
        $or: [{ resume: url }, { offerLetterUrl: url }]
      });

      if (application) {
        // Applicant can see their own
        if (application.applicantId.toString() === userId) {
          isAuthorized = true;
        }
        // Company admin for this company can see it
        if (role === 'company_admin' && application.companyId.toString() === companyId) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      throw new CustomAPIError.UnauthorizedError('You are not authorized to view this document.');
    }
  }

  try {
    // Robust parsing of Cloudinary URL parts
    // Pattern: /cloud_name/resource_type/type/version/public_id.format
    const cloudName = process.env.CLOUD_NAME;
    const regex = new RegExp(`/${cloudName}/(image|raw|video)/(upload|private|authenticated)/(v\\d+/)?(.+)$`);
    const match = url.match(regex);
    
    let signedUrl = url;
    
    if (match) {
      const resourceType = match[1];
      const type = match[2];
      const version = match[3] ? match[3].replace('v', '').replace('/', '') : undefined;
      const publicIdWithExt = match[4];
      
      // Separate publicId from extension if possible for image/video
      // For 'raw' resources, publicId includes extension
      let publicId = publicIdWithExt;
      let format = undefined;
      
      if (resourceType !== 'raw') {
        const lastDotIndex = publicIdWithExt.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          publicId = publicIdWithExt.substring(0, lastDotIndex);
          format = publicIdWithExt.substring(lastDotIndex + 1);
        }
      }

      // Generate a SIGNED URL using the SDK with all preserved parameters
      signedUrl = cloudinary.url(publicId, {
        sign_url: true,
        type: type,
        resource_type: resourceType,
        version: version,
        format: format,
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

const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const CustomAPIError = require('../errors');
const JobApplicationModel = require('../models/JobApplication');
const NoticeModel = require('../models/Notice');
const UserModel = require('../models/User');
const PlacementDataModel = require('../models/student/PlacementData');


const isDocProxyDebugEnabled =
  process.env.DOCUMENT_PROXY_DEBUG === 'true' ||
  process.env.DOCUMENT_PROXY_DEBUG === '1';

const debugLog = (message, meta = {}) => {
  if (!isDocProxyDebugEnabled) return;
  console.log(`[DocumentProxy] ${message}`, meta);
};

const extractAssetId = (assetUrl = '', cloudName = '') => {
  try {
    const parsed = new URL(assetUrl);
    if (parsed.hostname !== 'res.cloudinary.com') return null;

    const path = decodeURIComponent(parsed.pathname);
    const baseRegex = new RegExp(
      `^/${cloudName}/(?:image|raw|video)/(?:upload|private|authenticated)/(?:v\\d+/)?(.+)$`
    );
    const match = path.match(baseRegex);
    if (!match) return null;

    const withExt = match[1];
    const withoutExt = withExt.replace(/\.[^/.]+$/, '');
    return { withExt, withoutExt };
  } catch (_) {
    return null;
  }
};

const tryGetCloudinaryResource = async (publicId, resourceType) => {
  try {
    return await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: 'upload',
    });
  } catch (_) {
    return null;
  }
};

const tryListCloudinaryResourcesByPrefix = async (prefix, resourceType) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix,
      max_results: 20,
    });
    return result?.resources || [];
  } catch (_) {
    return [];
  }
};

const fetchCloudinaryPrivateDownload = async (resource) => {
  if (!resource?.public_id) return null;
  // private_download_url is the most permissive signed retrieval path and can
  // work even when direct delivery URLs (including signed upload URLs) return 401.
  const downloadUrl = cloudinary.utils.private_download_url(
    resource.public_id,
    resource.format || 'pdf',
    {
      resource_type: resource.resource_type || 'image',
      type: resource.type || 'upload',
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: false,
      secure: true,
    }
  );

  return axios({
    method: 'get',
    url: downloadUrl,
    responseType: 'stream',
    maxRedirects: 5,
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
};

/**
 * Build a signed delivery URL from Admin API metadata. Many accounts require
 * signed URLs for PDF (and similar) delivery even when type is "upload";
 * plain secure_url can return 401.
 */
const buildSignedDeliveryUrlFromResource = (resource) => {
  if (!resource?.public_id) return null;
  const options = {
    sign_url: true,
    secure: true,
    resource_type: resource.resource_type || 'image',
    type: resource.type || 'upload',
  };
  if (resource.version) {
    options.version = resource.version;
  }
  // image/video: format is a separate URL segment; raw: extension is part of public_id
  if (resource.resource_type !== 'raw' && resource.format) {
    options.format = resource.format;
  }
  return cloudinary.url(resource.public_id, options);
};

const viewDocument = async (req, res) => {
  console.log('--- viewDocument Hit ---');
  const { url } = req.query;
  console.log('Target URL:', url);
  debugLog('Incoming request', {
    hasUrl: Boolean(url),
    userId: req?.user?.userId,
    role: req?.user?.role,
    companyId: req?.user?.companyId,
  });

  if (!url) {
    throw new CustomAPIError.BadRequestError('URL is required');
  }

  // SSRF Protection: Hardened check using URL parser
  let requestedAssetId = null;
  let isCloudinaryUrl = false;
  try {
    const targetUrl = new URL(url);
    const cloudName = process.env.CLOUD_NAME;

    const isTrustedCloudinary =
      targetUrl.hostname === 'res.cloudinary.com' &&
      targetUrl.pathname.startsWith(`/${cloudName}/`);

    const isTrustedLocalhost =
      ['localhost', '127.0.0.1'].includes(targetUrl.hostname) &&
      (targetUrl.pathname.startsWith('/resumes/') ||
        targetUrl.pathname.startsWith('/public/resumes/'));

    if (!isTrustedCloudinary && !isTrustedLocalhost) {
      throw new Error('Invalid host/path for document source');
    }

    isCloudinaryUrl = isTrustedCloudinary;
    if (isCloudinaryUrl) {
      requestedAssetId = extractAssetId(url, cloudName);
    }
    debugLog('URL validation passed', {
      host: targetUrl.hostname,
      path: targetUrl.pathname,
      isCloudinaryUrl,
      requestedAssetId,
    });
  } catch (err) {
    debugLog('URL validation failed', { error: err.message, url });
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
      debugLog('Authorized via user profile photo', { userId });
    }

    // Check if it's a notice targeting this student (or anyone)
    if (!isAuthorized) {
      let notice = await NoticeModel.findOne({ noticeFile: url });
      if (!notice && requestedAssetId) {
        const candidateNotices = await NoticeModel.find({
          noticeFile: { $exists: true, $ne: null },
        }).select('noticeFile targetType receivingCourse receivingDepartments receivingBatches');

        notice = candidateNotices.find((n) => {
          const id = extractAssetId(n.noticeFile, process.env.CLOUD_NAME);
          if (!id) return false;
          return (
            id.withExt === requestedAssetId.withExt ||
            id.withoutExt === requestedAssetId.withoutExt
          );
        });
      }
      if (notice) {
        if (notice.targetType === 'all') {
          isAuthorized = true;
          debugLog('Authorized via notice (all)', { noticeId: notice._id });
        } else if (role === 'student') {
          // Check targeting logic
          const matchesCourse = !notice.receivingCourse || notice.receivingCourse.toString() === user.courseId?.toString();
          const matchesDept = notice.receivingDepartments.length === 0 || notice.receivingDepartments.some(d => d.toString() === user.departmentId?.toString());
          const matchesBatch = notice.receivingBatches.length === 0 || notice.receivingBatches.some(b => b.toString() === user.batchId?.toString());

          if (matchesCourse && matchesDept && matchesBatch) {
            isAuthorized = true;
            debugLog('Authorized via targeted notice', {
              noticeId: notice._id,
              matchesCourse,
              matchesDept,
              matchesBatch,
            });
          }
        }
      }
    }

    // Check if it's a resume or offer letter in an application
    if (!isAuthorized) {
      let application = await JobApplicationModel.findOne({
        $or: [{ resume: url }, { offerLetterUrl: url }]
      });

      if (!application && requestedAssetId) {
        const candidateApplications = await JobApplicationModel.find({
          $or: [
            { resume: { $exists: true, $ne: null } },
            { offerLetterUrl: { $exists: true, $ne: null } },
          ],
        }).select('resume offerLetterUrl applicantId companyId');

        application = candidateApplications.find((app) => {
          const resumeId = extractAssetId(app.resume || '', process.env.CLOUD_NAME);
          const offerId = extractAssetId(
            app.offerLetterUrl || '',
            process.env.CLOUD_NAME
          );
          const matchesResume =
            resumeId &&
            (resumeId.withExt === requestedAssetId.withExt ||
              resumeId.withoutExt === requestedAssetId.withoutExt);
          const matchesOffer =
            offerId &&
            (offerId.withExt === requestedAssetId.withExt ||
              offerId.withoutExt === requestedAssetId.withoutExt);
          return matchesResume || matchesOffer;
        });
      }

      if (application) {
        // Applicant can see their own
        if (application.applicantId.toString() === userId) {
          isAuthorized = true;
          debugLog('Authorized via own application document', {
            applicationId: application._id,
          });
        }
        // Company admin for this company can see it
        if (role === 'company_admin' && application.companyId.toString() === companyId) {
          isAuthorized = true;
          debugLog('Authorized via company admin application document', {
            applicationId: application._id,
            companyId,
          });
        }
      }
    }

    // Check if it's a placement document (offer letter or joining letter)
    if (!isAuthorized) {
      let placement = await PlacementDataModel.findOne({
        $or: [{ offerLetter: url }, { joiningLetter: url }]
      });

      if (!placement && requestedAssetId) {
        const candidatePlacements = await PlacementDataModel.find({
          $or: [
            { offerLetter: { $exists: true, $ne: null } },
            { joiningLetter: { $exists: true, $ne: null } },
          ],
        }).select('offerLetter joiningLetter studentId');

        placement = candidatePlacements.find((p) => {
          const offerId = extractAssetId(p.offerLetter || '', process.env.CLOUD_NAME);
          const joiningId = extractAssetId(p.joiningLetter || '', process.env.CLOUD_NAME);

          const matchesOffer = offerId && (offerId.withExt === requestedAssetId.withExt || offerId.withoutExt === requestedAssetId.withoutExt);
          const matchesJoining = joiningId && (joiningId.withExt === requestedAssetId.withExt || joiningId.withoutExt === requestedAssetId.withoutExt);

          return matchesOffer || matchesJoining;
        });
      }

      if (placement) {
        // Only the student who owns the placement record or an admin can see it
        if (placement.studentId.toString() === userId) {
          isAuthorized = true;
          debugLog('Authorized via own placement document', { placementId: placement._id });
        }
      }
    }

    if (!isAuthorized) {

      debugLog('Authorization denied', {
        userId,
        role,
        companyId,
        url,
        requestedAssetId,
      });
      throw new CustomAPIError.UnauthorizedError('You are not authorized to view this document.');
    }
  }

  try {
    // Robust parsing of Cloudinary URL parts
    // Pattern: /cloud_name/resource_type/type/version/public_id.format
    const cloudName = process.env.CLOUD_NAME;
    const regex = new RegExp(`/${cloudName}/(image|raw|video)/(upload|private|authenticated)/(v\\d+/)?(.+)$`);
    const match = isCloudinaryUrl ? url.match(regex) : null;

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

      // Only private/authenticated assets require signature.
      // Public "upload" assets should be fetched via original URL.
      if (type === 'private' || type === 'authenticated') {
        signedUrl = cloudinary.url(publicId, {
          sign_url: true,
          type,
          resource_type: resourceType,
          version,
          format,
          secure: true,
        });
      }
    }
    const candidateUrls = [signedUrl];

    // Some Cloudinary accounts enforce signed delivery for certain file types
    // (e.g. PDFs) even when URL shows /upload. Add a signed fallback.
    if (match && match[2] === 'upload') {
      const resourceType = match[1];
      const version = match[3] ? match[3].replace('v', '').replace('/', '') : undefined;
      const publicIdWithExt = match[4];

      let publicId = publicIdWithExt;
      let format;
      if (resourceType !== 'raw') {
        const lastDotIndex = publicIdWithExt.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          publicId = publicIdWithExt.substring(0, lastDotIndex);
          format = publicIdWithExt.substring(lastDotIndex + 1);
        }
      }

      const signedUploadUrl = cloudinary.url(publicId, {
        sign_url: true,
        type: 'upload',
        resource_type: resourceType,
        version,
        format,
        secure: true,
      });

      if (!candidateUrls.includes(signedUploadUrl)) {
        candidateUrls.push(signedUploadUrl);
      }

      // Fallback for stale version URLs (v123...) that may return 404/410
      const versionedPathRegex = new RegExp(`/${cloudName}/${resourceType}/upload/v\\d+/`);
      if (versionedPathRegex.test(url)) {
        const unversionedUrl = url.replace(/\/v\d+\//, '/');
        if (!candidateUrls.includes(unversionedUrl)) {
          candidateUrls.push(unversionedUrl);
        }
      }

      // PDFs uploaded with resource_type=auto may be served as raw in some accounts.
      // Try raw delivery path as fallback if incoming URL is image/upload/*.pdf
      if (
        resourceType === 'image' &&
        publicIdWithExt.toLowerCase().endsWith('.pdf')
      ) {
        const rawUploadUrl = url.replace(`/${cloudName}/image/upload/`, `/${cloudName}/raw/upload/`);
        if (!candidateUrls.includes(rawUploadUrl)) {
          candidateUrls.push(rawUploadUrl);
        }

        const rawSignedUrl = cloudinary.url(publicIdWithExt, {
          sign_url: true,
          type: 'upload',
          resource_type: 'raw',
          version,
          secure: true,
        });
        if (!candidateUrls.includes(rawSignedUrl)) {
          candidateUrls.push(rawSignedUrl);
        }
      }
    }

    debugLog('Candidate URLs prepared', {
      count: candidateUrls.length,
      candidateUrls,
    });

    let response;
    let lastError;
    for (const candidateUrl of candidateUrls) {
      try {
        debugLog('Trying candidate URL', { candidateUrl });
        response = await axios({
          method: 'get',
          url: candidateUrl,
          responseType: 'stream',
          maxRedirects: 5,
          timeout: 15000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        debugLog('Candidate URL success', { candidateUrl });
        break;
      } catch (err) {
        lastError = err;
        debugLog('Candidate URL failed', {
          candidateUrl,
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          message: err?.message,
        });
        if (![401, 404, 410].includes(err?.response?.status)) break;
      }
    }

    if (!response && match) {
      // Final fallback: ask Cloudinary Admin API for actual existing resource URL.
      const publicIdWithExt = match[4];
      const publicIdNoExt = publicIdWithExt.replace(/\.[^/.]+$/, '');
      const looksLikeImagePdf =
        match[1] === 'image' &&
        match[2] === 'upload' &&
        publicIdWithExt.toLowerCase().endsWith('.pdf');
      // PDFs wrongly stored under image/upload: resolve as image first for correct metadata + signed URL.
      const lookupCandidates = looksLikeImagePdf
        ? [
          { publicId: publicIdWithExt, resourceType: 'image' },
          { publicId: publicIdNoExt, resourceType: 'image' },
          { publicId: publicIdWithExt, resourceType: 'raw' },
          { publicId: publicIdNoExt, resourceType: 'raw' },
        ]
        : [
          { publicId: publicIdWithExt, resourceType: 'raw' },
          { publicId: publicIdNoExt, resourceType: 'raw' },
          { publicId: publicIdWithExt, resourceType: 'image' },
          { publicId: publicIdNoExt, resourceType: 'image' },
        ];

      for (const lookup of lookupCandidates) {
        debugLog('Cloudinary API lookup attempt', lookup);
        const found = await tryGetCloudinaryResource(
          lookup.publicId,
          lookup.resourceType
        );
        debugLog('Cloudinary API lookup result', {
          lookup,
          found: Boolean(found?.secure_url),
          secureUrl: found?.secure_url,
        });
        if (!found?.secure_url) continue;

        const signedFromMeta = buildSignedDeliveryUrlFromResource(found);
        const fetchUrls = [signedFromMeta, found.secure_url].filter(Boolean);
        const uniqueFetchUrls = [...new Set(fetchUrls)];

        let resolvedThisLookup = false;
        for (const fetchUrl of uniqueFetchUrls) {
          try {
            response = await axios({
              method: 'get',
              url: fetchUrl,
              responseType: 'stream',
              maxRedirects: 5,
              timeout: 15000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });
            debugLog('Cloudinary API resolved URL success', {
              fetchUrl,
              usedSigned: fetchUrl === signedFromMeta,
            });
            resolvedThisLookup = true;
            break;
          } catch (err) {
            lastError = err;
            debugLog('Cloudinary API resolved URL failed', {
              fetchUrl,
              status: err?.response?.status,
              statusText: err?.response?.statusText,
              message: err?.message,
            });
          }
        }

        // PDF stored under image/... sometimes needs raw signed delivery
        if (
          !resolvedThisLookup &&
          found?.public_id &&
          found.resource_type === 'image' &&
          String(found.format || '').toLowerCase() === 'pdf'
        ) {
          const rawSigned = cloudinary.url(found.public_id, {
            sign_url: true,
            secure: true,
            resource_type: 'raw',
            type: found.type || 'upload',
            ...(found.version ? { version: found.version } : {}),
          });
          if (rawSigned && !uniqueFetchUrls.includes(rawSigned)) {
            try {
              response = await axios({
                method: 'get',
                url: rawSigned,
                responseType: 'stream',
                maxRedirects: 5,
                timeout: 15000,
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
              });
              debugLog('Cloudinary API PDF raw signed fallback success', {
                rawSigned,
              });
              resolvedThisLookup = true;
            } catch (err) {
              lastError = err;
              debugLog('Cloudinary API PDF raw signed fallback failed', {
                rawSigned,
                status: err?.response?.status,
                message: err?.message,
              });
            }
          }
        }

        // Final per-resource fallback: authenticated private download endpoint
        // backed by API key/secret.
        if (!resolvedThisLookup) {
          try {
            response = await fetchCloudinaryPrivateDownload(found);
            debugLog('Cloudinary private download success', {
              publicId: found.public_id,
              resourceType: found.resource_type,
            });
            resolvedThisLookup = true;
          } catch (err) {
            lastError = err;
            debugLog('Cloudinary private download failed', {
              publicId: found.public_id,
              resourceType: found.resource_type,
              status: err?.response?.status,
              statusText: err?.response?.statusText,
              message: err?.message,
            });
          }
        }

        if (resolvedThisLookup) break;
      }

      // Prefix search fallback: catches cases where DB URL has stale version/path,
      // but the file still exists under the same folder/public id prefix.
      if (!response && publicIdNoExt) {
        const prefixCandidates = Array.from(
          new Set([publicIdNoExt, publicIdWithExt])
        );

        for (const prefix of prefixCandidates) {
          for (const resourceType of ['image', 'raw']) {
            const listed = await tryListCloudinaryResourcesByPrefix(
              prefix,
              resourceType
            );
            debugLog('Cloudinary prefix lookup result', {
              prefix,
              resourceType,
              count: listed.length,
            });
            if (!listed.length) continue;

            for (const resource of listed) {
              const signedFromMeta = buildSignedDeliveryUrlFromResource(resource);
              const fetchUrls = [signedFromMeta, resource.secure_url].filter(
                Boolean
              );

              for (const fetchUrl of [...new Set(fetchUrls)]) {
                try {
                  response = await axios({
                    method: 'get',
                    url: fetchUrl,
                    responseType: 'stream',
                    maxRedirects: 5,
                    timeout: 15000,
                    headers: {
                      'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                  });
                  debugLog('Cloudinary prefix lookup fetch success', {
                    prefix,
                    resourceType,
                    publicId: resource.public_id,
                    fetchUrl,
                  });
                  break;
                } catch (err) {
                  lastError = err;
                  debugLog('Cloudinary prefix lookup fetch failed', {
                    prefix,
                    resourceType,
                    publicId: resource.public_id,
                    fetchUrl,
                    status: err?.response?.status,
                    statusText: err?.response?.statusText,
                    message: err?.message,
                  });
                }
              }

              if (!response) {
                try {
                  response = await fetchCloudinaryPrivateDownload(resource);
                  debugLog('Cloudinary prefix private download success', {
                    prefix,
                    resourceType,
                    publicId: resource.public_id,
                  });
                } catch (err) {
                  lastError = err;
                  debugLog('Cloudinary prefix private download failed', {
                    prefix,
                    resourceType,
                    publicId: resource.public_id,
                    status: err?.response?.status,
                    statusText: err?.response?.statusText,
                    message: err?.message,
                  });
                }
              }

              if (response) break;
            }

            if (response) break;
          }
          if (response) break;
        }
      }
    }

    if (!response) throw lastError;

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    response.data.on('error', (err) => {
      console.error('Stream error during document delivery:', err);
      if (!res.headersSent) {
        res.status(500).send('Stream error during document delivery');
      }
    }).pipe(res);
  } catch (error) {
    console.error('Document Proxy Error:', {
      message: error.message,
      stack: error.stack,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url,
      requestedAssetId,
    });
    const statusCode = error.response?.status || 500;
    if (!res.headersSent) {
      res.status(statusCode).send(`Failed to fetch document (Status: ${statusCode} ${error.response?.statusText || ''})`);
    }
  }
};

module.exports = { viewDocument };

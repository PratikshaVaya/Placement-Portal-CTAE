const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const CustomAPIError = require('../errors');

const fileUpload = async (file, folder, acceptType) => {
  const fileMimeType = file.mimetype;
  const fileSize = file.size; // bytes
  let maxFileSize, acceptMIME, maxFileMB;

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (acceptType === 'image') {
    if (!allowedImageTypes.includes(fileMimeType)) {
      throw new CustomAPIError.BadRequestError('Invalid image format! Only JPG, PNG, and WEBP are allowed.');
    }
    maxFileSize = 2 * 1024 * 1024; // 2 MB
    maxFileMB = 2;
  } else if (acceptType === 'document') {
    if (!allowedDocTypes.includes(fileMimeType)) {
      throw new CustomAPIError.BadRequestError('Invalid document format! Only PDF, DOC, and DOCX are allowed.');
    }
    maxFileSize = 5 * 1024 * 1024; // 5 MB
    maxFileMB = 5;
  } else {
    throw new CustomAPIError.BadRequestError('Invalid upload category!');
  }

  if (fileSize > maxFileSize) {
    throw new CustomAPIError.BadRequestError(
      `Maximum file size ${maxFileMB} MB exceeded!`
    );
  }

  // Use temporary folder for initial processing
  const tmpFolder = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true });
  }

  // Secure temporary filename
  const extension = path.extname(file.name);
  const tmpFileName = `${crypto.randomUUID()}${extension}`;
  const filePath = path.join(tmpFolder, tmpFileName);

  try {
    await file.mv(filePath);

    // Upload to Cloudinary (Scalable & Secure)
    // Documents use resource_type "raw" so URLs are /raw/upload/... — storing PDFs as
    // image/upload/...pdf can cause delivery to require signatures or return 401 on fetch.
    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      unique_filename: true,
      folder: `Placement-Portal/${folder}`,
      resource_type: acceptType === 'document' ? 'raw' : 'auto',
    });

    if (uploadedFile) {
      console.log(`File upload successful! -> ${uploadedFile.secure_url}`);
      return {
        success: true,
        message: 'File Uploaded',
        fileURL: uploadedFile?.secure_url,
      };
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new CustomAPIError.InternalServerError('File upload failed!');
  } finally {
    // Cleanup temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  throw new Error('File upload failed!');
};

module.exports = { fileUpload };

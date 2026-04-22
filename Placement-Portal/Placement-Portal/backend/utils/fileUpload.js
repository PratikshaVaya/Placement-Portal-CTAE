const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const CustomAPIError = require('../errors');

const fileUpload = async (file, folder, acceptType) => {
  const fileMimeType = file.mimetype;
  const fileSize = file.size; // bytes
  let maxFileSize, acceptMIME, maxFileMB;

  if (acceptType == 'image') {
    acceptMIME = 'image/';
    maxFileSize = 1 * 1024 * 1024; // 1 MB
    maxFileMB = 1;
  } else if (acceptType == 'document') {
    acceptMIME = 'application/pdf';
    maxFileSize = 2 * 1024 * 1024; // 2 MB
    maxFileMB = 2;
  }

  if (!fileMimeType.startsWith(acceptMIME)) {
    throw new CustomAPIError.BadRequestError('Invalid file format!');
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
    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      unique_filename: true,
      folder: `Placement-Portal/${folder}`,
      resource_type: 'auto',
      format: acceptType === 'document' ? 'pdf' : undefined,
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

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath, folder = 'foodrescue') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  });
  return result.secure_url;
};

const uploadBuffer = async (buffer, folder = 'foodrescue') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadImage, uploadBuffer };

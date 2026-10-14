const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: "xtkb191b",
    api_key: "932827289721817",
    api_secret: "SX6805TckLnrcb0tg3a_tVf5IeE"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"]
  },
});

module.exports = {
    cloudinary,
    storage
};
const multer = require('multer');

//limit upload file size
const maximumSize = 25 * 1000 * 1000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
     storage: storage,
     limits: { fileSize: maximumSize }
});
        
module.exports = upload;
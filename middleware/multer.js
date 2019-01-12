const multer = require('multer');
const path = require('path');

module.exports = multer({
  dest: './public',
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png/i;
    const extname = filetypes.test(path.extname(file.originalname));
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    else return cb("Error the given file isn't an image");
  }
});

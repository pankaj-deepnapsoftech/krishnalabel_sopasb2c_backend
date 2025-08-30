const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// Export ImageUpload directly
module.exports = upload;

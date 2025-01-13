import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!file) {
        return;
      }
      cb(null, `../uploads/`); // Specify the upload folder
    },
    filename: (req, file, cb) => {
      if (!file) {
        return;
      }

      cb(null, file.filename); 
    }
});

  // Create the multer instance
const upload = multer({ storage });

export default(upload);
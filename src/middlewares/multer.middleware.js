// this multer will act as a middleware , that is why it is written in middleware,
// so when we want to use this file upload cababilities we will inject this middleware



import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")                  //(null is for error handling, path is for destination)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ 
    storage,
})
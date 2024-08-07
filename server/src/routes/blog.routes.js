const Router = require('express');

const {
    createBlog,
    // getAllBlogs,
    // getBlog,
    // updateBlog,
    // deleteBlog,
} = require('../controllers/blog.controller.js');


const {upload} = require('../middlewares/multer.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');

const router = Router();



router.route("/").post(    
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1,
        }]),
        verifyJWT,createBlog)


module.exports = router;
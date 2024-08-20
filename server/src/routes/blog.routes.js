const Router = require('express');

const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} = require('../controllers/blog.controller.js');


const {upload} = require('../middlewares/multer.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');

const router = Router();
router.use(verifyJWT);


router
    .route("/")
    .get(getAllBlogs)
    .post(
        upload.fields([
            {
                name: "thumbnail",
                maxCount: 1,
            }]),
            createBlog
    )

router
    .route("/:blogId")
    .get(getBlogById)
    .delete(deleteBlog)
    .patch(upload.single("thumbnail"), updateBlog);



module.exports = router;
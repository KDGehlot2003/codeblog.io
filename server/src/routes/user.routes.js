const Router = require('express');

const { 
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
} = require('../controllers/user.controller.js');

const {upload} = require('../middlewares/multer.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)


router.route("/logout").post(verifyJWT, logoutUser)
router.route("/c/:username").get(verifyJWT, getUserProfile)








module.exports = router;
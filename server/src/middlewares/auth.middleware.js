const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError.js');
const asyncHandler = require('../utils/asyncHandler.js');
const User = require('../models/user.model.js');


const verifyJWT = asyncHandler(async (req, _, next) => {     // added new keyword
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?.id)
    .select("-password -refreshToken")


    req.user = user;
    next()
    
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }
});

module.exports = verifyJWT;
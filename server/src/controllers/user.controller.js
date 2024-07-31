const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler( async (req,res) => {

    const {fullName, email, username, password} = req.body

    // TODO: validate the request body
})

const loginUser = asyncHandler(async (req,res) => {
    // username or password: not empty reqbody -> data
    // username should exist in database
    // password should match

    const {email, username, password} = req.body

    // TODO: validate the request body

})

const logoutUser = asyncHandler(async (req,res) => {
    // TODO: logout the user
})


module.exports = {
    registerUser,
    loginUser,
    logoutUser
}
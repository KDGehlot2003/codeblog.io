const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const Blog = require('../models/blog.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');


const createBlog = asyncHandler( async (req,res) => {
        //TODO: create tweet
        const {title,content} = req.body

        if(!(title && content)){
            throw new ApiError(400, "Please provide title and content")
        }

        const thumbnailLocalPath = req.files?.thumbnail[0]?.path

        if(!thumbnailLocalPath){
            throw new ApiError(400, "Please provide thumbnail")
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        const blog = await Blog.create({
            title,
            content,
            thumbnail: thumbnail.url,
            owner: req.user._id
        })
    
        return res
        .status(201)
        .json(new ApiResponse(201, blog,"Blog created successfully"))
})

module.exports = {
    createBlog
}
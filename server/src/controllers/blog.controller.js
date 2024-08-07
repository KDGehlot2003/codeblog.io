const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const Blog = require('../models/blog.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const { isValidObjectId } = require('mongoose');


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

const getAllBlogs = asyncHandler( async (req,res) => {

})

const getBlogById = asyncHandler( async (req,res) => {
    // 66b391a4fc91a2beb66da84d sample blog id
    const {blogId} = req.params

    if (!isValidObjectId(blogId)) {
        throw new ApiError(400, "Invalid blog id")
    }

    const blog = await Blog.findById(blogId)

    if (!blog) {
        throw new ApiError(400, "Blog not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog fetched successfully") )

})

const updateBlog = asyncHandler( async (req,res) => {

})

const deleteBlog = asyncHandler( async (req,res) => {

})

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
}
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
            res.status(400).json(new ApiResponse(400, {}, "Please provide title and content"))
            // throw new ApiError(400, "Please provide title and content")
        }

        // const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        

        if(!thumbnailLocalPath){
            res.status(400).json(new ApiResponse(400, {}, "Please provide thumbnail"))
            // throw new ApiError(400, "Please provide thumbnail")
        }


        // const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
        const blog = await Blog.create({
            title,
            content,
            owner: req.user._id
        })
    
        return res
        .status(201)
        .json(new ApiResponse(201, blog,"Blog created successfully"))
})

const getAllBlogs = asyncHandler(async (req, res) => {
    const sortBy = req.query.sortBy || 'createdAt'; // Default to sorting by 'createdAt'
    const order = req.query.order === 'desc' ? -1 : 1; // Default to ascending order
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 blogs per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const blogs = await Blog.find()
        .populate('owner', req.user._id)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

    const totalBlogs = await Blog.countDocuments(); // Get the total number of blogs

    if (!blogs.length) {
        res.status(404).json(new ApiResponse(404, {}, "No blogs found"));
        // throw new ApiError(404, "No blogs found");
    }

    return res.status(200).json(new ApiResponse(200, {
        blogs,
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs
    }, "Blogs fetched successfully"));
});

const getBlogById = asyncHandler( async (req,res) => {
    // 66b391a4fc91a2beb66da84d sample blog id
    const {blogId} = req.params

    if (!isValidObjectId(blogId)) {
        res.status(400).json(new ApiResponse(400, {}, "Invalid blog id"))
        // throw new ApiError(400, "Invalid blog id")
    }

    const blog = await Blog.findById(blogId)

    if (!blog) {
        res.status(404).json(new ApiResponse(404, {}, "Blog not found"))
        // throw new ApiError(400, "Blog not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog fetched successfully") )

})

const updateBlog = asyncHandler( async (req,res) => {

    const {blogId } = req.params;
    const { title, content } = req.body;

    if (!(title || content || req.files?.thumbnail)) {
        res.status(400).json(new ApiResponse(400, {}, "Please provide at least one field to update"));
        // throw new ApiError(400, "Please provide at least one field to update");
    }
    console.log(blogId);
    
    
    const blog = await Blog.findById(blogId);

    if (!blog) {
        res.status(404).json(new ApiResponse(404, {}, "Blog not found"));
        // throw new ApiError(404, "Blog not found");
    }

    if (blog.owner.toString() !== req.user._id.toString()) {
        res.status(403).json(new ApiResponse(403, {}, "You are not authorized to update this blog"));
        // throw new ApiError(403, "You are not authorized to update this blog");
    }

    if (title) blog.title = title;
    if (content) blog.content = content;

    if (req.files?.thumbnail) {
        const thumbnailLocalPath = req.files.thumbnail[0].path;
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        blog.thumbnail = thumbnail.url;
    }

    await blog.save();

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog updated successfully"));
})

const deleteBlog = asyncHandler( async (req,res) => {
    
    const { blogId } = req.params;  

    const blog = await Blog.findById(blogId);

    if (!blog) {
        res.status(404).json(new ApiResponse(404, {}, "Blog not found"));
        // throw new ApiError(404, "Blog not found");
    }

    if (blog.owner.toString() !== req.user._id.toString()) {
        res.status(403).json(new ApiResponse(403, {}, "You are not authorized to delete this blog"));
        // throw new ApiError(403, "You are not authorized to delete this blog");
    }

    await Blog.findByIdAndDelete(blogId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Blog deleted successfully"));
})

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
}
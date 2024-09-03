const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const Blog = require('../models/blog.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const { isValidObjectId } = require('mongoose');


const createBlog = asyncHandler( async (req,res) => {
        //TODO: create tweet
        const {title,content,category} = req.body

        if(!(title && content && category)){
            res.status(400).json(new ApiResponse(400, {}, "Please provide title, content and category"))
            // throw new ApiError(400, "Please provide title and content")
        }

        
        if (title.length < 3 || title.length > 30) {
            res.status(400).json(new ApiResponse(400, {}, "Title should be between 3 to 30 characters"));
            throw new ApiError(400, "Title should be between 3 to 30 characters");
        }

        if (category.length < 2 || category.length > 30) {
            res.status(400).json(new ApiResponse(400, {}, "Category should be between 2 to 30 characters"));
            throw new ApiError(400, "Category should be between 2 to 30 characters");
        }

        

        // const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        

//         if(!thumbnailLocalPath){
//             res.status(400).json(new ApiResponse(400, {}, "Please provide thumbnail"))
//             // throw new ApiError(400, "Please provide thumbnail")
//         }


        // const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
        const blog = await Blog.create({
            title,
            content,
            category,
            // thumbnail: thumbnail.url,
            owner: req.user._id
        })
    
        return res
        .status(201)
        .json(new ApiResponse(201, blog,"Blog created successfully"))
})

// const getAllBlogs = asyncHandler(async (req, res) => {
//     const sortBy = req.query.sortBy || 'createdAt'; // Default to sorting by 'createdAt'
//     const order = req.query.order === 'desc' ? -1 : 1; // Default to ascending order
//     const page = parseInt(req.query.page) || 1; // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 blogs per page
//     const skip = (page - 1) * limit; // Calculate the number of documents to skip

//     const blogs = await Blog.find()
//         .populate('owner', req.user._id)
//         .sort({ [sortBy]: order })
//         .skip(skip)
//         .limit(limit);

//     const totalBlogs = await Blog.countDocuments(); // Get the total number of blogs

//     if (!blogs.length) {
//         res.status(404).json(new ApiResponse(404, {}, "No blogs found"));
//         // throw new ApiError(404, "No blogs found");
//     }

//     return res.status(200).json(new ApiResponse(200, {
//         blogs,
//         currentPage: page,
//         totalPages: Math.ceil(totalBlogs / limit),
//         totalBlogs
//     }, "Blogs fetched successfully"));
// });

const getAllBlogs = asyncHandler(async (req, res) => {
    const sortBy = req.query.sortBy || 'createdAt'; // Default to sorting by 'createdAt'
    const order = req.query.order === 'desc' ? -1 : 1; // Default to ascending order
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 blogs per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const { category, startDate, endDate } = req.query;

    // Create a filter object
    const filter = {};

    // Add category filter if provided
    if (category) {
        filter.category = category;
    }
    // console.log(startDate, endDate);

    // Negative Test: Filter by invalid startDate and endDate
    if (startDate && !Date.parse(startDate)) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid start date"));
    }
    if (endDate && !Date.parse(endDate)) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid end date"));
    }
    

    // Add date range filter if provided
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    } else if (startDate) {
        filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
        filter.createdAt = { $lte: new Date(endDate) };
    }
    // console.log(filter.createdAt);
    

    const blogs = await Blog.find(filter)
        .populate('owner', req.user._id)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

    const totalBlogs = await Blog.countDocuments(filter); // Get the total number of filtered blogs

    if (!blogs.length) {
        return res.status(404).json(new ApiResponse(404, {}, "No blogs found"));
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
        res.status(401).json(new ApiResponse(401, {}, "Invalid blog id"))
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
    const { title, content, category } = req.body;

    if (!(title || content || category || req.files?.thumbnail)) {
        res.status(400).json(new ApiResponse(400, {}, "Please provide at least one field to update"));
        // throw new ApiError(400, "Please provide at least one field to update");
    }
    // console.log(blogId);
    
    // invalid blog id
    if (!isValidObjectId(blogId)) {
        res.status(401).json(new ApiResponse(401, {}, "Invalid blog id"));
        // throw new ApiError(400, "Invalid blog id");
    }

    if (title && (title.length < 3 || title.length > 30)) {
        res.status(400).json(new ApiResponse(400, {}, "Title should be between 3 to 30 characters"));
        throw new ApiError(400, "Title should be between 3 to 30 characters");
    }

    if (category && (category.length < 2 || category.length > 30)) {
        res.status(400).json(new ApiResponse(400, {}, "Category should be between 2 to 30 characters"));
        throw new ApiError(400, "Category should be between 2 to 30 characters");
    }
    
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
    if (category) blog.category = category;

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

    if (!isValidObjectId(blogId)) {
        res.status(401).json(new ApiResponse(401, {}, "Invalid blog id"));
        // throw new ApiError(400, "Invalid blog id");
    }

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
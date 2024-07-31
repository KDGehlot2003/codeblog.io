// import {v2 as cloudinary} from 'cloudinary';
const v2 = require('cloudinary');
const fs = require('fs');

v2.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await v2.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded sucessfull
        // console.log("file is uploaded on cloudinary ",response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation 
        return null
    }
}

module.exports = uploadOnCloudinary;
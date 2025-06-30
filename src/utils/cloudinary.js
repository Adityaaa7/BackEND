 // This file will contaiin the code for file uploading on server using multer and cloudnary

 import { v2 as cloudinary} from "cloudinary";
import { log } from "console";
 import fs from 'fs'           //file sysytem : imporrting for , if we upload file successfully on server then it should get deleted from server basically unlink


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:  process.env.CLOUDINARY_API_SECRET
    });


    //upload : lets create a method which will take path of local file as parameter and well upload it if successfully upload then well unlink it from file system
   
   //method
   const uploadOncloudinary= async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        //upload on cloudianry
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file ahs been uploaded successfullly
        // console.log("File is uploaded on cloudianary",response.url);
        fs.unlinkSync(localFilePath)
        return response
    } 
    
    catch (error) {
        fs.unlinkSync(localFilePath)   //remove the locally saved temporary file as the upload operation failed
        return null;
    }
   }
   
   
   
   
   export { uploadOncloudinary }
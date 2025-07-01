import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js' 
import {uploadOncloudinary} from '../utils/cloudinary.js'  
import { ApiResponse } from "../utils/ApiResponce.js"; 
import jwt from "jsonwebtoken"    
import { accessSync } from "fs";



//we generate access and refresh token together so many times so better create a method and just call it
const generateAccessAndRefreshTokens = async(userId)=>{
                //this method will generate access and refresh token save it and send access token to user 
    
    
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken( )

        user.refreshToken = refreshToken         //added in the user
        await user.save({validateBeforeSave: false})   // when we save it the fields such as password kick in that it is required 

        return{ accessToken,refreshToken }
    } 
    
    
    catch (error) {
        throw new ApiError(500,"Somethin gwent wrong while generating access and refresh token")
    }
}





const registerUser = asyncHandler( async (req,res) =>{
   //steps 
   //get user details from the frontend
   //validation , corner cases , not empty
   //check if user already exist: with username or email
   // check for images check for avtar
   //upload them to cloudinary for avtar
   // create user object - create entry in db
   //remove password and refresh token feild from responce
   //check for user creation 
   // if yes return responce if no then show error



                                                        //1.user details
    const {fullname,email,username,password} =req.body                       //destruccturing
    console.log("email",email);

                                                         //2.validation

    // if(fullname === ""){
    //     throw new ApiError(400,"full name is required")             and write this code for each field or
    // }
                                    
        if(
            [fullname,email,username,password].some((field)=>field?.trim() === "" ))
            {
                throw new ApiError(400,"All feilds are required")      
            }
        
                                                     //3.check user already exist or not

       const existedUser = await User.findOne({             //with user model we can find if user already exist or not because it is made up from monggose
            $or:[{ username },{ email }]
        })      
        
        if(existedUser){
            throw new ApiError(409, "User with this username or email already exists")
        }



        console.log(req.files);

                                                    //4.check for images check for avtar              

         const avatarLocalPath = req.files?.avatar[0]?.path;
        //  const coverImageLocalPath = req.files?.coverImage[0]?.path;  

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath =req.files.coverImage[0].path
        }
         
         if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
         }
                                                       //5.upload them to cloudinary for avtar

        const avatar = await uploadOncloudinary(avatarLocalPath);
        const coverImage = await uploadOncloudinary(coverImageLocalPath);

        if(!avatar){
            throw new ApiError(400,"Avatar file is required")
        }

        console.log("avtar",avatar);
                                                        //6.create user object - create entry in db

       const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""  ,  //no validation and compultion on coverIamge
            email,
            password,
            username:username.toLowerCase()

        })

                                                        //7.check for user creation and remove password and refresh token feild from responce
        const createdUser = await User.findById(user._id).select("-password ")  //-refreshToken                                                        

        if(!createdUser){
            
                console.error("User found by ID is null!");
                throw new ApiError(500, "Something went wrong while retrieving the user after creation");
              
              
        } 

                                                        //8.return responce
        return res.status(201).json(
            new ApiResponse(200, createdUser,"User registred successfully")
        )                                                    
})

                                        //LOGIN
const loginUser = asyncHandler(async (req,res) =>{
        //steps
        //bring data from req.body
        //username or email based login
        //find user
        //password check
        //generate access and refresh token
        //send tokens in form of cookies    
        
        
                                                //bring data from req.body
        const {email,username,password} = req.body                                          

        if(!username && !email){
            throw new ApiError(400, "username or email is required")
        }

        const user = await User.findOne({
            $or: [username,email]                   // finds based on email or username 
        })


        if(!user){
            throw new ApiError(404,"User does not exist")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401,"Invlaid user credentials")
        }


        const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = User.findById(_id).select("-password -refreshToken");  // we want to send user everything except the pass and token

        //we need to select options for cookies
        const options = {
            httpOnly: true,  //only editable from server not from frontend
            secure:true
        }


        return res.
        status(200)
        .cookie("accessToken",accessToken,options)  //(key value option) 
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken

                },
                "User logged in successfully"
            )
        )

}) 


//logout
const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined  
            }
        },
        {
            new:true
        }
        )


        const options = {
            httpOnly: true,  //only editable from server not from frontend
            secure:true
        }

        return res
        .status(200)
        .clearCookie('accessToken',options)
        .clearCookie('refreshToken',options)
        .json(new ApiResponse(200,{},"User Logged out"))

})

//refrsh token 
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    //verify incoming refresh token with one in our db
   try {
     const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     const user =  User.findById(decodedToken._id)
     if(!user){
         throw new ApiError(401,"Invalid refresh token")
     }
 
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token iss expired or used")
     }
 
 
     const options = {
         httpOnly: true,  //only editable from server not from frontend
         secure:true
     }
 
     const { accessToken,newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json (
         new ApiResponse(
             200,
             {accessToken,refreshToken:newRefreshToken},
             "Access Token refreshed"
         )
     )
   } 
   
   catch (error) {
    throw new ApiError(401,error?.message|| "Invalid refresh token") 
   }

})



// change password
const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Please Enter correct old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))

})

//Get currently loggged in user 
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully")
})

//update user details  text based
const updateAccountDetails = asyncHandler(async(req,res)=>{
    
    const {fullname,email} = req.body
    if(!fullname || !email){
        throw new ApiError(400,"All fields are required")
    }

   const user =  User.findByIdAndUpdate(
        req.user?._id,
        {
        $set:{ 
            fullname,
            email
        }
    },
        {new:true}

        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))

})

// udpate user avtar
const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avtar file is missing")              //multer middlawre , file uploaded using multer
    }

    const avatar = uploadOncloudinary(avatarLocalPath)           // uploaded on cloudianry

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on cloudianry")
    }

    const user = await User.findByIdAndUpdate(
        req?.user._id,   //finding user
        {
            $set: {
                avatar:avatar.url
            }
        },
        {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Avatar Updated Successfully")
        )
})

//update user coverImage
const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverIamgeLocalPath = req.file?.path
    if(!coverIamgeLocalPath){
        throw new ApiError(400,"cover image file is missing")              //multer middlawre , file uploaded using multer
    }

    const coverImage = uploadOncloudinary(coverIamgeLocalPath)           // uploaded on cloudianry

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading avatar on cloudianry")
    }

    const user = await User.findByIdAndUpdate(
        req?.user._id,   //finding user
        {
            $set: {
                coverImage:coverImage.url
            }
        },
        {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"CoverImage Updated Successfully")
        )
})




export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage}
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js' 
import {uploadOnCloudinary} from '../utils/cloudinary.js'  
import { ApiResponse } from "../utils/ApiResponce.js";      


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
            [fullname,email,username,password].some( (field)  => field?.trim() === "" ))
            {
                throw new ApiError(400,"All feilds are required")      
            }
        
                                                     //3.check user already exist or not

       const existedUser =  User.findOne({             //with user model we can find if user already exist or not because it is made up from monggose
            $or:[{ username },{ email }]
        })      
        
        if(existedUser){
            throw new ApiError(409, "User with this username or email already exists")
        }

                                                    //4.check for images check for avtar              

         const avtarLocalPath = req.files?.avtar[0]?.path;
         const coverImageLocalPath = req.files?.coverImage[0]?.path;  
         
         if(!avtarLocalPath){
            throw new ApiError(400,"Avtar file is required")
         }
                                                       //5.upload them to cloudinary for avtar

        const avatr = await uploadOnCloudinary(avtarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatr){
            throw new ApiError(400,"Avtar file is required")
        }


                                                        //6.create user object - create entry in db

       const user = await User.create({
            fullname,
            avtar: avtar.url,
            coverImage: coverImage?.url || ""  ,  //no validation and compultion on coverIamge
            email,
            password,
            username:username.toLowerCase()

        })

                                                        //7.check for user creation and remove password and refresh token feild from responce
        const createdUser = await User.findById(user._id).select("-password refreshToken")                                                        

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user")
        } 

                                                        //8.return responce
        return res.status(201).json(
            new ApiResponse(200, createdUser,"User registred successfully")
        )

})


export {registerUser}
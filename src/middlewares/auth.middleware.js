//this method only verify ki user ahi ya nahi hai

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";


export const verifyJWT = asyncHandler(async (req,res,next) =>{
  try {
     const token =  req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer","")
  
     if(!token){
          throw new ApiError(401, "Unauthorized request") 
     }
  
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
     const user = await User.findById(decodedToken._id).select("-password -refreshToken")
  
     if(!user){
      throw new ApiError(401,"Invalid access token")
     }
  
  
     req.user = user;
     next()     // when we write .post(verifyJWT,logoutUser) in routes   then it will execute jwt first and then it should go to logout therefore we write next
  }
  
  catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }

})
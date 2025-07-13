import mongoose , { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,          //cloudinary url
            required:true,
        },
        coverImage:{
            type:String,         
        },
        watchHistory:[
            {
            type:Schema.Types.ObjectId,
            ref:"video"
            }         
        ],
        password:{
            type:String,             //password ideally should not be plane string so forr this we will install library called bcrypt which will help us to hash the password
            required:  [true, "password is mandantory"]
        },
        refreshToken:{
            type:String
        }
        
    },{timestamps:true})





                                        // PASSWORD ENCRYPTION

    // here pre is a middleware which is used to execute perticular function just brfore saving it, also as it is a middleware we have to store next 
    // dont use arrow functions in here as they dont have reference for 'this'  also this function takes time so use async 
userSchema.pre("save", async function(next){


    if(this.isModified("password")) return next();

    this.password =await bcrypt.hash(this.password,10)  //(kya hash kru,kitne round)
    next()        //this code execute and change pass every time we do changes in anything lets say fullname it will change pass for this we use if condition
}) 
                                        //mongoDB allows to add custom methods 
                                        // 1.PASSWORD CHEKING

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)       //(normal string password , encrypted password)
}



                                        //2.ACCESS TOKEN 
userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this._id,
        email: this.email,                             //payload :   payload name, value from dataabse 
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}



                                        //3.REFRESH TOKEN 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
                           

export const User = mongoose.model("User",userSchema) 
// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'

import connectDB from "./db/index.js";

import { app } from './app.js';

// import express from 'express'

// const app = express();
dotenv.config({
    path:'./.env'
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`app running at port ${process.env.PORT }`);
    })
})
.catch((err) =>{
    console.log("MONGO DB Conenction Failed!!!", err);
})










/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants"
import connectDB from "./db";
import express from 'express'
const app = express();

// function connectDB(){         declare 

// }
// connectDB()                   calling                normal way


// EFFICIENT WAY
// ()() EFFIE

( async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("Error", (error) =>{
        console.log("ERROR:", error);
        throw error
       })

    app.listen(process.env.PORT, ()=>{
        console.log(`App is lsitening at port ${process.env.PORT}`);
    })   


    }
    catch(error){
        console.log("ERROR" , error)
        throw error
    } 
})()

*/
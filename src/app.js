import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//configure the above packages
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit:"16kb"}))     //to handle json input such as api or forms   
app.use(express.urlencoded({extended:true,limit:"16kb"}))         // to handle urls 
app.use(express.static("public"))          //  to save some file or folder such as pdf  
app.use(cookieParser())

export { app }
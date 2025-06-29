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


//import routes
import userRouter from './routes/user.routes.js'

//routes declaration                   as things are separate now router are in different folder so we have to use the middlewares
app.use("/api/v1/users", userRouter)       //now it will transfer control to user.routes.js
 
 // so url will look like http://localhost:8000/api/v1/users/register

// FLOW :::
    // when a request comes on /users app will pass it to routes, then when we go to /register it will passs it to 
    // registerUser in user controller and when we go to controller it passes it to async handler's highr order function

    app.get("/ping", (req, res) => {
        res.send("pong");
      });
      




export { app }
import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
                                 // so url will look like http://localhost:8000/api/v1/users/register
router.route("/register").post(
    upload.fields([                                   // middleware start
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),                                               // middleware end
    registerUser)       

// router.post("/register", registerUser);


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post( verifyJWT, logoutUser)    //(middleware,funtion or method to execute on that route)

router.route("/refresh-token").post(refreshAccessToken)


export default router
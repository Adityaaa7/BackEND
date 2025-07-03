import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
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

//secured routes     i.e. user should be logged in, so mostly we'll use middleware

router.route("/logout").post( verifyJWT, logoutUser)    //(middleware,funtion or method to execute on that route)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)  //we will use patch when we update speficif things not all document

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

//when wwe get from parasm:
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)




export default router
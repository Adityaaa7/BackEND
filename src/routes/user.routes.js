import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'


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

export default router
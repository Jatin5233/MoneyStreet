import express from "express";
import {signUp,login,check_auth,logout,sendOtp, verifyOtp} from "../controllers/user.js"
import wrapAsync from "../utils/wrapAsync.js"

const router=express.Router();
router.route("/signUp").post(wrapAsync(signUp))
router.route("/login").post(wrapAsync(login))
router.route("/logout").post(logout)
router.route("/check-auth").get(check_auth)
router.route("/sendOtp").post(wrapAsync(sendOtp))
router.route("/verifyOtp").post(verifyOtp)
export default router
import dotenv from 'dotenv';
dotenv.config({path:"../.env"});

import User from "../models/user.js"
import httpStatus from "http-status"
import passport from "passport"
import axios from "axios"

export async function signUp(req, res) {
    try {
        const { username, email, phoneNo, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "Name, email, and password are required" 
            });
        }

        // Check for existing user by email (more unique than name)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ 
                message: "User already exists" 
            });
        }

        // Password validation (example - adjust as needed)
        if (password.length < 8) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "Password must be at least 8 characters" 
            });
        }

         try {
    const newUser = new User({ username, email, phoneNo });
    await User.register(newUser, password); // handles hashing internally
    await newUser.save();
     req.login(newUser, (err) => {
    if (err) return next(err);

    return res.status(201).json({
      message: "Signup & login successful",
      user: {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email
      }
    });
  });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }

    
    } catch (error) {
        console.error("Signup error:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal server error" 
        });
    }
}
export async function login(req, res,next){
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
       const message="Email or password is Incorrect"
      return res.status(401).json({ success: false, message:message });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("Session after login:", req.session); // ADD THIS
      return res.status(200).json({ success: true, message: 'Logged in successfully', user });
    });
  })(req, res, next);
};
export function check_auth(req,res){
  
    if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
  
}
export function logout(req, res) {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed', error: err });
    }
    // Clear session and cookie
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // use your cookie name if different
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  });
}

const otpStore=new Map()
export async function sendOtp(req,res){
    const { phoneNo } = req.body;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // Make Fast2SMS API call
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      variables_values: otp,
      route: 'otp',
      numbers: phoneNo
    }, {
      headers: {
        authorization: process.env.FAST_API_KEY, // Replace with your key
        'Content-Type': 'application/json'
      }
    });

    // Store OTP against phone number
    otpStore.set(phoneNo, otp);

    // Optionally expire OTP after 2 mins
    setTimeout(() => otpStore.delete(phone), 2 * 60 * 1000);

    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}
export function verifyOtp(req,res){
   const { phoneNo, otp } = req.body;

  const storedOtp = otpStore.get(phoneNo);

  if (storedOtp && storedOtp.toString() === otp) {
    otpStore.delete(phoneNo); // Clear OTP after successful verification
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
}

import dotenv from 'dotenv';
dotenv.config({path:"../.env"});

import express from "express";
import mongoose from "mongoose"
import passport from "passport"
import LocalStrategy from "passport-local"
import user from "../routes/user.js"
import User from "../models/user.js"
import session from "express-session"
import cors from "cors"

const app = express();

// Database connection
const dbUrl = process.env.MONGO_URL;


async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log("Database connected"))
    .catch(err => console.error("Database connection error:", err));

// Middleware

app.use(cors({
    origin: 'https://celebrated-entremet-f89d5e.netlify.app', // Your React app's URL
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',     // 'lax' or 'none' (depends on browser)
    secure: true,       // set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  { usernameField: 'email' }, // if you're using email instead of username
  (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Email is not registered' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    });
  }
));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use("/users", user);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;


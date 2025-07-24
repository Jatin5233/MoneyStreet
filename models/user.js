import mongoose from "mongoose";
const Schema=mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose"

const userSchema=new Schema({
    username:{type:String,
        required:true
    },
    email:{type:String,
        required:true
    },
    phoneNo:{type:Number,
        required:true,
        maxLength:10,
        minLength:10
    },
  

})
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

const User=mongoose.model("User",userSchema)
export default User


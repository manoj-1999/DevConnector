const mongoose =require('mongoose')
const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        reuired:true
    },
    avatar:{
        type:String
    },
    Date:{
        type:Date,
        default:Date.now
    }
})
module.exports=User=mongoose.model('user',userschema)
const mongoose=require('mongoose')
const Schema=mongoose.Schema

const PostSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    name:{
        type:String
    },
    text:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    likes:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ],
    comments:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'user'
            },
            name:{
                type:String
            },
            text:{
                type:String,
                required:true
            },
            avatar:{
                type:String
            }
            
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
})
module.exports=Post=mongoose.model('post',PostSchema)
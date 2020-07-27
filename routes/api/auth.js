const express=require('express')

const router=express.Router()
const bcrypt=require('bcryptjs')
const auth=require('../../midleware/auth')
const jwt=require('jsonwebtoken')

const User=require('../../model/User')
const config=require('config')

const {check,validationResults, validationResult}=require('express-validator')

router.get("/",auth,async (req,res)=>{
    try{
        const user=await User.findById(req.user.id).select('-password')
        res.json(user);
    }
    catch(error){
        console.error(error.message)
        res.status(500).send("Server Error")
    }
})

router.post("/login",[
check('email','email is required').notEmpty(),
check('email','Valid Email is required').isEmail(),
check('password','password is required').notEmpty()    
],async(req,res)=>{
    const error=validationResult(req)
    
    if(!error.isEmpty())
    return res.status(400).json({errors:error.array()})
   
    const {email,password}=req.body
    try{
           
        
        let user=await User.findOne({email}).select('password')
       if(!user)
       return res.status(400).json({errors:[{msg:"Invalid credentials"}]})

        const isMatch=await bcrypt.compare(password,user.password)
         
         if(!isMatch)
         return  res.status(403).json({errors:[{msg:"Invalid credentials"}]})
         const payload={
             "user":{
                 id:user.id
             }
         }
         const token=jwt.sign(payload,config.get('Secret'),{expiresIn:360000},
         (error,token)=>{
             if(error) throw error
             res.json({token})
         })
    

    }
    catch(error){
        console.error(error.message)
        res.send('Server Error')
    }

})

module.exports=router
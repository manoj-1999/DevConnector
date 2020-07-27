const express = require("express");

const { check, validationResult } = require("express-validator");

const router = express.Router();

const User=require('../../model/User')

const gravatar=require('gravatar')

const bcrypt=require('bcryptjs')

const jwt =require('jsonwebtoken')

const config=require('config')

router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Valid Email is Required").isEmail(),
    check("password", "password must be atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    const {name,email,password}=req.body
   try{
         let user= await User.findOne({email})
        if(user){
            return  res.status(400).json({errors:[{msg:"User already exsists"}]})
        }
        const avatar=gravatar.url({
            s:'20',
            r:'pg',
            d:'mm'
        })
        user=new User({
            name,
            email,
            password,
            avatar
        })
        const salt=await bcrypt.genSalt(10)
        user.password=await bcrypt.hash(password,salt)
        await user.save()
        const payload={
            "user":{
                id:user.id
            }
            }
         await jwt.sign(payload,
            config.get("Secret"),
            {expiresIn:360000},
            (err,token)=>{
              if(err) throw err
              res.json({token})
            }) 
        
        
   }
   catch(error){
       console.log(error.message)
      res.status(500).send('Server Error')
   }
  }
);
module.exports = router;

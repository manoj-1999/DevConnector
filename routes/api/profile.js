const express = require("express");

const router = express.Router();

const auth = require("../../midleware/auth");

const Profile = require("../../model/Profile");
const User = require("../../model/User");
const Post=require('../../model/Post')
const { check, validationResult } = require("express-validator");

const request=require('request')
const config=require('config')

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile)
      return res.status(400).json({ msg: "There is no profile for this user" });
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").notEmpty(),
      check("skills", "Skills are Required").notEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty())
     return res.status(400).json({ errors:   error.array() });
    const {
      company,
      bio,
      website,
      status,
      skills,
      githubusername,
      location,
      twitter,
      youtube,
      facebook,
      linkedin,
      instagram,
      github
    } = req.body;
    const ProfileFields = {};
    if (company) ProfileFields.company = company;
    if (bio) ProfileFields.bio = bio;
    if (website) ProfileFields.website = website;
    ProfileFields.status = status;
    ProfileFields.skills = skills.split(",").map((skill) => skill.trim());
    if (githubusername) ProfileFields.githubusername = githubusername;
    if (location) ProfileFields.location = location;

    ProfileFields.social = {};
    if (twitter) ProfileFields.social.twitter = twitter;
    if (facebook) ProfileFields.social.facebook = facebook;
    if (youtube) ProfileFields.social.youtube = youtube;
    if (linkedin) ProfileFields.social.linkedin = linkedin;
    if (instagram) ProfileFields.social.instagram = instagram;
    if (github) ProfileFields.social.github = github;
    ProfileFields.user = req.user.id;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: ProfileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(ProfileFields);
      profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Server Error");
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate('user',['name', 'avatar']);
    res.json(profile);
  } catch (error) {
    res.status(500).json("Server Error");
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json("Profile does not exsist");
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId")
      return res.status(400).json("Profile does not exsist");
    res.status(500).json("Server Error");
  }
});

router.delete("/",auth,async(req,res)=>{
    try {
        await Post.deleteMany({user:req.user.id})
        await Profile.findOneAndDelete({user:req.user.id})
        await  User.findOneAndDelete({_id:req.user.id})
        res.json({msg:"delete success"})
    } catch (error) {
        
    }
})

router.put("/experience",[auth,[
    check('title','title is required').notEmpty(),
    check('company','company is required').notEmpty(),
    check('from','from is required').notEmpty()
]],async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty())
    return res.status(400).json({errors:[{msg:error.array()}]})
    const {
        title,
        company,
        from,
        to,
        current,
        location,
        description
    }=req.body
    
    const newExp={
        title,
        company,
        from,
        to,
        current,
        location,
        description
    }
    const profile=await Profile.findOne({user:req.user.id})
    profile.experience.unshift(newExp)
    await profile.save()
    res.json(profile)

})

router.delete("/experience/:expId",auth,async (req,res)=>{
     let profile=await Profile.findOne({user:req.user.id})
     const removeIndex=profile.experience.map(item=>item._id).indexOf(req.params.expId)
     profile.experience.splice(removeIndex,1)
     await profile.save()
     res.json(profile)
})

router.put("/education",[auth,[
    check('school','school is required').notEmpty(),
    check('degree','degree is required').notEmpty(),
    check('fieldofstudy','fieldofstudy is required').notEmpty(),
    check('from','from is required').notEmpty()
]],async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty())
    return res.status(400).json({error:[{msg:error.array()}]})
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body
    
    const newEd={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    const profile=await Profile.findOne({user:req.user.id})
    profile.education.unshift(newEd)
    await profile.save()
    res.json(profile)

})

router.delete("/education/:edId",auth,async (req,res)=>{
    let profile=await Profile.findOne({user:req.user.id})
    const removeIndex=profile.education.map(item=>item._id).indexOf(req.params.edId)
    profile.education.splice(removeIndex,1)
    await profile.save()
    res.json(profile)
})

router.get("/github/:userName",(req,res)=>{
    try {
        const options={
            uri:`https://api.github.com/users/${req.params.userName}?per_page=5
            &sort=created:asc
            &client_id=${config.get('githubClientId')}
            &client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
        }
        request(options,(error,response,body)=>{
            if(error) console.log(error)
            if(response.statusCode!==200)
            return res.status(404).json({msg:"Profile Not found"})
            res.json(JSON.parse(body))
        })
        }
     catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})



router.put('/follow/:id',auth,async (req,res)=>{
try {
  
  const followingprofile=await Profile.findOne({user:req.user.id})
  const followerprofile=await Profile.findOne({user:req.params.id})
  if(followingprofile.following.filter(follow=>follow.user.toString()===req.params.id).length>0)
  return res.status(400).json({msg:'Already following'})
  const followuser=await User.findById(req.user.id)
  const followeruser= await User.findById(req.params.id)
  const newfollowing={
    user:req.params.id,
    name:followeruser.name,
    avatar:followeruser.avatar
  }
  console.log(followeruser)
  const newfollower={
    user:req.user.id,
    name:followuser.name,
    avatar:followuser.avatar
  }
  followingprofile.following.unshift(newfollowing)
  console.log(followingprofile.following)
  followerprofile.followers.unshift(newfollower)
  await followerprofile.save()
  await followingprofile.save()
  return res.json(followerprofile.followers)
} catch (error) {
  console.error(error.message)
      res.status(500).json("Server Error");
}
})

router.put('/unfollow/:id',auth,async (req,res)=>{
  try {
    
    const followingprofile=await Profile.findOne({user:req.user.id})
    const followerprofile=await Profile.findOne({user:req.params.id})
    if(followingprofile.following.filter(follow=>follow.user.toString()===req.params.id).length===0)
    return res.status(400).json({msg:'Currently Not following this user'})
    const removeindex=followingprofile.following.map(follow=>follow.user).indexOf(req.params.id)
    const removefollower=followerprofile.followers.map(follower=>follower.user).indexOf(req.user.id)
    followingprofile.following.splice(removeindex,1)
    followerprofile.followers.splice(removefollower,1)
    await followerprofile.save()
    await followingprofile.save()
    return res.json(followingprofile.following)
  } catch (error) {
    console.error(error.message)
        res.status(500).json("Server Error");
  }
  })

  router.put('/remove/:id',auth,async (req,res)=>{
    try {
      
      const followerprofile=await Profile.findOne({user:req.user.id})
      const followingprofile=await Profile.findOne({user:req.params.id})
      if(followingprofile.following.filter(follow=>follow.user.toString()===req.user.id).length===0)
      return res.status(400).json({msg:'Currently Not following this user'})
      const removeindex=followingprofile.following.map(follow=>follow.user).indexOf(req.user.id)
      const removefollower=followerprofile.followers.map(follower=>follower.user).indexOf(req.params.id)
      followingprofile.following.splice(removeindex,1)
      followerprofile.followers.splice(removefollower,1)
      await followerprofile.save()
      await followingprofile.save()
      return res.json(followerprofile.followers)
    } catch (error) {
      console.error(error.message)
          res.status(500).json("Server Error");
    }
    })

module.exports = router;

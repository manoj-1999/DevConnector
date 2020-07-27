const express=require('express')

const {check,validationResult}=require('express-validator')
const auth=require('../../midleware/auth')
const Post=require('../../model/Post')
const User=require('../../model/User')
const Profile=require('../../model/Profile')


const router=express.Router()

router.post("/",[auth,[
    check('text','text is required').notEmpty()
]],async (req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty())
    return res.status(400).json({errors:error.array()})
   try {
    const user=await User.findById(req.user.id)
    const newPost={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    }
    const post=new Post(newPost);
    await post.save()
    res.json(post)
       
   } catch (error) {
       console.log(error.message)
       res.status(500).send('Server Error')
       
   }

 
})

router.get('/',auth,async(req,res)=>{
    try {
        
        var posts=[];

        const profile=await Profile.findOne({user:req.user.id})
        console.log(profile.following)
        for(i=0;i<profile.following.length;i++){
            const follow=profile.following[i];
            console.log(follow);
           const post=(await Post.find({user:follow.user}))
           post.forEach(po=>posts.push(po))
        }
        const post1=(await Post.find({user:req.user.id}));
        post1.forEach(po=>posts.push(po)) 
       posts.sort(function(a,b){
           return b.date-a.date
       })  
        res.json(posts)
    
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Eror')
        
    }
})
router.get('/:postId',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.postId)
        if(!post)
        return res.status(404).json({msg:"Post Not Found"})
        res.json(post)
    
    } catch (error) {
        console.error(error.message)

        if (error.kind == "ObjectId")
        return res.status(400).json("Profile does not exsist");
      res.status(500).json("Server Error");
    }
})

router.delete("/:postId",auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.postId)
        if(!post){
        return res.status(404).json({msg:"Post Not Found"})}

        if(post.user.toString()!==req.user.id)
        return res.status(401).json({msg:"User Not Authorized"})

        await post.remove()
        res.json({msg:"Post Deleted"})
        
    } catch (error) {
        console.error(error.message)
        if (error.kind == "ObjectId")
        return res.status(400).json("Profile does not exsist");
        res.status(500).json("Server Error");
    }
})

router.put("/like/:postId",auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.postId)

        if(!post)
        return res.status(404).json({msg:"Post Not Found"})

        if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
            return res.status(400).json({msg:"Post already liked"})

        }
        post.likes.unshift({user:req.user.id})
        await post.save()
        res.json(post.likes)
        
    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error");
    }
})
router.put('/unlike/:postId',auth,async(req,res)=>{
    try {
      
        const post=await Post.findById(req.params.postId)

        

        if(!post)
        return res.status(404).json({msg:"Post Not Found"})

        if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0)
          return res.status(400).json({msg:"Post not liked yet"})

        const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
        console.log(removeIndex)
        post.likes.splice(removeIndex,1)
        console.log(post.likes)
        await post.save()
        
        res.json(post.likes)
        
    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error");
    }
})


router.put("/comment/:postId",[auth,[
    check('text','text is required').notEmpty()
]],async (req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty())
    return res.status(400).json({errors:error.array()})
   try {
    const user=await User.findById(req.user.id)
    const newComment={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    }
    const post=await Post.findById(req.params.postId)
    if(!post)
        return res.status(404).json({msg:"Post Not Found"})

        post.comments.unshift(newComment)
    await post.save()
    res.json(post.comments)
       
   } catch (error) {
       console.log(error.message)
       res.status(500).send('Server Error')
       
   }

 
})
router.delete("/comment/:postId/:commentId",auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.postId)
        if(!post)
        return res.status(404).json({msg:"Post Not Found"})

        const commentIndex =post.comments.map(comment=>comment.id.toString()).indexOf(req.params.commentId)

        if(!(post.user.id.toString()!==req.user.id))
        return res.status(401).json({msg:"Not Authorized"})

        post.comments.splice(commentIndex,1);
        await post.save()
        res.json({msg:"deleted successfully"})

        
    } 
    catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }

})



module.exports=router
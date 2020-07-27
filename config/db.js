const mongoose=require('mongoose');
const config=require('config')

const db=config.get("mongoURI");

exports. connectDb=async ()=>{
                     try{
                        await  mongoose.connect(db,{ useNewUrlParser: true,createIndexes:true, useUnifiedTopology: true  });
                        console.log(`connected to db`);

                     }
                     catch(err){
                         console.log(err.message);
                         process.exit(1);
                     }
}
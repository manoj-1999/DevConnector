const express=require('express')

const connect=require('./config/db')

const morgan=require('morgan')

connect.connectDb()
const app=express()


app.use(morgan("dev"))
app.use(express.json({extended:false}))


app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/user',require('./routes/api/user'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/post',require('./routes/api/post'))





const PORT=process.env.PORT||5000

app.listen(PORT,()=>console.log(`listening on port ${PORT}`))
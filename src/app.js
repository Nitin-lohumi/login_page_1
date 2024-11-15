const express = require('express');
const cookies = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('../model//User_Model.js');
const con_db = require('../DbConnect/dbconnect.js');
const cors = require('cors');
con_db();
const app = express();
app.use(cookies());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, 
  }))
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.get('/',(req,res)=>{
    res.send("hello users");
})

app.post('/createuser',async (req,res)=>{
    const {username,password,email} = req.body;
    const hashpassword = await bcrypt.hash(password,10);
    try {
        const user = new User({username:username,password:hashpassword,email:email});
        await  user.save();
        res.status(201).send({message:"sucess",sucess:true});
    } catch (error) {
        console.log(error);
        res.status(400).send({message:"unsucess",sucess:false});
    }
    console.log(username + " =>"+password+ " =>"+email+"hashed apassword "+ hashpassword);
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({email})
    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
    if (!user) {
        console.log("user is not find");
        return res.status(401).json({ message: 'Invalid username or password' });
    }
    console.log(user.password);
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid  password' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, "nitin", { expiresIn: '1h' });
    console.log(token);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,  
      maxAge: 3600000 
    });
    res.json({ message: 'Login successful' });
  });
const auth =async(req,res,next)=>{
        const token = await req.cookies.token;
        console.log("token ",token); 
        if (!token) return res.status(400).send({message:"unsucess",sucess:false});;
         jwt.verify(token,"nitin",(err,decode)=>{
             if(err) return  res.status(400).send({message:"unsucess",sucess:false});
             req.user = decode;
             console.log(decode);
            next();
        });
}
app.get('/home',auth,(req,res)=>{
    res.status(200).json({
        message: 'Welcome to the home page!',
        sucess:true,
        user: req.user,
    })
});
app.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure:false });
    res.status(200).json({ message: 'Logged out successfully' });
    // res.redirect("/home");
});
app.listen(3000,()=>{
    console.log("this is listend at port number 3000");
});
const mongoose  = require('mongoose');
const connect =async()=>{
   try {
    await  mongoose.connect("mongodb+srv://login_db:login_db@db.ndepz.mongodb.net/?retryWrites=true&w=majority&appName=Db");
    console.log("connected sucessfully");
   } catch (error) {
      console.log(error);
   }
}
module.exports = connect;
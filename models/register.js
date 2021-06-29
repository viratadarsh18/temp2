const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({

  firstName : {
     type: String,
     required : true
  },

  lastName : {
     type: String,
     required : true
  },

  email : {
    type : String,
    required:true,
    unique:true
  },

  password : {
    type : String,
    required:true
  },

  money : {
    type : Number,
    default : 0
  }


});


const RegisterUser = new mongoose.model("RegisterUser", bankUserSchema);

module.exports = RegisterUser;

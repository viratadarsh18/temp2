const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-amit:<Your cluster Pass here>@clustersparks1.ivp3h.mongodb.net/bankUser",
{useNewUrlParser:true}).then(() => {
  console.log('Database connection successful');
}).catch( (e) => {
  console.log(e);
});

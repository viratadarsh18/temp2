const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("./db/conn.js");
const app = express();

mongoose.connect("mongodb+srv://admin-amit:<Your cluster Pass here>@clustersparks1.ivp3h.mongodb.net/bankUser", {
  useNewUrlParser: true
}).then(() => {
  console.log('Database connection successful');
}).catch((e) => {
  console.log(e);
});

const RegisterUser = require("./models/register");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

var email;
var userDeductedMoney;
var deductedPlusTransfered;

//All transfer details Schema
const transferLogSchema = new mongoose.Schema({
  log: {
    type: String
  }
});

const TransferLog = mongoose.model("TransferLog", transferLogSchema);


app.get("/login", function(req, res) {
  res.render('login');
});

app.get("/register", function(req, res) {
  res.render('register');
});

app.get("/transfer", function(req, res) {
  RegisterUser.find({}, function(err, users) {
    if (err) {
      console.log(err);
    } else {

      res.render('transfer', {
        data: users,
        cuurentUser: email
      });

    }
  });
});

app.get("/transferlogs", function(req, res) {

  RegisterUser.find({}, function(err, users) {
    if (err) {
      console.log(err);
    } else {

      TransferLog.find({}, function(err, logs) {
        if (err) {
          console.log(err);
        } else {
          res.render('transferlogs', {
            logData: logs,
            data: users,
            cuurentUser: email
          });
        }
      });

    }
  });


});

app.post("/transfer", function(req, res) {

  RegisterUser.findOne({
    email: email
  }, function(err, foundUser) {

    //Add MOney from transfer page

    if (foundUser.email === req.body.emailsender) {
      const moneySended = parseInt(req.body.sendmoney);
      userDeductedMoney = parseInt(foundUser.money) + moneySended;

      RegisterUser.findOne({
        email: email
      }, function(err, foundUser) {

        var moneyAddLog = "Amount " + moneySended.toString() + " successfully added to " + foundUser.firstName + " " + foundUser.lastName + "'s account";

        //moneyAdd log
        const logData = new TransferLog({
          log: moneyAddLog.toString()
        });

        logData.save();

        RegisterUser.findOneAndUpdate({
          email: email
        }, {
          "$set": {
            "money": parseInt(userDeductedMoney)
          }
        }, {
          returnNewDocument: true
        }, (err, doc) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/transfer");

          }
        });

      });



    } else {

      //Deduct money from your account
      const moneySended = parseInt(req.body.sendmoney);
      userDeductedMoney = parseInt(foundUser.money) - moneySended;
      var moneyDeductedLog;

      RegisterUser.findOne({
        email: email
      }, function(err, foundUser) {

        moneyDeductedLog = "Amount " + moneySended.toString() + " deducted from " + foundUser.firstName + " " + foundUser.lastName + "'s account";

        // const logData = new TransferLog({
        //      log : moneyDeductedLog.toString()
        // });
        //
        // logData.save();

        RegisterUser.findOneAndUpdate({
          email: email
        }, {
          "$set": {
            "money": parseInt(userDeductedMoney)
          }
        }, {
          returnNewDocument: true
        }, (err, doc) => {});
      });

      //Transfer to others
      RegisterUser.findOne({
        email: req.body.emailsender
      }, function(err, foundUser) {
        const sendermoney = parseInt(req.body.sendmoney);
        const userFinalMoney = parseInt(foundUser.money) + sendermoney

        RegisterUser.findOneAndUpdate({
          email: req.body.emailsender
        }, {
          "$set": {
            "money": parseInt(userFinalMoney)
          }
        }, {
          returnNewDocument: true
        }, (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          } else {
            var moneyTransferedLog = "Amount " + sendermoney.toString() + " transfered to " + doc.firstName + " " + doc.lastName + "'s account";
            var completeLog = moneyDeductedLog + "  ||  " + moneyTransferedLog;

            const logData = new TransferLog({
              log: completeLog.toString()
            });

            logData.save();

            res.redirect("/transfer");

          }
        });

      });


    }
  });

});


app.post("/addmoney", function(req, res) {
  const addingMoney = parseInt(req.body.addingmoney);

  RegisterUser.find({}, function(err, users) {
    if (err) {
      console.log(err);
    } else {
      RegisterUser.findOne({
        email: email
      }, function(err, foundUser) {

        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            // console.log(foundUser.email);
            // console.log(email);
            // console.log("hello");

            const userFinalMoney = parseInt(foundUser.money) + addingMoney;

            RegisterUser.findOneAndUpdate({
              email: email
            }, {
              "$set": {
                "money": parseInt(userFinalMoney)
              }
            }, {
              returnNewDocument: true
            }, (err, doc) => {
              if (err) {
                console.log("Something wrong when updating data!");
              }

            });

            var moneyAddedLog = "Amount " + addingMoney.toString() + " successfully added to " + foundUser.firstName + " " + foundUser.lastName + "'s account";

            //moneyAdd log
            const logData = new TransferLog({
              log: moneyAddedLog.toString()
            });

            logData.save();

            res.render('addmoney', {
              data: users,
              addingMoney,
              name: foundUser.firstName,
              totalmoney: userFinalMoney,
              cuurentUser: email
            });
          }
        }
      })
    }
  });


});




app.get("/", function(req, res) {
  RegisterUser.find({}, function(err, users) {
    if (err) {
      console.log(err);
    } else {
      res.render('home', {
        data: users,
        cuurentUser: email
      });

    }
  });
});


app.post("/register", async (req, res) => {
  try {
    const registereNewBankUser = new RegisterUser({
      firstName: req.body.fname,

      lastName: req.body.lname,

      email: req.body.emailaddr,

      password: req.body.pass
    })
    const registeredBankUser = await registereNewBankUser.save();
    res.redirect("login");
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post("/login", function(req, res) {
  email = req.body.email; //public
  const password = req.body.pass;

  RegisterUser.findOne({
    email: email
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.redirect('/');
        }
      } else {
        console.log("Error");
      }
    }
  })
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started at successfully");
});

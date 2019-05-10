require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/mmUserDB", {useNewUrlParser: true});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  motto : [ {category: String, motto: String,
    mottoDate: { type: Date, default: Date.now } } ],
  userCreatedDate: { type: Date, default: Date.now } 
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    if (req.isAuthenticated()){
      res.redirect("/userHomepage");
    } else {
      res.redirect("/login");
    }
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/userHomepage", function(req, res){
  if (req.isAuthenticated()){
    res.render("userHomepage", {userData: req.user});
  } else {
    res.redirect("/login");
  }
});

app.get("/submit", function(req,res){
    if (req.isAuthenticated()){
        res.render("submit", {userData: req.user})
    } else {
        res.redirect("/login");
      }
});

app.post("/submit", function(req,res){
    const submittedMotto = req.body.addAMotto;
    const categoryMotto = req.body.categoryMotto;

    User.findById(req.user.id, function(err, foundUser){
        if (err) {
            console.log(err);
          } else {
            if (foundUser) {
                foundUser.motto.push( {category: categoryMotto,motto: submittedMotto} );
                foundUser.save(function(){
                    res.redirect("/userHomepage")
                })
            } 
          }
    })
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/userHomepage");
      });
    }
  });

});

app.get('/test', function(req,res){
    
    User.find(req.body.showAllUsersButton, function(err, foundUsers){
        if (err) {
            console.log(err);
          } else {
            if (foundUsers) {
                console.log(foundUsers)
                }
            }
    res.render("test", { userData: foundUsers })
    });
});

app.delete('/test', function(req,res){
    console.log("DELETE");
    console.log(req,res)
    res.redirect("/test");
})
app.post('/test', function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
      });

      User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
              console.log("user crested", user.username)
            res.render("test");
          });
        }
      });

    //   let name = User.find ({ username: 'qwe' },function (err, name){
    //       console.log(name);
    //   });
      
      
})

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
      res.redirect("/login")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/userHomepage");
      });
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

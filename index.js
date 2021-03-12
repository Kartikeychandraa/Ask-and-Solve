var express = require("express");
var body = require("body-parser");
var ejs = require("ejs");
var mongoose = require("mongoose");
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const methodoverride=require("method-override");
const flash = require('express-flash');

// ---------------models--------
const UserModel = require("./model/user");
const QuestionModel = require("./model/question");
const AnswerModel = require("./model/answer");

require('dotenv').config();

mongoose.connect(
  process.env.mongodb,
  { useUnifiedTopology: true, useNewUrlParser: true }
);

var app = express();
app.use(flash());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("public"));
app.use(methodoverride("_method"))
app.set("view engine", "ejs");

app.use(body.urlencoded({ extended: false }));
app.use(body.json());

app.use(session({
    secret: 'secretid',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------routes----
app.get('/',(req,res)=>{
	res.render("home");
})


//------------------------------------authentication-start--
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/indexmain')
  }
  next()
}
const checkFun = async(email, password, done) =>{
  UserModel.findOne({ "email": email },(err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false,{ messages: 'No user with that email' });
        }
           bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false,{ messages: 'Password Incorrect'});
            }
            if (match) {
                return done(null, data);
            }
        });
      
    })

      
   }
    
var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField: 'email' },checkFun))


passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    UserModel.findById(id, function (err, user) {
        cb(err, user);
    });
});

//------------------------------------authentication-end--
// -----------------------------------complete auth

app.post('/login', (req, res, next) => {
var promise = new Promise((resolve,reject)=>{
  if (req.body.email === 'admin@gmail.com')
    {resolve();}
  else{reject();}
})
 
promise. 
    then( ()=>{ 
       passport.authenticate('local', {
        failureRedirect: '/',
        successRedirect: '/admin',
    })(req, res, next);
    })
    .catch(()=> { 
         passport.authenticate('local', {
        failureRedirect: '/',
        successRedirect: '/index',
    })(req, res, next);

    });

   
});


app.post("/register",async(req,res,next) =>{
UserModel.find({email : req.body.username},(err,data)=>{
  if(err){
    next();
  }
  else if (data){
res.send('already  a user');
  }
});
});
 app.post("/register",checkNotAuthenticated, async (req, res,next) => {
  console.log("posting register");
   var a = req.body.name;
   var c = req.body.username;
  const hashedPassword = await bcrypt.hash(req.body.SignupPassword, 10)
   const userr = new UserModel({
     name: a,
     email: c,
     password: hashedPassword,
   });
     try {
       await userr.save();
       res.send(userr);
     } catch (err) {
       res.status(500).send(err);
     }
     res.redirect("/")  
 });

app.delete("/logout",(req,res)=>
{
req.logout();
res.render("/");
});
// ------------------------------complete-auth-end
//--------------------------------project start-----
app.get('/index',(req,res)=>{
	res.render("index");
})
app.post('/AddQuestion',async(req,res)=>{
const question = new QuestionModel({
title : req.body.title,
description : req.body.description,
problem : req.body.problem,
userid : req.user._id,
})
 try {
       await question.save();
       res.send(question);
     } catch (err) {
       res.status(500).send(err);
     }
      
})



app.get("/output", async (req, res) => {
  const data = await UserModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(process.env.PORT || 3000,()=>{
	console.log("Server Running at 3000");
});
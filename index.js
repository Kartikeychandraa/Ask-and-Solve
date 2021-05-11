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
const FeedbackModel = require("./model/feedback");
require('dotenv').config();
mongoose.connect(
  "",
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

  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/index')
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
        successRedirect: '/admin-question',
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
 app.post("/signup",checkNotAuthenticated, async (req, res,next) => {
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
res.redirect("/");
});
// ------------------------------complete-auth-end
//--------------------------------project start-----
app.get('/index',checkAuthenticated,async (req,res)=>{
 await QuestionModel.find({},(err,data)=>{
if(err){
res.send(err);
}
else{
  var user=req.user.name;
  res.render("index",{data,user})
}

  });
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
});

app.get('/myquestion',checkAuthenticated,(req,res)=>{
   const id = req.user.id;
     if (id.match(/^[0-9a-fA-F]{24}$/)) {
       console.log(id + " is retrieving data");
  QuestionModel.find({userid : id},(err,data)=>{
  if (err)
   {console.log('error occured in my questions');}
 else{
res.render("myquestion",{data})
 }
})
     }
})
// ---------------------------------delete customer question
app.post('/delete_question/:id',(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    QuestionModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/myquestion");
      }
    })

  }
  else{console.log("id is not valid");}

})
// -------------view and answer questions
var temp =[];
var question_id;

app.get('/answer/:id',async(req,res,next)=>{
var id = req.params.id;
question_id = id;
temp = [];
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
  await QuestionModel.findById({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
       
       temp.push(data);
     next();
      }
    })
  }
  else{console.log("id is not valid");}
})
app.get("/answer/:id",async(req,res,next)=>{
  await AnswerModel.find({questionid : question_id},(err,data)=>{
     if (err)
        {res.send(err);}
      else{
       
       temp= temp.concat(data);
   
      }
  })
  console.log(temp);
  console.log(question_id);
  res.render("answer",{temp});
})

// --------------------------------------answer posting 
app.post("/post_answer",async(req,res)=>{
 const answer  = new AnswerModel({
     description: req.body.description,
     solution: req.body.solution,
     verified: 0,
     userid: req.user._id,
     questionid : question_id,
   });
     try {
       await answer.save();
       res.send(answer);
     } catch (err) {
       res.status(500).send(err);
     }
})

//-------------------------feedback -----------
app.post('/feedback',async(req,res)=>{
const feed = new FeedbackModel({
name: req.body.first_name + " " + req.body.last_name,
 email : req.body.email,
 subject : "NULL",
 company : "NULL",
 message : req.body.message,
});
try {
  await feed.save();
  res.redirect('/');
}
catch(err){
  res.status(500).send(err);
}

})

// -------------------------------------
app.get('/profile',checkAuthenticated,async(req,res)=>{
const data = await req.user;
  res.render('profile',{data});
})
//---------------------admin side --------
app.get('/admin-question',(req,res)=>{
  QuestionModel.find({},(err,data)=>{
    if(err){res.send(err);}
    else{
      
  res.render('admin-question',{data});
   }
    })
})
app.get('/admin-answer',(req,res)=>{
  AnswerModel.find({},(err,data)=>{
    if(err){res.send(err);}
    else{
  res.render('admin-answer',{data});
   } })
})
app.get('/admin-feedback',(req,res)=>{
  FeedbackModel.find({},(err,data)=>{
    if(err){res.send(err);}
    else{
  res.render('feedback',{data});
   } })
})
app.get('/admin-user',(req,res)=>{
  UserModel.find({},(err,data)=>{
    if(err){res.send(err);}
    else{
  res.render('admin-user',{data});
   } })
})
//--------------------------admin deleting---
app.post("/delete-user/:id",(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    UserModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/admin-user");
      }
    })

  }
  else{console.log("id is not valid");}
})
app.post("/delete-question/:id",(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    QuestionModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/admin-question");
      }
    })

  }
  else{console.log("id is not valid");}
})
app.post("/delete-answer/:id",(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    AnswerModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/admin-answer");
      }
    })

  }
  else{console.log("id is not valid");}
})

app.post("/delete-feedback/:id",(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    FeedbackModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/admin-feedback");
      }
    })

  }
  else{console.log("id is not valid");}
})

//------------------------------------------testing routes
app.get("/output", async (req, res) => {
  const data = await UserModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});
app.get("/question_output", async (req, res) => {
  const data = await QuestionModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/answer_output", async (req, res) => {
  const data = await AnswerModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});


app.listen(process.env.PORT || 3000,()=>{
  var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  console.log("Server started on 3000 at UTC " + date+ " "+ time);
});
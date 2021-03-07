const express = require("express");
const ejs = require("ejs");
var app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get('/',(req,res)=>{
	res.render("home");
})
app.get('/login',(req,res)=>{
	res.render("login");
})
app.get('/signup',(req,res)=>{
	res.render("signup");
})


app.listen(process.env.PORT || 3000,()=>{
	console.log("Server Running at 3000");
});
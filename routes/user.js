
let express= require("express");
let router  =express.Router();
let User = require("../models/user.js");
let wrapAsync=require("../deep/wrap.js");
let passport = require("passport"); 
let {savedUrl} = require("../middleware.js");




router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});


router.post("/signup",wrapAsync(async(req,res,next)=>{
    try{
    let{username,email,password}=req.body;
    let newUser = new User({username,email});
    let registerUser = await User.register(newUser,password);
    console.log(registerUser);

    req.login(registerUser,(err)=>{
        if(err){
            return next(err);
            
        }
         req.flash("success","wlecome to wanderlust");
    res.redirect("/listings");

    })
   
    }
    catch(er){
        req.flash("error",er.message);
        res.redirect("/signup");
    }
    

}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",savedUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome to back to wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);

});

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out ");
        res.redirect("/listings");
    })
});


module.exports=router;
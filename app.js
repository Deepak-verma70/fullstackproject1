
require("dotenv").config();

let express = require("express");
let mongoose=require("mongoose");
let app =express();
let Listing=require("./models/listing.js");
let path = require("path");
let methodOverride=require("method-override");
let ejsMate = require("ejs-mate");
let wrapAsync=require("./deep/wrap.js");
let ExpressError=require("./deep/ExpressError");
let {listingSchema,reviewSchema} = require("./schema.js");
let Review=require("./models/review.js");
let listings = require("./routes/listing.js");
let session = require("express-session");
let MongoStore = require("connect-mongo").default;
let flash = require("connect-flash");
let passport = require("passport");
let LocalStrategy = require("passport-local");
let User = require("./models/user.js");
let userRouter = require("./routes/user.js");
let cookieParser = require("cookie-parser");
let {isLoggedIn,Owner,isReview} = require("./middleware.js");



 const dbUrl=process.env.ATLASDB_URL; 
async function main(){
   await mongoose.connect(dbUrl);
}
main().then((res)=>{
    console.log("connection to db");
}).catch((err)=>{
    console.log(err);
});


app.use(cookieParser());

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3400,
});

store.on("error",()=>{
    console.log("error in mongo session store");
});

let sessionOptions={store,secret:process.env.SECRET,resave:false,saveUninitialized:true,cookie:{expires:Date.now() + 7 * 24 * 60 * 60 *1000,
    maxAge:7*24*60*60*1000,httpOnly:true,
}};

app.use(session(sessionOptions));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(8080,()=>{
    console.log("server start");
});
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));




app.use((req,res,next)=>{
    
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser = req.user;
    

    next();
})




app.use("/listings",listings);
app.use("/",userRouter);


app.get("/",(req,res)=>{
    res.render("index.ejs");
})




app.post("/listings/:id/reviews",isLoggedIn,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

   let ret= await newReview.save();
   let rep = await listing.save();

   res.redirect(`/listings/${listing._id}`);
   
}));

app.delete("/listing/:id/reviews/:reviewId",isLoggedIn,isReview,wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);

}));


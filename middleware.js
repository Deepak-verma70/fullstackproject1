
let Listing =require("./models/listing.js");
let Review =require("./models/review.js");


module.exports.isLoggedIn = (req,res,next) =>{
   
     if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing");
       return res.redirect("/login");
    }
    next();
    
};

module.exports.savedUrl = (req,res,next)=>{
   if(req.session.redirectUrl){
      res.locals.redirectUrl=req.session.redirectUrl;
      
   }
   next();
};


module.exports.Owner =async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
     if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error","you not owner of listing");
       return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.isReview =async (req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","you not author of review");
       return res.redirect(`/listings/${id}`);
    }
    next();
};
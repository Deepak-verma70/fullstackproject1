


let express = require("express");
let routes= express.Router();
let Listing=require("../models/listing.js");
let wrapAsync=require("../deep/wrap.js");
let ExpressError=require("../deep/ExpressError");
let {listingSchema} = require("../schema.js");
let {isLoggedIn,Owner} = require("../middleware.js");
let multer= require("multer");
let {storage}=require("../cloudConfig.js");
let upload = multer({ storage });
let controllerListing = require("../controllers/listings.js");


routes.route("/")
   .get(controllerListing.show)
   .post(upload.single("listing[image]"),wrapAsync(async(req,res,next)=>{
    
    let url = req.file.path;
    let filename=req.file.filename;
   let listing= new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image={url,filename};
  await  listing.save();
  req.flash("success","listing created successfully");
    res.redirect("/listings");

}));



routes.get("/search",async(req,res)=>{
    let {location}= req.query;

    let Listings = await Listing.find({
        location:{
            $regex:location,
            $options:"i"

        }
    });

    if(Listings.length == 0){
        req.flash("error","No Listing found");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs",{Listings});
});
   


routes.get("/new",isLoggedIn,(req,res)=>{
   
    res.render("listings/new.ejs");
});

routes.get("/:id",async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
         req.flash("error","listing not existed");
         res.redirect("/listings");

    }
    console.log(listing);
    res.render("listings/individual.ejs",{listing});

});



routes.get("/:id/edit",Owner,async(req,res)=>{
     let {id} = req.params;
    let listing = await Listing.findById(id);
   
    let originalImageUrl = listing.image.url;
   originalImageUrl= originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});

});

routes.put("/:id",Owner,upload.single("listing[image]"),async(req,res)=>{
    let {id} = req.params;
      

    
   
  let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
  if(typeof req.file !== "undefined"){
   let url = req.file.path;
    let filename=req.file.filename;
  listing.image = {url,filename};
  await listing.save();
  }
    req.flash("success","listing update successfully");
    res.redirect(`/listings/${id}`);

});

routes.delete("/:id",Owner,async (req,res)=>{
    let {id} = req.params;
   await Listing.findByIdAndDelete(id);
    req.flash("success","listing delete successfully");
    res.redirect("/listings");
});




module.exports = routes;
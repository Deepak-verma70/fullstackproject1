
let Listing = require("../models/listing.js");
module.exports.show = async (req,res)=>{
    let allListings = await Listing.find();
    res.render("listings/show.ejs",{allListings});



}
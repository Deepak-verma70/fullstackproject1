


let mongoose=require("mongoose");
let initdata = require("./data.js");
let Listing=require("../models/listing.js");


async function main(){
   await mongoose.connect("mongodb://127.0.0.1:27017/wandwelust");
}
main().then((res)=>{
    console.log("connection to db");
}).catch((err)=>{
    console.log(err);
});


let initdb = async ()=>{
  await  Listing.deleteMany({});
  initdata.data = initdata.data.map((obj)=>({...obj,owner:"69d7c764f2900d007b690a8e"}));
  await Listing.insertMany(initdata.data);
  console.log("data initialized");
}

initdb();

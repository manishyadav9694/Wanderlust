const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to DB");
}

const initDB = async () => {
  await main();

  let user = await User.findOne({});
  if (!user) {
    console.log("KOI USER NAHI HAI! Pehle node app.js chala ke signup karo");
    mongoose.connection.close();
    return;
  }

  await Listing.deleteMany({});
  console.log(`Owner: ${user.username} - ${user._id}`);

  initData.data = initData.data.map((obj) => ({ 
    ...obj, 
    owner: user._id,
    geometry: obj.geometry || { type: "Point", coordinates: [77.2090, 28.6139] }
  }));
  
  await Listing.insertMany(initData.data);
  console.log("data was initialized - listings wapas aa gaye");
  mongoose.connection.close();
};

initDB();
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken? mbxGeocoding({ accessToken: mapToken }) : null;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
   .populate({ path: "reviews", populate: { path: "author" } })
   .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  if (!geocodingClient) {
    req.flash("error", "MAP_TOKEN is missing in.env file!");
    return res.redirect("/listings/new");
  }
  let response = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location}, ${req.body.listing.country}`,
    limit: 1,
  }).send();

  if (!response.body.features.length) {
    req.flash("error", "Invalid location!");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;

  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  Object.assign(listing, req.body.listing);

  if (geocodingClient) {
    let response = await geocodingClient.forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    }).send();
    if (response.body.features.length) {
      listing.geometry = response.body.features[0].geometry;
    }
  }

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
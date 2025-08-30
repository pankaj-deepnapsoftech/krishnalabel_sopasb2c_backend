const { Schema, model } = require("mongoose");

const GardSchema = new Schema({
  type: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  details: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  material: { type: String,  trim:  true },
  purpose: { type: String,  trim: true},
  comment: { type: String,  trim: true},
  contact_persone: { type: String, trim: true },
  status: { type: String, required: true, trim: true },
},{timestamps:true});

exports.GardModels = model("gard", GardSchema);

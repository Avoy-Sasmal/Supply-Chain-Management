import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  deviceId: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    geoLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    productDetails: {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      temperature: { type: String, required: true }
    },
    ownership: {
      owner: { type: String, required: true },
      transporter: { type: String, required: true }
    },
    transportation: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      status: { type: String, required: true }
    }
},{
  timestamps : true
})

const productData  = mongoose.model("products",productSchema)
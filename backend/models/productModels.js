import mongoose from "mongoose";


// Define the product schema
const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  sold: {
    type: Boolean,
    default: false
  },
  dateOfSale: {
    type: Date,
    required: true
  }
});

// Create the product model
const Product = mongoose.model('Product', productSchema);

export default Product;
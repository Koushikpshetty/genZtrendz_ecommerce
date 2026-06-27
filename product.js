import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: Number,
    rating: Number,
    company: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    size: [],
    isFeatured: {
      type: Boolean,
      default: false,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

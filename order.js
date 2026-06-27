import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    total_price: {
      type: Number,
      required: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
      },
    ],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    delivery_address: {
      name: String,
      address1: String,
      address2: String,
      phone: Number,
      pincode: Number,
      state: String,
    },
    status: {
      type: String,
      enum: ["delivered", "processing", "shipped"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

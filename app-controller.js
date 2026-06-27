import { Product, User } from "../model/index.js";
import { ApiError } from "../utils/ApiError.js";
import { safeValidateProductData } from "../validation/productValidation.js";
import { Order } from "../model/order.js";

export const getProducts = async (req, res) => {
  const { page, limit, search = "" } = req.body;

  if (!page || !limit) {
    return ApiError(422, "Not provided the required parameters");
  }

  const searchFilter = search
    ? { title: { $regex: search, $options: "i" } }
    : {};

  const result = await Product.find(searchFilter)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalProducts = await Product.find(searchFilter).countDocuments();

  const paginationData = {
    total: totalProducts,
    page: page,
    limit: limit,
  };

  res
    .status(200)
    .json({ success: true, data: { data: result, meta: paginationData } });
};

export const createProduct = async (req, res, next) => {
  console.log("Request reached controller");
  try {
    const {
      title,
      description,
      price,
      category,
      discountedPrice,
      size,
      rating,
      company,
      isFeatured,
    } = req.body;

    // Validation
    const { success, data, error } = safeValidateProductData(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
    if (!req.file) {
      throw new ApiError(422, "Image is required");
    }

    const image = "/product/images/" + req.file.filename;

    // Create new product
    const product = await Product.create({
      title,
      description,
      price,
      image,
      category,
      discountedPrice,
      size,
      rating,
      company,
      isFeatured,
      // Add any other fields from your schema
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeatured = async (req, res, next) => {
  try {
    const result = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: result ?? [] });
  } catch (err) {
    next(err);
  }
};

export const getLatestProducts = async (req, res, next) => {
  try {
    const result = await Product.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: result ?? [] });
  } catch (err) {
    next(err);
  }
};

export const getSingleProduct = async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    throw ApiError(422, "No product id provided");
  }
  try {
    const result = await Product.findById(productId);
    res.status(200).json({ success: true, data: result ?? [] });
  } catch (err) {
    next(err);
  }
};

// Cart section
export const getCart = async (req, res, next) => {
  const userId = req.id;

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    res.status(200).json({ success: true, data: user.cart });
  } catch (err) {
    next(err);
  }
};

export const addCart = async (req, res, next) => {
  const { productId, quantity, size = "M" } = req.body;
  const userId = req.id;

  try {
    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    // Check if the product is already in the cart
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    const existingCartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    let updatedUser;

    if (existingCartItemIndex >= 0) {
      // Product already in cart, update quantity
      user.cart[existingCartItemIndex].quantity += quantity;
      user.cart[existingCartItemIndex].size = size;
      await user.save();
      updatedUser = await User.findById(userId).populate("cart.productId");
    } else {
      // Product not in cart, add new item
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { productId, quantity, size } } },
        { new: true }
      ).populate("cart.productId");
    }

    res.status(200).json({ success: true, data: updatedUser.cart });
  } catch (err) {
    next(err);
  }
};

// Increment cart item quantity
export const incrementCartItemQuantity = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.id;
  try {
    if (!productId) {
      throw new ApiError(422, "No product id provided");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (!cartItem) {
      throw new ApiError(404, "Cart item not found");
    }
    cartItem.quantity += 1;
    await user.save();
    await user.populate("cart.productId");
    res.status(200).json({ success: true, data: user.cart });
  } catch (err) {
    next(err);
  }
};

// Decrement cart item quantity
export const decrementCartItemQuantity = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.id;
  try {
    if (!productId) {
      throw new ApiError(422, "No product id provided");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (!cartItem) {
      throw new ApiError(404, "Cart item not found");
    }
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await user.save();
      await user.populate("cart.productId");
      res.status(200).json({ success: true, data: user.cart });
    } else {
      // Optionally, remove item if quantity reaches 0
      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId
      );
      await user.save();
      await user.populate("cart.productId");
      res.status(200).json({
        success: true,
        data: user.cart,
        message: "Item removed from cart",
      });
    }
  } catch (err) {
    next(err);
  }
};

// Remove cart item by productId
export const removeCartItemByProductId = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.id;
  try {
    if (!productId) {
      throw new ApiError(422, "No product id provided");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );
    if (user.cart.length === initialCartLength) {
      throw new ApiError(404, "Cart item not found");
    }
    await user.save();
    await user.populate("cart.productId");
    res.status(200).json({
      success: true,
      data: user.cart,
      message: "Item removed from cart by productId",
    });
  } catch (err) {
    next(err);
  }
};

// Remove cart item by productId
export const ClearCartController = async (req, res, next) => {
  const userId = req.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.cart = [];
    await user.save();
    res.status(200).json({
      success: true,
      message: "Cart Item cleared",
    });
  } catch (err) {
    next(err);
  }
};

// Orders

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.id;
    const { total_price, products, delivery_address } = req.body;

    if (
      !total_price ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !delivery_address
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields",
      });
    }

    const order = await Order.create({
      total_price,
      products,
      user_id: userId,
      delivery_address,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res) => {
  const userId = req.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const orders = await Order.find({ user_id: userId })
      .populate("products.product_id")
      .sort({
        createdAt: -1,
      });
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res) => {
  const userId = req.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.isAdmin) {
      throw new ApiError(403, "Not Authorized");
    }

    const orders = await Order.find()
      .populate([
        { path: "products.product_id" },
        { path: "user_id", select: "name email" },
      ])
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const changeOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  const userId = req.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.isAdmin) {
      throw new ApiError(403, "Not Authorized");
    }

    await Order.findByIdAndUpdate(orderId, {
      status: status,
    });
    res.json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

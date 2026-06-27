import { User } from "../model/user.js";
import bcrypt from "bcrypt";
import { generateAvatar } from "../utils/generateAvatar.js";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = generateAvatar(name);

    // Create new user
    const result = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      isAdmin: false, // Default role
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).populate({
      path: "cart.productId", // adjust path as per your schema
      select: "-__v", // exclude unwanted fields
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, please sign up",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { email: email, _id: user._id.toString() },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5 days",
      }
    );

    // Remove password from response
    const loggedInUser = user.toObject();
    delete loggedInUser.password;

    return res.status(200).json({
      success: true,
      user: loggedInUser,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
      error: error.message,
    });
  }
};

// Create a me controller that returns user data along with populated cart
export const me = async (req, res) => {
  try {
    // req.user should be set by authentication middleware
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Populate cart (assuming 'cart' is a field in User schema and references products)
    const user = await User.findById(userId).select("-password").populate({
      path: "cart.productId", // adjust path as per your schema
      select: "-__v", // exclude unwanted fields
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Me controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong fetching user data",
      error: error.message,
    });
  }
};

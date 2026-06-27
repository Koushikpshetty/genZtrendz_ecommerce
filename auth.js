import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const isAuth = (req, res, next) => {
  // Get token from authorization header - headers are lowercase in Express
  const accessToken = req.headers.authorization || req.headers["authorization"];

  if (!accessToken) {
    throw new ApiError(401, "Not Authorized: No token provided");
  }

  try {
    const decodedVal = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.id = decodedVal._id;
    next();
  } catch (error) {
    throw new ApiError(401, "Not Authorized: Invalid token");
  }
};

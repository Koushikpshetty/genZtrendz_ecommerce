import express from "express";
import * as AppController from "../controller/app-controller.js";
import { v4 } from "uuid";
import multer from "multer";
import path from "path";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "product", "images"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + v4() + "." + file.originalname.split(".")[1]
    );
  },
});

// Check if uploaded file is an image
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|avif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  // You can also check mimetype
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter });

router.post("/products", AppController.getProducts);
router.get("/product/featured", AppController.getFeatured);
router.get("/product/new-arrival", AppController.getLatestProducts);
router.get("/products/:productId", AppController.getSingleProduct);
router.post("/product", upload.single("image"), AppController.createProduct);

router.get("/cart", isAuth, AppController.getCart);
router.post("/cart/add", isAuth, AppController.addCart);
router.post("/cart/clear", isAuth, AppController.ClearCartController);
router.delete(
  "/cart/remove/:productId",
  isAuth,
  AppController.removeCartItemByProductId
);

router.post("/order", isAuth, AppController.createOrder);
router.get("/order", isAuth, AppController.getOrders);
router.post("/order/admin", isAuth, AppController.getAdminOrders);
router.post("/order/change-status", isAuth, AppController.changeOrderStatus);

export { router as appRouter };

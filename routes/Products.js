const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

var upload = multer({ storage: storage });
const auth = require("../middlewares/auth");
const productUserController = require("../controllers/ProductController");

router.get("/", productUserController.getProducts);
router.get("/get-product/:_id", productUserController.getSingleProduct);
router.get("/my-products", auth, productUserController.getUserProducts);

router.post(
  "/search-products",
  productUserController.getProductsByLocationAndName
);
router.post(
  "/create-product",
  auth,
  upload.single("image"),
  productUserController.createProduct
);

router.delete(
  "/delete-product/:_id",
  auth,
  productUserController.deleteProduct
);

router.put(
  "/update-product/:_id",
  auth,
  upload.single("image"),
  productUserController.updateProduct
);

router.post("/buy-product", auth, productUserController.buyproduct);
router.get(
  "/get-product-voucher/:voucher/:id",
  auth,
  productUserController.checkVoucher
);
router.get("/get-sales", auth, productUserController.getSales);

module.exports = router;

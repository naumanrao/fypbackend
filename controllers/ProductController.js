const fs = require("fs");
const { Stripe } = require("stripe");

const { Product, validation } = require("../models/Product");
const { User } = require("../models/User");
const { SoldProduct } = require("../models/ProductsSold");

const getUserbyId = async (_id) => {
  const user = await User.findById({ _id }).select("-password");
  return user;
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("userId", "fullName");
    res.status(200).send({ products });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.status(200).send({ products });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    let product = await Product.findById({ _id: req.params._id }).populate(
      "userId",
      ["fullName", "email", "phoneNumber"]
    );

    res.status(200).send({ product });
  } catch (error) {
    res.status(500).send({ error: "No product found" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { _id } = req.user;

    console.log(req.body);
    const { error } = validation.validate(req.body);

    if (error) return res.status(400).send({ error: error.details[0].message });

    const {
      name,
      price,
      description,
      stock,
      unit,
      voucher,
      voucherAvailableTimes,
      voucherPercentage,
    } = req.body;
    const user = await getUserbyId(_id);
    let image = null;

    if (req.file) {
      image = req.file.path;
    }

    const product = new Product({
      name,
      price,
      description,
      userId: _id,
      image: image,
      location: user.location,
      stock,
      unit,
      voucher,
      voucherAvailableTimes,
      voucherPercentage,
    });

    await product.save();

    const createdProduct = await Product.findById({
      _id: product._id,
    }).populate("location");

    res.status(201).send({
      product: createdProduct,
      message: "Product created sucessfully",
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete({
      _id: req.params._id,
    });

    if (deletedProduct) {
      fs.unlink(deletedProduct.image, () => {});
    }

    res.status(200).send({ message: "Product deleted sucessfully" });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById({ _id: req.params._id });

    if (!product) {
      return res.status(400).send({ error: "Product not found" });
    }

    const {
      name,
      description,
      price,
      status,
      stock,
      unit,
      voucher,
      voucherAvailableTimes,
      voucherPercentage,
    } = req.body;

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.unit = unit;
    product.voucher = voucher;
    product.voucherAvailableTimes = voucherAvailableTimes;
    product.voucherPercentage = voucherPercentage;
    if (status) {
      product.status = status;
    }

    if (req.file) {
      fs.unlink("uploads/" + product.image.split("\\")[1], () => {});
      product.image = req.file.path;
    }

    await product.save();

    res.status(200).send({ product, message: "Product updated sucessfully." });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getProductsByLocationAndName = async (req, res) => {
  try {
    const { locationId, keys } = req.body;

    let searchObj = { name: { $regex: keys, $options: "i" } };
    if (locationId) {
      searchObj = {
        name: { $regex: keys, $options: "i" },
        location: locationId,
      };
    }

    const products = await Product.find({
      $or: [searchObj],
    })
      .populate("location")
      .populate("userId");

    res.status(200).send({ products });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.buyproduct = async (req, res) => {
  try {
    const { cardDetails, totalPrice, product, quantity, hasVoucher } = req.body;

    const pro = await Product.findById({ _id: product });
    if (parseInt(pro.stock) < quantity)
      return res.status(400).send({ error: "Stock exceded" });

    const stripe = new Stripe(
      "sk_test_51L510HD6MLn8tqd5C7eNFKZrwPYh4p6yRCdzY25ByZwS2EYNtUqkqOWw8O4FdFNcRdNxHlU1VTD50wGmG9xKicqK00ojNx5w5N"
    );

    const month = cardDetails.expiryDate.split("/")[0];
    const year = cardDetails.expiryDate.split("/")[1];
    const token = await stripe.tokens.create({
      card: {
        number: cardDetails.cardNumber,
        exp_month: month,
        exp_year: year,
        cvc: cardDetails.securityCode,
      },
    });

    const session = await stripe.charges.create({
      card: token.id,
      amount: totalPrice * 100,
      currency: "pkr",
      description: "This is a order from organic food",
    });

    if (session) {
      pro.stock = parseInt(pro.stock) - parseInt(quantity);
      if (hasVoucher) {
        pro.voucherAvailableTimes = parseInt(pro.voucherAvailableTimes) - 1;
      }
      await pro.save();

      const newSale = new SoldProduct({
        buyer: req.user._id,
        product,
        quantity,
        total: totalPrice,
        owner: pro.userId,
      });

      await newSale.save();
      res.status(200).send({ message: "Product purchased successfully! " });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
};

exports.checkVoucher = async (req, res) => {
  try {
    const { voucher, id } = req.params;

    const product = await Product.findOne({
      voucher: { $regex: voucher, $options: "i" },
      _id: id,
    }).lean();

    console.log(product);

    if (!product)
      return res.status(500).send({ error: "This voucher is invalid" });

    if (product.voucherAvailableTimes === 0)
      return res.status(500).send({ error: "This voucher has expired" });

    res.status(200).send({
      message: "Voucher is avaialble",
      percentage: product.voucherPercentage,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await SoldProduct.find({ owner: req.user._id })
      .lean()
      .select("-owner")
      .populate("product", "name")
      .populate("buyer", "fullName email phoneNumber");

    res.status(200).send({ sales });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

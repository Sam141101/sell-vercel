const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  try {
    let products = [];
    // console.log(req.body.cart);
    req.body.cart.forEach(function (element) {
      let tp = {
        product_id: element.product_id,
        quantity: element.quantity,
        price: element.price,
        size: element.size,
      };
      products.push(tp);
    });
    // console.log(products);

    const newOrder = new Order({
      userId: req.body.userId,
      products: products,
      method: req.body.inputs.method,
      amount: req.body.totalPrice,
    });

    const updateUser = await User.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          fullname: req.body.inputs.fullname,
          address: req.body.inputs.address,
          phone: req.body.inputs.phone,
        },
      }
    );

    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
    // res.status(200).json("fff");
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
// router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     await Order.findByIdAndDelete(req.params.id);
//     res.status(200).json("Order has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  // router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    // const orders = await Order.find({ userId: req.params.id });
    const tt = await Order.findOne({
      userId: req.params.id,
    }).populate({
      path: "products",
      populate: { path: "product_id" },
    });

    // console.log(tt.products[0].product_id);

    let listOrder = [];

    // tt.products.forEach(function (element) {

    //   const product = await Product.findOne
    //   let tp = {
    //     product_id: element._id,
    //     quantity: element.quantity,
    //     price: element.price,
    //     size: element.size,
    //   };
    //   listOrder.push(tp);
    // });

    // const ts = await tt.products.find();

    // console.log(tt.products[0].product_id);
    console.log(tt);
    res.status(200).json(tt);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

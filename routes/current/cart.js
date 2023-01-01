const Cart = require("../models/Cart");
const User = require("../models/User");
const Quantity = require("../models/Quantity");
const Price = require("../models/Price");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const Product = require("../models/Product");
const Size = require("../models/Size");
// const { addCart } = require("../controllers/cart.js");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  try {
    // Tìm tới user trong mảng user
    const story = await User.findOne({ _id: req.body.userId });

    // ---------------- Trỏ để hiện đầy đủ các cart_id và quantity_id và price_id trong bảng Cart từ User --------------------
    // Tìm tới thằng quantity_id bên trong cart
    const getQuantity_id = await User.findOne({
      _id: req.body.userId,
    }).populate({
      path: "cart_id",
      populate: { path: "quantity_id" },
    });
    const quantity_id = await getQuantity_id.cart_id.quantity_id;

    // Tìm tới thằng price_id bên trong cart
    const getPrice_id = await User.findOne({
      _id: req.body.userId,
    }).populate({
      path: "cart_id",
      populate: { path: "price_id" },
    });
    const price_id = await getPrice_id.cart_id.price_id;

    // Tìm tới thằng size_id bên trong cart
    const getSize_id = await User.findOne({
      _id: req.body.userId,
    }).populate({
      path: "cart_id",
      populate: { path: "size_id" },
    });
    const size_id = await getSize_id.cart_id.size_id;

    // ----------------------------------------------------------------

    // // Lấy ra được giá tiền của sản phẩm
    const getProduct_id = await Product.findOne({
      _id: req.body.product_id,
    });
    const price = getProduct_id.price;

    // --------------- kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa ----------------
    // kiểm tra xem có cùng id sản phẩm không
    const tt = await Cart.findOne({
      _id: story.cart_id,
      product_id: { $in: [req.body.product_id] },
    });

    // kiểm tra xem có cùng size sản phẩm không
    let flag = false;
    if (tt !== null) {
      const sz = await Size.findOne({
        _id: size_id._id,
        products: { $elemMatch: { product_id: req.body.product_id } },
      });
      const size = sz.products.filter(
        (item) => item.product_id === req.body.product_id
      );
      const checkSize = size[0].size_sp;
      if (checkSize === req.body.size_sp) {
        return (flag = true);
      }
      console.log("kkkkkkkk");
      // return flag;
    }
    console.log(flag);
    // ----------------------------------------------------------------

    // Xác định xem sản phẩm đã có chưa để thay đổi số lượng sản phẩm và số lượng đơn hàng
    if (tt === null || (flag && tt)) {
      // if (tt === null) {
      console.log("không");
      const quantityCartPd = await Quantity.findOne({ _id: quantity_id._id });
      const qttCart = quantityCartPd.quantityCart;
      let change2 = qttCart;
      change2 = change2 + 1;

      // Tính giá sản phẩm = price x req.body.quantity_sp khi mà chưa có sản phẩm đó trong giỏ hàng
      const p = await Price.findOne({ _id: price_id._id });
      const ptotal = p.totalPrice;

      let total_sp = 0;
      total_sp = price * req.body.quantity_sp;
      let total_cart = ptotal + total_sp;

      // add(
      //   req.body.product_id,
      //   story,
      //   quantity_id,
      //   req.body.quantity_sp,
      //   change2,
      //   req.body.size_sp
      // );
      // console.log("tiếp");

      await Cart.updateOne(
        // cập nhật product_id trong mảng cart
        { _id: story.cart_id },
        {
          $push: { product_id: req.body.product_id },
        },
        { new: true }
      );

      const quanti = await Quantity.updateOne(
        { _id: quantity_id._id },
        {
          $push: {
            products: {
              product_id: req.body.product_id,
              quantity_sp: req.body.quantity_sp,
              // size_sp: req.body.size_sp,
            },
          },
          $set: {
            quantityCart: change2,
          },
        },
        { new: true }
      );

      await Price.updateOne(
        // cập nhật product_id trong mảng Price
        { _id: price_id._id },
        {
          $push: {
            products: {
              price_sp: total_sp,
              product_id: req.body.product_id,
            },
          },
          $set: {
            totalPrice: total_cart,
          },
        },
        { new: true }
      );

      await Size.updateOne(
        // cập nhật product_id trong mảng Size
        { _id: size_id._id },
        {
          $push: {
            products: {
              size_sp: req.body.size_sp,
              product_id: req.body.product_id,
            },
          },
        },
        { new: true }
      );
    } else {
      console.log("Có");
      let change = 0;

      // Tìm tới số lượng đơn hàng trong Quantity
      const quantityCartPd = await Quantity.findOne({ _id: quantity_id._id });
      const qttCart = quantityCartPd.quantityCart;

      // Tìm sản phẩm có cùng id trong mảng sản phẩm của Quantity
      const tt = await Quantity.findOne({
        _id: quantity_id,
        products: { $elemMatch: { product_id: req.body.product_id } },
      });

      function checkAdult(age) {
        return age.product_id === req.body.product_id;
      }

      const t = tt.products.filter(checkAdult);
      const f = t[0].quantity_sp;
      change = f + req.body.quantity_sp;

      // quanti(
      //   change,
      //   qttCart,
      //   req.body.size_sp,
      //   quantity_id,
      //   req.body.product_id
      // );

      const quanti = await Quantity.updateOne(
        { _id: quantity_id._id },
        {
          $set: {
            "products.$[element].quantity_sp": change,
            // "products.$[element].size_sp": req.body.size_sp,
          },
        },
        {
          new: true,
          arrayFilters: [{ "element.product_id": req.body.product_id }],
        }
      );

      // Tính giá sản phẩm = price x req.body.quantity_sp khi mà đã có sản phẩm đó trong giỏ hàng
      const p = await Price.findOne({ _id: price_id._id });
      const ptotal = p.totalPrice;
      console.log(ptotal);
      // Tìm sản phẩm có cùng id trong mảng sản phẩm của Quantity
      const pt = await Price.findOne({
        _id: price_id._id,
        products: { $elemMatch: { product_id: req.body.product_id } },
      });

      const ttsp = pt.products.filter(
        (item) => item.product_id === req.body.product_id
      );
      let total_sp = ttsp[0].price_sp;

      total_sp = total_sp + price * req.body.quantity_sp;
      let total_cart = ptotal + price * req.body.quantity_sp;

      await Price.updateOne(
        // cập nhật product_id trong mảng cart
        { _id: price_id._id },
        {
          $set: {
            totalPrice: total_cart,
            "products.$[element].price_sp": total_sp,
          },
        },
        {
          new: true,
          arrayFilters: [{ "element.product_id": req.body.product_id }],
        }
      );
    }

    // lấy số lượng đơn hàng ra
    const amount = await Quantity.findOne({ _id: quantity_id._id });
    const update = await amount.quantityCart;

    console.log(update);

    res.status(200).json(update);
    console.log("sut thanh cong");
  } catch (err) {
    console.log("failer");
    res.status(500).json(err);
  }
});

// router.post("/", verifyToken, addCart);

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER CART
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  // router.get("/find/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).populate({
      path: "cart_id",
      populate: { path: "product_id" },
    });
    console.log(user.cart_id.product_id);

    // const products = {
    //   product: user.cart_id.product_id,
    // };

    // ----------------- test ----------------
    // const user = await User.findOne({ _id: req.params.id }).populate({
    //   path: "cart_id",
    // });

    // // console.log(user.cart_id.product_id);

    // const productCart = await Cart.findOne({ _id: user.cart_id._id }).populate({
    //   path: "product_id",
    // });
    // const quantityCart = await Cart.findOne({ _id: user.cart_id._id }).populate(
    //   {
    //     path: "quantity_id",
    //   }
    // );
    // // Lấy sản phẩm
    // const product = productCart.product_id;
    // // Lấy số lượng
    // const quantity = quantityCart.quantity_id;
    // console.log(quantity);

    // // const quantity = await Cart.findOn

    // // ----------------------------------------------------------------

    // const products = {
    //   product: product,
    //   // quantity:
    //   // price:
    // };

    // res.status(200).json(products);
    res.status(200).json(user.cart_id.product_id);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

// ----------------- Thêm đơn hàng vào giỏ hàng --------------------
// Thêm 1 bảng cart
const add = async (
  product_id,
  story,
  quantity_id,
  quantity_sp,
  quantityCart,
  size_sp
) => {
  await Cart.updateOne(
    // cập nhật product_id trong mảng cart
    { _id: story.cart_id },
    {
      $push: { product_id: product_id },
    },
    { new: true }
  );

  const quanti = await Quantity.updateOne(
    { _id: quantity_id._id },
    {
      $push: {
        products: {
          product_id: product_id,
          quantity_sp: quantity_sp,
          size_sp: size_sp,
        },
      },
      $set: {
        quantityCart: quantityCart,
      },
    },
    { new: true }
  );

  // await Price.updateOne(
  //   // cập nhật product_id trong mảng cart
  //   { _id: price_id._id },
  //   {
  //     $push: {
  //       totalPrice: totalPrice,
  //       products: {
  //         price_sp: price_sp,
  //         product_id: product_id,
  //       },
  //     },
  //     $set: {
  //       totalPrice: totalPrice,
  //     },
  //   },
  //   { new: true }
  // );
};
// -------------------------------------

// ------------------- Thêm các thông số như số lượng và size --------------------
// Thêm các trường vào mảng products của Quantity
const quanti = async (
  quantity_sp,
  qttCart,
  size_sp,
  quantity_id,
  product_id
) => {
  console.log("vào rồi");
  const quanti = await Quantity.updateOne(
    { _id: quantity_id._id },
    {
      // $set: {
      //   products: {
      //     // product_id: product_id,
      //     quantity_sp: quantity_sp,
      //     size_sp: size_sp,
      //   },
      // },

      $set: {
        "products.$[element].quantity_sp": quantity_sp,
        "products.$[element].size_sp": size_sp,
      },
    },
    {
      new: true,
      arrayFilters: [{ "element.product_id": product_id }],
    }
  );

  // await Price.updateOne(
  //   // cập nhật product_id trong mảng cart
  //   { _id: price_id._id },
  //   {
  //     $set: {
  //       totalPrice: totalPrice,
  //       "products.$[element].price_sp": price_sp,
  //     },
  //   },
  //   {
  //     new: true,
  //     arrayFilters: [{ "element.product_id": product_id }],
  //   }
  // );

  console.log(quanti);
  // ---------------------------------------
};

// ------------------- số lượng đơn hàng --------------------

// ---------------------------------------

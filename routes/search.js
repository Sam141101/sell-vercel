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
const ListProduct = require("../models/ListProduct");

const router = require("express").Router();

//GET PRODUCT
router.get("/", async (req, res) => {
  try {
    if (!req.query.search) {
      return;
    }

    // const search = await Product.aggregate([
    //   {
    //     $search: {
    //       index: "custom1",
    //       text: {
    //         query: req.query.search,
    //         path: {
    //           wildcard: "*",
    //         },
    //         // path: "title",
    //         // query: "SHORT",
    //         // path: "categories",
    //       },
    //     },
    //   },

    //   { $limit: 5 },
    // ]);

    const search = await Product.aggregate([
      {
        $search: {
          index: "custom2",
          autocomplete: {
            path: "title",
            query: `${req.query.search}`,
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },
      {
        $limit: 5,
      },
      // {
        //   $project: {
          //     "_id": 0,
          //     "title": 1
          //   }
          // }
        ]);
        
        // const product = await Product.find({
          //   title: { $regex: `${req.query.search}` },
          // });
          // console.log(product);
          
    // const product = await Product.find({
    //   // title: { $regex: /WHITE/, $options: "m" },
    //   title: { $regex: /req.query.search/, $options: "m" },
    // });
    
    // console.log(product);
    res.status(200).json(search);
    // res.status(200).json(product);
    // res.status(200).json("co");
  } catch (err) {
    res.status(500).json(err);
  }
});
// path: "categories",
// path: {
//   wildcard: "*",
// },

//GET ALL CATE
router.get("/find/", async (req, res) => {
  let page = req.query.page;
  page = parseInt(page);
  if (page < 1) {
    page = 1;
  }
  let quanti = (page - 1) * PAGE_SIZE;

  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      })
        .skip(quanti)
        .limit(PAGE_SIZE);
    } else {
      products = await Product.find();
    }

    const total = await Product.find({
      categories: {
        $in: [qCategory],
      },
    });

    const totalProduct = total.length;

    const pagi = {
      page: page,
      totalRows: totalProduct,
    };

    const results = {
      resultProducts: products,
      pagi: pagi,
    };

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

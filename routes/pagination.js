const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken.js");

const router = require("express").Router();

const PAGE_SIZE = 12;

//GET PRODUCTS FROM PAGINATION
router.get("/", async (req, res) => {
  try {
    let page = req.query.page;
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }

    let quanti = (page - 1) * PAGE_SIZE;

    const resultProducts = await Product.find({})
      // .sort({ createdAt: -1 })
      .skip(quanti)
      .limit(PAGE_SIZE);

    const total = await Product.find({});

    const totalProduct = total.length;

    const pagi = {
      page: page,
      totalRows: totalProduct,
    };

    const results = {
      resultProducts: resultProducts,
      pagi: pagi,
    };

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

const router = require("express").Router();
const User = require("../models/User");
const Token = require("../models/Token");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verifyTokenAndAuthorization, verifyToken } = require("./verifyToken");
const Cart = require("../models/Cart");
const Quantity = require("../models/Quantity");
const Price = require("../models/Price");
const Size = require("../models/Size");

let refreshTokens = [];

// Dùng phương thức token authentication

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const quantityCart = new Quantity();
    const sizeCart = new Size();
    const priceCart = new Price();

    const userCart = new Cart({
      name: req.body.username,
      quantity_id: quantityCart._id,
      price_id: priceCart._id,
      size_id: sizeCart._id,
    });

    // console.log(userCart);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      cart_id: userCart._id,
    });

    const savepriceCart = await priceCart.save();
    const savesizeCart = await sizeCart.save();
    const savequantityCart = await quantityCart.save();
    const savedUserCart = await userCart.save();
    console.log(savedUserCart);

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GENERATE ACCESS TOKEN
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SEC,
    {
      expiresIn: "365d",
    }
  );
};

// GENERATE REFRESH TOKEN
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.RF_JWT_SEC,
    { expiresIn: "365d" }
  );
};

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json("User not found!");

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.status(400).json("Wrong password or username!");

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
      withCredentials: true,
    });

    const { img, password, isAdmin, ...otherDetails } = user._doc;
    res.status(200).json({ ...otherDetails, isAdmin, img, token });
  } catch (err) {
    res.status(500).json(err);
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  // Lay token tu user
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken))
    return res.status(401).json("Refresh token is not valid");
  jwt.verify(refreshToken, process.env.RF_JWT_SEC, (err, user) => {
    if (err) {
      res.status(500).json(err);
    }

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    // Tao new accessToken va refreshToken
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.push(newRefreshToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    res.status(200).json({ token: newAccessToken });
  });
});

// LOG OUT

// router.post("/logout", verifyTokenAndAuthorization, async (req, res) => {
// router.post("/logout/:id", verifyTokenAndAuthorization, async (req, res) => {
router.post("/logout", verifyToken, async (req, res) => {
  res.clearCookie("refreshToken");
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.cookies.refreshToken
  );
  res.status(200).json("Logged Out");
});

// router.post("/logout/:id", verifyTokenAndAuthorization, async (req, res) => {

//   res.clearCookie("refreshToken");
//   refreshTokens = refreshTokens.filter(
//     (token) => token !== req.cookies.refreshToken
//   );
//   res.status(200).json("Logged Out");
// });

router.get("/gettestuser", async (req, res) => {
  try {
    const save = await NguoiDung.find().populate("giohang_id");

    res.status(201).json(save);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

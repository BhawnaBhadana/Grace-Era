const express = require("express");
const { getProducts } = require("../controllers/productcontrollers");
const router = express.Router();

router.get("/", getProducts);

module.exports = router;

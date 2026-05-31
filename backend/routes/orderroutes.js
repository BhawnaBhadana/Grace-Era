const express = require("express");
const { createOrder } = require("../controllers/ordercontrollers");
const router = express.Router();

router.post("/", createOrder);

module.exports = router;

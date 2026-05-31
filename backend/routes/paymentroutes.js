const express = require("express");
const { createPaymentOrder, verifyPaymentAndCreateOrder } = require("../controllers/paymentcontrollers");
const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPaymentAndCreateOrder);

module.exports = router;

const express = require("express");
const { getCart, upsertCartItem, removeCartItem } = require("../controllers/cartcontrollers");
const router = express.Router();

router.get("/", getCart);
router.post("/", upsertCartItem);
router.delete("/:id", removeCartItem);

module.exports = router;

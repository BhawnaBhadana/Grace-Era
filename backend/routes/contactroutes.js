const express = require('express');
const router = express.Router();
const Contact = require('../models/contacts');

// Save message
router.post('/', async (req, res) => {
  const message = new Contact(req.body);
  await message.save();
  res.json({ message: "Message sent successfully ✅" });
});

module.exports = router;
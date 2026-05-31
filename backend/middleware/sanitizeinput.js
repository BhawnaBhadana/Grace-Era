const validator = require("validator");

const sanitizeInput = (req, _res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === "string") {
        obj[key] = validator.escape(validator.trim(value));
      } else if (Array.isArray(value)) {
        value.forEach((item) => sanitizeObject(item));
      } else if (typeof value === "object" && value !== null) {
        sanitizeObject(value);
      }
    });
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};

module.exports = sanitizeInput;

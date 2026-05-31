require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const sanitizeInput = require("./middleware/sanitizeinput");
const { notFound, errorHandler } = require("./middleware/errormiddleware");
const { seedProductsIfEmpty } = require("./services/seedservice");

const productRoutes = require("./routes/productroutes");
const cartRoutes = require("./routes/cartroutes");
const orderRoutes = require("./routes/orderroutes");
const paymentRoutes = require("./routes/paymentroutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(sanitizeInput);
app.use(morgan("dev"));

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
  try {
    await connectDB();
    await seedProductsIfEmpty();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

start();
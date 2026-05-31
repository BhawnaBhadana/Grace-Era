const Product = require("../models/product");

const seedProductsIfEmpty = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany([
    {
      name: "Classic Denim Jacket",
      price: 2499,
      image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80",
      description: "Soft washed denim jacket for all seasons.",
      category: "Fashion",
      stock: 50
    },
    {
      name: "Running Sneakers",
      price: 3299,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      description: "Breathable and lightweight sports sneakers.",
      category: "Footwear",
      stock: 70
    },
    {
      name: "Wireless Headphones",
      price: 4999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      description: "Noise cancellation with 30-hour battery life.",
      category: "Electronics",
      stock: 40
    },
    {
      name: "Smart Watch Pro",
      price: 6999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      description: "Track health, workouts, and notifications.",
      category: "Electronics",
      stock: 35
    },
    {
      name: "Minimalist Backpack",
      price: 2199,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      description: "Water-resistant backpack with laptop sleeve.",
      category: "Accessories",
      stock: 80
    },
    {
      name: "Organic Cotton T-Shirt",
      price: 999,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      description: "Premium cotton t-shirt, regular fit.",
      category: "Fashion",
      stock: 120
    }
  ]);
};

module.exports = { seedProductsIfEmpty }
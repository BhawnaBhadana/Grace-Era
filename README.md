<div align="center">

# 🌸 Grace Era
### Western Fashion E-Commerce Store

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-grace--era.vercel.app-black?style=for-the-badge)](https://grace-era.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️_Backend-grace--era--1.onrender.com-purple?style=for-the-badge)](https://grace-era-1.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-BhawnaBhadana-181717?style=for-the-badge&logo=github)](https://github.com/BhawnaBhadana/Grace-Era)

*Dress with intention. Live with grace.*

</div>

---

## ✨ Features

- 🛍️ **Product Catalogue** — 30+ curated western fashion products with category filters
- 🛒 **Smart Cart** — Real-time cart sync with MongoDB, quantity controls, live total
- 💳 **Razorpay Payments** — Secure online payments with signature verification
- 🏠 **Cash on Delivery** — COD option available
- 📧 **Order Confirmation Emails** — Auto email on successful payment
- 🔐 **Admin Panel** — Dashboard with revenue charts, product & order management
- 📱 **Fully Responsive** — Works on mobile and desktop

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Hosting | Vercel (Frontend) + Render (Backend) |
| Media | Cloudinary + Multer |

---

## 🚀 Live Demo

| | URL |
|--|--|
| 🌐 Frontend | [grace-era.vercel.app](https://grace-era.vercel.app) |
| ⚙️ Backend API | [grace-era-1.onrender.com/api/health](https://grace-era-1.onrender.com/api/health) |

> ⚠️ Backend is on Render free tier — first request may take **30-50 seconds** to wake up.

---

## 🔑 Demo Credentials

### Admin Panel
| Field | Value |
|-------|-------|
| Email | `admin@graceera.com` |
| Password | `admin123` |

### Test Payment (Razorpay)
| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## 📁 Project Structure

```
Grace Era/
├── backend/
│   ├── config/          # DB, Cloudinary, Multer
│   ├── controllers/     # Cart, Order, Payment, Product
│   ├── middleware/      # Auth, Error handling, Sanitization
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Email, Seed service
│   └── server.js        # Entry point
└── frontend/
    └── index.html       # Full SPA frontend
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/BhawnaBhadana/Grace-Era.git
cd Grace-Era
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Create `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
FRONTEND_ORIGIN=http://127.0.0.1:5501

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Grace Era <no-reply@graceera.com>
```

### 4. Start backend
```bash
npm start
```

### 5. Open frontend
Open `frontend/index.html` with **Live Server** in VS Code.

---

## 🌐 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart?userId=` | Get user cart |
| POST | `/api/cart` | Add/update cart item |
| DELETE | `/api/cart/:id` | Remove cart item |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify & complete order |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/order/:userId` | Get user orders |

---

## 🔒 Security

- **Helmet.js** — Secure HTTP headers
- **express-mongo-sanitize** — NoSQL injection prevention
- **validator.js** — Input validation
- **CORS** — Restricted to allowed origins
- **Razorpay HMAC-SHA256** — Payment signature verification

---

## 📄 License

MIT License — feel free to use for learning and portfolio purposes.

---

<div align="center">

Made with ❤️ by **Bhawna Bhadana**

</div>
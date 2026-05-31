const API_BASE = "http://localhost:5000/api";
const STORAGE_KEYS = {
  userId: "ge_user_id",
  cart: "ge_cart",
  wishlist: "ge_wishlist"
};

const state = {
  userId: "",
  products: [],
  filteredProducts: [],
  cart: { items: [], total: 0 },
  wishlist: new Set()
};

const els = {};

const makeUserId = () => `user_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

const getOrCreateUserId = () => {
  const existing = localStorage.getItem(STORAGE_KEYS.userId);
  if (existing) return existing;

  const created = makeUserId();
  localStorage.setItem(STORAGE_KEYS.userId, created);
  return created;
};

const persistLocalCart = () => {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
};

const loadLocalCart = () => {
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "null");
    if (local && Array.isArray(local.items) && typeof local.total === "number") {
      state.cart = local;
    }
  } catch (_error) {
    state.cart = { items: [], total: 0 };
  }
};

const persistWishlist = () => {
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify([...state.wishlist]));
};

const loadWishlist = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist) || "[]");
    state.wishlist = new Set(Array.isArray(saved) ? saved : []);
  } catch (_error) {
    state.wishlist = new Set();
  }
};

const setLoading = (isLoading) => {
  if (!els.globalLoader) return;
  els.globalLoader.classList.toggle("hidden", !isLoading);
  els.globalLoader.classList.toggle("flex", isLoading);
};

const showFeedback = (message, type = "info") => {
  if (!els.feedbackBar) return;

  const styles = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-emerald-100 text-emerald-800",
    error: "bg-rose-100 text-rose-800"
  };

  els.feedbackBar.className = `rounded-lg px-4 py-3 mb-4 text-sm ${styles[type] || styles.info}`;
  els.feedbackBar.textContent = message;
  els.feedbackBar.classList.remove("hidden");
};

const showToast = (message, type = "info") => {
  if (!els.toastContainer) return;

  const styles = {
    info: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white"
  };

  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded-lg shadow-lg text-sm ${styles[type] || styles.info}`;
  toast.textContent = message;

  els.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2600);
};

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({ success: false, message: "Invalid JSON response" }));

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const updateBadges = () => {
  const cartCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  if (els.cartCount) els.cartCount.textContent = String(cartCount);
  if (els.wishlistCount) els.wishlistCount.textContent = String(state.wishlist.size);
};

const renderProducts = () => {
  if (!els.productGrid || !els.emptyState) return;

  if (state.filteredProducts.length === 0) {
    els.productGrid.innerHTML = "";
    els.emptyState.classList.remove("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");

  els.productGrid.innerHTML = state.filteredProducts
    .map((product) => {
      const wished = state.wishlist.has(product._id);
      return `
        <article class="bg-white rounded-2xl overflow-hidden shadow-panel flex flex-col">
          <img src="${product.image}" alt="${product.name}" class="h-52 w-full object-cover" />
          <div class="p-4 flex flex-col gap-3 grow">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-semibold text-lg">${product.name}</h3>
              <button data-wishlist="${product._id}" class="text-sm px-2 py-1 rounded ${wished ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}">
                ${wished ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
            <p class="text-slate-600 text-sm line-clamp-2">${product.description || "No description available."}</p>
            <p class="font-bold text-brand-700">INR ${product.price}</p>
            <div class="mt-auto flex gap-2">
              <button data-view="${product._id}" class="flex-1 rounded-lg border border-slate-300 py-2 text-sm hover:bg-slate-50">Details</button>
              <button data-add="${product._id}" class="flex-1 rounded-lg bg-brand-500 text-white py-2 text-sm hover:bg-brand-700">Add to Cart</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderCategories = () => {
  if (!els.categoryFilter) return;

  const categories = [...new Set(state.products.map((p) => p.category).filter(Boolean))].sort();
  els.categoryFilter.innerHTML = `<option value="">All Categories</option>${categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("")}`;
};

const applyFilters = () => {
  const search = (els.searchInput?.value || "").toLowerCase().trim();
  const category = els.categoryFilter?.value || "";
  const minPrice = Number(els.minPrice?.value || 0);
  const maxPrice = Number(els.maxPrice?.value || 0);

  state.filteredProducts = state.products.filter((product) => {
    const matchesSearch = !search || product.name.toLowerCase().includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesMin = !minPrice || product.price >= minPrice;
    const matchesMax = !maxPrice || product.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  renderProducts();
};

const renderCart = () => {
  if (!els.cartItems || !els.cartTotal || !els.cartEmptyState) return;

  if (!state.cart.items.length) {
    els.cartItems.innerHTML = "";
    els.cartEmptyState.classList.remove("hidden");
  } else {
    els.cartEmptyState.classList.add("hidden");
    els.cartItems.innerHTML = state.cart.items
      .map(
        (item) => `
          <div class="flex items-center gap-3 rounded-lg border p-3">
            <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded" />
            <div class="grow">
              <p class="font-medium">${item.name}</p>
              <p class="text-sm text-slate-600">INR ${item.unitPrice} x ${item.quantity}</p>
            </div>
            <input data-qty="${item.product}" type="number" min="1" max="20" value="${item.quantity}" class="w-16 border rounded px-2 py-1" />
            <button data-remove="${item.product}" class="text-rose-600 hover:text-rose-800">Remove</button>
          </div>
        `
      )
      .join("");
  }

  els.cartTotal.textContent = String(state.cart.total.toFixed(2));
  updateBadges();
};

const openCartModal = () => {
  if (!els.cartModal) return;
  renderCart();
  els.cartModal.classList.remove("hidden");
};

const closeCartModal = () => {
  if (!els.cartModal) return;
  els.cartModal.classList.add("hidden");
};

const openProductModal = (product) => {
  if (!els.productModal || !els.productModalContent || !product) return;

  els.productModalContent.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="w-full h-72 object-cover rounded-xl mb-4" />
    <h3 class="text-2xl font-bold mb-2">${product.name}</h3>
    <p class="text-slate-600 mb-4">${product.description || "No description available."}</p>
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold text-brand-700">INR ${product.price}</p>
      <button data-add-modal="${product._id}" class="rounded-lg bg-brand-500 hover:bg-brand-700 text-white px-4 py-2">Add to Cart</button>
    </div>
  `;

  els.productModal.classList.remove("hidden");
};

const closeProductModal = () => {
  if (!els.productModal) return;
  els.productModal.classList.add("hidden");
};

const recomputeLocalCartTotal = () => {
  state.cart.total = state.cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

const syncCartFromBackend = async () => {
  try {
    for (const item of state.cart.items) {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({
          userId: state.userId,
          productId: item.product,
          quantity: item.quantity
        })
      });
    }

    const payload = await apiFetch(`/cart?userId=${encodeURIComponent(state.userId)}`);
    state.cart = payload.data;
    persistLocalCart();
    renderCart();
  } catch (error) {
    showToast(error.message, "error");
    showFeedback("Unable to sync cart with server. Working from local data.", "error");
  }
};

const upsertCartItem = async (productId, quantity) => {
  const payload = await apiFetch("/cart", {
    method: "POST",
    body: JSON.stringify({ userId: state.userId, productId, quantity })
  });

  state.cart = payload.data;
  persistLocalCart();
  renderCart();
};

const removeCartItem = async (productId) => {
  const payload = await apiFetch(`/cart/${productId}?userId=${encodeURIComponent(state.userId)}`, {
    method: "DELETE"
  });

  state.cart = payload.data;
  persistLocalCart();
  renderCart();
};

const addToCart = async (productId) => {
  const product = state.products.find((item) => item._id === productId);
  if (!product) return;

  const existing = state.cart.items.find((item) => item.product === productId);
  const quantity = existing ? Math.min(existing.quantity + 1, 20) : 1;

  try {
    await upsertCartItem(productId, quantity);
    showToast("Added to cart", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
};

const toggleWishlist = (productId) => {
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    showToast("Removed from wishlist", "info");
  } else {
    state.wishlist.add(productId);
    showToast("Added to wishlist", "success");
  }

  persistWishlist();
  updateBadges();
  renderProducts();
};

const startRazorpayCheckout = async () => {
  const email = (els.checkoutEmail?.value || "").trim();

  if (!email) {
    showToast("Please enter email", "error");
    return;
  }

  if (!state.cart.items.length) {
    showToast("Cart is empty", "error");
    return;
  }

  setLoading(true);
  try {
    const orderPayload = await apiFetch("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ userId: state.userId })
    });

    const { paymentOrder, razorpayKeyId } = orderPayload.data;

    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "Grace Era",
      description: "Checkout",
      order_id: paymentOrder.id,
      handler: async (response) => {
        try {
          await apiFetch("/payment/verify", {
            method: "POST",
            body: JSON.stringify({
              userId: state.userId,
              email,
              ...response
            })
          });

          state.cart = { items: [], total: 0 };
          persistLocalCart();
          renderCart();
          closeCartModal();
          showToast("Payment successful and order confirmed", "success");
          showFeedback("Order placed successfully. Confirmation email sent.", "success");
        } catch (error) {
          showToast(error.message, "error");
        }
      },
      prefill: { email },
      theme: { color: "#118a7e" }
    });

    rzp.open();
  } catch (error) {
    showToast(error.message, "error");
    showFeedback("Checkout failed. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};

const placeCODOrder = async () => {
  const email = (els.checkoutEmail?.value || "").trim();

  if (!email) {
    showToast("Please enter email", "error");
    return;
  }

  if (!state.cart.items.length) {
    showToast("Cart is empty", "error");
    return;
  }

  setLoading(true);
  try {
    await apiFetch("/order", {
      method: "POST",
      body: JSON.stringify({
        userId: state.userId,
        email,
        paymentMethod: "cod"
      })
    });

    state.cart = { items: [], total: 0 };
    persistLocalCart();
    renderCart();
    closeCartModal();
    showToast("COD order placed", "success");
    showFeedback("Order created successfully. Confirmation email sent.", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
};

const loadProducts = async () => {
  setLoading(true);
  try {
    const payload = await apiFetch("/products");
    state.products = payload.data;
    state.filteredProducts = [...state.products];
    renderCategories();
    renderProducts();
    showFeedback("Products loaded successfully.", "success");
  } catch (error) {
    showFeedback(error.message, "error");
  } finally {
    setLoading(false);
  }
};

const bindEvents = () => {
  els.cartBtn?.addEventListener("click", openCartModal);
  els.wishlistBtn?.addEventListener("click", () => {
    const wishlistProducts = state.products.filter((product) => state.wishlist.has(product._id));
    state.filteredProducts = wishlistProducts;
    renderProducts();
    showToast("Showing wishlisted products", "info");
  });

  els.searchInput?.addEventListener("input", applyFilters);
  els.categoryFilter?.addEventListener("change", applyFilters);
  els.minPrice?.addEventListener("input", applyFilters);
  els.maxPrice?.addEventListener("input", applyFilters);

  els.checkoutBtn?.addEventListener("click", startRazorpayCheckout);
  els.codBtn?.addEventListener("click", placeCODOrder);

  document.querySelectorAll("[data-close-cart]").forEach((btn) => {
    btn.addEventListener("click", closeCartModal);
  });

  document.querySelectorAll("[data-close-product]").forEach((btn) => {
    btn.addEventListener("click", closeProductModal);
  });

  els.cartModal?.addEventListener("click", (event) => {
    if (event.target === els.cartModal) closeCartModal();
  });

  els.productModal?.addEventListener("click", (event) => {
    if (event.target === els.productModal) closeProductModal();
  });

  document.body.addEventListener("click", (event) => {
    const addId = event.target.getAttribute("data-add") || event.target.getAttribute("data-add-modal");
    const removeId = event.target.getAttribute("data-remove");
    const viewId = event.target.getAttribute("data-view");
    const wishId = event.target.getAttribute("data-wishlist");

    if (addId) addToCart(addId);
    if (removeId) {
      removeCartItem(removeId).catch((error) => showToast(error.message, "error"));
    }
    if (wishId) toggleWishlist(wishId);
    if (viewId) {
      const product = state.products.find((item) => item._id === viewId);
      openProductModal(product);
    }
  });

  els.cartItems?.addEventListener("change", (event) => {
    const productId = event.target.getAttribute("data-qty");
    if (!productId) return;

    const nextQty = Number(event.target.value || 1);
    const safeQty = Number.isInteger(nextQty) ? Math.min(Math.max(nextQty, 1), 20) : 1;

    upsertCartItem(productId, safeQty).catch((error) => showToast(error.message, "error"));
  });
};

const cacheElements = () => {
  els.globalLoader = document.getElementById("globalLoader");
  els.feedbackBar = document.getElementById("feedbackBar");
  els.productGrid = document.getElementById("productGrid");
  els.emptyState = document.getElementById("emptyState");
  els.searchInput = document.getElementById("searchInput");
  els.categoryFilter = document.getElementById("categoryFilter");
  els.minPrice = document.getElementById("minPrice");
  els.maxPrice = document.getElementById("maxPrice");
  els.cartBtn = document.getElementById("cartBtn");
  els.wishlistBtn = document.getElementById("wishlistBtn");
  els.cartCount = document.getElementById("cartCount");
  els.wishlistCount = document.getElementById("wishlistCount");
  els.cartModal = document.getElementById("cartModal");
  els.productModal = document.getElementById("productModal");
  els.productModalContent = document.getElementById("productModalContent");
  els.cartItems = document.getElementById("cartItems");
  els.cartTotal = document.getElementById("cartTotal");
  els.cartEmptyState = document.getElementById("cartEmptyState");
  els.checkoutBtn = document.getElementById("checkoutBtn");
  els.codBtn = document.getElementById("codBtn");
  els.checkoutEmail = document.getElementById("checkoutEmail");
  els.toastContainer = document.getElementById("toastContainer");
};

const init = async () => {
  cacheElements();
  state.userId = getOrCreateUserId();

  loadLocalCart();
  recomputeLocalCartTotal();
  loadWishlist();

  updateBadges();
  renderCart();
  bindEvents();

  await loadProducts();
  await syncCartFromBackend();
};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    showFeedback(error.message || "Initialization failed", "error");
  });
});
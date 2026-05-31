<script src="script.js" defer></script>
const cart = [];
const cartCountElem = document.getElementById('cart-count');
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElem = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');
const backToTopBtn = document.getElementById('backToTop');
const searchBar = document.getElementById('search-bar');
const priceFilter = document.getElementById('price-filter');

// ===================== 🛍️ CART =====================
function updateCartCount() {
  cartCountElem.textContent = cart.length;
  cartCountElem.style.display = cart.length === 0 ? 'none' : 'inline-block';
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.forEach(item => cart.push(item));
    updateCartCount();
  }
}

function renderCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-gray-600 text-center">Your cart is empty.</p>';
    cartTotalElem.textContent = '$0';
    return;
  }

  cart.forEach((item, index) => {
    total += item.price;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'flex justify-between items-center border-b pb-2';
    itemDiv.innerHTML = `
      <div>
        <p class="font-semibold text-pink-700">${item.name}</p>
        <p class="text-pink-600">$${item.price}</p>
      </div>
      <button class="text-red-500 hover:text-red-700 font-bold" data-index="${index}">&times;</button>
    `;

    itemDiv.querySelector('button').addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart();
      updateCartCount();
      renderCart();
    });

    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotalElem.textContent = '$' + total;
}

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    cart.push({ name, price });
    saveCart();
    updateCartCount();
    alert(`${name} added to cart!`);
  });
});

cartButton?.addEventListener('click', () => {
  renderCart();
  cartModal.classList.remove('hidden');
  cartModal.classList.add('flex');
});

closeCartBtn?.addEventListener('click', () => {
  cartModal.classList.add('hidden');
  cartModal.classList.remove('flex');
});

checkoutBtn?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  alert(`Thank you for your purchase of ${cart.length} item(s) totaling ${cartTotalElem.textContent}!`);
  cart.length = 0;
  localStorage.removeItem('cart');
  updateCartCount();
  renderCart();
  cartModal.classList.add('hidden');
  cartModal.classList.remove('flex');
});

// ===================== 🔍 SEARCH & FILTER =====================
searchBar?.addEventListener('input', function (e) {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('#gallery .flex').forEach(card => {
    const name = card.querySelector('h3')?.textContent.toLowerCase();
    card.style.display = name.includes(query) ? 'flex' : 'none';
  });
});

priceFilter?.addEventListener('change', function () {
  const max = parseInt(this.value);
  document.querySelectorAll('#gallery .flex').forEach(card => {
    const priceText = card.querySelector('p.font-bold')?.textContent.replace('$', '');
    const price = parseFloat(priceText);
    card.style.display = !max || price <= max ? 'flex' : 'none';
  });
});

// ===================== 🔍 IMAGE ZOOM =====================
window.zoomImage = function (button) {
  const imageSrc = button.closest('.flex').querySelector('img')?.src;
  document.getElementById('zoomed-image').src = imageSrc;
  document.getElementById('zoom-modal').classList.remove('hidden');
  document.getElementById('zoom-modal').classList.add('flex');
};

window.closeZoom = function () {
  document.getElementById('zoom-modal').classList.add('hidden');
  document.getElementById('zoom-modal').classList.remove('flex');
};

// ===================== ❤️ WISHLIST =====================
window.addToWishlist = function (button) {
  button.classList.toggle('text-red-500');
  alert('Item added to wishlist!');
};

// ===================== 🔝 BACK TO TOP =====================
window.addEventListener('scroll', () => {
  backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// ===================== INIT =====================
window.addEventListener('load', () => {
  loadCart();
});
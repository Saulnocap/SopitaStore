const products = [
  {
    id: 1,
    name: "Labial satinado",
    description: "Color duradero con acabado suave.",
    price: 9800,
    emoji: "💄",
  },
  {
    id: 2,
    name: "Suero hidratante",
    description: "Ácido hialurónico para un brillo natural.",
    price: 18900,
    emoji: "💧",
  },
  {
    id: 3,
    name: "Polera oversize",
    description: "Algodón suave con caída moderna.",
    price: 15900,
    emoji: "👕",
  },
  {
    id: 4,
    name: "Vestido midi",
    description: "Tela fluida, ideal para ocasiones especiales.",
    price: 26900,
    emoji: "👗",
  },
];

const cart = new Map();

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const clearCartButton = document.getElementById("clearCart");
const checkoutForm = document.getElementById("checkoutForm");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");
const backToTop = document.getElementById("backToTop");
const navbar = document.querySelector(".navbar");
const navbarContent = document.querySelector(".navbar__content");
const navbarLogo = document.querySelector(".navbar__logo");
const navbarActions = document.querySelector(".navbar__actions");
const cartDropdown = document.getElementById("cartDropdown");
const cartDropdownItems = document.getElementById("cartDropdownItems");
const cartDropdownTotal = document.getElementById("cartDropdownTotal");
const cartButton = document.querySelector(".navbar__cart");
const cartDropdownClose = document.querySelector(".cart-dropdown__close");
const root = document.documentElement;
let dropdownCloseTimeout;
let carouselIndex = 0;
let carouselInterval;
const themeStorageKey = "sopita-theme";
const cardNumberInput = document.getElementById("cardNumber");
const expiryInput = document.getElementById("expiry");
const phoneInput = document.getElementById("phone");
const countryCodeInput = document.getElementById("countryCode");
const countrySelect = document.getElementById("countrySelect");
const countryTrigger = document.getElementById("countryTrigger");
const countryMenu = document.getElementById("countryMenu");
const continueToPayment = document.getElementById("continueToPayment");
const emptyCartModal = document.getElementById("emptyCartModal");

const storedTheme = localStorage.getItem(themeStorageKey);
root.dataset.theme = storedTheme || root.dataset.theme || "light";

const CART_STORAGE_KEY = "sopita-cart";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const entries = JSON.parse(raw);
    if (Array.isArray(entries)) {
      cart.clear();
      entries.forEach(([id, qty]) => {
        if (typeof id === "number" && typeof qty === "number") {
          cart.set(id, qty);
        }
      });
    }
  } catch (error) {
    console.warn("No se pudo cargar el carrito.", error);
  }
};

const saveCart = () => {
  const entries = Array.from(cart.entries());
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
};

const backgrounds = [
  "assets/bg1.jpg",
  "assets/bg2.jpg",
  "assets/bg3.jpg",
  "assets/bg4.jpg",
  "assets/bg5.jpg",
];
let backgroundIndex = 0;

const carouselTrack = document.getElementById("carouselTrack");
const carouselTabs = document.getElementById("carouselTabs");

const formatPrice = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("toast--visible");
  setTimeout(() => toast.classList.remove("toast--visible"), 2400);
};

const setBackgroundImage = () => {
  root.style.setProperty(
    "--page-bg-image",
    `url("${backgrounds[backgroundIndex]}")`,
  );
  backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
};

const toggleTheme = () => {
  const isDark = root.dataset.theme === "dark";
  root.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem(themeStorageKey, root.dataset.theme);
};

const renderProducts = () => {
  if (!productGrid) {
    return;
  }
  productGrid.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-card__image">${product.emoji}</div>
      <div>
        <h3>${product.name}</h3>
        <p class="muted">${product.description}</p>
      </div>
      <div class="product-card__meta">
        <span class="price">${formatPrice(product.price)}</span>
        <button class="button button--primary" data-id="${product.id}">Agregar</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
};

const updateCart = () => {
  if (cartItems) {
    cartItems.innerHTML = "";
  }
  if (cartDropdownItems) {
    cartDropdownItems.innerHTML = "";
  }
  if (cart.size === 0) {
    if (cartItems) {
      cartItems.innerHTML = '<p class="empty-state">Tu carrito está vacío.</p>';
    }
    if (cartDropdownItems) {
      cartDropdownItems.innerHTML = '<p class="empty-state">Sin productos.</p>';
    }
    if (cartTotal) {
      cartTotal.textContent = formatPrice(0);
    }
    if (cartDropdownTotal) {
      cartDropdownTotal.textContent = formatPrice(0);
    }
    saveCart();
    return;
  }

  let total = 0;
  cart.forEach((quantity, productId) => {
    const product = products.find((item) => item.id === productId);
    const itemTotal = product.price * quantity;
    total += itemTotal;

    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p class="muted">${quantity} x ${formatPrice(product.price)}</p>
      </div>
      <span>${formatPrice(itemTotal)}</span>
      <button class="cart-item__remove" aria-label="Quitar ${product.name}" data-id="${product.id}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
        </svg>
      </button>
    `;
    if (cartItems) {
      cartItems.appendChild(item);
    }

    const dropdownItem = document.createElement("div");
    dropdownItem.className = "cart-dropdown__item";
    dropdownItem.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p class="muted">${quantity} x ${formatPrice(product.price)}</p>
      </div>
      <button aria-label="Quitar ${product.name}" data-id="${product.id}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
        </svg>
      </button>
    `;
    if (cartDropdownItems) {
      cartDropdownItems.appendChild(dropdownItem);
    }
  });

  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }
  if (cartDropdownTotal) {
    cartDropdownTotal.textContent = formatPrice(total);
  }
  saveCart();
};

const buildCarousel = () => {
  if (!carouselTrack || !carouselTabs) {
    return;
  }
  carouselTrack.innerHTML = "";
  carouselTabs.innerHTML = "";

  products.forEach((product, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel__slide";
    slide.innerHTML = `
      <div class="carousel__image">${product.emoji}</div>
      <div class="carousel__details">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <strong class="price">${formatPrice(product.price)}</strong>
      </div>
    `;
    carouselTrack.appendChild(slide);

    const tab = document.createElement("button");
    tab.className = "carousel__tab";
    tab.type = "button";
    tab.setAttribute("aria-label", `Ver ${product.name}`);
    tab.addEventListener("click", () => {
      carouselIndex = index;
      updateCarousel();
      resetCarouselInterval();
    });
    carouselTabs.appendChild(tab);
  });
};

const updateCarousel = () => {
  if (!carouselTrack || !carouselTabs) {
    return;
  }
  const tabs = Array.from(carouselTabs.children);
  carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
  tabs.forEach((tab, index) => {
    tab.classList.toggle("carousel__tab--active", index === carouselIndex);
  });
};

const resetCarouselInterval = () => {
  clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % products.length;
    updateCarousel();
  }, 5000);
};

if (productGrid) {
  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) {
      return;
    }

    const productId = Number(button.dataset.id);
    const current = cart.get(productId) || 0;
    cart.set(productId, current + 1);
    updateCart();
    showToast("Producto agregado al carrito.");
  });
}

if (cartItems) {
  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) {
      return;
    }

    const productId = Number(button.dataset.id);
    const current = cart.get(productId);
    if (!current) {
      return;
    }

    if (current === 1) {
      cart.delete(productId);
    } else {
      cart.set(productId, current - 1);
    }
    updateCart();
  });
}

if (cartDropdownItems) {
  cartDropdownItems.addEventListener("click", (event) => {
    event.stopPropagation();
    const button = event.target.closest("button[data-id]");
    if (!button) {
      return;
    }

    const productId = Number(button.dataset.id);
    const current = cart.get(productId);
    if (!current) {
      return;
    }

    if (current === 1) {
      cart.delete(productId);
    } else {
      cart.set(productId, current - 1);
    }
    updateCart();
  });
}

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    cart.clear();
    updateCart();
    showToast("Carrito vacío.");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    toggleTheme();
  });
}

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const applyPhonePlaceholder = (pattern) => {
  if (!phoneInput) {
    return;
  }
  if (pattern) {
    phoneInput.placeholder = pattern;
  }
};

const stripDialCode = (digits, code) => {
  const codeDigits = (code || "").replace(/\D/g, "");
  if (!codeDigits) {
    return digits;
  }
  if (digits.startsWith(codeDigits)) {
    return digits.slice(codeDigits.length);
  }
  return digits;
};

const formatPhone = (value, pattern, code) => {
  const rawDigits = value.replace(/\D/g, "");
  const digits = stripDialCode(rawDigits, code);
  if (!pattern) {
    return digits;
  }
  let result = "";
  let digitIndex = 0;
  for (const char of pattern) {
    if (char === "#") {
      if (digitIndex >= digits.length) {
        break;
      }
      result += digits[digitIndex];
      digitIndex += 1;
    } else {
      result += char;
    }
  }
  return result.trim();
};

if (cardNumberInput) {
  cardNumberInput.addEventListener("input", (event) => {
    const target = event.target;
    const formatted = formatCardNumber(target.value);
    target.value = formatted;
  });
}

if (expiryInput) {
  expiryInput.addEventListener("input", (event) => {
    const target = event.target;
    target.value = formatExpiry(target.value);
  });
}

const countries = [
  { code: "+56", name: "Chile", flag: "🇨🇱", pattern: "9 #### ####" },
  { code: "+57", name: "Colombia", flag: "🇨🇴", pattern: "### ### ####" },
  { code: "+51", name: "Perú", flag: "🇵🇪", pattern: "### ### ###" },
  { code: "+52", name: "México", flag: "🇲🇽", pattern: "### ### ####" },
  { code: "+34", name: "España", flag: "🇪🇸", pattern: "### ### ###" },
  { code: "+54", name: "Argentina", flag: "🇦🇷", pattern: "## #### ####" },
  { code: "+55", name: "Brasil", flag: "🇧🇷", pattern: "## ##### ####" },
  { code: "+1", name: "Estados Unidos", flag: "🇺🇸", pattern: "### ### ####" },
  { code: "+1", name: "Canadá", flag: "🇨🇦", pattern: "### ### ####" },
  { code: "+44", name: "Reino Unido", flag: "🇬🇧", pattern: "#### ### ####" },
  { code: "+49", name: "Alemania", flag: "🇩🇪", pattern: "### #### ####" },
  { code: "+33", name: "Francia", flag: "🇫🇷", pattern: "## ## ## ## ##" },
  { code: "+39", name: "Italia", flag: "🇮🇹", pattern: "### #### ###" },
  { code: "+351", name: "Portugal", flag: "🇵🇹", pattern: "### ### ###" },
  { code: "+41", name: "Suiza", flag: "🇨🇭", pattern: "## ### ## ##" },
  { code: "+31", name: "Países Bajos", flag: "🇳🇱", pattern: "## ### ####" },
  { code: "+45", name: "Dinamarca", flag: "🇩🇰", pattern: "## ## ## ##" },
  { code: "+46", name: "Suecia", flag: "🇸🇪", pattern: "## ### ## ##" },
  { code: "+47", name: "Noruega", flag: "🇳🇴", pattern: "### ## ###" },
  { code: "+358", name: "Finlandia", flag: "🇫🇮", pattern: "## ### ####" },
  { code: "+353", name: "Irlanda", flag: "🇮🇪", pattern: "## ### ####" },
  { code: "+43", name: "Austria", flag: "🇦🇹", pattern: "### ### ####" },
  { code: "+32", name: "Bélgica", flag: "🇧🇪", pattern: "### ## ## ##" },
  { code: "+48", name: "Polonia", flag: "🇵🇱", pattern: "### ### ###" },
  { code: "+420", name: "Chequia", flag: "🇨🇿", pattern: "### ### ###" },
  { code: "+36", name: "Hungría", flag: "🇭🇺", pattern: "## ### ####" },
  { code: "+52", name: "México", flag: "🇲🇽", pattern: "### ### ####" },
  { code: "+7", name: "Rusia", flag: "🇷🇺", pattern: "### ### ## ##" },
  { code: "+90", name: "Turquía", flag: "🇹🇷", pattern: "### ### ####" },
  { code: "+20", name: "Egipto", flag: "🇪🇬", pattern: "### ### ####" },
  { code: "+27", name: "Sudáfrica", flag: "🇿🇦", pattern: "## ### ####" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬", pattern: "### ### ####" },
  { code: "+212", name: "Marruecos", flag: "🇲🇦", pattern: "### ## ## ##" },
  { code: "+971", name: "EAU", flag: "🇦🇪", pattern: "## ### ####" },
  { code: "+966", name: "Arabia Saudita", flag: "🇸🇦", pattern: "### ### ####" },
  { code: "+972", name: "Israel", flag: "🇮🇱", pattern: "## ### ####" },
  { code: "+91", name: "India", flag: "🇮🇳", pattern: "##### #####" },
  { code: "+86", name: "China", flag: "🇨🇳", pattern: "### #### ####" },
  { code: "+81", name: "Japón", flag: "🇯🇵", pattern: "## #### ####" },
  { code: "+82", name: "Corea del Sur", flag: "🇰🇷", pattern: "## #### ####" },
  { code: "+61", name: "Australia", flag: "🇦🇺", pattern: "#### ### ###" },
  { code: "+64", name: "Nueva Zelanda", flag: "🇳🇿", pattern: "## ### ####" },
  { code: "+63", name: "Filipinas", flag: "🇵🇭", pattern: "### ### ####" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩", pattern: "### ### ####" },
  { code: "+60", name: "Malasia", flag: "🇲🇾", pattern: "## ### ####" },
  { code: "+66", name: "Tailandia", flag: "🇹🇭", pattern: "## ### ####" },
  { code: "+65", name: "Singapur", flag: "🇸🇬", pattern: "#### ####" },
].sort((a, b) => a.name.localeCompare(b.name, "es"));

const countrySearchInput = document.getElementById("countrySearch");

if (countrySelect && countryMenu && countryTrigger && countryCodeInput) {
  const updateSelection = (option) => {
    const code = option.dataset.code;
    const pattern = option.dataset.pattern;
    countryCodeInput.value = code;
    countryTrigger.innerHTML = option.innerHTML;
    countryMenu.classList.remove("is-open");
    applyPhonePlaceholder(pattern);
    if (phoneInput) {
      phoneInput.dataset.pattern = pattern;
      phoneInput.dataset.code = code;
      phoneInput.value = formatPhone(phoneInput.value, pattern, code);
    }
  };

  const renderCountryOptions = (items) => {
    const existingOptions = countryMenu.querySelectorAll(
      ".country-select__option",
    );
    existingOptions.forEach((option) => option.remove());
    items.forEach((country) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "country-select__option";
      option.dataset.code = country.code;
      option.dataset.pattern = country.pattern;
      option.innerHTML = `<span class="flag" aria-hidden="true">${country.flag}</span>${country.name} (${country.code})`;
      option.addEventListener("click", () => updateSelection(option));
      countryMenu.appendChild(option);
    });
  };

  renderCountryOptions(countries);

  const options = () =>
    Array.from(countryMenu.querySelectorAll(".country-select__option"));

  countryTrigger.addEventListener("click", () => {
    countryMenu.classList.toggle("is-open");
  });

  if (countrySearchInput) {
    countrySearchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      const filtered = countries.filter((country) =>
        country.name.toLowerCase().includes(query),
      );
      renderCountryOptions(filtered);
    });
  }

  document.addEventListener("click", (event) => {
    if (countrySelect.contains(event.target)) {
      return;
    }
    countryMenu.classList.remove("is-open");
  });

  const currentOptions = options();
  if (currentOptions[0]) {
    updateSelection(currentOptions[0]);
  }
}

if (phoneInput) {
  phoneInput.addEventListener("input", (event) => {
    const target = event.target;
    const pattern = target.dataset.pattern;
    const code = target.dataset.code || "";
    target.value = formatPhone(target.value, pattern, code);
  });
}

if (continueToPayment) {
  continueToPayment.addEventListener("click", (event) => {
    if (cart.size > 0) {
      return;
    }
    event.preventDefault();
    if (emptyCartModal) {
      emptyCartModal.classList.add("is-open");
      emptyCartModal.setAttribute("aria-hidden", "false");
    }
  });
}

const toggleCartDropdown = (isOpen) => {
  if (!cartDropdown) {
    return;
  }
  cartDropdown.classList.toggle("cart-dropdown--open", isOpen);
  cartDropdown.setAttribute("aria-hidden", String(!isOpen));
};

const scheduleCloseDropdown = () => {
  clearTimeout(dropdownCloseTimeout);
  dropdownCloseTimeout = setTimeout(() => toggleCartDropdown(false), 200);
};

if (cartButton && cartDropdown) {
  cartButton.addEventListener("click", () => {
    toggleCartDropdown(false);
  });
}

if (cartButton) {
  cartButton.addEventListener("mouseenter", () => {
    clearTimeout(dropdownCloseTimeout);
    toggleCartDropdown(true);
  });
}

if (cartButton) {
  cartButton.addEventListener("mouseleave", scheduleCloseDropdown);
}

if (cartDropdown) {
  cartDropdown.addEventListener("mouseenter", () => {
    clearTimeout(dropdownCloseTimeout);
    toggleCartDropdown(true);
  });
}

if (cartDropdown) {
  cartDropdown.addEventListener("mouseleave", scheduleCloseDropdown);
}

if (cartDropdownClose) {
  cartDropdownClose.addEventListener("click", () => {
    toggleCartDropdown(false);
  });
}

if (cartDropdown && cartButton) {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (cartDropdown.contains(target) || cartButton.contains(target)) {
      return;
    }
    toggleCartDropdown(false);
  });
}

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const updateNavbarState = () => {
  if (!navbar) {
    return;
  }
  const progress = Math.min(window.scrollY / 240, 1);
  const isCompact = progress > 0.5;
  navbar.classList.toggle("navbar--compact", isCompact);
  if (!navbarContent || !navbarLogo) {
    return;
  }
  const contentRect = navbarContent.getBoundingClientRect();
  const logoRect = navbarLogo.getBoundingClientRect();
  const logoCenter = logoRect.left + logoRect.width / 2;
  const contentCenter = contentRect.left + contentRect.width / 2;
  const shift = (contentCenter - logoCenter) * progress;
  const scale = 1 + 0.4 * progress;
  const actionsShift = 24 * progress;
  navbarContent.style.setProperty("--logo-shift", `${shift}px`);
  navbarContent.style.setProperty("--logo-scale", scale.toFixed(3));
  navbarContent.style.setProperty("--actions-shift", `${actionsShift}px`);
};

window.addEventListener("scroll", updateNavbarState);
window.addEventListener("resize", updateNavbarState);

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cart.size === 0) {
      showToast("Agrega al menos un producto para continuar.");
      return;
    }
    showToast("¡Compra confirmada! Revisaremos tu pedido.");
    checkoutForm.reset();
    cart.clear();
    updateCart();
  });
}

renderProducts();
buildCarousel();
updateCarousel();
resetCarouselInterval();
loadCart();
updateCart();
setBackgroundImage();
setInterval(setBackgroundImage, 9000);
updateNavbarState();

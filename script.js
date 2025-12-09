/* ========================================
   PAWPALS PET SUPPLY - JAVASCRIPT
   Functionality for navigation, forms, cart, and interactions
======================================== */

// ========== DOM CONTENT LOADED ==========
document.addEventListener("DOMContentLoaded", () => {
  initHamburgerMenu()
  initCart()
  initProductModal()
  initAddToCartButtons()
  initCartPage()
  initCheckoutPage()
  initContactForm()
  initLoginForm()
  initSignupForm()
  initSmoothScroll()
  updateCartCount()
})

// ========== CART MANAGEMENT ==========
// Get cart items from localStorage
function getCart() {
  const cart = localStorage.getItem("pawpalsCart")
  return cart ? JSON.parse(cart) : []
}

// Save cart items to localStorage and update cart count
function saveCart(cart) {
  localStorage.setItem("pawpalsCart", JSON.stringify(cart))
  updateCartCount()
}

// Update the cart item count displayed in the UI
function updateCartCount() {
  const cart = getCart()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const countElements = document.querySelectorAll(".cart-count")
  countElements.forEach((el) => {
    el.textContent = totalItems
  })
}

// Add a product to the cart or update its quantity
function addToCart(product, quantity = 1) {
  const cart = getCart()
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ ...product, quantity })
  }

  saveCart(cart)
  return cart
}

// Remove a product from the cart by its ID
function removeFromCart(productId) {
  let cart = getCart()
  cart = cart.filter((item) => item.id !== productId)
  saveCart(cart)
  return cart
}

// Update the quantity of a specific cart item
function updateCartItemQuantity(productId, quantity) {
  const cart = getCart()
  const item = cart.find((item) => item.id === productId)
  if (item) {
    item.quantity = Math.max(1, Math.min(10, quantity))
  }
  saveCart(cart)
  return cart
}

// ========== HAMBURGER MENU ==========
// Initialize hamburger menu for mobile navigation
function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger")
  const nav = document.querySelector(".nav")

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      nav.classList.toggle("active")
    })

    const navLinks = document.querySelectorAll(".nav-list a")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        nav.classList.remove("active")
      })
    })
  }
}

// ========== PRODUCT MODAL ==========
// Initialize product detail modal and its interactions
function initProductModal() {
  const productCards = document.querySelectorAll(".product-card")
  const modal = document.getElementById("productModal")
  const modalClose = document.getElementById("modalClose")

  if (!modal) return

  let currentProduct = null

  productCards.forEach((card) => {
    const imageWrapper = card.querySelector(".product-image-wrapper")
    if (imageWrapper) {
      imageWrapper.addEventListener("click", () => {
        currentProduct = {
          id: card.dataset.id,
          name: card.dataset.name,
          price: Number.parseFloat(card.dataset.price),
          image: card.dataset.image,
          description: card.dataset.description,
          details: card.dataset.details,
        }

        document.getElementById("modalImage").src = currentProduct.image
        document.getElementById("modalImage").alt = currentProduct.name
        document.getElementById("modalName").textContent = currentProduct.name
        document.getElementById("modalPrice").textContent = `${Math.round(currentProduct.price)} THB`
        document.getElementById("modalDescription").textContent = currentProduct.description
        document.getElementById("modalSpecs").textContent = currentProduct.details
        document.getElementById("quantity").value = 1

        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      })
    }
  })

  // Close modal
  if (modalClose) {
    modalClose.addEventListener("click", closeModal)
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal()
    }
  })

  // Close the product modal
  function closeModal() {
    modal.classList.remove("active")
    document.body.style.overflow = ""
  }

  // Quantity controls
  const qtyMinus = document.getElementById("qtyMinus")
  const qtyPlus = document.getElementById("qtyPlus")
  const qtyInput = document.getElementById("quantity")

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener("click", () => {
      const current = Number.parseInt(qtyInput.value)
      if (current > 1) qtyInput.value = current - 1
    })

    qtyPlus.addEventListener("click", () => {
      const current = Number.parseInt(qtyInput.value)
      if (current < 10) qtyInput.value = current + 1
    })
  }

  // Modal add to cart
  const modalAddBtn = document.getElementById("modalAddToCart")
  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", () => {
      const quantity = Number.parseInt(document.getElementById("quantity").value)
      addToCart(currentProduct, quantity)

      modalAddBtn.textContent = "Added!"
      modalAddBtn.style.backgroundColor = "#a8d8aa"

      setTimeout(() => {
        modalAddBtn.textContent = "Add to Cart"
        modalAddBtn.style.backgroundColor = ""
        closeModal()
      }, 1500)
    })
  }
}

// ========== ADD TO CART BUTTONS ==========
// Set up 'Add to Cart' button event listeners for products
function initAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll(".product-card .add-to-cart")

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const productCard = this.closest(".product-card")

      const product = {
        id: productCard.dataset.id || Math.random().toString(36).substr(2, 9),
        name: productCard.dataset.name || productCard.querySelector("h3").textContent,
        price: Number.parseFloat(
          productCard.dataset.price || productCard.querySelector(".price").textContent.replace(" THB", ""),
        ),
        image: productCard.dataset.image || productCard.querySelector("img").src,
      }

      addToCart(product, 1)

      this.textContent = "Added!"
      this.style.backgroundColor = "#A8D8AA"

      setTimeout(() => {
        this.textContent = "Add to Cart"
        this.style.backgroundColor = ""
      }, 2000)
    })
  })
}

// ========== CART PAGE ==========
// Initialize the cart page and render cart items
function initCartPage() {
  const cartEmpty = document.getElementById("cartEmpty")
  const cartItemsWrapper = document.getElementById("cartItemsWrapper")
  const cartItemsContainer = document.getElementById("cartItems")

  if (!cartItemsContainer) return

  renderCart()

  // Render cart items and set up their event listeners
  function renderCart() {
    const cart = getCart()

    if (cart.length === 0) {
      cartEmpty.style.display = "block"
      cartItemsWrapper.style.display = "none"
      return
    }

    cartEmpty.style.display = "none"
    cartItemsWrapper.style.display = "grid"

    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="item-price">${Math.round(item.price)} THB</p>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="qty-btn cart-qty-minus">-</button>
            <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" max="10">
            <button class="qty-btn cart-qty-plus">+</button>
          </div>
          <button class="remove-item">Remove</button>
        </div>
      </div>
    `,
      )
      .join("")

    // Add event listeners for quantity and remove
    cartItemsContainer.querySelectorAll(".cart-item").forEach((itemEl) => {
      const id = itemEl.dataset.id
      const minusBtn = itemEl.querySelector(".cart-qty-minus")
      const plusBtn = itemEl.querySelector(".cart-qty-plus")
      const qtyInput = itemEl.querySelector(".cart-qty-input")
      const removeBtn = itemEl.querySelector(".remove-item")

      minusBtn.addEventListener("click", () => {
        const newQty = Number.parseInt(qtyInput.value) - 1
        if (newQty >= 1) {
          updateCartItemQuantity(id, newQty)
          renderCart()
        }
      })

      plusBtn.addEventListener("click", () => {
        const newQty = Number.parseInt(qtyInput.value) + 1
        if (newQty <= 10) {
          updateCartItemQuantity(id, newQty)
          renderCart()
        }
      })

      qtyInput.addEventListener("change", () => {
        updateCartItemQuantity(id, Number.parseInt(qtyInput.value))
        renderCart()
      })

      removeBtn.addEventListener("click", () => {
        removeFromCart(id)
        renderCart()
      })
    })

    updateCartSummary(cart)
  }

  // Update cart summary totals (subtotal, shipping, tax, total)
  function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 1750 ? 0 : 209
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    document.getElementById("subtotal").textContent = `${Math.round(subtotal)} THB`
    document.getElementById("shipping").textContent = shipping === 0 ? "FREE" : `${Math.round(shipping)} THB`
    document.getElementById("tax").textContent = `${Math.round(tax)} THB`
    document.getElementById("total").textContent = `${Math.round(total)} THB`
  }
}

// ========== CHECKOUT PAGE ==========
// Initialize the checkout page and its form logic
function initCheckoutPage() {
  const checkoutForm = document.getElementById("checkoutForm")
  const checkoutItems = document.getElementById("checkoutItems")

  if (!checkoutForm || !checkoutItems) return

  renderCheckoutItems()

  // Format card number input
  const cardInput = document.getElementById("cardNumber")
  if (cardInput) {
    cardInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s/g, "").replace(/\D/g, "")
      value = value.match(/.{1,4}/g)?.join(" ") || value
      e.target.value = value
    })
  }

  // Format expiry input
  const expiryInput = document.getElementById("expiry")
  if (expiryInput) {
    expiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2)
      }
      e.target.value = value
    })
  }

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (validateCheckoutForm()) {
      // Generate order number
      const orderNumber = "PP" + Date.now().toString().slice(-8)
      document.getElementById("orderNumber").textContent = orderNumber

      // Clear cart
      localStorage.removeItem("pawpalsCart")
      updateCartCount()

      // Show success modal
      const successModal = document.getElementById("successModal")
      successModal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  })

  // Render checkout items and summary
  function renderCheckoutItems() {
    const cart = getCart()

    if (cart.length === 0) {
      window.location.href = "cart.html"
      return
    }

    checkoutItems.innerHTML = cart
      .map(
        (item) => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="checkout-item-details">
          <h4>${item.name}</h4>
          <p>Qty: ${item.quantity}</p>
        </div>
        <span class="checkout-item-price">${Math.round(item.price * item.quantity)} THB</span>
      </div>
    `,
      )
      .join("")

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 1750 ? 0 : 209
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    document.getElementById("checkoutSubtotal").textContent = `${Math.round(subtotal)} THB`
    document.getElementById("checkoutShipping").textContent = shipping === 0 ? "FREE" : `${Math.round(shipping)} THB`
    document.getElementById("checkoutTax").textContent = `${Math.round(tax)} THB`
    document.getElementById("checkoutTotal").textContent = `${Math.round(total)} THB`
  }

  // Validate checkout form fields
  function validateCheckoutForm() {
    let isValid = true
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip",
      "cardName",
      "cardNumber",
      "expiry",
      "cvv",
    ]

    // Hide all errors first
    fields.forEach((field) => {
      const errorEl = document.getElementById(field + "Error")
      if (errorEl) errorEl.style.display = "none"
    })

    fields.forEach((field) => {
      const input = document.getElementById(field)
      const errorEl = document.getElementById(field + "Error")

      if (!input.value.trim()) {
        if (errorEl) {
          errorEl.textContent = "This field is required"
          errorEl.style.display = "block"
        }
        isValid = false
      }
    })

    // Email validation
    const email = document.getElementById("email").value
    if (email && !isValidEmail(email)) {
      document.getElementById("emailError").textContent = "Please enter a valid email"
      document.getElementById("emailError").style.display = "block"
      isValid = false
    }

    // Card number validation
    const cardNum = document.getElementById("cardNumber").value.replace(/\s/g, "")
    if (cardNum && cardNum.length < 16) {
      document.getElementById("cardNumberError").textContent = "Please enter a valid card number"
      document.getElementById("cardNumberError").style.display = "block"
      isValid = false
    }

    return isValid
  }
}

// ========== CONTACT FORM VALIDATION ==========
// Initialize contact form validation and submission
function initContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("contactName").value.trim()
      const email = document.getElementById("contactEmail").value.trim()
      const message = document.getElementById("contactMessage").value.trim()

      hideAllErrors("contact")

      let isValid = true

      if (name === "") {
        showError("nameError", "Please enter your name")
        isValid = false
      }

      if (email === "") {
        showError("emailError", "Please enter your email")
        isValid = false
      } else if (!isValidEmail(email)) {
        showError("emailError", "Please enter a valid email address")
        isValid = false
      }

      if (message === "") {
        showError("messageError", "Please enter your message")
        isValid = false
      }

      if (isValid) {
        const successMessage = document.getElementById("contactSuccess")
        successMessage.textContent = "Thank you for your message! We will get back to you within 24 hours."
        successMessage.style.display = "block"
        contactForm.reset()

        setTimeout(() => {
          successMessage.style.display = "none"
        }, 5000)
      }
    })
  }
}

// ========== LOGIN FORM VALIDATION ==========
// Initialize login form validation and submission
function initLoginForm() {
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const username = document.getElementById("loginUsername").value.trim()
      const password = document.getElementById("loginPassword").value.trim()

      hideAllErrors("login")

      let isValid = true

      if (username === "") {
        showError("loginUsernameError", "Please enter your username")
        isValid = false
      }

      if (password === "") {
        showError("loginPasswordError", "Please enter your password")
        isValid = false
      }

      if (isValid) {
        const successMessage = document.getElementById("loginSuccess")
        successMessage.textContent = `Welcome back, ${username}! Login successful.`
        successMessage.style.display = "block"

        alert(`Login Successful!\n\nWelcome back to PawPals, ${username}!`)
        loginForm.reset()

        setTimeout(() => {
          successMessage.style.display = "none"
        }, 5000)
      }
    })
  }
}

// ========== SIGNUP FORM VALIDATION ==========
// Initialize signup form validation and submission
function initSignupForm() {
  const signupForm = document.getElementById("signupForm")

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("signupName").value.trim()
      const email = document.getElementById("signupEmail").value.trim()
      const password = document.getElementById("signupPassword").value.trim()
      const confirmPassword = document.getElementById("signupConfirmPassword").value.trim()

      hideAllErrors("signup")

      let isValid = true

      if (name === "") {
        showError("signupNameError", "Please enter your name")
        isValid = false
      }

      if (email === "") {
        showError("signupEmailError", "Please enter your email")
        isValid = false
      } else if (!isValidEmail(email)) {
        showError("signupEmailError", "Please enter a valid email address")
        isValid = false
      }

      if (password === "") {
        showError("signupPasswordError", "Please enter a password")
        isValid = false
      } else if (password.length < 6) {
        showError("signupPasswordError", "Password must be at least 6 characters")
        isValid = false
      }

      if (confirmPassword === "") {
        showError("signupConfirmError", "Please confirm your password")
        isValid = false
      } else if (password !== confirmPassword) {
        showError("signupConfirmError", "Passwords do not match")
        isValid = false
      }

      if (isValid) {
        const successMessage = document.getElementById("signupSuccess")
        successMessage.textContent = `Account created successfully! Welcome to the PawPals family, ${name}!`
        successMessage.style.display = "block"

        alert(`Account Created!\n\nWelcome to PawPals, ${name}! Your account has been created successfully.`)
        signupForm.reset()

        setTimeout(() => {
          successMessage.style.display = "none"
        }, 5000)
      }
    })
  }
}

// ========== SMOOTH SCROLL ==========
// Enable smooth scrolling for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// ========== HELPER FUNCTIONS ==========
// Show an error message for a form field
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

// Hide all error messages for a given form type
function hideAllErrors(formType) {
  let errorIds = []

  switch (formType) {
    case "contact":
      errorIds = ["nameError", "emailError", "messageError"]
      break
    case "login":
      errorIds = ["loginUsernameError", "loginPasswordError"]
      break
    case "signup":
      errorIds = ["signupNameError", "signupEmailError", "signupPasswordError", "signupConfirmError"]
      break
  }

  errorIds.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.style.display = "none"
    }
  })
}

// Validate email format using regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Initialize cart on page load
function initCart() {
  updateCartCount()
}

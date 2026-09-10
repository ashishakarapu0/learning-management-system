 /* =========================================================
   MYSTORE - MAIN JAVASCRIPT FILE
   ========================================================= */


/* =========================================================
   1. COMMON HELPERS
   ========================================================= */

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}


/* =========================================================
   2. PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();
    updateWishlistCount();

    initializeProductSearch();
    initializeProductFilter();
    initializeProductSort();

    initializeForms();

    displayCart();
    displayWishlist();

    updateCheckoutSummary();

});


/* =========================================================
   3. CART COUNT
   ========================================================= */

function updateCartCount() {

    const cart = getCart();

    const cartLinks = document.querySelectorAll(
        'a[href*="cart.html"]'
    );

    cartLinks.forEach(function (link) {

        if (!link.querySelector(".cart-count")) {

            const count = document.createElement("span");

            count.className = "cart-count";

            count.textContent = cart.length;

            count.style.cssText = `
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                padding: 2px 7px;
                font-size: 11px;
                margin-left: 4px;
            `;

            link.appendChild(count);

        } else {

            link.querySelector(".cart-count").textContent =
                cart.length;

        }

    });

}


/* =========================================================
   4. WISHLIST COUNT
   ========================================================= */

function updateWishlistCount() {

    const wishlist = getWishlist();

    const wishlistLinks = document.querySelectorAll(
        'a[href*="wishlist.html"]'
    );

    wishlistLinks.forEach(function (link) {

        if (!link.querySelector(".wishlist-count")) {

            const count = document.createElement("span");

            count.className = "wishlist-count";

            count.textContent = wishlist.length;

            count.style.cssText = `
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                padding: 2px 7px;
                font-size: 11px;
                margin-left: 4px;
            `;

            link.appendChild(count);

        } else {

            link.querySelector(".wishlist-count").textContent =
                wishlist.length;

        }

    });

}


/* =========================================================
   5. ADD PRODUCT TO CART
   ========================================================= */

function addToCart(product) {

    let cart = getCart();

    const existingProduct = cart.find(function (item) {

        return item.name === product.name;

    });


    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        product.quantity = 1;

        cart.push(product);

    }


    saveCart(cart);

    updateCartCount();

    alert(product.name + " added to cart!");

}


/* =========================================================
   6. ADD PRODUCT TO CART FROM PRODUCT CARD
   ========================================================= */

function addProductToCart(button) {

    const card = button.closest(".product-card");

    if (!card) {
        return;
    }


    const nameElement = card.querySelector("h2, h3");

    const priceElement = card.querySelector(".product-price");

    const imageElement = card.querySelector("img");

    const categoryElement =
        card.querySelector(".product-category");


    const product = {

        id: Date.now(),

        name: nameElement
            ? nameElement.textContent.trim()
            : "Product",

        price: priceElement
            ? parseFloat(
                priceElement.textContent
                    .replace(/[₹,]/g, "")
              )
            : 0,

        image: imageElement
            ? imageElement.getAttribute("src")
            : "",

        category: categoryElement
            ? categoryElement.textContent.trim()
            : "General"

    };


    addToCart(product);

}


/* =========================================================
   7. ADD TO WISHLIST
   ========================================================= */

function addToWishlist(button) {

    /*
       If the function is called from HTML like:

       onclick="addToWishlist()"

       we find the nearest product card.
    */

    let card = null;

    if (button && button.closest) {
        card = button.closest(".product-card");
    }

    /*
       If no button was passed, try to find
       the product card from the event.
    */

    if (!card && typeof event !== "undefined") {

        if (event.target) {

            card = event.target.closest(".product-card");

        }

    }


    if (!card) {

        alert("Please select a product first.");

        return;

    }


    const nameElement =
        card.querySelector("h2, h3");

    const priceElement =
        card.querySelector(".product-price");

    const imageElement =
        card.querySelector("img");

    const categoryElement =
        card.querySelector(".product-category");


    const product = {

        id: Date.now(),

        name: nameElement
            ? nameElement.textContent.trim()
            : "Product",

        price: priceElement
            ? parseFloat(
                priceElement.textContent
                    .replace(/[₹,]/g, "")
              )
            : 0,

        image: imageElement
            ? imageElement.getAttribute("src")
            : "",

        category: categoryElement
            ? categoryElement.textContent.trim()
            : "General"

    };


    let wishlist = getWishlist();


    const exists = wishlist.some(function (item) {

        return item.name === product.name;

    });


    if (exists) {

        alert("Product is already in your wishlist.");

        return;

    }


    wishlist.push(product);

    saveWishlist(wishlist);

    updateWishlistCount();

    alert(product.name + " added to wishlist!");

}


/* =========================================================
   8. PRODUCT SEARCH
   ========================================================= */

function initializeProductSearch() {

    const searchInputs = document.querySelectorAll(
        "#electronics-search, #clothes-search, #footwear-search, #product-search"
    );


    searchInputs.forEach(function (input) {

        input.addEventListener("input", function () {

            filterProducts();

        });

    });

}


/* =========================================================
   9. PRODUCT CATEGORY FILTER
   ========================================================= */

function initializeProductFilter() {

    const filterInputs = document.querySelectorAll(
        "#electronics-type, #clothes-type, #footwear-type, #product-category"
    );


    filterInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            filterProducts();

        });

    });

}


/* =========================================================
   10. FILTER PRODUCTS
   ========================================================= */

function filterProducts() {

    const containers = document.querySelectorAll(
        ".product-container"
    );


    containers.forEach(function (container) {

        const cards = container.querySelectorAll(
            ".product-card"
        );


        let searchInput =
            document.querySelector(
                "#electronics-search, #clothes-search, #footwear-search, #product-search"
            );


        let filterInput =
            document.querySelector(
                "#electronics-type, #clothes-type, #footwear-type, #product-category"
            );


        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


        const selectedCategory = filterInput
            ? filterInput.value
            : "all";


        let visibleProducts = 0;


        cards.forEach(function (card) {

            const productName =
                card.textContent.toLowerCase();


            const productType =
                card.dataset.type || "";


            const matchesSearch =
                productName.includes(searchText);


            const matchesCategory =
                selectedCategory === "all" ||
                productType === selectedCategory;


            if (
                matchesSearch &&
                matchesCategory
            ) {

                card.style.display = "";

                visibleProducts++;

            } else {

                card.style.display = "none";

            }

        });


        /*
           Show "No products found"
        */

        const noProducts =
            document.querySelector(
                "#no-electronics, #no-clothes, #no-footwear, #no-products"
            );


        if (noProducts) {

            noProducts.style.display =
                visibleProducts === 0
                    ? "block"
                    : "none";

        }

    });

}


/* =========================================================
   11. PRODUCT SORT
   ========================================================= */

function initializeProductSort() {

    const sortInputs = document.querySelectorAll(
        "#electronics-sort, #clothes-sort, #footwear-sort, #product-sort"
    );


    sortInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            sortProducts(input.value);

        });

    });

}


/* =========================================================
   12. SORT PRODUCTS
   ========================================================= */

function sortProducts(sortType) {

    const containers = document.querySelectorAll(
        ".product-container"
    );


    containers.forEach(function (container) {

        const cards =
            Array.from(
                container.querySelectorAll(".product-card")
            );


        cards.sort(function (a, b) {

            const priceA =
                parseFloat(a.dataset.price) || 0;

            const priceB =
                parseFloat(b.dataset.price) || 0;


            const ratingA =
                parseFloat(a.dataset.rating) || 0;

            const ratingB =
                parseFloat(b.dataset.rating) || 0;


            if (sortType === "low-high") {

                return priceA - priceB;

            }


            if (sortType === "high-low") {

                return priceB - priceA;

            }


            if (sortType === "rating") {

                return ratingB - ratingA;

            }


            return 0;

        });


        cards.forEach(function (card) {

            container.appendChild(card);

        });

    });

}


/* =========================================================
   13. DISPLAY CART
   ========================================================= */

function displayCart() {

    const cartContainer =
        document.querySelector("#cart-items");


    if (!cartContainer) {
        return;
    }


    const cart = getCart();


    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h2>
                    Your Cart is Empty
                </h2>

                <p>
                    Add some products to your cart.
                </p>

                <a
                    href="products.html"
                    class="btn"
                >
                    Start Shopping
                </a>

            </div>

        `;

        updateCartTotal();

        return;

    }


    cartContainer.innerHTML = "";


    cart.forEach(function (product, index) {

        const item = document.createElement("div");

        item.className = "cart-item";


        item.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.category || ""}
                </p>


                <div class="quantity-control">

                    <button
                        type="button"
                        onclick="changeQuantity(${index}, -1)"
                    >
                        -
                    </button>

                    <span>
                        ${product.quantity}
                    </span>

                    <button
                        type="button"
                        onclick="changeQuantity(${index}, 1)"
                    >
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>

            </div>


            <div class="cart-item-price">

                ₹${(
                    product.price *
                    product.quantity
                ).toLocaleString("en-IN")}

            </div>

        `;


        cartContainer.appendChild(item);

    });


    updateCartTotal();

}


/* =========================================================
   14. CHANGE CART QUANTITY
   ========================================================= */

function changeQuantity(index, change) {

    let cart = getCart();


    if (!cart[index]) {
        return;
    }


    cart[index].quantity += change;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart(cart);

    displayCart();

    updateCartCount();

    updateCheckoutSummary();

}


/* =========================================================
   15. REMOVE FROM CART
   ========================================================= */

function removeFromCart(index) {

    let cart = getCart();


    if (!cart[index]) {
        return;
    }


    const productName =
        cart[index].name;


    cart.splice(index, 1);


    saveCart(cart);

    displayCart();

    updateCartCount();

    updateCheckoutSummary();


    alert(
        productName +
        " removed from cart."
    );

}


/* =========================================================
   16. UPDATE CART TOTAL
   ========================================================= */

function updateCartTotal() {

    const cart = getCart();


    const subtotal =
        cart.reduce(function (total, product) {

            return total +
                product.price *
                product.quantity;

        }, 0);


    const shipping =
        subtotal > 0
            ? 50
            : 0;


    const total =
        subtotal + shipping;


    const subtotalElement =
        document.querySelector("#cart-subtotal");


    const shippingElement =
        document.querySelector("#cart-shipping");


    const totalElement =
        document.querySelector("#cart-total");


    if (subtotalElement) {

        subtotalElement.textContent =
            "₹" +
            subtotal.toLocaleString("en-IN");

    }


    if (shippingElement) {

        shippingElement.textContent =
            "₹" +
            shipping.toLocaleString("en-IN");

    }


    if (totalElement) {

        totalElement.textContent =
            "₹" +
            total.toLocaleString("en-IN");

    }

}


/* =========================================================
   17. DISPLAY WISHLIST
   ========================================================= */

function displayWishlist() {

    const wishlistContainer =
        document.querySelector("#wishlist-items");


    if (!wishlistContainer) {
        return;
    }


    const wishlist = getWishlist();


    if (wishlist.length === 0) {

        wishlistContainer.innerHTML = `

            <div class="empty-wishlist">

                <div class="empty-wishlist-icon">
                    ♡
                </div>

                <h2>
                    Your Wishlist is Empty
                </h2>

                <p>
                    Save products you love here.
                </p>

                <a
                    href="products.html"
                    class="btn"
                >
                    Explore Products
                </a>

            </div>

        `;

        return;

    }


    wishlistContainer.innerHTML = "";


    wishlist.forEach(function (product, index) {

        const card =
            document.createElement("div");


        card.className =
            "wishlist-card";


        card.innerHTML = `

            <div class="wishlist-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >


                <button
                    type="button"
                    class="remove-wishlist"
                    onclick="removeFromWishlist(${index})"
                >
                    ×
                </button>

            </div>


            <div class="wishlist-info">

                <p class="product-category">
                    ${product.category || ""}
                </p>

                <h2>
                    ${product.name}
                </h2>

                <p class="product-price">
                    ₹${product.price.toLocaleString("en-IN")}
                </p>


                <div class="wishlist-product-actions">

                    <button
                        type="button"
                        class="btn"
                        onclick="moveWishlistToCart(${index})"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        `;


        wishlistContainer.appendChild(card);

    });

}


/* =========================================================
   18. REMOVE FROM WISHLIST
   ========================================================= */

function removeFromWishlist(index) {

    let wishlist = getWishlist();


    if (!wishlist[index]) {
        return;
    }


    wishlist.splice(index, 1);


    saveWishlist(wishlist);

    displayWishlist();

    updateWishlistCount();

}


/* =========================================================
   19. MOVE WISHLIST PRODUCT TO CART
   ========================================================= */

function moveWishlistToCart(index) {

    let wishlist = getWishlist();


    if (!wishlist[index]) {
        return;
    }


    const product = {
        ...wishlist[index]
    };


    addToCart(product);


    wishlist.splice(index, 1);

    saveWishlist(wishlist);

    displayWishlist();

    updateWishlistCount();

}


/* =========================================================
   20. CLEAR WISHLIST
   ========================================================= */

function clearWishlist() {

    const wishlist =
        getWishlist();


    if (wishlist.length === 0) {

        alert("Your wishlist is already empty.");

        return;

    }


    const confirmClear =
        confirm(
            "Are you sure you want to clear your wishlist?"
        );


    if (confirmClear) {

        localStorage.removeItem(
            "wishlist"
        );

        displayWishlist();

        updateWishlistCount();

    }

}


/* =========================================================
   21. CHECKOUT SUMMARY
   ========================================================= */

function updateCheckoutSummary() {

    const checkoutItems =
        document.querySelector("#checkout-items");


    if (!checkoutItems) {
        return;
    }


    const cart = getCart();


    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <p>
                Your cart is empty.
            </p>

            <a
                href="products.html"
                class="btn"
            >
                Continue Shopping
            </a>

        `;

        return;

    }


    checkoutItems.innerHTML = "";


    cart.forEach(function (product) {

        const item =
            document.createElement("div");


        item.className =
            "summary-row";


        item.innerHTML = `

            <span>
                ${product.name}
                × ${product.quantity}
            </span>

            <span>
                ₹${(
                    product.price *
                    product.quantity
                ).toLocaleString("en-IN")}
            </span>

        `;


        checkoutItems.appendChild(item);

    });


    const subtotal =
        cart.reduce(function (total, product) {

            return total +
                product.price *
                product.quantity;

        }, 0);


    const shipping =
        subtotal > 0
            ? 50
            : 0;


    const total =
        subtotal + shipping;


    const subtotalElement =
        document.querySelector(
            "#checkout-subtotal"
        );


    const shippingElement =
        document.querySelector(
            "#checkout-shipping"
        );


    const totalElement =
        document.querySelector(
            "#checkout-total"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            "₹" +
            subtotal.toLocaleString("en-IN");

    }


    if (shippingElement) {

        shippingElement.textContent =
            "₹" +
            shipping.toLocaleString("en-IN");

    }


    if (totalElement) {

        totalElement.textContent =
            "₹" +
            total.toLocaleString("en-IN");

    }

}


/* =========================================================
   22. LOGIN / REGISTER / CONTACT FORMS
   ========================================================= */

function initializeForms() {

    const forms =
        document.querySelectorAll("form");


    forms.forEach(function (form) {

        form.addEventListener(
            "submit",
            function (event) {

                handleFormSubmit(
                    event,
                    form
                );

            }
        );

    });

}


/* =========================================================
   23. FORM HANDLER
   ========================================================= */

function handleFormSubmit(event, form) {

    event.preventDefault();


    /*
       REGISTER FORM
    */

    if (
        form.id === "register-form" ||
        form.classList.contains("register-form")
    ) {

        registerUser(form);

        return;

    }


    /*
       LOGIN FORM
    */

    if (
        form.id === "login-form" ||
        form.classList.contains("login-form")
    ) {

        loginUser(form);

        return;

    }


    /*
       CHECKOUT FORM
    */

    if (
        form.id === "checkout-form" ||
        form.classList.contains("checkout-form")
    ) {

        submitCheckout(form);

        return;

    }


    /*
       PAYMENT FORM
    */

    if (
        form.id === "payment-form" ||
        form.classList.contains("payment-form")
    ) {

        processPayment(form);

        return;

    }


    /*
       CONTACT FORM
    */

    if (
        form.id === "contact-form" ||
        form.classList.contains("contact-form")
    ) {

        submitContactForm(form);

        return;

    }


    /*
       DEFAULT FORM
    */

    alert(
        "Form submitted successfully!"
    );

}


/* =========================================================
   24. REGISTER USER
   ========================================================= */

function registerUser(form) {

    const name =
        getInputValue(
            form,
            [
                "#name",
                "#full-name",
                "#register-name"
            ]
        );


    const email =
        getInputValue(
            form,
            [
                "#email",
                "#register-email"
            ]
        );


    const password =
        getInputValue(
            form,
            [
                "#password",
                "#register-password"
            ]
        );


    if (!name || !email || !password) {

        alert(
            "Please fill in all required fields."
        );

        return;

    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;

    }


    const user = {

        name: name,

        email: email,

        password: password

    };


    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );


    alert(
        "Registration successful! You can now login."
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   25. LOGIN USER
   ========================================================= */

function loginUser(form) {

    const email =
        getInputValue(
            form,
            [
                "#email",
                "#login-email"
            ]
        );


    const password =
        getInputValue(
            form,
            [
                "#password",
                "#login-password"
            ]
        );


    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;

    }


    const savedUser =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (!savedUser) {

        alert(
            "No account found. Please register first."
        );

        return;

    }


    if (
        savedUser.email === email &&
        savedUser.password === password
    ) {

        localStorage.setItem(
            "loggedIn",
            "true"
        );


        alert(
            "Login successful!"
        );


        window.location.href =
            "index.html";

    } else {

        alert(
            "Invalid email or password."
        );

    }

}


/* =========================================================
   26. LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem(
        "loggedIn"
    );


    alert(
        "You have been logged out."
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   27. GET INPUT VALUE
   ========================================================= */

function getInputValue(form, selectors) {

    for (
        let i = 0;
        i < selectors.length;
        i++
    ) {

        const input =
            form.querySelector(
                selectors[i]
            );


        if (input) {

            return input.value.trim();

        }

    }


    return "";

}


/* =========================================================
   28. CONTACT FORM
   ========================================================= */

function submitContactForm(form) {

    const name =
        getInputValue(
            form,
            ["#name", "#contact-name"]
        );


    const email =
        getInputValue(
            form,
            ["#email", "#contact-email"]
        );


    const message =
        getInputValue(
            form,
            ["#message", "#contact-message"]
        );


    if (!name || !email || !message) {

        alert(
            "Please fill in all fields."
        );

        return;

    }


    alert(
        "Thank you, " +
        name +
        "! Your message has been sent."
    );


    form.reset();

}


/* =========================================================
   29. CHECKOUT
   ========================================================= */

function submitCheckout(form) {

    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const name =
        getInputValue(
            form,
            ["#name", "#full-name", "#checkout-name"]
        );


    const address =
        getInputValue(
            form,
            ["#address", "#checkout-address"]
        );


    const city =
        getInputValue(
            form,
            ["#city", "#checkout-city"]
        );


    const phone =
        getInputValue(
            form,
            ["#phone", "#checkout-phone"]
        );


    if (
        !name ||
        !address ||
        !city ||
        !phone
    ) {

        alert(
            "Please fill in all delivery details."
        );

        return;

    }


    /*
       Save checkout information temporarily
    */

    const checkoutData = {

        name: name,

        address: address,

        city: city,

        phone: phone

    };


    localStorage.setItem(
        "checkoutData",
        JSON.stringify(checkoutData)
    );


    window.location.href =
        "payment.html";

}


/* =========================================================
   30. PAYMENT
   ========================================================= */

function processPayment(form) {

    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const paymentMethod =
        form.querySelector(
            'input[name="payment-method"]:checked'
        );


    if (!paymentMethod) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    /*
       Calculate total
    */

    const subtotal =
        cart.reduce(function (total, product) {

            return total +
                product.price *
                product.quantity;

        }, 0);


    const shipping =
        50;


    const total =
        subtotal + shipping;


    /*
       Create Order
    */

    const order = {

        orderId:
            "ORD" +
            Date.now(),

        date:
            new Date().toLocaleDateString("en-IN"),

        items:
            cart,

        total:
            total,

        paymentMethod:
            paymentMethod.value,

        status:
            "Confirmed"

    };


    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    orders.push(order);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    /*
       Clear cart
    */

    localStorage.removeItem(
        "cart"
    );


    updateCartCount();


    alert(
        "Payment successful! Your order has been placed."
    );


    window.location.href =
        "orders.html";

}


/* =========================================================
   31. DISPLAY ORDERS
   ========================================================= */

function displayOrders() {

    const ordersContainer =
        document.querySelector(
            "#orders-container"
        );


    if (!ordersContainer) {
        return;
    }


    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    if (orders.length === 0) {

        ordersContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    📦
                </div>

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    Your placed orders will appear here.
                </p>

                <a
                    href="products.html"
                    class="btn"
                >
                    Start Shopping
                </a>

            </div>

        `;

        return;

    }


    ordersContainer.innerHTML = "";


    orders.reverse().forEach(function (order) {

        const orderCard =
            document.createElement("div");


        orderCard.className =
            "order-card";


        let productsHTML = "";


        order.items.forEach(function (product) {

            productsHTML += `

                <div class="order-product">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                    <div class="order-product-info">

                        <h4>
                            ${product.name}
                        </h4>

                        <p>
                            Quantity:
                            ${product.quantity}
                        </p>

                    </div>

                    <strong>
                        ₹${(
                            product.price *
                            product.quantity
                        ).toLocaleString("en-IN")}
                    </strong>

                </div>

            `;

        });


        orderCard.innerHTML = `

            <div class="order-header">

                <div>

                    <h3>
                        ${order.orderId}
                    </h3>

                    <p class="order-date">
                        ${order.date}
                    </p>

                </div>

                <span class="order-status">
                    ${order.status}
                </span>

            </div>


            <div class="order-products">

                ${productsHTML}

            </div>


            <div class="order-total">

                <span>
                    Total
                </span>

                <span>
                    ₹${order.total.toLocaleString("en-IN")}
                </span>

            </div>

        `;


        ordersContainer.appendChild(
            orderCard
        );

    });

}


/* =========================================================
   32. PROFILE PAGE
   ========================================================= */

function displayProfile() {

    const profileName =
        document.querySelector(
            "#profile-name"
        );


    const profileEmail =
        document.querySelector(
            "#profile-email"
        );


    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (!user) {

        return;

    }


    if (profileName) {

        profileName.textContent =
            user.name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email;

    }

}


/* =========================================================
   33. INITIALIZE ORDERS & PROFILE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayOrders();

        displayProfile();

    }
);


/* =========================================================
   34. PROTECT CHECKOUT PAGE
   ========================================================= */

function protectCheckout() {

    const checkoutForm =
        document.querySelector(
            "#checkout-form"
        );


    if (!checkoutForm) {
        return;
    }


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty. Please add a product first."
        );


        window.location.href =
            "cart.html";

    }

}


document.addEventListener(
    "DOMContentLoaded",
    protectCheckout
);


/* =========================================================
   35. PAYMENT METHOD UI
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.name ===
            "payment-method"
        ) {

            const methods =
                document.querySelectorAll(
                    ".payment-method"
                );


            methods.forEach(function (method) {

                method.classList.remove(
                    "active"
                );

            });


            const selected =
                event.target.closest(
                    ".payment-method"
                );


            if (selected) {

                selected.classList.add(
                    "active"
                );

            }

        }

    }
);


/* =========================================================
   36. MOBILE NAVIGATION
   ========================================================= */

function createMobileMenu() {

    const nav =
        document.querySelector("nav");


    const navLinks =
        document.querySelector(".nav-links");


    if (
        !nav ||
        !navLinks
    ) {

        return;

    }


    /*
       Don't create duplicate menu buttons.
    */

    if (
        document.querySelector(
            ".mobile-menu-btn"
        )
    ) {

        return;

    }


    const button =
        document.createElement("button");


    button.className =
        "mobile-menu-btn";


    button.textContent =
        "☰";


    button.style.cssText = `

        display: none;

        background: none;

        border: none;

        font-size: 28px;

        color: #2878f0;

    `;


    nav.insertBefore(
        button,
        navLinks
    );


    button.addEventListener(
        "click",
        function () {

            navLinks.classList.toggle(
                "mobile-menu-open"
            );

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    createMobileMenu
);


/* =========================================================
   37. BUY NOW
   ========================================================= */

function buyNow(button) {

    const card =
        button.closest(
            ".product-card"
        );


    if (!card) {
        return;
    }


    const nameElement =
        card.querySelector(
            "h2, h3"
        );


    const priceElement =
        card.querySelector(
            ".product-price"
        );


    const imageElement =
        card.querySelector(
            "img"
        );


    const categoryElement =
        card.querySelector(
            ".product-category"
        );


    const product = {

        id: Date.now(),

        name:
            nameElement
                ? nameElement.textContent.trim()
                : "Product",

        price:
            priceElement
                ? parseFloat(
                    priceElement.textContent
                        .replace(/[₹,]/g, "")
                  )
                : 0,

        image:
            imageElement
                ? imageElement.src
                : "",

        category:
            categoryElement
                ? categoryElement.textContent.trim()
                : "General",

        quantity: 1

    };


    saveCart([product]);

    updateCartCount();


    window.location.href =
        "checkout.html";

}


/* =========================================================
   38. CLEAR CART
   ========================================================= */

function clearCart() {

    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is already empty."
        );

        return;

    }


    const confirmation =
        confirm(
            "Are you sure you want to clear your cart?"
        );


    if (confirmation) {

        localStorage.removeItem(
            "cart"
        );


        displayCart();

        updateCartCount();

        updateCheckoutSummary();

    }

}


/* =========================================================
   39. NEWSLETTER
   ========================================================= */

function subscribeNewsletter(event) {

    event.preventDefault();


    const emailInput =
        document.querySelector(
            "#newsletter-email"
        );


    if (!emailInput) {
        return;
    }


    const email =
        emailInput.value.trim();


    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;

    }


    alert(
        "Thank you for subscribing!"
    );


    emailInput.value = "";

}


/* =========================================================
   40. CONSOLE MESSAGE
   ========================================================= */

console.log(
    "MyStore JavaScript loaded successfully."
);

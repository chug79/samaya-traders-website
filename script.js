document.addEventListener('DOMContentLoaded', () => {
    // Header UI elements (safe guards)
    const searchForm = document.querySelector('.search-form');
    const shoppingCart = document.querySelector('.shopping-cart');
    const loginForm = document.querySelector('.login-form');
    const navbar = document.querySelector('.navbar');

    const searchBtn = document.querySelector('#search-btn');
    const cartBtn = document.querySelector('#cart-btn');
    const loginBtn = document.querySelector('#login-btn');
    const menuBtn = document.querySelector('#menu-btn');

    if (searchBtn && searchForm) {
        searchBtn.addEventListener('click', () => {
            searchForm.classList.toggle('active');
            shoppingCart?.classList.remove('active');
            loginForm?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (cartBtn && shoppingCart) {
        cartBtn.addEventListener('click', () => {
            shoppingCart.classList.toggle('active');
            searchForm?.classList.remove('active');
            loginForm?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (loginBtn && loginForm) {
        loginBtn.addEventListener('click', () => {
            loginForm.classList.toggle('active');
            searchForm?.classList.remove('active');
            shoppingCart?.classList.remove('active');
            navbar?.classList.remove('active');
        });
    }
    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
            searchForm?.classList.remove('active');
            shoppingCart?.classList.remove('active');
            loginForm?.classList.remove('active');
        });
    }

    window.addEventListener('scroll', () => {
        searchForm?.classList.remove('active');
        shoppingCart?.classList.remove('active');
        loginForm?.classList.remove('active');
        navbar?.classList.remove('active');
    });

    // Swiper init (only if library loaded)
    if (typeof Swiper !== 'undefined') {
        try {
            // keep a map of containerElement -> Swiper instance so we can control autoplay from search
            const swiperInstances = new Map();
            // init each product slider individually and store instances
            document.querySelectorAll('.product-slider').forEach((el) => {
                try {
                    const inst = new Swiper(el, {
                        loop: true, spaceBetween: 20, autoplay: { delay: 3000, disableOnInteraction: false },
                        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } }
                    });
                    swiperInstances.set(el, inst);
                } catch (err) { /* ignore per-instance errors */ }
            });
            // init review sliders too (store instances in the same map)
            document.querySelectorAll('.review-slider').forEach((el) => {
                try {
                    const inst = new Swiper(el, {
                        loop: true, spaceBetween: 20, autoplay: { delay: 3000, disableOnInteraction: false },
                        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } }
                    });
                    swiperInstances.set(el, inst);
                } catch (err) { /* ignore per-instance errors */ }
            });

            // expose swiperInstances for other code (used by search click handler below)
            window.__productSwiperInstances = swiperInstances;
        } catch (e) { /* ignore if sliders not present */ }
    }

    // --- Cart & WhatsApp checkout ---
    const addButtons = document.querySelectorAll('.add-to-cart, .btn.add-to-cart');
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const whatsappDefaultHref = checkoutBtn?.getAttribute('href') || 'https://wa.me/+923278641145';
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const parsePrice = (text = '') => {
        const m = text.replace(/,/g, '').match(/[\d.]+/);
        return m ? parseFloat(m[0]) : 0;
    };
    const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

    function buildWhatsAppHref() {
        const m = whatsappDefaultHref.match(/wa\.me\/(\+?\d+)/);
        const phone = m ? m[1].replace(/\+/g, '') : '';
        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const lines = cart.map(i => `${i.name} x${i.qty} = Rs. ${(i.price * i.qty).toFixed(2)}`);
        const message = ['Hello, I would like to place an order:', ...lines, `Total: Rs. ${totalPrice.toFixed(2)}`].join('\n');
        return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    function updateCartUI() {
        // Clean invalid items
        cart = cart.filter(item => item.price && !isNaN(item.price) && item.qty && !isNaN(item.qty));
        cart.forEach(item => {
            if (!item.qty || item.qty < 1) item.qty = 1;
        });
        saveCart();

        const totalCount = cart.reduce((s, i) => s + i.qty, 0);
        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
        if (cartCountEl) cartCountEl.textContent = totalCount;

        if (!cartItemsContainer) return;
        cartItemsContainer.style.maxHeight = '300px';
        cartItemsContainer.style.overflowY = 'auto';
        cartItemsContainer.style.overflowX = 'hidden';
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = 'Your cart is empty';
            cartItemsContainer.appendChild(empty);
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.style.display = 'flex';
                itemDiv.style.justifyContent = 'space-between';
                itemDiv.style.alignItems = 'center';
                itemDiv.style.padding = '1rem';
                itemDiv.style.marginBottom = '0.5rem';
                itemDiv.style.borderBottom = '1px solid #eee';
                const textSpan = document.createElement('span');
                textSpan.textContent = item.name + ' x' + item.qty + ' - Rs. ' + (item.price * item.qty).toFixed(2);
                itemDiv.appendChild(textSpan);
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-item';
                removeBtn.dataset.id = item.id;
                removeBtn.innerHTML = '&#128465;'; // trash bin icon
                removeBtn.style.background = 'none';
                removeBtn.style.border = 'none';
                removeBtn.style.fontSize = '2rem';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.color = '#f39c12';
                itemDiv.appendChild(removeBtn);
                cartItemsContainer.appendChild(itemDiv);
            });
        }

        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = `Total: Rs. ${totalPrice.toFixed(2)}`;

        if (checkoutBtn) {
            const waHref = buildWhatsAppHref();
            checkoutBtn.setAttribute('href', waHref);
            checkoutBtn.setAttribute('target', '_blank');
            checkoutBtn.setAttribute('rel', 'noopener noreferrer');
            // ensure clicking opens new tab (some browsers block anchor.open in JS)
            checkoutBtn.addEventListener('click', (e) => {
                // allow default but also explicitly open
                window.open(waHref, '_blank', 'noopener');
            }, { once: true });
        }

        saveCart();
    }

    function addToCartFromButton(btn) {
        const box = btn.closest('.box') || btn.closest('.swiper-slide') || btn.parentElement;
        let id = btn.dataset.productId || (box?.querySelector('h3') ? box.querySelector('h3').textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'product-' + Date.now());
        if (id === 'veg-2') {
            id = box?.querySelector('h3') ? box.querySelector('h3').textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'product-' + Date.now();
        }
        const name = btn.dataset.productName || (box?.querySelector('h3') ? box.querySelector('h3').textContent.trim() : 'Product');
        const price = btn.dataset.productPrice ? parseFloat(btn.dataset.productPrice) : (box?.querySelector('.price') ? parsePrice(box.querySelector('.price').textContent) : 0);
        const image = box?.querySelector('img') ? box.querySelector('img').getAttribute('src') : '';

        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty += 1;
        else cart.push({ id, name, price: Number(price), qty: 1, image });

        updateCartUI();
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCartFromButton(btn);
        });
    });

    document.addEventListener('click', (e) => {
        const rem = e.target.closest('.remove-item');
        if (rem) {
            const id = rem.dataset.id;
            cart = cart.filter(i => i.id !== id);
            updateCartUI();
        }
    });

    updateCartUI();

    // --- Product-only search ---
    const searchBox = document.getElementById('search-box');
    const productsContainer = document.querySelector('.products');
    let noResultsEl = null;
    // in-memory product index for faster searching / results dropdown
    const productIndex = [];
    function buildProductIndex() {
        const nodeList = Array.from(document.querySelectorAll('.products .box, .products .swiper-slide.box, .products .swiper-wrapper .box'))
            .filter(b => !b.classList.contains('swiper-slide-duplicate'));
        productIndex.length = 0;
        nodeList.forEach((box, i) => {
            const name = (box.querySelector('h3')?.textContent || '').trim();
            const price = (box.querySelector('.price')?.textContent || '').trim();
            const img = box.querySelector('img')?.getAttribute('src') || '';
            const id = box.dataset.productId || box.dataset.id || ('p-' + i);
            // store a combined normalized string for token matching
            const combined = (name + ' ' + price).toLowerCase();
            productIndex.push({ id, name, price, img, el: box, combined });
        });
    }
    // build once on load
    buildProductIndex();
    function createNoResultsMessage() {
        if (noResultsEl) return noResultsEl;
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'search-no-results';
        noResultsEl.style.textAlign = 'center';
        noResultsEl.style.padding = '2rem';
        noResultsEl.style.color = 'var(--light-color, #777)';
        noResultsEl.textContent = 'No products found';
        return noResultsEl;
    }

    function filterProducts(query) {
        // use indexed list for consistent results
        const boxes = productIndex.map(p => p.el);
        if (boxes.length === 0) {
            // nothing to search on this page
            if (productsContainer) {
                const existing = document.getElementById('search-no-results');
                if (!existing && query.length > 0) productsContainer.appendChild(createNoResultsMessage());
            }
            return;
        }

        let shown = 0;
        // tokenized matching: every token in query must exist in product combined string
        const tokens = (query || '').split(/\s+/).filter(Boolean);
        boxes.forEach(box => {
            const idx = productIndex.findIndex(p => p.el === box);
            const combined = idx >= 0 ? productIndex[idx].combined : (box.querySelector('h3')?.textContent || '').toLowerCase();
            let match = true;
            if (tokens.length > 0) {
                match = tokens.every(tok => combined.includes(tok));
            }
            if (match) {
                box.style.display = '';
                shown++;
            } else {
                box.style.display = 'none';
            }
        });

        if (productsContainer) {
            const existing = document.getElementById('search-no-results');
            if (shown === 0 && query.length > 0) {
                if (!existing) productsContainer.appendChild(createNoResultsMessage());
            } else {
                existing?.remove();
            }
        }
    }

    if (searchBox) {
        const form = searchBox.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const q = (searchBox.value || '').trim().toLowerCase();
                filterProducts(q);
                showSearchResults(q);
            });
        }
        // debounce helper to avoid running filter on every keystroke
        function debounce(fn, wait) {
            let t;
            return function(...args) {
                clearTimeout(t);
                t = setTimeout(() => fn.apply(this, args), wait);
            };
        }

        // results dropdown UI
        let resultsEl = null;
        function ensureResultsEl() {
            if (resultsEl) return resultsEl;
            const header = document.querySelector('.header') || document.body;
            resultsEl = document.createElement('div');
            resultsEl.id = 'search-results';
            Object.assign(resultsEl.style, {
                position: 'absolute',
                top: '100%',
                right: '2rem',
                width: 'min(40rem, 92vw)',
                background: '#fff',
                boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.12)',
                borderRadius: '0.6rem',
                padding: '0.6rem',
                zIndex: 1200,
                overflow: 'auto',
                maxHeight: '50vh',
                display: 'none'
            });
            header.appendChild(resultsEl);
            // hide when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-form') && !e.target.closest('#search-btn') && !e.target.closest('#search-results')) {
                    resultsEl.style.display = 'none';
                }
            });
            return resultsEl;
        }

        function clearHighlight(el) {
            if (!el) return;
            el.style.transition = '';
            el.style.background = '';
            el.style.outline = '';
        }

        function highlightElement(el) {
            if (!el) return;
            el.style.transition = 'background 0.6s ease';
            el.style.background = 'linear-gradient(90deg, rgba(1,117,47,0.06), rgba(1,117,47,0.04))';
            setTimeout(() => clearHighlight(el), 2000);
        }

        function showSearchResults(query) {
            const re = ensureResultsEl();
            if (!query) { re.style.display = 'none'; return; }
            const tokens = query.split(/\s+/).filter(Boolean);
            const matches = productIndex.filter(p => tokens.every(tok => p.combined.includes(tok))).slice(0, 8);
            re.innerHTML = '';
            if (matches.length === 0) {
                const el = document.createElement('div');
                el.style.padding = '1rem';
                el.style.color = 'var(--light-color, #666)';
                el.textContent = 'No results';
                re.appendChild(el);
                re.style.display = 'block';
                return;
            }
            matches.forEach(m => {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'search-result-item';
                item.dataset.searchId = m.id;
                Object.assign(item.style, { display: 'flex', gap: '0.6rem', padding: '0.6rem', alignItems: 'center', borderRadius: '0.4rem', color: 'var(--black, #000)', textDecoration: 'none' });
                item.innerHTML = `<img src="${m.img}" alt="" style="height:3.6rem;width:3.6rem;object-fit:cover;border-radius:.4rem">` +
                    `<div style="flex:1"><div style="font-size:1.4rem">${m.name}</div><div style="font-size:1.2rem;color:var(--light-color)">${m.price}</div></div>`;
                item.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    re.style.display = 'none';
                    // if product is inside a Swiper slider, try to stop autoplay and navigate to that slide
                    try {
                        const swiperMap = window.__productSwiperInstances;
                        if (swiperMap && swiperMap.size > 0) {
                            for (const [container, inst] of swiperMap.entries()) {
                                if (container.contains(m.el)) {
                                    // find slide index in this container's DOM slides
                                    const slides = Array.from(container.querySelectorAll('.swiper-slide'));
                                    const matchIndex = slides.findIndex(s => s.contains(m.el));
                                    if (matchIndex >= 0) {
                                        // stop autoplay (if available)
                                        try { if (inst?.autoplay?.stop) inst.autoplay.stop(); else if (inst?.autoplayStop) inst.autoplayStop(); } catch (e) { /* ignore */ }
                                        // prefer slideToLoop if available (handles looped sliders)
                                        try {
                                            if (typeof inst.slideToLoop === 'function') {
                                                // slideToLoop expects the original slide index (not DOM index), so pass matchIndex and allow swiper to resolve
                                                inst.slideToLoop(matchIndex, 600);
                                            } else if (typeof inst.slideTo === 'function') {
                                                inst.slideTo(matchIndex, 600);
                                            }
                                        } catch (e) { /* ignore navigation errors */ }
                                    }
                                    break;
                                }
                            }
                        }
                    } catch (e) { /* ignore any swiper control errors */ }

                    // fallback behaviour: scroll to product and highlight
                    try { m.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
                    highlightElement(m.el);
                });
                re.appendChild(item);
            });
            re.style.display = 'block';
        }

        const handleInput = debounce((val) => {
            filterProducts(val);
            showSearchResults(val);
        }, 180);

        searchBox.addEventListener('input', (e) => {
            const v = ((e.target.value) || '').trim().toLowerCase();
            handleInput(v);
        });
    }

    // Modal for select-options
    let selectedOption = null;
    const modal = document.getElementById('product-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalOptions = document.getElementById('modal-options');
        const addToCartModal = document.getElementById('add-to-cart-modal');
        const closeBtn = document.querySelector('.close');

        document.querySelectorAll('.select-options').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productName = this.getAttribute('data-product-name');
                const options = JSON.parse(this.getAttribute('data-options'));
                modalTitle.textContent = 'Select Option for ' + productName;
                modalOptions.innerHTML = '';
                options.forEach(option => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option-item';
                    optionDiv.innerHTML = `<img src="${option.image}" alt="${option.name}"><p>${option.name} - Rs. ${option.price}</p>`;
                    modalOptions.appendChild(optionDiv);
                });
                modalOptions.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const optionDiv = e.target.closest('.option-item');
                    if (optionDiv) {
                        const index = Array.from(modalOptions.children).indexOf(optionDiv);
                        selectedOption = options[index];
                        modalOptions.querySelectorAll('.option-item').forEach(d => d.style.border = '1px solid #ccc');
                        optionDiv.style.border = '2px solid #f39c12';
                    }
                });
                modal.style.display = 'block';
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');

        window.addEventListener('click', (event) => {
            if (event.target == modal) modal.style.display = 'none';
        });

        if (addToCartModal) addToCartModal.addEventListener('click', () => {
            if (selectedOption) {
                const productName = modalTitle.textContent.split(' for ')[1] + ' ' + selectedOption.name;
                const id = productName.toLowerCase().replace(/\s+/g, '-');
                const existing = cart.find(i => i.id === id);
                if (existing) existing.qty += 1;
                else cart.push({ id, name: productName, price: parseFloat(selectedOption.price.toString().replace(/[^\d.]/g, '')), qty: 1, image: selectedOption.image || '' });
                updateCartUI();
                modal.style.display = 'none';
                selectedOption = null;
            } else {
                alert('Please select an option');
            }
        });
    }
});

    // --- scroll fade-up animations (faster, exclude header controls) ---
    (function setupScrollAnimations() {
        const selectors = [
            '.products .box',
            '.features .box',
            '.categories .box',
            '.review .box',
            '.blogs .box',
            '.home .content',
            '.heading'
        ].join(', ');

        const nodes = Array.from(document.querySelectorAll(selectors));
        if (nodes.length === 0) return;

        nodes.forEach((el) => el.classList.add('fade-up'));

        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const index = nodes.indexOf(el);
                // smaller stagger (40ms steps) and cap to avoid long delays
                if (index >= 0) el.style.setProperty('--d', `${Math.min(index, 6) * 40}ms`);
                el.classList.add('in-view');
                observer.unobserve(el);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -8% 0px'
        });

        nodes.slice(0, 200).forEach(n => obs.observe(n));
    })();

(function setupContactSend() {
    const contactMessage = document.getElementById('contact-message');
    const contactPhone = document.getElementById('contact-phone');
    const sendWaBtn = document.getElementById('send-wa');

    const supportWaNumber = '+923278641145'; // change if needed

    function getComposedMessage() {
        const msg = (contactMessage?.value || '').trim();
        const phone = (contactPhone?.value || '').trim();
        let body = msg;
        if (phone) body += `\n\nContact phone: ${phone}`;
        return body;
    }

    sendWaBtn?.addEventListener('click', () => {
        const body = getComposedMessage();
        if (!body) { alert('Please enter a message.'); return; }

        const phone = supportWaNumber.replace(/\+/g, '');
        const text = encodeURIComponent(body);
        const waHref = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;

        // update button state
        const origText = sendWaBtn.textContent;
        sendWaBtn.textContent = 'Sent!';
        sendWaBtn.disabled = true;
        sendWaBtn.classList.add('sent');

        // clear inputs immediately so text "vanishes"
        if (contactMessage) contactMessage.value = '';
        if (contactPhone) contactPhone.value = '';

        // open WhatsApp
        window.open(waHref, '_blank', 'noopener');

        // revert button after 3 seconds
        setTimeout(() => {
            sendWaBtn.textContent = origText;
            sendWaBtn.disabled = false;
            sendWaBtn.classList.remove('sent');
        }, 15000);
    });
})();



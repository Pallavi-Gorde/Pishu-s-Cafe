/* Pishu's Café — shared interactions (menu render, cart, reservations, reveals).
   Static demo build: orders & reservations are front-end only (no backend). */
(function () {
  const demo = document.body.dataset.demo;
  const data = window.PISHUS[demo];
  if (!data) return;

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const $ = (sel) => document.querySelector(sel);

  /* hero background */
  const heroBg = $(".hero-bg");
  if (heroBg) heroBg.style.backgroundImage = `url(${data.hero})`;

  /* marquee (slow editorial loop) */
  const track = $("#marquee-track");
  if (track) {
    const group = () => `<div class="marquee-group">${data.marquee.concat(data.marquee).map((w) => `<span class="marquee-item">${w}<b>✦</b></span>`).join("")}</div>`;
    track.innerHTML = group() + group();
  }

  /* table chip from ?table=N (scanned QR links) */
  const table = new URLSearchParams(location.search).get("table");
  const chip = $("#table-chip");
  if (chip && table && /^[1-8]$/.test(table)) {
    chip.hidden = false;
    chip.textContent = `Table ${String(table).padStart(2, "0")}`;
  }
  const qrFab = $("#qr-fab");
  if (qrFab) {
    if (table && /^[1-8]$/.test(table)) qrFab.textContent = `▦ Table ${String(table).padStart(2, "0")} menu`;
    qrFab.addEventListener("click", () => $("#menu").scrollIntoView({ behavior: "smooth" }));
  }

  /* toast */
  let toastEl;
  function toast(msg) {
    if (toastEl) toastEl.remove();
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl && toastEl.remove(), 2600);
  }

  /* ---------- menu ---------- */
  let activeCategory = "All";
  const categories = ["All", ...new Set(data.menu.map((i) => i.category))];

  function renderCategories() {
    $("#category-row").innerHTML = categories
      .map((c) => `<button class="${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`)
      .join("");
  }

  function renderMenu() {
    const visible = data.menu.filter((i) => activeCategory === "All" || i.category === activeCategory);
    $("#menu-grid").innerHTML = visible
      .map(
        (item, index) => `
      <article class="menu-card ${item.dishOfDay ? "spotlight" : ""}">
        <div class="menu-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <span class="${item.dishOfDay ? "dish-of-day" : ""}">${item.dishOfDay ? "★ Dish of the day" : index === 0 ? "Pishu listed" : item.category}</span>
        </div>
        <div class="menu-card-copy">
          <div class="item-heading"><h3>${item.name}</h3><strong><small>sample</small> ${money(item.price)}</strong></div>
          <p>${item.description}</p>
          <button class="text-button" data-add="${item.id}">Add to order ＋</button>
        </div>
      </article>`
      )
      .join("");
  }

  renderCategories();
  renderMenu();

  $("#category-row").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderCategories();
    renderMenu();
  });

  /* ---------- cart (saved in this browser) ---------- */
  const cartKey = `pishus-cart-${demo}`;
  let cart = JSON.parse(localStorage.getItem(cartKey) || "{}");
  const validTable = table && /^[1-8]$/.test(table) ? table : null;

  const cartCount = () => Object.values(cart).reduce((s, q) => s + q, 0);
  const cartItems = () =>
    Object.entries(cart)
      .map(([id, qty]) => ({ ...data.menu.find((i) => i.id === id), qty }))
      .filter((i) => i.name);
  const cartTotal = () => cartItems().reduce((s, i) => s + i.price * i.qty, 0);

  function syncCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    $("#cart-count").textContent = cartCount();
  }

  function renderCart() {
    const items = cartItems();
    $("#cart-body").innerHTML = `
      <div class="drawer-kicker">${validTable ? `ORDERING FOR TABLE ${String(validTable).padStart(2, "0")}` : "YOUR TABLE ORDER"}</div>
      <h2>A little something?</h2>
      ${
        items.length
          ? items
              .map(
                (item) => `
        <div class="cart-line">
          <div><strong>${item.name}</strong><small>${money(item.price)} each</small></div>
          <div class="stepper">
            <button data-step="${item.id}|-1">−</button><span>${item.qty}</span><button data-step="${item.id}|1">＋</button>
          </div>
        </div>`
              )
              .join("")
          : `<div class="empty-cart">☕<p>Your table order is empty.<br />Let's find you something delicious.</p></div>`
      }
      <div class="cart-total"><span>Subtotal</span><strong>${money(cartTotal())}</strong></div>
      <button class="primary-button full-width" id="place-order" ${items.length ? "" : "disabled"}>Place demo order →</button>
      <small class="demo-note">Demo only · no payment required · orders can't be edited once placed</small>`;
  }

  function openCart() {
    renderCart();
    $("#cart-overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeOverlays() {
    $("#cart-overlay").hidden = true;
    $("#reserve-overlay").hidden = true;
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add;
      cart[id] = (cart[id] || 0) + 1;
      syncCart();
      toast(`${data.menu.find((i) => i.id === id).name} added to your bag`);
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      const [id, amount] = step.dataset.step.split("|");
      cart[id] = Math.max(0, (cart[id] || 0) + Number(amount));
      if (!cart[id]) delete cart[id];
      syncCart();
      renderCart();
      return;
    }
    if (e.target.closest("#place-order")) {
      const total = cartTotal();
      const ref = Math.random().toString(16).slice(2, 8).toUpperCase();
      cart = {};
      syncCart();
      $("#cart-body").innerHTML = `
        <div class="success-state">
          <div class="tick">✓</div>
          <div class="eyebrow" style="justify-content:center">Order locked in</div>
          <h2>The kitchen is on it.</h2>
          <p>Order #${ref} · ${money(total)}${validTable ? ` · Table ${String(validTable).padStart(2, "0")}` : ""}. Your order is sent and can no longer be edited — flag a team member if anything needs changing.</p>
          <button class="primary-button" data-close-cart>Back to the café</button>
        </div>`;
      return;
    }
    if (e.target.closest("#cart-open")) return openCart();
    if (e.target.closest("[data-reserve]") || e.target.closest("#reserve-open")) return openReserve();
    if (e.target.closest("[data-close-cart]") || e.target.closest("[data-close-reserve]")) return closeOverlays();
    if (e.target.classList && e.target.classList.contains("overlay")) return closeOverlays();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlays();
  });

  /* ---------- reservations ---------- */
  function openReserve() {
    $("#reserve-body").innerHTML = `
      <div class="eyebrow">Make yourself at home</div>
      <h2>We'll save you a seat.</h2>
      <p>For an unhurried catch-up, a celebration, or simply a quiet cup.</p>
      <form class="reservation-form" id="reserve-form">
        <label>Your name<input name="name" required placeholder="Full name" /></label>
        <label>Mobile number<input name="phone" required placeholder="+91" /></label>
        <label>Date<input name="date" type="date" required /></label>
        <label>Time<select name="time"><option>10:00 AM</option><option>1:00 PM</option><option>4:00 PM</option><option>7:00 PM</option></select></label>
        <label class="wide">Guests<select name="guests"><option>2</option><option>3</option><option>4</option><option>6</option></select></label>
        <button class="primary-button full-width wide" type="submit">Request a table →</button>
      </form>`;
    $("#reserve-overlay").hidden = false;
    document.body.style.overflow = "hidden";
    $("#reserve-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const ref = Math.random().toString(16).slice(2, 8).toUpperCase();
      $("#reserve-body").innerHTML = `
        <div class="success-state">
          <div class="tick">✓</div>
          <div class="eyebrow" style="justify-content:center">You're on the list</div>
          <h2>We'll save you a seat.</h2>
          <p>Your table request is with the café team. See you soon.</p>
          <div class="booking-ref">Ref #${ref} <span class="status-pill requested">Requested</span></div>
          <small class="demo-note">Static demo build — requests aren't stored without the backend.</small>
          <button class="primary-button" data-close-reserve>Back to the café</button>
        </div>`;
    });
  }

  /* ---------- scroll reveals ---------- */
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  syncCart();
})();

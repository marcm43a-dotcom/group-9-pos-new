const profiles = [
  { code: "cashier1234", role: "Cashier" },
  { code: "admin1234", role: "Admin" }
];
let currentProfile = profiles[0];

let subtotal = 0;
let discountRate = 2;
let totalDiscount = 0;
let discountedPrice = 0;
let vatRate = 2;
let totalVat = 0;
let overallPrice = 0;
let customerBalance = 0;
let customerChange = 0;

let storeList = [
];

function renderStoreList() {
  const container = document.getElementById("store_list");
  container.innerHTML = "";
  storeList.forEach((item, index) => {
    const button = document.createElement("button");
    button.id = "store_list_listed_item";
    button.innerHTML = `
      <img id="store_list_listed_item_image" src="${item.image}">
      <p id="store_list_listed_item_name">${item.name}</p>
      <p id="store_list_listed_item_iid">IID ${index + 1}</p>
      <p id="store_list_listed_item_stock">${item.stock} in stock</p>
      <p id="store_list_listed_item_price">₱${item.price.toFixed(2)}</p>
    `;
    button.addEventListener("click", () => addItemToCheckout(index));
    container.appendChild(button);
  });
}

function renderCheckoutList() {
  const container = document.getElementById("checkout_list");
  container.innerHTML = "";
  storeList.forEach((item, index) => {
    if (item.quantity > 0) {
      const button = document.createElement("button");
      button.id = "checkout_list_listed_item";
      button.innerHTML = `
        ${item.name}<br>
        ₱${item.price.toFixed(2)} x ${item.quantity} = ₱${(item.price * item.quantity).toFixed(2)}
      `;
      button.addEventListener("click", () => updateItemQuantity(index));
      container.appendChild(button);
    }
  });
}

function renderCheckoutSummary() {
  subtotal = storeList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalDiscount = subtotal * (discountRate / 100);
  discountedPrice = subtotal - totalDiscount;
  totalVat = discountedPrice * (vatRate / 100);
  overallPrice = discountedPrice + totalVat;

  document.getElementById("checkout_summary_sub_total").textContent =
    `Sub Total -------- ₱${subtotal.toFixed(2)}`;
  document.getElementById("checkout_summary_discount_rate").textContent =
    `Total Discount --- ₱${totalDiscount.toFixed(2)} = ${discountRate}%`;
  document.getElementById("checkout_summary_discounted_price").textContent =
    `Discounted Price - ₱${discountedPrice.toFixed(2)}`;
  document.getElementById("checkout_summary_vat_rate").textContent =
    `Total VAT -------- ₱${totalVat.toFixed(2)} = ${vatRate}%`;
  document.getElementById("checkout_summary_overall_price").textContent =
    `Overall Price ---- ₱${overallPrice.toFixed(2)}`;
  document.getElementById("checkout_summary_customer_balance").textContent =
    `Customer Balance - ₱${customerBalance.toFixed(2)}`;
  document.getElementById("checkout_summary_customer_chanage").textContent =
    `Customer Change -- ₱${customerChange.toFixed(2)}`;

  const purchaseBtn = document.getElementById("checkout_button_purchase_items");
  if (purchaseBtn) purchaseBtn.disabled = !storeList.some(item => item.quantity > 0);
}

function addItemToCheckout(index) {
  const item = storeList[index];
  if (item.quantity < item.stock) {
    item.quantity++;
  } else {
    alert(`${item.name} has reached maximum stock limit (${item.stock}).`);
  }
  renderCheckoutList();
  renderCheckoutSummary();
}

function updateItemQuantity(index) {
  const item = storeList[index];
  const newQty = prompt(
    `Enter new quantity for ${item.name} (0 to remove, up to ${item.stock}):`,
    0
  );
  if (newQty !== null) {
    const parsed = parseInt(newQty, 10);
    if (!isNaN(parsed)) {
      item.quantity = Math.max(0, Math.min(parsed, item.stock));
      renderCheckoutList();
      renderCheckoutSummary();
    }
  }
}

function setBalance() {
  const suggested = Math.ceil(overallPrice);
  const input = prompt("Enter your balance:", suggested.toFixed(2));
  if (input === null) return false;
  const parsed = parseFloat(input);
  if (!isNaN(parsed)) {
    customerBalance = parsed;
    customerChange = customerBalance - overallPrice;
    renderCheckoutSummary();
    if (customerBalance >= overallPrice) {
      alert("Balance is sufficient. Click Purchase again to proceed.");
      return true;
    } else {
      alert("Balance is insufficient. Please try again.");
      return setBalance();
    }
  }
  return false;
}

function purchaseItems() {
  if (customerBalance < overallPrice) {
    setBalance();
    return;
  }
  logReceipt();
  updateStock();
  resetCheckout();
  alert("Purchase completed!");
}

function logReceipt() {
  const history = document.getElementById("purchase_history_list");
  const receipt = document.createElement("div");
  receipt.id = "purchase_history_list_receipt";
  let html = `Date of Purchase: ${new Date().toLocaleString()}<br>`;
  storeList.forEach((item, index) => {
    if (item.quantity > 0) {
      html += `<br>${item.name}<br>₱${item.price.toFixed(2)} x ${item.quantity} = ₱${(item.price * item.quantity).toFixed(2)} (IID ${index + 1})`;
    }
  });
  html += `
    <br><br>Sub Total -------- ₱${subtotal.toFixed(2)}
    <br>Total Discount --- ₱${totalDiscount.toFixed(2)} = ${discountRate}%
    <br>Discounted Price - ₱${discountedPrice.toFixed(2)}
    <br>Total VAT -------- ₱${totalVat.toFixed(2)} = ${vatRate}%
    <br>Overall Price ---- ₱${overallPrice.toFixed(2)}
    <br>Customer Balance - ₱${customerBalance.toFixed(2)}
    <br>Customer Change -- ₱${customerChange.toFixed(2)}
  `;
  receipt.innerHTML = html;
  history.appendChild(receipt);
}

function updateStock() {
  storeList.forEach(item => {
    if (item.quantity > 0) {
      item.stock = Math.max(0, item.stock - item.quantity);
      item.quantity = 0;
    }
  });
}

function resetCheckout() {
  storeList.forEach(item => { item.quantity = 0; });
  subtotal = totalDiscount = discountedPrice = totalVat = overallPrice = 0;
  customerBalance = customerChange = 0;
  renderStoreList();
  renderCheckoutList();
  renderCheckoutSummary();
}

function requireAdmin() {
  if (currentProfile.role !== "Admin") {
    alert("Admin access required.");
    return false;
  }
  return true;
}

function adminAddItem() {
  if (!requireAdmin()) return;
  storeList.push({
    name: "New Item",
    price: 1,
    stock: 1,
    quantity: 0,
    image: "assets/iid_image/input.jpg"
  });
  refreshUI();
}

function adminEditItem(field) {
  if (!requireAdmin()) return;
  const iid = parseInt(prompt("Enter IID of item:"), 10) - 1;
  const item = storeList[iid];
  if (!item) return alert("Item not found.");
  let newValue;
  switch (field) {
    case "name":
      newValue = prompt("Enter new name:", item.name);
      if (newValue) item.name = newValue.trim();
      break;
    case "stock":
      newValue = parseInt(prompt("Enter new stock:", item.stock), 10);
      if (!isNaN(newValue) && newValue >= 0) item.stock = newValue;
      break;
    case "price":
      newValue = parseFloat(prompt("Enter new price:", item.price));
      if (!isNaN(newValue) && newValue >= 0) item.price = newValue;
      break;
    case "image":
      newValue = prompt("Enter image filename (without .jpg):", "");
      if (newValue && newValue.trim() !== "") {
        item.image = `assets/iid_image/${newValue.trim()}.jpg`;
      }
      break;
  }
  refreshUI();
}

function adminRemoveItem() {
  if (!requireAdmin()) return;
  const iid = parseInt(prompt("Enter IID of item to remove:"), 10) - 1;
  if (iid < 0 || iid >= storeList.length) {
    alert("Item not found.");
    return;
  }
  storeList.splice(iid, 1);
  refreshUI();
}

function adminSetRate(type) {
  if (!requireAdmin()) return;
  const currentRate = type === "discount" ? discountRate : vatRate;
  const newRate = parseInt(prompt(`Enter new ${type} rate (as integer %, e.g. 5 for 5%):`, currentRate), 10);
  if (!isNaN(newRate) && newRate >= 0) {
    if (type === "discount") discountRate = newRate;
    else vatRate = newRate;
    renderCheckoutSummary();
  }
}

function setUserProfile() {
  const code = prompt("Enter profile code:");
  if (code) {
    const profile = profiles.find(p => p.code === code.trim());
    if (profile) {
      currentProfile = profile;
      const btn = document.getElementById("checkout_button_set_user_profile");
      if (btn) btn.textContent = `"Welcome ${profile.role}"`;
      toggleAdminSection(profile.role === "Admin");
    } else {
      alert("Invalid profile code.");
    }
  }
}

function initPOS() {
  renderStoreList();
  renderCheckoutList();
  renderCheckoutSummary();
  document.getElementById("checkout_button_purchase_items").addEventListener("click", purchaseItems);
  document.getElementById("checkout_list_button_reset_list").addEventListener("click", resetCheckout);
  document.getElementById("checkout_button_set_user_profile").addEventListener("click", setUserProfile);
  document.getElementById("admin_button_add_item").addEventListener("click", adminAddItem);
  document.getElementById("admin_button_edit_name").addEventListener("click", () => adminEditItem("name"));
  document.getElementById("admin_button_edit_stock").addEventListener("click", () => adminEditItem("stock"));
  document.getElementById("admin_button_edit_price").addEventListener("click", () => adminEditItem("price"));
  document.getElementById("admin_button_edit_image").addEventListener("click", () => adminEditItem("image"));
  document.getElementById("admin_button_set_discount_rate").addEventListener("click", () => adminSetRate("discount"));
  document.getElementById("admin_button_set_vat_rate").addEventListener("click", () => adminSetRate("vat"));
  document.getElementById("admin_button_remove_item").addEventListener("click", adminRemoveItem);
  toggleAdminSection(currentProfile.role === "Admin");
}

window.onload = initPOS;

function refreshUI() {
  renderStoreList();
  renderCheckoutList();
  renderCheckoutSummary();
}

function toggleAdminSection(isAdmin) {
  const adminDiv = document.getElementById("admin");
  if (adminDiv) {
    adminDiv.style.display = isAdmin ? "flex" : "none";
  }
}


/* ==========================================================
   SubscriptionLib: a small JavaScript library
   Methods: getAll, add, remove, isExpired, getStats,
            render, showSection, init
   ========================================================== */

const SubscriptionLib = (function () {
  const STORAGE_KEY = "subscriptions";
  const DEFAULT_SECTION = "form-section";

  /* ---------- Storage ---------- */
  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  /* ---------- Data actions ---------- */
  function add(data) {
    const list = getAll();
    list.push({
      id: Date.now(),
      service: data.service.trim(),
      provider: data.provider.trim(),
      subscriber: data.subscriber.trim(),
      renewalDate: data.renewalDate,
      category: data.category,
    });
    save(list);
  }

  function remove(id) {
    save(getAll().filter((item) => item.id !== id));
  }

  /* ---------- Status and stats ---------- */
  function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  // Dates are "YYYY-MM-DD" strings, so they compare correctly as text
  function isExpired(renewalDate) {
    return renewalDate < todayString();
  }

  function getStats() {
    const list = getAll();
    return {
      total: list.length,
      expired: list.filter((item) => isExpired(item.renewalDate)).length,
    };
  }

  /* ---------- Rendering ---------- */
  function createCell(text) {
    const td = document.createElement("td");
    td.textContent = text; // textContent is safe against HTML injection
    return td;
  }

  function createRow(item) {
    const tr = document.createElement("tr");

    tr.appendChild(createCell(item.service));
    tr.appendChild(createCell(item.provider));
    tr.appendChild(createCell(item.subscriber));
    tr.appendChild(createCell(item.renewalDate));
    tr.appendChild(createCell(item.category));

    // Status cell with a badge
    const expired = isExpired(item.renewalDate);
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = expired ? "badge badge-expired" : "badge badge-active";
    badge.textContent = expired ? "Expired" : "Active";
    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    // Action cell with a delete button
    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-danger";
    button.textContent = "Delete";
    button.addEventListener("click", function () {
      remove(item.id);
      render();
    });
    actionCell.appendChild(button);
    tr.appendChild(actionCell);

    return tr;
  }

  function render() {
    const body = document.getElementById("subscription-body");
    const list = getAll();

    body.innerHTML = "";

    if (list.length === 0) {
      const tr = document.createElement("tr");
      const td = createCell("No subscriptions yet.");
      td.colSpan = 7;
      td.className = "text-center text-muted";
      tr.appendChild(td);
      body.appendChild(tr);
    } else {
      list.forEach((item) => body.appendChild(createRow(item)));
    }

    const stats = getStats();
    document.getElementById("total-count").textContent = stats.total;
    document.getElementById("expired-count").textContent = stats.expired;
  }

  /* ---------- Navigation ---------- */
  function showSection() {
    const sections = document.querySelectorAll(".page-section");
    const ids = Array.from(sections).map((section) => section.id);

    let id = window.location.hash.slice(1);
    if (!ids.includes(id)) {
      id = DEFAULT_SECTION;
    }

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === id);
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  /* ---------- Setup ---------- */
  function init() {
    const form = document.getElementById("subscription-form");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      add({
        service: form.service.value,
        provider: form.provider.value,
        subscriber: form.subscriber.value,
        renewalDate: form.renewalDate.value,
        category: form.category.value,
      });

      form.reset();
      render();
      window.location.hash = "table-section";
    });

    showSection();
    window.addEventListener("hashchange", showSection);
    render();
  }

  // Public methods
  return { getAll, add, remove, isExpired, getStats, render, showSection, init };
})();

SubscriptionLib.init();
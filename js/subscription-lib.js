/* ==========================================================
   SubscriptionLib: A small JavaScript library
   Methods: getAll, add, remove, isExpired, getStats,
            render, showSection, init
   It starts itself when the page is ready.
   ========================================================== */

const SubscriptionLib = (function () {

    const STORAGE_KEY = "subscriptions";
    const DEFAULT_SECTION = "form-section";

    /* ---------- Storage ---------- */

    function getAll() {
        try {
            const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(list) ? list : [];
        } catch (error) {
            return [];
        }
    }

    function save(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    /* ---------- Data actions ---------- */

    function add(data) {
        if (
            !data.service.trim() ||
            !data.provider.trim() ||
            !data.subscriber.trim() ||
            !data.renewalDate ||
            !data.category
        ) {
            return false;
        }

        const list = getAll();

        list.push({
            id: Date.now(),
            service: data.service.trim(),
            provider: data.provider.trim(),
            subscriber: data.subscriber.trim(),
            renewalDate: data.renewalDate,
            category: data.category
        });

        save(list);
        return true;
    }

    function remove(id) {
        const list = getAll();
        const updatedList = list.filter(item => item.id !== id);
        save(updatedList);
    }

    /* ---------- Status and statistics ---------- */

    function todayString() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${now.getFullYear()}-${month}-${day}`;
    }

    function isExpired(renewalDate) {
        return renewalDate < todayString();
    }

    function getStats() {
        const list = getAll();

        return {
            total: list.length,
            expired: list.filter(item =>
                isExpired(item.renewalDate)
            ).length
        };
    }

    /* ---------- Rendering ---------- */

    function createCell(text) {
        const td = document.createElement("td");
        td.textContent = text;
        return td;
    }

    function createRow(item) {
        const tr = document.createElement("tr");

        tr.appendChild(createCell(item.service));
        tr.appendChild(createCell(item.provider));
        tr.appendChild(createCell(item.subscriber));
        tr.appendChild(createCell(item.renewalDate));
        tr.appendChild(createCell(item.category));

        // Status cell
        const expired = isExpired(item.renewalDate);
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = expired
            ? "ui-badge ui-badge-danger"
            : "ui-badge ui-badge-success";

        badge.textContent = expired ? "Expired" : "Active";

        statusCell.appendChild(badge);
        tr.appendChild(statusCell);

        // Delete button
        const actionCell = document.createElement("td");
        const button = document.createElement("button");

        button.type = "button";
        button.className = "ui-btn ui-btn-danger";
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
        const totalElement = document.getElementById("total-count");
        const expiredElement = document.getElementById("expired-count");

        if (!body || !totalElement || !expiredElement) {
            return;
        }

        const list = getAll();

        body.innerHTML = "";

        if (list.length === 0) {
            const tr = document.createElement("tr");
            const td = createCell("No subscriptions yet.");

            td.colSpan = 7;
            td.className = "ui-text-center ui-text-muted";

            tr.appendChild(td);
            body.appendChild(tr);
        } else {
            list.forEach(item => {
                body.appendChild(createRow(item));
            });
        }

        const stats = getStats();

        totalElement.textContent = stats.total;
        expiredElement.textContent = stats.expired;
    }

    /* ---------- Navigation ---------- */

    function showSection() {
        const sections = document.querySelectorAll(".ui-section");

        const ids = Array.from(sections).map(section => section.id);

        let id = window.location.hash.slice(1);

        if (!ids.includes(id)) {
            id = DEFAULT_SECTION;
        }

        sections.forEach(section => {
            section.classList.toggle("is-active", section.id === id);
        });

        document.querySelectorAll(".ui-nav-link").forEach(link => {
            link.classList.toggle(
                "is-active",
                link.getAttribute("href") === "#" + id
            );
        });
    }

    /* ---------- Initialization ---------- */

    function init() {
        const form = document.getElementById("subscription-form");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const success = add({
                service: form.elements.namedItem("service").value,
                provider: form.elements.namedItem("provider").value,
                subscriber: form.elements.namedItem("subscriber").value,
                renewalDate: form.elements.namedItem("renewalDate").value,
                category: form.elements.namedItem("category").value
            });

            if (success) {
                form.reset();
                render();
                window.location.hash = "table-section";
            }
        });

        showSection();

        window.addEventListener("hashchange", showSection);

        render();
    }

    // Public methods
    return {
        getAll,
        add,
        remove,
        isExpired,
        getStats,
        render,
        showSection,
        init
    };

})();

/* Start the library when the page is ready */
document.addEventListener("DOMContentLoaded", function () {
    SubscriptionLib.init();
});
const ADMIN_PASSWORD = "1234";

let allBookings = [];

// =============================================
// LOGIN / LOGOUT
// =============================================
function adminLogin() {
    const input = document.getElementById("admin-password").value;
    if (input === ADMIN_PASSWORD) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("login-error").style.display = "none";
        initDashboard();
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

function adminLogout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("admin-password").value = "";
    document.getElementById("login-error").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const pwInput = document.getElementById("admin-password");
    if (pwInput) {
        pwInput.addEventListener("keydown", e => {
            if (e.key === "Enter") adminLogin();
        });
    }
});


// =============================================
// DASHBOARD INIT
// =============================================
function initDashboard() {
    allBookings = JSON.parse(localStorage.getItem("bookings_full")) || [];

    const now = new Date();
    document.getElementById("admin-today-label").textContent = now.toLocaleDateString("en-PH", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const todayStr  = now.toISOString().split("T")[0];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    document.getElementById("stat-total").textContent = allBookings.length;
    document.getElementById("stat-today").textContent = allBookings.filter(b => b.date === todayStr).length;
    document.getElementById("stat-week").textContent  = allBookings.filter(b => {
        const d = new Date(b.date + "T00:00:00");
        return d >= weekStart;
    }).length;

    renderTable();
}


// =============================================
// RENDER TABLE
// =============================================
function renderTable() {
    const fd = document.getElementById("filter-date").value;
    const ft = document.getElementById("filter-time").value;
    const fs = document.getElementById("filter-service").value;

    const filtered = allBookings.filter(b =>
        (!fd || b.date === fd) &&
        (!ft || b.time === ft) &&
        (!fs || b.service === fs)
    );

    const tbody    = document.getElementById("booking-tbody");
    const emptyMsg = document.getElementById("admin-empty");

    if (!filtered.length) {
        tbody.innerHTML        = "";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";
    tbody.innerHTML = filtered.map((b, i) => `
        <tr>
            <td class="admin-td-num">${i + 1}</td>
            <td class="admin-td-name">${b.name}</td>
            <td class="admin-td-contact">${b.contact}</td>
            <td><span class="admin-badge admin-badge-${b.service.toLowerCase()}">${b.service}</span></td>
            <td>${b.date}</td>
            <td class="admin-td-time">${b.time}</td>
            <td>
                <button class="admin-del-btn" onclick="deleteBooking('${b.date}', '${b.time}', '${b.name}')">Remove</button>
            </td>
        </tr>
    `).join("");
}


// =============================================
// DELETE BOOKING
// =============================================
function deleteBooking(date, time, name) {
    if (!confirm(`Remove booking for ${name} on ${date} at ${time}?`)) return;
    allBookings = allBookings.filter(b => !(b.date === date && b.time === time && b.name === name));
    localStorage.setItem("bookings_full", JSON.stringify(allBookings));
    initDashboard();
}


// =============================================
// CLEAR FILTERS
// =============================================
function clearFilters() {
    document.getElementById("filter-date").value    = "";
    document.getElementById("filter-time").value    = "";
    document.getElementById("filter-service").value = "";
    renderTable();
}
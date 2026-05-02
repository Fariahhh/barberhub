// =============================================
// EMAILJS CONFIG
// =============================================
const EMAILJS_PUBLIC_KEY  = "6OJdTIF2Zmqm6YITC";
const EMAILJS_SERVICE_ID  = "service_barberhub";
const EMAILJS_TEMPLATE_ID = "template_26cuk9h";
const ADMIN_EMAIL         = "genesismarky@gmail.com";

emailjs.init(EMAILJS_PUBLIC_KEY);


// =============================================
// BOOKING DATA
// =============================================
const times = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

function getBookings() {
    return JSON.parse(localStorage.getItem("bookings_full")) || [];
}

function saveBookings(bookings) {
    localStorage.setItem("bookings_full", JSON.stringify(bookings));
}


// =============================================
// BOOKING FORM INIT
// =============================================
function initBooking() {
    const timeSelect = document.getElementById("time");
    const dateInput  = document.getElementById("date");
    const today      = new Date().toISOString().split("T")[0];

    if (dateInput) {
        dateInput.setAttribute("min", today);
        dateInput.addEventListener("change", updateAvailableTimes);
    }

    function updateAvailableTimes() {
        timeSelect.innerHTML = "<option value=''>Select Time</option>";
        const selectedDate = dateInput.value;
        const bookings     = getBookings();

        times.forEach(t => {
            const isBooked  = bookings.some(b => b.date === selectedDate && b.time === t);
            const option    = document.createElement("option");
            option.value    = t;
            option.text     = isBooked ? `${t} (Full)` : t;
            option.disabled = isBooked;
            timeSelect.add(option);
        });
    }
}


// =============================================
// BOOK FUNCTION
// =============================================
function book() {
    const name    = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const service = document.getElementById("service").value;
    const date    = document.getElementById("date").value;
    const time    = document.getElementById("time").value;

    if (!name || !contact || !service || !date || !time) {
        alert("Please fill in all details.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
        alert("Please enter a valid email address.");
        return;
    }

    const bookings   = getBookings();
    const newBooking = { name, contact, service, date, time };
    bookings.push(newBooking);
    saveBookings(bookings);

    document.getElementById("conf-details").innerHTML =
        `<strong>${name}</strong>, your seat is reserved for<br><span style="color: gold;">${date} at ${time}</span>`;
    document.getElementById("conf-service").innerText = service;
    document.getElementById("confirmation-overlay").style.display = "flex";

    setBookingStatus("Sending confirmation email...");
    sendEmails(name, contact, service, date, time);
}


// =============================================
// EMAILJS — SEND CLIENT + ADMIN EMAILS
// =============================================
function sendEmails(name, contact, service, date, time) {
    const clientParams = {
        to_email:     contact,
        to_name:      name,
        service_type: service,
        date:         date,
        time:         time,
        reply_to:     ADMIN_EMAIL,
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, clientParams)
        .then(() => {
            const adminParams = {
                to_email:     ADMIN_EMAIL,
                to_name:      "Winsan",
                service_type: service,
                date:         date,
                time:         time,
                client_name:  name,
                client_email: contact,
                reply_to:     contact,
            };
            return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, adminParams);
        })
        .then(() => {
            setBookingStatus("Confirmation sent to your email!");
        })
        .catch(err => {
            console.error("EmailJS error:", err);
            setBookingStatus("Booking saved, but email could not be sent.");
        });
}

function setBookingStatus(msg) {
    const el = document.getElementById("booking-status");
    if (el) {
        el.textContent   = msg;
        el.style.display = "block";
    }
}


// =============================================
// MODAL
// =============================================
function closeModal() {
    document.getElementById("confirmation-overlay").style.display = "none";
    location.reload();
}


// =============================================
// STAR RATING
// =============================================
let rating = 0;

function rate(num) {
    rating = num;
    document.querySelectorAll(".star").forEach((s, i) => {
        s.style.color = (i < num) ? "#D4AF37" : "#333";
    });
}


// =============================================
// FEEDBACK / REVIEWS
// =============================================
function submitFeedback() {
    const comment = document.getElementById("comment").value.trim();
    if (!comment || rating === 0) {
        alert("Please leave a rating and a comment.");
        return;
    }

    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.unshift({ rating, comment });
    localStorage.setItem("reviews", JSON.stringify(reviews));

    document.getElementById("comment").value = "";
    rate(0);
    displayReviews();
}

function displayReviews() {
    const reviews   = JSON.parse(localStorage.getItem("reviews")) || [];
    const container = document.getElementById("reviews");
    if (container) {
        container.innerHTML = reviews.map(r => `
            <div style="background: #111; padding: 20px; margin-bottom: 15px; border-left: 3px solid #D4AF37;">
                <div style="color: gold;">${"★".repeat(r.rating)}</div>
                <p style="margin: 5px 0 0 0;">${r.comment}</p>
            </div>
        `).join("");
    }
}


// =============================================
// SCROLL HELPER
// =============================================
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}


// =============================================
// INIT
// =============================================
window.onload = () => {
    initBooking();
    displayReviews();
};
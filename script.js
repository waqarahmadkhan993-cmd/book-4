
const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("open", !isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Service filtering
const filter = document.querySelector("#service-filter");
const cards = [...document.querySelectorAll(".service-card")];
const filterStatus = document.querySelector("#filter-status");

function filterServices() {
  let visibleCount = 0;

  cards.forEach((card) => {
    const matches =
      filter.value === "all" ||
      card.dataset.category === filter.value;

    card.hidden = !matches;

    if (matches) visibleCount++;
  });

  filterStatus.textContent =
    visibleCount === 0
      ? "No services found."
      : `${visibleCount} service${visibleCount === 1 ? "" : "s"} available.`;
}

filter.addEventListener("change", filterServices);
filterServices();

// Select a service from its card
const serviceSelect = document.querySelector("#service");

document.querySelectorAll(".choose-service").forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    document.querySelector("#booking").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });
    serviceSelect.focus({ preventScroll: true });
  });
});

// Set the earliest booking date to today
const dateInput = document.querySelector("#date");

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

dateInput.min = getLocalDate();

const form = document.querySelector("#booking-form");
const confirmation = document.querySelector("#confirmation");
const confirmationMessage = document.querySelector("#confirmation-message");
const newBookingButton = document.querySelector("#new-booking");

const fields = {
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  phone: document.querySelector("#phone"),
  service: serviceSelect,
  date: dateInput,
  time: document.querySelector("#time")
};

const errors = {
  name: document.querySelector("#name-error"),
  email: document.querySelector("#email-error"),
  phone: document.querySelector("#phone-error"),
  service: document.querySelector("#service-error"),
  date: document.querySelector("#date-error"),
  time: document.querySelector("#time-error")
};

function getError(field, value) {
  if (!value.trim()) {
    return "This field is required.";
  }

  if (field === "name" && value.trim().length < 2) {
    return "Please enter at least 2 characters.";
  }

  if (field === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address.";
  }

  if (field === "phone" &&
      !/^(03\d{9}|\+923\d{9}|00923\d{9})$/.test(value.replace(/[\s-]/g, ""))) {
    return "Enter a valid Pakistani mobile number.";
  }

  if (field === "date" &&
      (value < getLocalDate() || Number.isNaN(Date.parse(value)))) {
    return "Choose today or a future date.";
  }

  return "";
}

function validateField(fieldName) {
  const field = fields[fieldName];
  const message = getError(fieldName, field.value);
  errors[fieldName].textContent = message;

  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }

  return !message;
}

// Validate fields as the user edits them
Object.keys(fields).forEach((fieldName) => {
  fields[fieldName].addEventListener("blur", () => {
    validateField(fieldName);
  });

  fields[fieldName].addEventListener("input", () => {
    if (fields[fieldName].getAttribute("aria-invalid") === "true") {
      validateField(fieldName);
    }
  });

  fields[fieldName].addEventListener("change", () => {
    if (fields[fieldName].getAttribute("aria-invalid") === "true") {
      validateField(fieldName);
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fieldNames = Object.keys(fields);
  const allValid = fieldNames
    .map(validateField)
    .every(Boolean);

  if (!allValid) {
    const firstInvalid = fieldNames.find(
      (fieldName) =>
        fields[fieldName].getAttribute("aria-invalid") === "true"
    );

    fields[firstInvalid].focus();
    return;
  }

  const name = fields.name.value.trim();
  const service = fields.service.value;
  const date = fields.date.value;
  const time = fields.time.value;

  confirmationMessage.textContent =
    `Thank you, ${name}. Your ${service} request is recorded for ` +
    `${date} at ${time} in this demo.`;

  form.hidden = true;
  confirmation.hidden = false;
  confirmation.focus();
});

newBookingButton.addEventListener("click", () => {
  form.reset();

  Object.keys(fields).forEach((fieldName) => {
    fields[fieldName].removeAttribute("aria-invalid");
    errors[fieldName].textContent = "";
  });

  dateInput.min = getLocalDate();
  confirmation.hidden = true;
  form.hidden = false;
  document.querySelector("#name").focus();
});

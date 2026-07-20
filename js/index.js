var STORAGE_KEY = "contactHubContacts";
var contacts = loadContacts();
var editingId = null;
var tempPhoto = null;

function loadContacts() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Couldn't load contacts:", error);
    return [];
  }
}

function saveContacts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error("Couldn't save contacts:", error);
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

var addContactBtn = document.getElementById("addContactBtn");
var modalOverlay = document.getElementById("contactModalOverlay");
var closeModalBtn = document.getElementById("closeModalBtn");
var cancelBtn = document.getElementById("cancelBtn");
var saveContactBtn = document.getElementById("saveContactBtn");
var modalTitle = document.getElementById("modalTitle");
var contactForm = document.getElementById("contactForm");

var contactIdInput = document.getElementById("contactId");
var fullNameInput = document.getElementById("fullName");
var phoneNumberInput = document.getElementById("phoneNumber");
var emailInput = document.getElementById("email");
var addressInput = document.getElementById("address");
var groupInput = document.getElementById("group");
var notesInput = document.getElementById("notes");
var isFavoriteInput = document.getElementById("isFavorite");
var isEmergencyInput = document.getElementById("isEmergency");
var photoInput = document.getElementById("photoInput");
var avatarPreview = document.getElementById("avatarPreview");

var searchInput = document.getElementById("searchInput");
var contactsList = document.getElementById("contactsList");
var emptyState = document.getElementById("emptyState");
var emptyTitle = document.getElementById("emptyTitle");
var emptySubtitle = document.getElementById("emptySubtitle");

var totalCount = document.getElementById("totalCount");
var favoritesCount = document.getElementById("favoritesCount");
var emergencyCount = document.getElementById("emergencyCount");
var subtitleText = document.getElementById("subtitleText");

var favoritesBody = document.getElementById("favoritesBody");
var emergencyBody = document.getElementById("emergencyBody");

// View contact modal
var viewModalOverlay = document.getElementById("viewContactModalOverlay");
var viewModalBody = document.getElementById("viewContactBody");
var closeViewModalBtn = document.getElementById("closeViewModalBtn");
var viewEditBtn = document.getElementById("viewEditBtn");
var currentViewId = null;

var nameRegex = /^[A-Za-z\u0600-\u06FF\s]{2,50}$/;
var phoneRegex = /^(01[0125]\d{8}|\+201[0125]\d{8})$/;
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var AVATAR_COLORS = [
  "#5538f8", "#f43f5e", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

function stringToColor(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function showAlert(icon, title, text) {
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonColor: "#5538f8",
  });
}

function showToast(icon, title, text) {
  return Swal.fire({
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 1500,
    confirmButtonColor: "#5538f8",
  });
}

function openModal(mode = "add", contact = null) {
  resetForm();

  if (mode === "edit" && contact) {
    modalTitle.textContent = "Edit Contact";
    editingId = contact.id;

    contactIdInput.value = contact.id;
    fullNameInput.value = contact.name;
    phoneNumberInput.value = contact.phone;
    emailInput.value = contact.email || "";
    addressInput.value = contact.address || "";
    groupInput.value = contact.group || "";
    notesInput.value = contact.notes || "";
    isFavoriteInput.checked = contact.isFavorite;
    isEmergencyInput.checked = contact.isEmergency;

    tempPhoto = contact.photo || null;
    if (tempPhoto) {
      avatarPreview.innerHTML = `<img src="${tempPhoto}" alt="avatar" />`;
    }
  } else {
    modalTitle.textContent = "Add New Contact";
    editingId = null;
  }

  modalOverlay.classList.add("show");
}

function closeModal() {
  modalOverlay.classList.remove("show");
  resetForm();
}

function resetForm() {
  contactForm.reset();
  avatarPreview.innerHTML = `<i class="fa-solid fa-user"></i>`;
  tempPhoto = null;
  editingId = null;
  photoInput.value = "";
  clearFieldError(fullNameInput);
  clearFieldError(phoneNumberInput);
  clearFieldError(emailInput);
}

addContactBtn.addEventListener("click", () => openModal("add"));
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});


document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (modalOverlay.classList.contains("show")) closeModal();
    if (viewModalOverlay && viewModalOverlay.classList.contains("show")) closeViewModal();
  }
});


contactForm.addEventListener("submit", function (e) {
  e.preventDefault();
  saveContactBtn.click();
});

photoInput.addEventListener("change", (e) => {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = (event) => {
    tempPhoto = event.target.result;
    avatarPreview.innerHTML = `<img src="${tempPhoto}" alt="avatar" />`;
  };
  reader.readAsDataURL(file);
});


function setFieldError(input) {
  input.classList.add("is-invalid");
}
function clearFieldError(input) {
  input.classList.remove("is-invalid");
}

fullNameInput.addEventListener("input", () => {
  var name = fullNameInput.value.replace(/\s+/g, " ").trim();
  if (!name || !nameRegex.test(name)) setFieldError(fullNameInput);
  else clearFieldError(fullNameInput);
});

phoneNumberInput.addEventListener("input", () => {

    var cleaned = phoneNumberInput.value.replace(/\s/g, "");
  if (cleaned !== phoneNumberInput.value) phoneNumberInput.value = cleaned;

  if (!cleaned || !phoneRegex.test(cleaned)) setFieldError(phoneNumberInput);
  else clearFieldError(phoneNumberInput);
});

emailInput.addEventListener("input", () => {
  var email = emailInput.value.trim();
  if (email && !emailRegex.test(email)) setFieldError(emailInput);
  else clearFieldError(emailInput);
});

saveContactBtn.addEventListener("click", () => {

    var name = fullNameInput.value.replace(/\s+/g, " ").trim();


  var phone = phoneNumberInput.value.replace(/\s/g, "");
  var email = emailInput.value.trim();

  if (!name || !nameRegex.test(name)) {
    setFieldError(fullNameInput);
    showAlert(
      "error",
      "Invalid Name",
      "Name should contain only letters and spaces (2-50 characters)",
    );
    fullNameInput.focus();
    return;
  }

  if (!phone || !phoneRegex.test(phone)) {
    setFieldError(phoneNumberInput);
    showAlert(
      "error",
      "Invalid Phone",
      "Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678).",
    );
    phoneNumberInput.focus();
    return;
  }

  if (email && !emailRegex.test(email)) {
    setFieldError(emailInput);
    showAlert(
      "error",
      "Invalid Email",
      "Please enter a valid email address (e.g., name@example.com).",
    );
    emailInput.focus();
    return;
  }

  var duplicatePhone = contacts.find(
    (c) => c.phone === phone && c.id !== editingId,
  );
  if (duplicatePhone) {
    showAlert(
      "error",
      "Duplicate Phone Number",
      `A contact with this phone number already exists: ${duplicatePhone.name}`,
    );
    phoneNumberInput.focus();
    return;
  }

  if (email) {
    var duplicateEmail = contacts.find(
      (c) =>
        c.email &&
        c.email.toLowerCase() === email.toLowerCase() &&
        c.id !== editingId,
    );
    if (duplicateEmail) {
      showAlert(
        "error",
        "Duplicate Email",
        `A contact with this email already exists: ${duplicateEmail.name}`,
      );
      emailInput.focus();
      return;
    }
  }

  var contactData = {
    id: editingId || Date.now().toString(),
    name,
    phone,
    email,
    address: addressInput.value.trim(),
    group: groupInput.value,
    notes: notesInput.value.trim(),
    isFavorite: isFavoriteInput.checked,
    isEmergency: isEmergencyInput.checked,
    photo: tempPhoto,
  };

  if (editingId) {
    var index = contacts.findIndex((c) => c.id === editingId);
    // fix: guard against findIndex returning -1 (would silently corrupt the array)
    if (index !== -1) {
      contacts[index] = contactData;
    } else {
      contacts.push(contactData);
    }
    showToast("success", "Updated!", "Contact has been updated successfully.");
  } else {
    contacts.push(contactData);
    showToast("success", "Added!", "Contact has been added successfully.");
  }

  saveContacts();
  closeModal();
  renderAll();
});

function deleteContact(id) {
  var contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  Swal.fire({
    icon: "warning",
    title: "Delete Contact?",
    text: `Are you sure you want to delete ${contact.name}? This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
  }).then((result) => {
    if (!result.isConfirmed) return;

    contacts = contacts.filter((c) => c.id !== id);
    saveContacts();
    renderAll();
    showToast("success", "Deleted!", "Contact has been deleted.");
  });
}

function toggleFavorite(id) {
  var contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  contact.isFavorite = !contact.isFavorite;
  saveContacts();
  renderAll();
}

function toggleEmergency(id) {
  var contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  contact.isEmergency = !contact.isEmergency;
  saveContacts();
  renderAll();
}

function editContact(id) {
  var contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  closeViewModal();
  openModal("edit", contact);
}


function viewContact(id) {
  var contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  currentViewId = id;

  var avatarStyle = contact.photo ? "" : `style="background:${stringToColor(contact.name)}"`;
  var avatarContent = contact.photo
    ? `<img src="${contact.photo}" alt="${escapeHTML(contact.name)}" />`
    : escapeHTML(getInitial(contact.name));

  viewModalBody.innerHTML = `
    <div class="view-avatar-wrapper">
      <div class="contact-avatar view-avatar" ${avatarStyle}>${avatarContent}</div>
    </div>
    <h4 class="view-name">${escapeHTML(contact.name)}</h4>
    <div class="contact-tags view-tags">
      ${contact.group ? `<span class="tag-group">${escapeHTML(contact.group)}</span>` : ""}
      ${contact.isFavorite ? `<span class="tag-emergency" style="background:#fef3c7;color:#92400e;"><i class="fa-solid fa-star"></i> Favorite</span>` : ""}
      ${contact.isEmergency ? `<span class="tag-emergency"><i class="fa-solid fa-heart"></i> Emergency</span>` : ""}
    </div>
    <div class="contact-detail-row">
      <div class="detail-icon-box icon-phone"><i class="fa-solid fa-phone"></i></div>
      <span>${escapeHTML(contact.phone)}</span>
    </div>
    ${contact.email ? `
    <div class="contact-detail-row">
      <div class="detail-icon-box icon-email"><i class="fa-solid fa-envelope"></i></div>
      <span>${escapeHTML(contact.email)}</span>
    </div>` : ""}
    ${contact.address ? `
    <div class="contact-detail-row">
      <div class="detail-icon-box icon-address"><i class="fa-solid fa-location-dot"></i></div>
      <span>${escapeHTML(contact.address)}</span>
    </div>` : ""}
    ${contact.notes ? `
    <div class="view-notes">
      <p class="view-notes-label">Notes</p>
      <p class="view-notes-text">${escapeHTML(contact.notes)}</p>
    </div>` : ""}
  `;

  viewModalOverlay.classList.add("show");
}

function closeViewModal() {
  viewModalOverlay.classList.remove("show");
  currentViewId = null;
}

if (closeViewModalBtn) closeViewModalBtn.addEventListener("click", closeViewModal);
if (viewModalOverlay) {
  viewModalOverlay.addEventListener("click", (e) => {
    if (e.target === viewModalOverlay) closeViewModal();
  });
}
if (viewEditBtn) {
  viewEditBtn.addEventListener("click", () => {
    if (currentViewId) editContact(currentViewId);
  });
}


contactsList.addEventListener("click", (e) => {
  if (e.target.closest(".contact-actions")) return;
  var card = e.target.closest(".contact-card");
  if (!card) return;
  viewContact(card.getAttribute("data-id"));
});

searchInput.addEventListener("input", () => {
  renderAll();
});

function getFilteredContacts(query = "") {


    query = query.trim().toLowerCase();
  if (!query) return contacts;

  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)),
  );
}

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}


function sortContacts() {
  contacts.sort((a, b) => {
    if (b.isFavorite !== a.isFavorite) return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
    if (b.isEmergency !== a.isEmergency) return (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0);
    return a.name.localeCompare(b.name);
  });
}

function createContactCardHTML(contact) {
  var avatarStyle = contact.photo ? "" : `style="background:${stringToColor(contact.name)}"`;



  var avatarContent = contact.photo
    ? `<img src="${contact.photo}" alt="${escapeHTML(contact.name)}" />`
    : escapeHTML(getInitial(contact.name));

  return `
    <div class="contact-card" data-id="${contact.id}">
      <div class="contact-card-top">
        <div class="contact-avatar-wrapper">
          <div class="contact-avatar" ${avatarStyle}>${avatarContent}</div>
          ${contact.isFavorite ? `<div class="badge-icon badge-favorite"><i class="fa-solid fa-star"></i></div>` : ""}
          ${contact.isEmergency ? `<div class="badge-icon badge-emergency"><i class="fa-solid fa-heart"></i></div>` : ""}
        </div>
        <div class="flex-grow-1">
          <p class="contact-name">${escapeHTML(contact.name)}</p>
          <div class="contact-detail-row mb-0">
            <div class="detail-icon-box icon-phone"><i class="fa-solid fa-phone"></i></div>
            <span>${escapeHTML(contact.phone)}</span>
          </div>
        </div>
      </div>

      ${
        contact.email
          ? `<div class="contact-detail-row">
              <div class="detail-icon-box icon-email"><i class="fa-solid fa-envelope"></i></div>
              <span>${escapeHTML(contact.email)}</span>
            </div>`
          : ""
      }

      ${
        contact.address
          ? `<div class="contact-detail-row">
              <div class="detail-icon-box icon-address"><i class="fa-solid fa-location-dot"></i></div>
              <span>${escapeHTML(contact.address)}</span>
            </div>`
          : ""
      }

      <div class="contact-tags">
        ${contact.group ? `<span class="tag-group">${escapeHTML(contact.group)}</span>` : ""}
        ${contact.isEmergency ? `<span class="tag-emergency"><i class="fa-solid fa-heart"></i> Emergency</span>` : ""}
      </div>

      <div class="contact-actions">
        <div class="contact-actions-left">
          <button class="action-btn action-call" title="Call" onclick="window.location.href='tel:${contact.phone}'">
            <i class="fa-solid fa-phone"></i>
          </button>
          ${
            contact.email
              ? `<button class="action-btn action-email" title="Email" onclick="window.location.href='mailto:${contact.email}'">
                  <i class="fa-solid fa-envelope"></i>
                </button>`
              : ""
          }
        </div>
        <div class="contact-actions-right">
          <button class="action-btn action-fav ${contact.isFavorite ? "active" : ""}" onclick="toggleFavorite('${contact.id}')" title="Favorite">
            <i class="fa-solid fa-star"></i>
          </button>
          <button class="action-btn action-emergency ${contact.isEmergency ? "active" : ""}" onclick="toggleEmergency('${contact.id}')" title="Emergency">
            <i class="fa-solid fa-heart"></i>
          </button>
          <button class="action-btn action-edit" onclick="editContact('${contact.id}')" title="Edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn action-delete" onclick="deleteContact('${contact.id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderContactsList(query = "") {
  var filtered = getFilteredContacts(query);

  if (filtered.length === 0) {
    contactsList.innerHTML = "";
    emptyState.style.display = "flex";
    

    if (query.trim()) {
      emptyTitle.textContent = "No contacts match your search";
      emptySubtitle.textContent = "Try a different name, phone, or email.";
    } else {
      emptyTitle.textContent = "No contacts found";
      emptySubtitle.textContent = 'Click "Add Contact" to get started';
    }
    return;
  }

  emptyState.style.display = "none";
  contactsList.innerHTML = filtered.map(createContactCardHTML).join("");
  return filtered.length;
}

function createMiniRowHTML(contact, listType) {
  var avatarStyle = contact.photo ? "" : `style="background:${stringToColor(contact.name)}"`;
  var avatarContent = contact.photo
    ? `<img src="${contact.photo}" alt="${escapeHTML(contact.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />`
    : escapeHTML(getInitial(contact.name));



    var callBtnClass = listType === "emergency" ? "mini-call-emergency" : "mini-call-favorites";

  return `
    <div class="mini-contact-row">
      <div class="mini-contact-left">
        <div class="mini-avatar" ${avatarStyle}>${avatarContent}</div>
        <div>
          <p class="mini-contact-name">${escapeHTML(contact.name)}</p>
          <p class="mini-contact-phone">${escapeHTML(contact.phone)}</p>
        </div>
      </div>
      <button class="mini-call-btn ${callBtnClass}" onclick="window.location.href='tel:${contact.phone}'">
        <i class="fa-solid fa-phone"></i>
      </button>
    </div>
  `;
}

function renderSidePanels() {
  var favs = contacts.filter((c) => c.isFavorite);
  var emergencies = contacts.filter((c) => c.isEmergency);

  favoritesBody.innerHTML = favs.length
    ? favs.map((c) => createMiniRowHTML(c, "favorite")).join("")
    : `<p class="empty-text">No favorites yet</p>`;

  emergencyBody.innerHTML = emergencies.length
    ? emergencies.map((c) => createMiniRowHTML(c, "emergency")).join("")
    : `<p class="empty-text">No emergency contacts</p>`;
}

function renderCounters(shownCount) {
  totalCount.textContent = contacts.length;
  favoritesCount.textContent = contacts.filter((c) => c.isFavorite).length;
  emergencyCount.textContent = contacts.filter((c) => c.isEmergency).length;



  var query = searchInput.value.trim();
  if (query) {
    subtitleText.innerHTML = `Showing <b>${shownCount}</b> of <b>${contacts.length}</b> contacts`;
  } else {
    subtitleText.innerHTML = `Manage and organize your <b>${contacts.length}</b> contacts`;
  }
}

function renderAll() {
  sortContacts();
  var query = searchInput.value.trim().toLowerCase();
  var shownCount = renderContactsList(query);
  if (shownCount === undefined) shownCount = 0;
  renderSidePanels();
  renderCounters(shownCount);
}

renderAll();
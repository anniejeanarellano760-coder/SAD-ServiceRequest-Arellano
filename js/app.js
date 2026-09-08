const TABLE = "service_requests";

let currentUser = null;
let allRequests = [];   
let editingId = null;   
let pendingDeleteId = null;

const els = {
  userEmail: document.getElementById("user-email"),
  logoutBtn: document.getElementById("logout-btn"),

  totalCount: document.getElementById("stat-total"),
  pendingCount: document.getElementById("stat-pending"),
  inProgressCount: document.getElementById("stat-inprogress"),
  completedCount: document.getElementById("stat-completed"),

  searchInput: document.getElementById("search-input"),
  statusFilter: document.getElementById("status-filter"),
  priorityFilter: document.getElementById("priority-filter"),

  newRequestBtn: document.getElementById("new-request-btn"),
  tableBody: document.getElementById("requests-tbody"),
  emptyState: document.getElementById("empty-state"),

 
  modal: document.getElementById("request-modal"),
  modalTitle: document.getElementById("modal-title"),
  form: document.getElementById("request-form"),
  fRequester: document.getElementById("f-requester"),
  fDepartment: document.getElementById("f-department"),
  fCategory: document.getElementById("f-category"),
  fDescription: document.getElementById("f-description"),
  fPriority: document.getElementById("f-priority"),
  fStatus: document.getElementById("f-status"),
  fStatusRow: document.getElementById("f-status-row"),
  formError: document.getElementById("form-error"),
  cancelBtn: document.getElementById("cancel-btn"),


  confirmModal: document.getElementById("confirm-modal"),
  confirmYes: document.getElementById("confirm-yes"),
  confirmNo: document.getElementById("confirm-no"),

 
  analyticsCategory: document.getElementById("analytics-category"),
  analyticsPriority: document.getElementById("analytics-priority"),
};

(async function init() {
  currentUser = await requireSession();
  if (!currentUser) return; 

  els.userEmail.textContent = currentUser.email;
  els.logoutBtn.addEventListener("click", logoutUser);

  await loadRequests();

  els.searchInput.addEventListener("input", renderTable);
  els.statusFilter.addEventListener("change", renderTable);
  els.priorityFilter.addEventListener("change", renderTable);

  els.newRequestBtn.addEventListener("click", () => openModal());
  els.cancelBtn.addEventListener("click", closeModal);
  els.form.addEventListener("submit", handleFormSubmit);

  els.confirmNo.addEventListener("click", closeConfirm);
  els.confirmYes.addEventListener("click", handleConfirmedDelete);
})();

async function loadRequests() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    alert("Could not load requests: " + error.message);
    return;
  }

  allRequests = data || [];
  renderDashboard();
  renderTable();
  renderAnalytics();
}

function renderDashboard() {
  const total = allRequests.length;
  const pending = allRequests.filter((r) => r.status === "Pending").length;
  const inProgress = allRequests.filter((r) => r.status === "In Progress").length;
  const completed = allRequests.filter((r) => r.status === "Completed").length;

  els.totalCount.textContent = total;
  els.pendingCount.textContent = pending;
  els.inProgressCount.textContent = inProgress;
  els.completedCount.textContent = completed;
}

function renderAnalytics() {
  if (!els.analyticsCategory || !els.analyticsPriority) return;

  const byCategory = {};
  const byPriority = {};

  allRequests.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
  });

  els.analyticsCategory.innerHTML = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<li><span>${escapeHtml(k)}</span><strong>${v}</strong></li>`)
    .join("") || "<li><span>No data</span></li>";

  els.analyticsPriority.innerHTML = Object.entries(byPriority)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<li><span>${escapeHtml(k)}</span><strong>${v}</strong></li>`)
    .join("") || "<li><span>No data</span></li>";
}

function renderTable() {
  const term = els.searchInput.value.trim().toLowerCase();
  const statusVal = els.statusFilter.value;
  const priorityVal = els.priorityFilter.value;

  const filtered = allRequests.filter((r) => {
    const matchesSearch =
      !term ||
      r.requester_name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term);

    const matchesStatus = statusVal === "All" || r.status === statusVal;
    const matchesPriority = priorityVal === "All" || r.priority === priorityVal;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  els.tableBody.innerHTML = "";
  els.emptyState.style.display = filtered.length ? "none" : "block";

  filtered.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${escapeHtml(r.requester_name)}</td>
      <td>${escapeHtml(r.department)}</td>
      <td>${escapeHtml(r.category)}</td>
      <td><span class="badge badge-priority-${slug(r.priority)}">${r.priority}</span></td>
      <td><span class="badge badge-status-${slug(r.status)}">${r.status}</span></td>
      <td>${formatDate(r.created_at)}</td>
      <td class="actions-cell">
        <button class="btn-link" data-action="edit" data-id="${r.id}">Edit</button>
        <button class="btn-link btn-danger" data-action="delete" data-id="${r.id}">Delete</button>
      </td>
    `;
    els.tableBody.appendChild(tr);
  });

  els.tableBody.querySelectorAll("[data-action='edit']").forEach((btn) =>
    btn.addEventListener("click", () => openModal(Number(btn.dataset.id)))
  );
  els.tableBody.querySelectorAll("[data-action='delete']").forEach((btn) =>
    btn.addEventListener("click", () => openConfirm(Number(btn.dataset.id)))
  );
}

function openModal(id = null) {
  editingId = id;
  els.form.reset();
  els.formError.textContent = "";

  if (id) {
    const record = allRequests.find((r) => r.id === id);
    els.modalTitle.textContent = "Edit Request";
    els.fRequester.value = record.requester_name;
    els.fDepartment.value = record.department;
    els.fCategory.value = record.category;
    els.fDescription.value = record.description;
    els.fPriority.value = record.priority;
    els.fStatus.value = record.status;
    els.fStatusRow.style.display = "block"; 
  } else {
    els.modalTitle.textContent = "New Service Request";
    els.fStatusRow.style.display = "none"; 
  }

  els.modal.classList.add("open");
}

function closeModal() {
  els.modal.classList.remove("open");
  editingId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const requester_name = els.fRequester.value.trim();
  const department = els.fDepartment.value.trim();
  const category = els.fCategory.value;
  const description = els.fDescription.value.trim();
  const priority = els.fPriority.value;

  const errors = [];
  if (!requester_name) errors.push("Requester name cannot be empty."); 
  if (!department) errors.push("Department must be provided.");        
  if (!category) errors.push("Category must be selected.");          
  if (!description || description.length < 10)
    errors.push("Description must contain sufficient information (min 10 characters)."); 
  if (!["Low", "Medium", "High"].includes(priority))
    errors.push("Priority must be Low, Medium, or High.");

  if (errors.length) {
    els.formError.textContent = errors.join(" ");
    return;
  }

  if (editingId) {

    const status = els.fStatus.value;
    const { error } = await supabaseClient
      .from(TABLE)
      .update({ requester_name, department, category, description, priority, status })
      .eq("id", editingId);

    if (error) {
      els.formError.textContent = error.message;
      return;
    }
  } else {

    const { error } = await supabaseClient.from(TABLE).insert([
      {
        requester_name,
        department,
        category,
        description,
        priority,
        status: "Pending",
        user_id: currentUser.id,
      },
    ]);

    if (error) {
      els.formError.textContent = error.message;
      return;
    }
  }

  closeModal();
  await loadRequests();
}

function openConfirm(id) {
  pendingDeleteId = id;
  els.confirmModal.classList.add("open");
}

function closeConfirm() {
  pendingDeleteId = null;
  els.confirmModal.classList.remove("open");
}

async function handleConfirmedDelete() {
  if (!pendingDeleteId) return;

  const { error } = await supabaseClient
    .from(TABLE)
    .delete()
    .eq("id", pendingDeleteId);

  closeConfirm();

  if (error) {
    alert("Could not delete record: " + error.message);
    return;
  }

  await loadRequests();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function slug(str) {
  return (str || "").toLowerCase().replace(/\s+/g, "-");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
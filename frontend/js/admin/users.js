/**
 * ADMIN USER MANAGEMENT LOGIC
 * Online Event Management System
 */

let allUsersList = [];
let deleteTargetId = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    loadUsers();

    // Filters event listeners
    document.getElementById("user-search-input").addEventListener("input", debounce(loadUsers, 300));
    document.getElementById("user-role-filter").addEventListener("change", loadUsers);
    document.getElementById("user-status-filter").addEventListener("change", loadUsers);
    document.getElementById("filter-reset-btn").addEventListener("click", () => {
        document.getElementById("user-search-input").value = "";
        document.getElementById("user-role-filter").value = "ALL";
        document.getElementById("user-status-filter").value = "ALL";
        loadUsers();
    });

    // Form submit
    document.getElementById("user-form").addEventListener("submit", handleSaveUser);
    document.getElementById("confirm-delete-btn").addEventListener("click", handleConfirmDelete);
});

async function loadUsers() {
    const container = document.getElementById("users-table-container");
    UI.showLoading(container, "Loading user accounts...");

    const search = document.getElementById("user-search-input").value.trim();
    const role = document.getElementById("user-role-filter").value;
    const status = document.getElementById("user-status-filter").value;

    try {
        const res = await API.getUsers({ search, role, status });
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No users found", "Try clearing filters or search terms.", "fa-user-slash");
            return;
        }

        allUsersList = res.data;

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        allUsersList.forEach(u => {
            let roleBadge = "bg-secondary";
            if (u.role === "ADMIN") roleBadge = "bg-primary";
            else if (u.role === "ORGANIZER") roleBadge = "bg-info text-dark";
            else if (u.role === "ATTENDEE") roleBadge = "bg-dark";

            html += `
                <tr>
                    <td class="fw-semibold">#${u.id}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="sidebar-user-avatar bg-primary" style="width:32px;height:32px;font-size:0.75rem">
                                ${u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span class="fw-semibold">${Utils.escapeHtml(u.name)}</span>
                        </div>
                    </td>
                    <td>${Utils.escapeHtml(u.email)}</td>
                    <td><span class="badge ${roleBadge}">${u.role}</span></td>
                    <td>${Utils.getStatusBadgeHtml(u.status)}</td>
                    <td class="small text-muted">${Utils.formatDate(u.created_at)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="prepareEditUser(${u.id})" title="Edit User">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="prepareDeleteUser(${u.id}, '${Utils.escapeHtml(u.name)}')" title="Delete User">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Failed to load users: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function prepareAddUser() {
    document.getElementById("userModalTitle").textContent = "Add New User";
    document.getElementById("user-form").reset();
    document.getElementById("user-form").classList.remove("was-validated");
    document.getElementById("modal-user-id").value = "";
    document.getElementById("modal-user-pwd").setAttribute("required", "true");
}

function prepareEditUser(id) {
    const u = allUsersList.find(x => x.id == id);
    if (!u) return;

    document.getElementById("userModalTitle").textContent = "Edit User #" + u.id;
    document.getElementById("user-form").classList.remove("was-validated");
    document.getElementById("modal-user-id").value = u.id;
    document.getElementById("modal-user-name").value = u.name;
    document.getElementById("modal-user-email").value = u.email;
    document.getElementById("modal-user-role").value = u.role;
    document.getElementById("modal-user-status").value = u.status;
    document.getElementById("modal-user-pwd").removeAttribute("required");

    const modal = new bootstrap.Modal(document.getElementById("userModal"));
    modal.show();
}

async function handleSaveUser(e) {
    e.preventDefault();
    const form = document.getElementById("user-form");
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    const id = document.getElementById("modal-user-id").value;
    const name = document.getElementById("modal-user-name").value.trim();
    const email = document.getElementById("modal-user-email").value.trim();
    const role = document.getElementById("modal-user-role").value;
    const status = document.getElementById("modal-user-status").value;
    const password = document.getElementById("modal-user-pwd").value;

    const btn = document.getElementById("save-user-btn");
    UI.setBtnLoading(btn, true);

    try {
        let res;
        if (id) {
            const payload = { name, email, role, status };
            if (password) payload.password = password;
            res = await API.updateUser(id, payload);
        } else {
            res = await API.createUser({ name, email, role, status, password: password || "user123" });
        }

        if (res.success) {
            UI.showToast(res.message, "success");
            const modalEl = document.getElementById("userModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadUsers();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (err) {
        UI.showToast(err.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

function prepareDeleteUser(id, name) {
    deleteTargetId = id;
    document.getElementById("delete-user-name").textContent = name;
    const modal = new bootstrap.Modal(document.getElementById("deleteUserModal"));
    modal.show();
}

async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    const btn = document.getElementById("confirm-delete-btn");
    UI.setBtnLoading(btn, true);

    try {
        const res = await API.deleteUser(deleteTargetId);
        if (res.success) {
            UI.showToast("User deleted successfully.", "success");
            const modalEl = document.getElementById("deleteUserModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadUsers();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (err) {
        UI.showToast(err.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

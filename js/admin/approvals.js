/**
 * ADMIN EVENT APPROVALS LOGIC
 * Online Event Management System
 */

let currentStatusFilter = "PENDING";
let approvalsList = [];

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    loadApprovals();

    // Filter status buttons
    document.querySelectorAll(".approval-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".approval-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentStatusFilter = btn.dataset.status;
            loadApprovals();
        });
    });

    document.getElementById("approval-search-input").addEventListener("input", debounce(loadApprovals, 300));
    document.getElementById("confirm-reject-btn").addEventListener("click", handleConfirmReject);
});

async function loadApprovals() {
    const container = document.getElementById("approvals-table-container");
    UI.showLoading(container, "Loading event approvals...");

    const search = document.getElementById("approval-search-input").value.trim();

    try {
        const res = await API.getEvents({ status: currentStatusFilter, search });
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, `No ${currentStatusFilter.toLowerCase()} events`, "No event submissions match this criteria.", "fa-clipboard-check");
            return;
        }

        approvalsList = res.data;

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Event Date</th>
                        <th>Venue & City</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        approvalsList.forEach(ev => {
            html += `
                <tr>
                    <td class="fw-semibold">#${ev.id}</td>
                    <td>
                        <div class="fw-bold text-dark">${Utils.escapeHtml(ev.title)}</div>
                        <span class="small text-muted">Capacity: ${ev.capacity} seats</span>
                    </td>
                    <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(ev.category)}</span></td>
                    <td class="small">
                        <div><i class="fa-regular fa-calendar me-1"></i>${Utils.formatDate(ev.event_date)}</div>
                        <div class="text-muted"><i class="fa-regular fa-clock me-1"></i>${Utils.formatTime(ev.start_time)}</div>
                    </td>
                    <td class="small">
                        <div>${Utils.escapeHtml(ev.venue)}</div>
                        <div class="text-muted"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${Utils.escapeHtml(ev.city)}</div>
                    </td>
                    <td>${Utils.getStatusBadgeHtml(ev.status)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-1" onclick="viewEventDetails(${ev.id})" title="View Details">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
            `;

            if (ev.status === "PENDING") {
                html += `
                    <button class="btn btn-sm btn-success me-1" onclick="handleApproveEvent(${ev.id})" title="Approve Event">
                        <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="openRejectModal(${ev.id})" title="Reject Event">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                `;
            } else if (ev.status === "REJECTED") {
                html += `
                    <button class="btn btn-sm btn-outline-success" onclick="handleApproveEvent(${ev.id})" title="Re-approve Event">
                        <i class="fa-solid fa-check"></i> Approve Now
                    </button>
                `;
            }

            html += `
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Failed to load approvals: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

async function viewEventDetails(id) {
    const ev = approvalsList.find(x => x.id == id);
    if (!ev) return;

    document.getElementById("detail-event-title").textContent = ev.title;
    
    const body = document.getElementById("event-detail-modal-body");
    body.innerHTML = `
        <div class="row g-3">
            <div class="col-md-5">
                <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}" class="img-fluid rounded-3 mb-2" alt="Event Poster">
                <div class="p-2 bg-light rounded-3 text-center">
                    <span class="small text-muted d-block">Status</span>
                    ${Utils.getStatusBadgeHtml(ev.status)}
                </div>
            </div>
            <div class="col-md-7">
                <h5 class="fw-bold">${Utils.escapeHtml(ev.title)}</h5>
                <p class="text-muted small">${Utils.escapeHtml(ev.description)}</p>
                <hr>
                <div class="row g-2 small">
                    <div class="col-6"><strong>Category:</strong> ${Utils.escapeHtml(ev.category)}</div>
                    <div class="col-6"><strong>Capacity:</strong> ${ev.capacity} attendees</div>
                    <div class="col-6"><strong>Date:</strong> ${Utils.formatDate(ev.event_date)}</div>
                    <div class="col-6"><strong>Time:</strong> ${Utils.formatTime(ev.start_time)} - ${Utils.formatTime(ev.end_time)}</div>
                    <div class="col-12"><strong>Venue:</strong> ${Utils.escapeHtml(ev.venue)}, ${Utils.escapeHtml(ev.city)}</div>
                </div>
            </div>
        </div>
    `;

    const footer = document.getElementById("event-detail-modal-footer");
    if (ev.status === "PENDING") {
        footer.innerHTML = `
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-danger" onclick="openRejectModal(${ev.id})"><i class="fa-solid fa-xmark me-1"></i> Reject</button>
            <button type="button" class="btn btn-success" onclick="handleApproveEvent(${ev.id})"><i class="fa-solid fa-check me-1"></i> Approve Event</button>
        `;
    } else {
        footer.innerHTML = `<button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>`;
    }

    const modal = new bootstrap.Modal(document.getElementById("eventDetailModal"));
    modal.show();
}

async function handleApproveEvent(id) {
    try {
        const res = await API.approveEvent(id);
        if (res.success) {
            UI.showToast("Event approved successfully!", "success");
            const modalEl = document.getElementById("eventDetailModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadApprovals();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
    }
}

function openRejectModal(id) {
    document.getElementById("reject-event-id").value = id;
    document.getElementById("reject-reason-input").value = "";
    
    // Hide detail modal if open
    const detailModalEl = document.getElementById("eventDetailModal");
    const detailModal = bootstrap.Modal.getInstance(detailModalEl);
    if (detailModal) detailModal.hide();

    const modal = new bootstrap.Modal(document.getElementById("rejectReasonModal"));
    modal.show();
}

async function handleConfirmReject() {
    const id = document.getElementById("reject-event-id").value;
    const reason = document.getElementById("reject-reason-input").value.trim();

    const btn = document.getElementById("confirm-reject-btn");
    UI.setBtnLoading(btn, true);

    try {
        const res = await API.rejectEvent(id, reason);
        if (res.success) {
            UI.showToast("Event rejected.", "warning");
            const modalEl = document.getElementById("rejectReasonModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadApprovals();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
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

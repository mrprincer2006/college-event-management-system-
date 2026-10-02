/**
 * ORGANIZER EVENTS LISTING LOGIC
 * Online Event Management System
 */

let myEventsList = [];
let deleteEventTargetId = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    loadMyEvents(user.id);

    document.getElementById("org-event-search").addEventListener("input", debounce(() => loadMyEvents(user.id), 300));
    document.getElementById("org-event-status-filter").addEventListener("change", () => loadMyEvents(user.id));
    document.getElementById("org-filter-reset").addEventListener("click", () => {
        document.getElementById("org-event-search").value = "";
        document.getElementById("org-event-status-filter").value = "ALL";
        loadMyEvents(user.id);
    });

    document.getElementById("confirm-delete-event-btn").addEventListener("click", handleConfirmDeleteEvent);
});

async function loadMyEvents(organizerId) {
    const container = document.getElementById("org-events-table-container");
    UI.showLoading(container, "Loading your events...");

    const search = document.getElementById("org-event-search").value.trim();
    const status = document.getElementById("org-event-status-filter").value;

    try {
        const res = await API.getEvents({ organizer_id: organizerId, search, status });
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No events created yet", "Click 'Create New Event' to start publishing events.", "fa-calendar-plus");
            return;
        }

        myEventsList = res.data;

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                        <th>Venue & City</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        myEventsList.forEach(ev => {
            html += `
                <tr>
                    <td class="fw-semibold">#${ev.id}</td>
                    <td>
                        <div class="fw-bold text-dark">${Utils.escapeHtml(ev.title)}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(ev.category)}</span></td>
                    <td class="small">
                        <div><i class="fa-regular fa-calendar text-primary me-1"></i>${Utils.formatDate(ev.event_date)}</div>
                        <div class="text-muted"><i class="fa-regular fa-clock me-1"></i>${Utils.formatTime(ev.start_time)}</div>
                    </td>
                    <td class="small">
                        <div>${Utils.escapeHtml(ev.venue)}</div>
                        <div class="text-muted"><i class="fa-solid fa-location-dot text-danger me-1"></i>${Utils.escapeHtml(ev.city)}</div>
                    </td>
                    <td class="fw-semibold small">${ev.capacity} seats</td>
                    <td>${Utils.getStatusBadgeHtml(ev.status)}</td>
                    <td class="text-end">
                        <a href="tickets.html?eventId=${ev.id}" class="btn btn-sm btn-outline-success me-1" title="Manage Tickets"><i class="fa-solid fa-ticket"></i> Tickets</a>
                        <a href="edit-event.html?id=${ev.id}" class="btn btn-sm btn-outline-primary me-1" title="Edit Event"><i class="fa-solid fa-pen"></i></a>
                        <button class="btn btn-sm btn-outline-danger" onclick="prepareDeleteEvent(${ev.id}, '${Utils.escapeHtml(ev.title)}')" title="Delete Event"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Failed to load events: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function prepareDeleteEvent(id, name) {
    deleteEventTargetId = id;
    document.getElementById("delete-event-name").textContent = name;
    const modal = new bootstrap.Modal(document.getElementById("deleteEventModal"));
    modal.show();
}

async function handleConfirmDeleteEvent() {
    if (!deleteEventTargetId) return;
    const btn = document.getElementById("confirm-delete-event-btn");
    UI.setBtnLoading(btn, true);

    try {
        const res = await API.deleteEvent(deleteEventTargetId);
        if (res.success) {
            UI.showToast("Event deleted successfully.", "success");
            const modalEl = document.getElementById("deleteEventModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            const user = Auth.getCurrentUser();
            if (user) loadMyEvents(user.id);
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

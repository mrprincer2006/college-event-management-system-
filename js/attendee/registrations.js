/**
 * ATTENDEE REGISTRATIONS HISTORY LOGIC
 * Online Event Management System
 */

let allRegistrations = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    loadRegistrations(user.id);

    document.getElementById("reg-search-input").addEventListener("input", debounce(filterAndRender, 300));
    document.getElementById("reg-payment-filter").addEventListener("change", filterAndRender);
});

async function loadRegistrations(userId) {
    const container = document.getElementById("registrations-table-container");
    UI.showLoading(container, "Loading your registration history...");

    try {
        const res = await API.getAttendeeRegistrations(userId);
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No registrations yet", "Register for an event to see history here.", "fa-clipboard-list");
            return;
        }

        allRegistrations = res.data;
        renderRegistrationsTable(allRegistrations);
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Error loading registrations: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function filterAndRender() {
    const search = document.getElementById("reg-search-input").value.trim().toLowerCase();
    const payFilter = document.getElementById("reg-payment-filter").value;

    let filtered = [...allRegistrations];

    if (payFilter !== "ALL") {
        filtered = filtered.filter(r => (r.payment && r.payment.payment_status) === payFilter);
    }

    if (search) {
        filtered = filtered.filter(r =>
            (r.event && r.event.title && r.event.title.toLowerCase().includes(search)) ||
            (r.ticket && r.ticket.ticket_name && r.ticket.ticket_name.toLowerCase().includes(search))
        );
    }

    const container = document.getElementById("registrations-table-container");
    if (filtered.length === 0) {
        UI.renderEmptyState(container, "No matching registrations", "Try a different search term or filter.", "fa-filter");
        return;
    }

    renderRegistrationsTable(filtered);
}

function renderRegistrationsTable(registrations) {
    const container = document.getElementById("registrations-table-container");

    let html = `
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th>Reg. ID</th>
                    <th>Event</th>
                    <th>Ticket Tier</th>
                    <th>Reg. Date</th>
                    <th>Payment Status</th>
                    <th>Amount Paid</th>
                    <th class="text-end">Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    registrations.forEach(r => {
        const ev = r.event || {};
        const ticket = r.ticket || {};
        const pay = r.payment || {};

        html += `
            <tr>
                <td class="fw-semibold">#${r.registration_id}</td>
                <td>
                    <div class="fw-bold text-dark text-truncate" style="max-width:200px;">${Utils.escapeHtml(ev.title || 'Event')}</div>
                    <div class="small text-muted"><i class="fa-regular fa-calendar me-1 text-primary"></i>${Utils.formatDate(ev.event_date)}</div>
                    <div class="small text-muted"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${Utils.escapeHtml(ev.city || '')}</div>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">${Utils.escapeHtml(ticket.ticket_name || 'General')}</span>
                    ${r.quantity > 1 ? `<span class="ms-1 small text-muted">× ${r.quantity}</span>` : ''}
                </td>
                <td class="small text-muted">${Utils.formatDate(r.registration_date)}</td>
                <td>${Utils.getStatusBadgeHtml(pay.payment_status || 'PENDING')}</td>
                <td class="fw-bold text-success">${Utils.formatCurrency(pay.amount || 0)}</td>
                <td class="text-end">
                    <a href="my-tickets.html" class="btn btn-sm btn-outline-primary rounded-pill">
                        <i class="fa-solid fa-ticket me-1"></i> View Pass
                    </a>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * ORGANIZER ATTENDEES ROSTER LOGIC
 * Online Event Management System
 */

let currentAttendeesList = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    await loadOrganizerEventsSelect(user.id);
    loadAttendees();

    document.getElementById("attendee-event-select").addEventListener("change", loadAttendees);
    document.getElementById("attendee-search").addEventListener("input", debounce(loadAttendees, 300));
    document.getElementById("payment-status-filter").addEventListener("change", loadAttendees);
    document.getElementById("export-csv-btn").addEventListener("click", exportAttendeesToCSV);
});

async function loadOrganizerEventsSelect(organizerId) {
    const select = document.getElementById("attendee-event-select");
    try {
        const res = await API.getEvents({ organizer_id: organizerId });
        if (res.data) {
            res.data.forEach(ev => {
                select.innerHTML += `<option value="${ev.id}">${Utils.escapeHtml(ev.title)}</option>`;
            });
        }
    } catch (e) {
        console.error("Error loading events select:", e);
    }
}

async function loadAttendees() {
    const container = document.getElementById("attendees-table-container");
    UI.showLoading(container, "Loading attendee roster...");

    const eventId = document.getElementById("attendee-event-select").value;
    const search = document.getElementById("attendee-search").value.trim().toLowerCase();
    const payStatus = document.getElementById("payment-status-filter").value;

    try {
        const res = await API.getOrganizerAttendees(eventId === "ALL" ? "" : eventId);
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No registered attendees found", "Registrations will appear here once attendees purchase tickets.", "fa-users");
            currentAttendeesList = [];
            return;
        }

        let list = res.data;

        if (payStatus !== "ALL") {
            list = list.filter(a => a.payment_status === payStatus);
        }

        if (search) {
            list = list.filter(a => 
                (a.attendee_name && a.attendee_name.toLowerCase().includes(search)) ||
                (a.attendee_email && a.attendee_email.toLowerCase().includes(search)) ||
                (a.ticket_name && a.ticket_name.toLowerCase().includes(search))
            );
        }

        currentAttendeesList = list;

        if (list.length === 0) {
            UI.renderEmptyState(container, "No matching attendees", "Try clearing search or status filters.", "fa-filter");
            return;
        }

        let html = `
            <table class="table table-hover align-middle mb-0" id="attendees-table">
                <thead class="table-light">
                    <tr>
                        <th>Attendee Name</th>
                        <th>Email</th>
                        <th>Event Title</th>
                        <th>Ticket Type</th>
                        <th>Registration Date</th>
                        <th>Payment Status</th>
                        <th>Amount Paid</th>
                    </tr>
                </thead>
                <tbody>
        `;

        list.forEach(a => {
            html += `
                <tr>
                    <td class="fw-semibold text-dark">${Utils.escapeHtml(a.attendee_name)}</td>
                    <td>${Utils.escapeHtml(a.attendee_email)}</td>
                    <td class="small text-truncate" style="max-width:180px;">${Utils.escapeHtml(a.event_title)}</td>
                    <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(a.ticket_name)}</span></td>
                    <td class="small text-muted">${Utils.formatDate(a.registration_date)}</td>
                    <td>${Utils.getStatusBadgeHtml(a.payment_status)}</td>
                    <td class="fw-semibold text-success">${Utils.formatCurrency(a.amount)}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Failed to load attendees: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function exportAttendeesToCSV() {
    if (!currentAttendeesList || currentAttendeesList.length === 0) {
        UI.showToast("No attendee data available to export.", "warning");
        return;
    }

    const headers = ["ID", "Attendee Name", "Email", "Event Title", "Ticket Type", "Registration Date", "Payment Status", "Amount (INR)"];
    const rows = currentAttendeesList.map(a => [
        a.id,
        `"${a.attendee_name.replace(/"/g, '""')}"`,
        `"${a.attendee_email.replace(/"/g, '""')}"`,
        `"${a.event_title.replace(/"/g, '""')}"`,
        `"${a.ticket_name.replace(/"/g, '""')}"`,
        `"${Utils.formatDate(a.registration_date)}"`,
        a.payment_status,
        a.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendee_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    UI.showToast("CSV exported successfully!", "success");
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

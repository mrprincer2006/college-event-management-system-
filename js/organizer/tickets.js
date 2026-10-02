/**
 * ORGANIZER TICKET MANAGEMENT LOGIC
 * Online Event Management System
 */

let selectedEventId = null;
let currentTicketsList = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    await loadOrganizerEventsDropdown(user.id);

    document.getElementById("select-event-dropdown").addEventListener("change", (e) => {
        selectedEventId = e.target.value;
        loadEventTickets();
    });

    document.getElementById("ticket-form").addEventListener("submit", handleSaveTicket);
    document.getElementById("reset-ticket-form-btn").addEventListener("click", resetTicketForm);
});

async function loadOrganizerEventsDropdown(organizerId) {
    const dropdown = document.getElementById("select-event-dropdown");
    try {
        const res = await API.getEvents({ organizer_id: organizerId });
        if (!res.data || res.data.length === 0) {
            dropdown.innerHTML = `<option value="" disabled selected>No events found. Please create an event first.</option>`;
            return;
        }

        dropdown.innerHTML = `<option value="" disabled selected>-- Select an Event to Manage Tickets --</option>`;
        res.data.forEach(ev => {
            dropdown.innerHTML += `<option value="${ev.id}">${Utils.escapeHtml(ev.title)} (${Utils.formatDate(ev.event_date)})</option>`;
        });

        // Check URL parameter ?eventId=
        const paramEventId = Utils.getParam("eventId");
        if (paramEventId && res.data.some(e => e.id == paramEventId)) {
            dropdown.value = paramEventId;
            selectedEventId = paramEventId;
            loadEventTickets();
        }
    } catch (e) {
        dropdown.innerHTML = `<option value="" disabled>Error loading events</option>`;
    }
}

async function loadEventTickets() {
    if (!selectedEventId) return;

    const section = document.getElementById("ticket-section-container");
    section.style.display = "flex";

    const container = document.getElementById("tickets-table-container");
    UI.showLoading(container, "Loading ticket tiers...");

    resetTicketForm();

    try {
        const res = await API.getTicketsByEvent(selectedEventId);
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No ticket tiers configured", "Fill out the form on the left to add a ticket tier.", "fa-ticket");
            return;
        }

        currentTicketsList = res.data;

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                    <tr>
                        <th>Ticket Name</th>
                        <th>Price</th>
                        <th>Available / Total</th>
                        <th>Sale Period</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        currentTicketsList.forEach(t => {
            html += `
                <tr>
                    <td class="fw-bold text-dark">${Utils.escapeHtml(t.ticket_name)}</td>
                    <td class="fw-semibold text-primary">${Utils.formatCurrency(t.price)}</td>
                    <td><span class="badge bg-light text-dark border">${t.available_quantity} / ${t.quantity}</span></td>
                    <td class="small text-muted">
                        ${Utils.formatDate(t.sale_start)} - ${Utils.formatDate(t.sale_end)}
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editTicket(${t.id})" title="Edit Tier"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTicket(${t.id})" title="Delete Tier"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger p-2 small">Error loading tickets: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function resetTicketForm() {
    document.getElementById("ticketFormTitle").innerHTML = `<i class="fa-solid fa-ticket text-primary me-2"></i>Add Ticket Tier`;
    document.getElementById("ticket-form").reset();
    document.getElementById("ticket-form").classList.remove("was-validated");
    document.getElementById("ticket-id").value = "";

    // Default sale dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("sale-start").value = today;
}

function editTicket(id) {
    const t = currentTicketsList.find(x => x.id == id);
    if (!t) return;

    document.getElementById("ticketFormTitle").innerHTML = `<i class="fa-solid fa-pen text-primary me-2"></i>Edit Ticket Tier`;
    document.getElementById("ticket-id").value = t.id;
    document.getElementById("ticket-name").value = t.ticket_name;
    document.getElementById("ticket-price").value = t.price;
    document.getElementById("ticket-quantity").value = t.quantity;
    document.getElementById("sale-start").value = t.sale_start;
    document.getElementById("sale-end").value = t.sale_end;
}

async function handleSaveTicket(e) {
    e.preventDefault();
    if (!selectedEventId) {
        UI.showToast("Please select an event first.", "warning");
        return;
    }

    const form = document.getElementById("ticket-form");
    const name = document.getElementById("ticket-name").value.trim();
    const price = parseFloat(document.getElementById("ticket-price").value);
    const quantity = parseInt(document.getElementById("ticket-quantity").value, 10);
    const saleStart = document.getElementById("sale-start").value;
    const saleEnd = document.getElementById("sale-end").value;

    let isValid = true;
    if (price < 0 || quantity <= 0) isValid = false;
    if (saleStart && saleEnd && saleEnd < saleStart) {
        document.getElementById("sale-end").setCustomValidity("Sale end date before start date");
        isValid = false;
    } else {
        document.getElementById("sale-end").setCustomValidity("");
    }

    form.classList.add("was-validated");
    if (!form.checkValidity() || !isValid) return;

    const id = document.getElementById("ticket-id").value;
    const btn = document.getElementById("save-ticket-btn");
    UI.setBtnLoading(btn, true);

    try {
        let res;
        if (id) {
            res = await API.updateTicket(id, { ticket_name: name, price, quantity, sale_start: saleStart, sale_end: saleEnd });
        } else {
            res = await API.createTicket(selectedEventId, { ticket_name: name, price, quantity, sale_start: saleStart, sale_end: saleEnd });
        }

        if (res.success) {
            UI.showToast(res.message, "success");
            loadEventTickets();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (err) {
        UI.showToast(err.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

async function deleteTicket(id) {
    if (!confirm("Are you sure you want to delete this ticket tier?")) return;
    try {
        const res = await API.deleteTicket(id);
        if (res.success) {
            UI.showToast("Ticket tier deleted.", "success");
            loadEventTickets();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
    }
}

/**
 * ATTENDEE MY TICKETS LOGIC
 * Online Event Management System
 */

let myTicketsList = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    loadMyTickets(user);
});

async function loadMyTickets(user) {
    const container = document.getElementById("my-tickets-container");
    UI.showLoading(container, "Loading your ticket passes...");

    try {
        const res = await API.getAttendeeTickets(user.id);
        if (!res.data || res.data.length === 0) {
            container.innerHTML = "";
            UI.renderEmptyState(container, "No tickets purchased yet", "Browse events and buy your first ticket pass!", "fa-ticket");
            return;
        }

        myTicketsList = res.data;
        container.innerHTML = "";

        myTicketsList.forEach(t => {
            const ev = t.event || {};
            const ticket = t.ticket || {};
            const payment = t.payment || {};
            const regId = t.registration_id;

            const cardHtml = `
                <div class="col-lg-6">
                    <div class="card card-custom p-0 overflow-hidden">
                        <div class="p-3 border-bottom d-flex gap-3">
                            <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}"
                                 style="width:80px;height:80px;object-fit:cover;border-radius:10px;"
                                 alt="${Utils.escapeHtml(ev.title || '')}">
                            <div class="flex-grow-1">
                                <div class="fw-bold text-dark mb-1">${Utils.escapeHtml(ev.title || 'Event')}</div>
                                <div class="small text-muted"><i class="fa-regular fa-calendar text-primary me-1"></i>${Utils.formatDate(ev.event_date)}</div>
                                <div class="small text-muted"><i class="fa-solid fa-location-dot text-danger me-1"></i>${Utils.escapeHtml(ev.venue || '')} - ${Utils.escapeHtml(ev.city || '')}</div>
                                <div class="d-flex gap-2 mt-1 align-items-center">
                                    <span class="badge bg-light text-dark border small">${Utils.escapeHtml(ticket.ticket_name || 'Pass')}</span>
                                    ${Utils.getStatusBadgeHtml(payment.payment_status || 'SUCCESS')}
                                </div>
                            </div>
                        </div>
                        <div class="p-3 bg-light d-flex justify-content-between align-items-center">
                            <div class="small text-muted">
                                <span class="fw-semibold text-dark">Ticket #${regId}</span> &bull; 
                                Amount: <span class="fw-semibold text-success">${Utils.formatCurrency(payment.amount || 0)}</span>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-primary"
                                    onclick="openTicketPass(${regId})">
                                    <i class="fa-solid fa-id-card me-1"></i> View Pass
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Error loading tickets: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function openTicketPass(regId) {
    const t = myTicketsList.find(x => x.registration_id == regId);
    if (!t) return;

    const user = Auth.getCurrentUser();
    const ev = t.event || {};
    const ticket = t.ticket || {};
    const payment = t.payment || {};

    document.getElementById("pass-category").textContent = ev.category || "Event";
    document.getElementById("pass-event-title").textContent = ev.title || "Event";
    document.getElementById("pass-venue").innerHTML = `<i class="fa-solid fa-location-dot me-1"></i> ${Utils.escapeHtml(ev.venue || '')}`;
    document.getElementById("pass-attendee-name").textContent = user ? user.name : "Attendee";
    document.getElementById("pass-ticket-type").textContent = ticket.ticket_name || "General";
    document.getElementById("pass-date-time").textContent = Utils.formatDate(ev.event_date) + " " + Utils.formatTime(ev.start_time);
    document.getElementById("pass-ticket-id").textContent = "#" + regId;
    document.getElementById("pass-txn-id").textContent = payment.transaction_id || "TXN-DEMO";

    const modal = new bootstrap.Modal(document.getElementById("ticketPassModal"));
    modal.show();
}

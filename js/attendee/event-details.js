/**
 * ATTENDEE EVENT DETAILS & BOOKING LOGIC
 * Online Event Management System
 */

let currentEvent = null;
let selectedTicketObj = null;
let selectedQuantity = 1;

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    const eventId = Utils.getParam("id");
    if (!eventId) {
        window.location.href = "events.html";
        return;
    }

    loadEventPage(eventId);

    document.getElementById("confirm-payment-btn").addEventListener("click", handleConfirmPurchase);
});

async function loadEventPage(eventId) {
    const container = document.getElementById("event-detail-content-area");
    UI.showLoading(container, "Loading event details...");

    try {
        const res = await API.getEventById(eventId);
        if (!res.data) {
            UI.renderEmptyState(container, "Event not found", "This event may have been removed.", "fa-calendar-xmark");
            return;
        }

        currentEvent = res.data;
        const tickets = currentEvent.tickets || [];

        let html = `
            <div class="page-header mb-3">
                <a href="events.html" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-arrow-left me-1"></i> Back to All Events</a>
            </div>

            <div class="row g-4">
                
                <!-- Main Event Info Column -->
                <div class="col-lg-7">
                    <div class="card card-custom p-4">
                        <div class="mb-3 overflow-hidden rounded-3" style="max-height:340px;">
                            <img src="${currentEvent.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}" class="w-100 object-fit-cover" alt="${Utils.escapeHtml(currentEvent.title)}">
                        </div>
                        <span class="badge bg-primary px-3 py-2 rounded-pill align-self-start mb-2">${Utils.escapeHtml(currentEvent.category)}</span>
                        <h2 class="fw-bold mb-3">${Utils.escapeHtml(currentEvent.title)}</h2>
                        
                        <p class="text-secondary leading-relaxed mb-4">${Utils.escapeHtml(currentEvent.description)}</p>

                        <h6 class="fw-bold border-bottom pb-2 mb-3"><i class="fa-solid fa-circle-info text-primary me-2"></i>Event Logistics</h6>
                        <div class="row g-3 small">
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-calendar-day text-primary fs-5"></i>
                                    <div>
                                        <div class="text-muted">Date</div>
                                        <div class="fw-bold text-dark">${Utils.formatDate(currentEvent.event_date)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-clock text-primary fs-5"></i>
                                    <div>
                                        <div class="text-muted">Time</div>
                                        <div class="fw-bold text-dark">${Utils.formatTime(currentEvent.start_time)} - ${Utils.formatTime(currentEvent.end_time)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-location-dot text-danger fs-5"></i>
                                    <div>
                                        <div class="text-muted">Venue</div>
                                        <div class="fw-bold text-dark">${Utils.escapeHtml(currentEvent.venue)}, ${Utils.escapeHtml(currentEvent.city)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-user-tie text-info fs-5"></i>
                                    <div>
                                        <div class="text-muted">Hosted By</div>
                                        <div class="fw-bold text-dark">${Utils.escapeHtml(currentEvent.organizer_name || 'Organizer')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ticket Purchase Panel Column -->
                <div class="col-lg-5">
                    <div class="card card-custom p-4 sticky-top" style="top: 90px;">
                        <h5 class="fw-bold mb-3"><i class="fa-solid fa-ticket text-primary me-2"></i>Select Ticket Pass</h5>
        `;

        if (tickets.length === 0) {
            html += `
                <div class="alert alert-warning py-3 small">
                    <i class="fa-solid fa-triangle-exclamation me-1"></i> No ticket passes have been configured for this event yet. Check back soon!
                </div>
            `;
        } else {
            html += `<div class="d-flex flex-column gap-2 mb-4" id="ticket-tiers-list">`;
            tickets.forEach((t, idx) => {
                const isSelected = idx === 0;
                if (isSelected) selectedTicketObj = t;

                html += `
                    <div class="ticket-tier-card ${isSelected ? 'border-primary bg-primary-light' : ''}" style="cursor:pointer;" onclick="selectTicketTier(${t.id})">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold text-dark">${Utils.escapeHtml(t.ticket_name)}</div>
                                <div class="small text-muted">${t.available_quantity} passes remaining</div>
                            </div>
                            <div class="fs-5 fw-bold text-primary">${Utils.formatCurrency(t.price)}</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            // Live Price Calculation Box
            html += `
                <div class="mb-4">
                    <label for="ticket-qty-input" class="form-label fw-semibold">Quantity</label>
                    <input type="number" id="ticket-qty-input" class="form-control" min="1" max="10" value="1" onchange="updatePriceSummary()">
                </div>

                <div class="bg-light p-3 rounded-3 mb-4">
                    <h6 class="fw-bold mb-3 border-bottom pb-2">Order Price Summary</h6>
                    <div class="d-flex justify-content-between small mb-2">
                        <span id="summary-ticket-name">${selectedTicketObj ? selectedTicketObj.ticket_name : ''}</span>
                        <span id="summary-ticket-price">${selectedTicketObj ? Utils.formatCurrency(selectedTicketObj.price) : '₹0'}</span>
                    </div>
                    <div class="d-flex justify-content-between small mb-2">
                        <span>Quantity</span>
                        <span id="summary-qty">1</span>
                    </div>
                    <hr class="my-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">Total Pay:</span>
                        <span class="fs-4 fw-bold text-primary" id="summary-total">${selectedTicketObj ? Utils.formatCurrency(selectedTicketObj.price) : '₹0'}</span>
                    </div>
                </div>

                <button class="btn btn-primary w-100 py-2.5 fw-semibold fs-6" onclick="openPaymentModal()">
                    <i class="fa-solid fa-credit-card me-1"></i> Proceed to Pay & Register
                </button>
            `;
        }

        html += `
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Error loading event details: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function selectTicketTier(ticketId) {
    if (!currentEvent || !currentEvent.tickets) return;
    selectedTicketObj = currentEvent.tickets.find(t => t.id == ticketId);
    
    // Re-render highlight borders
    document.querySelectorAll(".ticket-tier-card").forEach(card => {
        card.classList.remove("border-primary", "bg-primary-light");
    });
    event.currentTarget.classList.add("border-primary", "bg-primary-light");

    updatePriceSummary();
}

function updatePriceSummary() {
    if (!selectedTicketObj) return;

    const qtyInput = document.getElementById("ticket-qty-input");
    selectedQuantity = parseInt(qtyInput.value, 10) || 1;
    if (selectedQuantity < 1) selectedQuantity = 1;
    if (selectedQuantity > 10) selectedQuantity = 10;
    qtyInput.value = selectedQuantity;

    const total = selectedTicketObj.price * selectedQuantity;

    document.getElementById("summary-ticket-name").textContent = selectedTicketObj.ticket_name;
    document.getElementById("summary-ticket-price").textContent = Utils.formatCurrency(selectedTicketObj.price);
    document.getElementById("summary-qty").textContent = selectedQuantity;
    document.getElementById("summary-total").textContent = Utils.formatCurrency(total);
}

function openPaymentModal() {
    if (!selectedTicketObj) {
        UI.showToast("Please select a ticket tier.", "warning");
        return;
    }

    const total = selectedTicketObj.price * selectedQuantity;
    document.getElementById("pay-modal-ticket-name").textContent = selectedTicketObj.ticket_name;
    document.getElementById("pay-modal-qty").textContent = selectedQuantity;
    document.getElementById("pay-modal-total").textContent = Utils.formatCurrency(total);

    const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
    modal.show();
}

async function handleConfirmPurchase() {
    const user = Auth.getCurrentUser();
    if (!user || !currentEvent || !selectedTicketObj) return;

    const paymentMethod = document.getElementById("payment-method-select").value;
    const btn = document.getElementById("confirm-payment-btn");
    UI.setBtnLoading(btn, true, "Processing Payment...");

    try {
        const res = await API.purchaseTicket({
            event_id: currentEvent.id,
            ticket_id: selectedTicketObj.id,
            attendee_id: user.id,
            attendee_name: user.name,
            quantity: selectedQuantity,
            payment_method: paymentMethod
        });

        if (res.success) {
            UI.showToast("Ticket purchased successfully! Ticket ID #" + res.data.registration.id, "success");
            const modalEl = document.getElementById("paymentModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            setTimeout(() => {
                window.location.href = "my-tickets.html";
            }, 1000);
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

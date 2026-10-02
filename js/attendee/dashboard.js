/**
 * ATTENDEE DASHBOARD LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    loadAttendeeDashboard(user.id);
});

async function loadAttendeeDashboard(userId) {
    try {
        // 1. Load tickets
        const ticketsRes = await API.getAttendeeTickets(userId);
        const tickets = ticketsRes.data || [];
        document.getElementById("att-stat-tickets-count").textContent = tickets.length;
        document.getElementById("att-stat-regs-count").textContent = tickets.length;
        renderTicketsPreview(tickets);

        // 2. Load notifications
        const notifsRes = await API.getNotifications(userId);
        const notifs = notifsRes.data || [];
        const unreadCount = notifs.filter(n => !n.is_read).length;
        document.getElementById("att-stat-notifs-count").textContent = unreadCount;
        
        const dot = document.getElementById("nav-notif-dot");
        if (dot) dot.style.display = unreadCount > 0 ? "block" : "none";

        renderNotificationsPreview(notifs);

        // 3. Load recommended events
        const eventsRes = await API.getEvents({ status: "APPROVED" });
        renderEventsGrid(eventsRes.data || []);
    } catch (e) {
        console.error("Error loading attendee dashboard:", e);
    }
}

function renderTicketsPreview(tickets) {
    const container = document.getElementById("att-my-tickets-preview");
    if (!container) return;

    if (tickets.length === 0) {
        UI.renderEmptyState(container, "No active tickets", "Browse events and buy tickets to see passes here.", "fa-ticket");
        return;
    }

    let html = '<div class="d-flex flex-column gap-2">';
    tickets.slice(0, 3).forEach(t => {
        html += `
            <div class="p-3 border rounded-3 bg-white d-flex align-items-center justify-content-between">
                <div>
                    <div class="fw-bold text-dark">${Utils.escapeHtml(t.event.title || 'Event')}</div>
                    <div class="small text-muted"><i class="fa-solid fa-ticket text-primary me-1"></i> ${Utils.escapeHtml(t.ticket.ticket_name || 'Pass')} (Qty: ${t.quantity})</div>
                    <div class="small text-muted"><i class="fa-regular fa-calendar me-1"></i> ${Utils.formatDate(t.event.event_date)}</div>
                </div>
                <a href="my-tickets.html" class="btn btn-sm btn-outline-primary rounded-pill">View Pass</a>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderNotificationsPreview(notifs) {
    const container = document.getElementById("att-notifications-preview");
    if (!container) return;

    if (notifs.length === 0) {
        UI.renderEmptyState(container, "No notifications", "You'll receive updates on ticket purchases here.", "fa-bell-slash");
        return;
    }

    let html = '<div class="d-flex flex-column gap-2">';
    notifs.slice(0, 3).forEach(n => {
        html += `
            <div class="notification-item ${!n.is_read ? 'unread' : ''}">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold small">${Utils.escapeHtml(n.title)}</span>
                    <span class="text-muted text-xs" style="font-size:0.75rem">${Utils.formatRelativeTime(n.created_at)}</span>
                </div>
                <div class="small text-secondary">${Utils.escapeHtml(n.message)}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderEventsGrid(events) {
    const container = document.getElementById("att-upcoming-events-grid");
    if (!container) return;

    if (events.length === 0) {
        UI.renderEmptyState(container, "No upcoming events available", "", "fa-calendar-xmark");
        return;
    }

    let html = "";
    events.slice(0, 3).forEach(ev => {
        html += `
            <div class="col-md-4">
                <div class="card event-card">
                    <div class="event-img-wrapper" style="height:150px;">
                        <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}" class="event-img" alt="${Utils.escapeHtml(ev.title)}">
                        <span class="category-badge">${Utils.escapeHtml(ev.category)}</span>
                    </div>
                    <div class="event-body">
                        <h6 class="event-title text-truncate-2">${Utils.escapeHtml(ev.title)}</h6>
                        <div class="event-meta small">
                            <span><i class="fa-solid fa-location-dot me-1 text-danger"></i> ${Utils.escapeHtml(ev.city)}</span>
                            <span><i class="fa-solid fa-calendar me-1 text-primary"></i> ${Utils.formatDate(ev.event_date)}</span>
                        </div>
                        <div class="event-footer pt-2 mt-auto">
                            <a href="event-details.html?id=${ev.id}" class="btn btn-sm btn-primary w-100 rounded-pill">View & Book</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * ATTENDEE NOTIFICATIONS LOGIC
 * Online Event Management System
 */

let notificationsList = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    loadNotifications(user.id);

    document.getElementById("mark-all-read-btn").addEventListener("click", () => markAllRead(user.id));
});

async function loadNotifications(userId) {
    const container = document.getElementById("notifications-list-container");
    UI.showLoading(container, "Loading notifications...");

    try {
        const res = await API.getNotifications(userId);
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "Your inbox is empty", "Ticket confirmations and event updates will appear here.", "fa-bell-slash");
            return;
        }

        notificationsList = res.data;
        renderNotifications(notificationsList);
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger">Error loading notifications: ${Utils.escapeHtml(e.message)}</div>`;
    }
}

function renderNotifications(list) {
    const container = document.getElementById("notifications-list-container");

    const unreadCount = list.filter(n => !n.is_read).length;
    let html = `
        <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="small text-muted fw-semibold">${list.length} Notifications &bull; <span class="text-warning">${unreadCount} unread</span></span>
        </div>
        <div class="d-flex flex-column gap-2">
    `;

    list.forEach(n => {
        const iconMap = {
            "Registration Confirmed": "fa-ticket text-success",
            "Ticket Purchase Confirmed": "fa-ticket text-success",
            "Organizer Announcement": "fa-bullhorn text-primary",
            "Event Approved!": "fa-circle-check text-success",
            "Event Rejected": "fa-circle-xmark text-danger",
            "Sunburn Beats Ticket Ready": "fa-music text-warning"
        };

        const iconClass = Object.keys(iconMap).find(k => n.title.includes(k.split(" ")[0]));
        const icon = iconClass ? iconMap[iconClass] : "fa-bell text-primary";

        html += `
            <div class="notification-item ${!n.is_read ? 'unread' : ''}" id="notif-${n.id}">
                <div class="d-flex gap-3 align-items-start">
                    <div class="flex-shrink-0" style="width:38px;height:38px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;">
                        <i class="fa-solid ${icon} fs-6"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <span class="fw-bold text-dark">${Utils.escapeHtml(n.title)}</span>
                            <span class="small text-muted text-nowrap ms-2" style="font-size:0.75rem;">${Utils.formatRelativeTime(n.created_at)}</span>
                        </div>
                        <p class="small text-secondary mb-2">${Utils.escapeHtml(n.message)}</p>
                        ${!n.is_read ? `
                            <button class="btn btn-xs btn-outline-primary py-1 px-2" style="font-size:0.75rem;" onclick="markOneRead(${n.id})">
                                <i class="fa-solid fa-check me-1"></i> Mark as Read
                            </button>
                        ` : `<span class="small text-muted"><i class="fa-solid fa-check-double me-1"></i>Read</span>`}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

async function markOneRead(notifId) {
    try {
        await API.markNotificationRead(notifId);
        const notif = notificationsList.find(n => n.id == notifId);
        if (notif) notif.is_read = true;
        renderNotifications(notificationsList);
        UI.showToast("Marked as read.", "success");
    } catch (e) {
        UI.showToast("Failed to mark notification.", "danger");
    }
}

async function markAllRead(userId) {
    try {
        for (const n of notificationsList) {
            if (!n.is_read) {
                await API.markNotificationRead(n.id);
                n.is_read = true;
            }
        }
        renderNotifications(notificationsList);
        UI.showToast("All notifications marked as read.", "success");
    } catch (e) {
        UI.showToast("Failed to mark all as read.", "danger");
    }
}

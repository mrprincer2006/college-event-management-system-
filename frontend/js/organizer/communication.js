/**
 * ORGANIZER COMMUNICATION LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    await loadOrganizerEvents(user.id);
    loadSentAnnouncementsLog();

    document.getElementById("comm-form").addEventListener("submit", handleSendAnnouncement);
});

async function loadOrganizerEvents(organizerId) {
    const select = document.getElementById("comm-event-select");
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

async function handleSendAnnouncement(e) {
    e.preventDefault();
    const form = document.getElementById("comm-form");
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    const eventId = document.getElementById("comm-event-select").value;
    const title = document.getElementById("comm-title").value.trim();
    const message = document.getElementById("comm-message").value.trim();

    const btn = document.getElementById("send-comm-btn");
    UI.setBtnLoading(btn, true, "Sending...");

    try {
        const res = await API.sendOrganizerNotification(eventId, title, message);
        if (res.success) {
            UI.showToast(res.message || "Announcement broadcasted!", "success");
            form.reset();
            form.classList.remove("was-validated");
            loadSentAnnouncementsLog();
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (err) {
        UI.showToast(err.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

function loadSentAnnouncementsLog() {
    const container = document.getElementById("sent-announcements-container");
    if (!container) return;

    const db = MockStorage.get();
    const notifications = db.notifications || [];

    if (notifications.length === 0) {
        UI.renderEmptyState(container, "No announcements sent yet", "Broadcasts to attendees will appear here.", "fa-bullhorn");
        return;
    }

    let html = '<div class="d-flex flex-column gap-3">';
    notifications.slice(0, 5).forEach(n => {
        const ev = db.events.find(e => e.id == n.event_id);
        const eventTitle = ev ? ev.title : "Event";

        html += `
            <div class="p-3 border rounded-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark">${Utils.escapeHtml(n.title)}</span>
                    <span class="small text-muted" style="font-size:0.75rem">${Utils.formatRelativeTime(n.created_at)}</span>
                </div>
                <div class="small text-primary fw-semibold mb-2"><i class="fa-regular fa-calendar-check me-1"></i> ${Utils.escapeHtml(eventTitle)}</div>
                <p class="small text-secondary mb-0">${Utils.escapeHtml(n.message)}</p>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

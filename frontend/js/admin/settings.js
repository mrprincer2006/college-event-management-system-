/**
 * ADMIN SETTINGS LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    loadSettings();

    document.getElementById("settings-form").addEventListener("submit", handleSaveSettings);
});

async function loadSettings() {
    try {
        const res = await API.getAdminSettings();
        if (res.success && res.data) {
            const s = res.data;
            document.getElementById("setting-website-name").value = s.website_name || "";
            document.getElementById("setting-registration-toggle").checked = !!s.registration_enabled;
            document.getElementById("setting-approval-toggle").checked = !!s.event_approval_required;
            document.getElementById("setting-notification-toggle").checked = !!s.notification_enabled;
            document.getElementById("setting-max-tickets").value = s.max_ticket_limit || 10;
        }
    } catch (e) {
        UI.showToast("Failed to load system settings", "danger");
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();
    const btn = document.getElementById("save-settings-btn");
    UI.setBtnLoading(btn, true, "Saving...");

    const payload = {
        website_name: document.getElementById("setting-website-name").value.trim(),
        registration_enabled: document.getElementById("setting-registration-toggle").checked,
        event_approval_required: document.getElementById("setting-approval-toggle").checked,
        notification_enabled: document.getElementById("setting-notification-toggle").checked,
        max_ticket_limit: parseInt(document.getElementById("setting-max-tickets").value, 10) || 10
    };

    try {
        const res = await API.updateAdminSettings(payload);
        if (res.success) {
            UI.showToast("System settings updated successfully!", "success");
        } else {
            UI.showToast(res.message, "danger");
        }
    } catch (err) {
        UI.showToast(err.message, "danger");
    } finally {
        UI.setBtnLoading(btn, false);
    }
}

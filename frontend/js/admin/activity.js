/**
 * ADMIN ACTIVITY LOGS LOGIC
 * Online Event Management System
 */

let refreshInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    loadActivityLogs();

    document.getElementById("activity-search-input").addEventListener("input", debounce(loadActivityLogs, 300));
    document.getElementById("activity-type-filter").addEventListener("change", loadActivityLogs);
    document.getElementById("manual-refresh-btn").addEventListener("click", () => {
        loadActivityLogs();
        UI.showToast("Activity log refreshed", "info");
    });

    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(() => {
        loadActivityLogs();
    }, 30000);
});

async function loadActivityLogs() {
    const container = document.getElementById("activity-table-container");
    const lastUpdatedEl = document.getElementById("last-updated-label");

    const search = document.getElementById("activity-search-input").value.trim().toLowerCase();
    const actionFilter = document.getElementById("activity-type-filter").value;

    try {
        const res = await API.getActivityLogs();
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No activity logs", "", "fa-clock-rotate-left");
            return;
        }

        let logs = res.data;

        if (actionFilter !== "ALL") {
            logs = logs.filter(l => l.action === actionFilter);
        }

        if (search) {
            logs = logs.filter(l => 
                (l.user_name && l.user_name.toLowerCase().includes(search)) || 
                (l.description && l.description.toLowerCase().includes(search)) ||
                (l.action && l.action.toLowerCase().includes(search))
            );
        }

        if (logs.length === 0) {
            UI.renderEmptyState(container, "No matching activities", "Try selecting another action type filter.", "fa-filter");
            return;
        }

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;

        logs.forEach(act => {
            let actionBadge = "bg-secondary";
            if (act.action.includes("Approved") || act.action.includes("Purchased")) actionBadge = "bg-success";
            else if (act.action.includes("Rejected") || act.action.includes("Blocked")) actionBadge = "bg-danger";
            else if (act.action.includes("Created") || act.action.includes("Registered")) actionBadge = "bg-primary";
            else if (act.action.includes("Login")) actionBadge = "bg-info text-dark";

            html += `
                <tr>
                    <td class="small text-muted" style="white-space:nowrap;">
                        <i class="fa-regular fa-clock me-1 text-primary"></i> ${Utils.formatDate(act.created_at)} ${Utils.formatTime(act.created_at)}
                    </td>
                    <td>
                        <span class="fw-semibold text-dark">${Utils.escapeHtml(act.user_name || 'System')}</span>
                    </td>
                    <td><span class="badge ${actionBadge}">${Utils.escapeHtml(act.action)}</span></td>
                    <td class="small text-dark">${Utils.escapeHtml(act.description)}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        if (lastUpdatedEl) {
            const now = new Date();
            lastUpdatedEl.innerHTML = `<i class="fa-solid fa-clock me-1 text-success"></i> Last updated: ${now.toLocaleTimeString()}`;
        }
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger m-3">Failed to load activity log: ${Utils.escapeHtml(e.message)}</div>`;
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

/**
 * ADMIN DASHBOARD LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Guard route for ADMIN only
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    // 2. Load Stats & Charts
    loadAdminDashboardStats();
    loadPendingApprovalsPreview();
    loadActivityPreview();
});

async function loadAdminDashboardStats() {
    try {
        const res = await API.getAdminStatistics();
        if (res.success && res.data) {
            const data = res.data;
            document.getElementById("stat-total-users").textContent = data.totalUsers || 0;
            document.getElementById("stat-total-events").textContent = data.totalEvents || 0;
            document.getElementById("stat-pending-events").textContent = data.pendingEvents || 0;
            document.getElementById("stat-approved-events").textContent = data.approvedEvents || 0;
            document.getElementById("stat-total-regs").textContent = data.totalRegistrations || 0;
            document.getElementById("stat-total-sales").textContent = Utils.formatCurrency(data.totalRevenue || 0);

            // Render Chart 1: Status Doughnut
            initStatusChart(data.eventsByStatus || {});

            // Render Chart 2: Sales Trend Line Chart
            initTrendChart();
        }
    } catch (e) {
        console.error("Failed to load admin stats:", e);
    }
}

function initStatusChart(statusData) {
    const ctx = document.getElementById("eventStatusChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Approved', 'Pending', 'Rejected', 'Completed'],
            datasets: [{
                data: [
                    statusData.APPROVED || 0,
                    statusData.PENDING || 0,
                    statusData.REJECTED || 0,
                    statusData.COMPLETED || 0
                ],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function initTrendChart() {
    const ctx = document.getElementById("salesTrendChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Ticket Sales (₹)',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 42000, 48000, 55000, 60000],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.35,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value
                    }
                }
            }
        }
    });
}

async function loadPendingApprovalsPreview() {
    const container = document.getElementById("pending-preview-container");
    if (!container) return;

    try {
        const res = await API.getPendingEvents();
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No pending approvals", "All submitted events have been reviewed.", "fa-circle-check");
            return;
        }

        let html = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light small">
                    <tr>
                        <th>Event Title</th>
                        <th>Date</th>
                        <th>City</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        res.data.slice(0, 5).forEach(ev => {
            html += `
                <tr>
                    <td>
                        <div class="fw-semibold text-truncate" style="max-width:200px;">${Utils.escapeHtml(ev.title)}</div>
                        <div class="small text-muted">${Utils.escapeHtml(ev.category)}</div>
                    </td>
                    <td class="small">${Utils.formatDate(ev.event_date)}</td>
                    <td class="small">${Utils.escapeHtml(ev.city)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success me-1 py-1 px-2" onclick="quickApproveEvent(${ev.id})"><i class="fa-solid fa-check"></i></button>
                        <button class="btn btn-sm btn-danger py-1 px-2" onclick="quickRejectEvent(${ev.id})"><i class="fa-solid fa-xmark"></i></button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger p-2 small">Error loading pending events.</div>`;
    }
}

async function loadActivityPreview() {
    const container = document.getElementById("activity-preview-container");
    if (!container) return;

    try {
        const res = await API.getActivityLogs();
        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No recent activity", "", "fa-clock");
            return;
        }

        let html = '<div class="d-flex flex-column gap-2">';
        res.data.slice(0, 5).forEach(act => {
            html += `
                <div class="activity-feed-item">
                    <div class="activity-icon bg-primary-light text-primary">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold small">${Utils.escapeHtml(act.user_name || 'System')}</span>
                            <span class="text-muted text-xs" style="font-size:0.75rem">${Utils.formatRelativeTime(act.created_at)}</span>
                        </div>
                        <div class="small text-dark">${Utils.escapeHtml(act.description)}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger p-2 small">Error loading activity log.</div>`;
    }
}

async function quickApproveEvent(id) {
    try {
        const res = await API.approveEvent(id);
        if (res.success) {
            UI.showToast("Event Approved!", "success");
            loadAdminDashboardStats();
            loadPendingApprovalsPreview();
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
    }
}

async function quickRejectEvent(id) {
    if (!confirm("Are you sure you want to reject this event?")) return;
    try {
        const res = await API.rejectEvent(id, "Rejected from quick dashboard action");
        if (res.success) {
            UI.showToast("Event Rejected.", "warning");
            loadAdminDashboardStats();
            loadPendingApprovalsPreview();
        }
    } catch (e) {
        UI.showToast(e.message, "danger");
    }
}

/**
 * ADMIN STATISTICS LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ADMIN");
    if (!user) return;

    loadStatisticsPage();
});

async function loadStatisticsPage() {
    try {
        const res = await API.getAdminStatistics();
        if (res.success && res.data) {
            const data = res.data;
            initRoleChart(data.usersByRole || {});
        }

        const eventsRes = await API.getEvents();
        if (eventsRes.success && eventsRes.data) {
            initCategoryChart(eventsRes.data);
            renderTopEventsTable(eventsRes.data);
        }

        initRevenueChart();
    } catch (e) {
        console.error("Error loading statistics:", e);
    }
}

function initRoleChart(roles) {
    const ctx = document.getElementById("userRoleChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Attendees', 'Organizers', 'Admins'],
            datasets: [{
                data: [roles.ATTENDEE || 0, roles.ORGANIZER || 0, roles.ADMIN || 0],
                backgroundColor: ['#4f46e5', '#06b6d4', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function initCategoryChart(events) {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    const counts = {};
    events.forEach(e => {
        counts[e.category] = (counts[e.category] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Number of Events',
                data: Object.values(counts),
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function initRevenueChart() {
    const ctx = document.getElementById("monthlyRevenueChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [15000, 24000, 18000, 32000, 29000, 41000, 38000, 45000, 52000, 61000, 75000, 89000],
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => '₹' + v }
                }
            }
        }
    });
}

function renderTopEventsTable(events) {
    const container = document.getElementById("top-events-table-container");
    if (!container) return;

    const sorted = [...events].sort((a, b) => (b.capacity || 0) - (a.capacity || 0)).slice(0, 5);

    let html = `
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th>Rank</th>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Capacity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach((e, idx) => {
        html += `
            <tr>
                <td><span class="badge bg-secondary rounded-pill">#${idx + 1}</span></td>
                <td class="fw-bold">${Utils.escapeHtml(e.title)}</td>
                <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(e.category)}</span></td>
                <td>${Utils.escapeHtml(e.city)}</td>
                <td><span class="fw-semibold text-primary">${e.capacity} seats</span></td>
                <td>${Utils.getStatusBadgeHtml(e.status)}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

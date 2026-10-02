/**
 * ORGANIZER DASHBOARD LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", async () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    loadOrganizerDashboard(user.id);
});

async function loadOrganizerDashboard(organizerId) {
    try {
        const res = await API.getOrganizerStatistics(organizerId);
        if (res.success && res.data) {
            const data = res.data;
            document.getElementById("org-stat-total-events").textContent = data.totalEvents || 0;
            document.getElementById("org-stat-upcoming-events").textContent = data.upcomingEvents || 0;
            document.getElementById("org-stat-total-regs").textContent = data.totalRegistrations || 0;
            document.getElementById("org-stat-total-revenue").textContent = Utils.formatCurrency(data.totalRevenue || 0);

            initOrgSalesChart();
            initOrgStatusChart(data.events || []);
            renderUpcomingEventsList(data.events || []);
        }
    } catch (e) {
        console.error("Error loading organizer dashboard:", e);
    }
}

function initOrgSalesChart() {
    const ctx = document.getElementById("orgSalesChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Ticket Revenue (₹)',
                data: [3500, 8900, 14200, 19800, 24500, 31200],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3
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

function initOrgStatusChart(events) {
    const ctx = document.getElementById("orgStatusChart");
    if (!ctx) return;

    const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0, COMPLETED: 0 };
    events.forEach(e => {
        if (counts[e.status] !== undefined) counts[e.status]++;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Approved', 'Pending', 'Rejected', 'Completed'],
            datasets: [{
                data: [counts.APPROVED, counts.PENDING, counts.REJECTED, counts.COMPLETED],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#06b6d4']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderUpcomingEventsList(events) {
    const container = document.getElementById("org-upcoming-events-container");
    if (!container) return;

    const upcoming = events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5);

    if (upcoming.length === 0) {
        UI.renderEmptyState(container, "No upcoming events scheduled", "Click 'Host New Event' to create one.", "fa-calendar-plus");
        return;
    }

    let html = `
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th>Event Title</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    upcoming.forEach(ev => {
        html += `
            <tr>
                <td>
                    <div class="fw-bold">${Utils.escapeHtml(ev.title)}</div>
                    <span class="small text-muted">${Utils.escapeHtml(ev.category)}</span>
                </td>
                <td class="small">
                    <div><i class="fa-regular fa-calendar text-primary me-1"></i>${Utils.formatDate(ev.event_date)}</div>
                    <div class="text-muted"><i class="fa-regular fa-clock me-1"></i>${Utils.formatTime(ev.start_time)}</div>
                </td>
                <td class="small">${Utils.escapeHtml(ev.venue)}, ${Utils.escapeHtml(ev.city)}</td>
                <td>${Utils.getStatusBadgeHtml(ev.status)}</td>
                <td class="text-end">
                    <a href="edit-event.html?id=${ev.id}" class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-pen"></i> Edit</a>
                    <a href="tickets.html?eventId=${ev.id}" class="btn btn-sm btn-outline-success"><i class="fa-solid fa-ticket"></i> Tickets</a>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

/**
 * ORGANIZER STATISTICS LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ORGANIZER");
    if (!user) return;

    initOrgVelocityChart();
    initOrgCityChart();
    initOrgTicketTypeChart();
});

function initOrgVelocityChart() {
    const ctx = document.getElementById("orgVelocityChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Tickets Sold per Day',
                data: [15, 28, 45, 62, 85, 110, 145],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function initOrgCityChart() {
    const ctx = document.getElementById("orgCityChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function initOrgTicketTypeChart() {
    const ctx = document.getElementById("orgTicketTypeChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Regular Pass', 'VIP Delegate Pass', 'Student Entry', 'Fan Pit Pass'],
            datasets: [{
                label: 'Total Revenue (₹)',
                data: [42415, 71445, 83720, 107880],
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

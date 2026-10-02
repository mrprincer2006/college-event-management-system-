/**
 * ATTENDEE BROWSE EVENTS LOGIC
 * Online Event Management System
 */

document.addEventListener("DOMContentLoaded", () => {
    const user = Auth.requireRole("ATTENDEE");
    if (!user) return;

    loadBrowseEvents();

    document.getElementById("att-search-input").addEventListener("input", debounce(loadBrowseEvents, 300));
    document.getElementById("att-category-filter").addEventListener("change", loadBrowseEvents);
    document.getElementById("att-city-filter").addEventListener("change", loadBrowseEvents);
    document.getElementById("att-reset-filters").addEventListener("click", () => {
        document.getElementById("att-search-input").value = "";
        document.getElementById("att-category-filter").value = "ALL";
        document.getElementById("att-city-filter").value = "ALL";
        loadBrowseEvents();
    });
});

async function loadBrowseEvents() {
    const container = document.getElementById("att-events-browse-container");
    UI.showLoading(container, "Discovering events...");

    const search = document.getElementById("att-search-input").value.trim();
    const category = document.getElementById("att-category-filter").value;
    const city = document.getElementById("att-city-filter").value;

    try {
        const res = await API.getEvents({
            status: "APPROVED",
            search,
            category,
            city
        });

        if (!res.data || res.data.length === 0) {
            UI.renderEmptyState(container, "No matching events found", "Try clearing your category or city filters.", "fa-calendar-xmark");
            return;
        }

        container.innerHTML = "";
        res.data.forEach(ev => {
            const cardHtml = `
                <div class="col-lg-4 col-md-6">
                    <div class="card event-card">
                        <div class="event-img-wrapper">
                            <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}" class="event-img" alt="${Utils.escapeHtml(ev.title)}">
                            <span class="category-badge">${Utils.escapeHtml(ev.category)}</span>
                        </div>
                        <div class="event-body">
                            <h5 class="event-title text-truncate-2">${Utils.escapeHtml(ev.title)}</h5>
                            <div class="event-meta">
                                <span><i class="fa-solid fa-calendar-day me-1 text-primary"></i> ${Utils.formatDate(ev.event_date)} at ${Utils.formatTime(ev.start_time)}</span>
                                <span><i class="fa-solid fa-location-dot me-1 text-danger"></i> ${Utils.escapeHtml(ev.venue)}, ${Utils.escapeHtml(ev.city)}</span>
                            </div>
                            <div class="event-footer">
                                <div>
                                    <span class="text-muted small d-block">Max Capacity</span>
                                    <span class="fw-semibold text-dark">${ev.capacity} seats</span>
                                </div>
                                <a href="event-details.html?id=${ev.id}" class="btn btn-primary px-3 rounded-pill fw-semibold">
                                    <i class="fa-solid fa-ticket me-1"></i> Book / Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger">Error loading events: ${Utils.escapeHtml(e.message)}</div>`;
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

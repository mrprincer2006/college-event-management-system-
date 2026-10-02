/**
 * MAIN UI HELPERS & INTERACTIVE LOGIC
 * Online Event Management System
 */

const UI = {
    /**
     * Show Bootstrap Toast Notification
     */
    showToast: function(message, type = "success") {
        let toastContainer = document.querySelector(".toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.className = "toast-container";
            document.body.appendChild(toastContainer);
        }

        const toastId = "toast-" + Date.now();
        const bgClass = type === "success" ? "bg-success" : type === "danger" || type === "error" ? "bg-danger" : "bg-primary";
        const iconClass = type === "success" ? "fa-circle-check" : type === "danger" || type === "error" ? "fa-circle-exclamation" : "fa-info-circle";

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="fa-solid ${iconClass} fs-5"></i>
                        <span>${Utils.escapeHtml(message)}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML("beforeend", toastHtml);
        const toastEl = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
        bsToast.show();

        toastEl.addEventListener("hidden.bs.toast", () => {
            toastEl.remove();
        });
    },

    /**
     * Display Loading Spinner inside container
     */
    showLoading: function(containerEl, text = "Loading data...") {
        if (!containerEl) return;
        containerEl.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-primary mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small text-muted fw-medium">${Utils.escapeHtml(text)}</div>
            </div>
        `;
    },

    /**
     * Render Empty State inside container
     */
    renderEmptyState: function(containerEl, title = "No data found", subtitle = "Try adjusting your filters or search terms.", icon = "fa-folder-open") {
        if (!containerEl) return;
        containerEl.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid ${icon}"></i>
                <h5>${Utils.escapeHtml(title)}</h5>
                <p class="text-muted small mb-0">${Utils.escapeHtml(subtitle)}</p>
            </div>
        `;
    },

    /**
     * Set Button Loading State (prevent double-submit)
     */
    setBtnLoading: function(buttonEl, isLoading, loadingText = "Processing...") {
        if (!buttonEl) return;
        if (isLoading) {
            buttonEl.dataset.originalText = buttonEl.innerHTML;
            buttonEl.disabled = true;
            buttonEl.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
        } else {
            buttonEl.disabled = false;
            if (buttonEl.dataset.originalText) {
                buttonEl.innerHTML = buttonEl.dataset.originalText;
            }
        }
    },

    /**
     * Init Dashboard Sidebar & Header info
     */
    initDashboardLayout: function() {
        const currentUser = Auth.getCurrentUser();
        
        // Populate User Info in Sidebar & Navbar if elements exist
        const userNameEls = document.querySelectorAll(".current-user-name");
        const userEmailEls = document.querySelectorAll(".current-user-email");
        const userRoleEls = document.querySelectorAll(".current-user-role");
        const userAvatarEls = document.querySelectorAll(".current-user-avatar");

        if (currentUser) {
            userNameEls.forEach(el => el.textContent = currentUser.name);
            userEmailEls.forEach(el => el.textContent = currentUser.email);
            userRoleEls.forEach(el => el.textContent = currentUser.role);
            userAvatarEls.forEach(el => {
                const initials = currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
                el.textContent = initials;
            });
        }

        // Toggle Sidebar on mobile
        const toggleBtn = document.querySelector(".sidebar-toggle-btn");
        const sidebar = document.querySelector(".sidebar");
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("show");
            });
        }

        // Highlight Active Link in Sidebar
        const currentPath = window.location.pathname.split('/').pop();
        const sidebarLinks = document.querySelectorAll(".sidebar-nav .nav-link-custom");
        sidebarLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && href.includes(currentPath)) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }
};

// Auto-run dashboard layout initializer on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    UI.initDashboardLayout();
});

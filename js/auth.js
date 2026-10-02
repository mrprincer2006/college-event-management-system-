/**
 * AUTHENTICATION & ROUTE GUARDS
 * Online Event Management System
 */

const Auth = {
    /**
     * Get current logged-in user from sessionStorage
     */
    getCurrentUser: function() {
        try {
            const u = sessionStorage.getItem("oems_user");
            return u ? JSON.parse(u) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Set user session in sessionStorage
     */
    setSession: function(user) {
        const { password, ...safeUser } = user;
        sessionStorage.setItem("oems_user", JSON.stringify(safeUser));
    },

    /**
     * Clear user session
     */
    clearSession: function() {
        sessionStorage.removeItem("oems_user");
    },

    /**
     * Route guard: Enforce specified role access
     */
    requireRole: function(allowedRoles) {
        const user = this.getCurrentUser();
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Determine path depth relative to root for clean redirection
        const path = window.location.pathname;
        const isSubfolder = path.includes("/admin/") || path.includes("/organizer/") || path.includes("/attendee/");
        const loginUrl = isSubfolder ? "../login.html" : "login.html";

        if (!user) {
            window.location.href = loginUrl;
            return null;
        }

        if (!roles.includes(user.role)) {
            // Redirect user to their own role dashboard if trying to access unauthorized area
            let correctDashboard = "../login.html";
            if (user.role === "ADMIN") correctDashboard = isSubfolder ? "../admin/dashboard.html" : "admin/dashboard.html";
            else if (user.role === "ORGANIZER") correctDashboard = isSubfolder ? "../organizer/dashboard.html" : "organizer/dashboard.html";
            else if (user.role === "ATTENDEE") correctDashboard = isSubfolder ? "../attendee/dashboard.html" : "attendee/dashboard.html";

            window.location.href = correctDashboard;
            return null;
        }

        return user;
    },

    /**
     * Logout action
     */
    logout: async function() {
        try {
            await API.logout();
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            this.clearSession();
            const isSubfolder = window.location.pathname.includes("/admin/") || 
                              window.location.pathname.includes("/organizer/") || 
                              window.location.pathname.includes("/attendee/");
            window.location.href = isSubfolder ? "../login.html" : "login.html";
        }
    }
};

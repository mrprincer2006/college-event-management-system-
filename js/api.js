/**
 * CENTRAL API LAYER
 * Online Event Management System
 */

const API_BASE = "/api";
const USE_MOCK = true; // Set false when Java Servlets backend on Tomcat is active

const API = {
    /**
     * Generic HTTP Request Wrapper for Tomcat backend
     */
    request: async function(method, endpoint, body = null) {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "same-origin"
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            if (response.status === 401) {
                sessionStorage.removeItem("currentUser");
                window.location.href = window.location.pathname.includes("/admin/") || 
                                       window.location.pathname.includes("/organizer/") || 
                                       window.location.pathname.includes("/attendee/")
                                       ? "../login.html" : "login.html";
                throw new Error("Session expired. Please log in again.");
            }
            if (response.status === 403) {
                throw new Error("Access Denied: You do not have permission for this action.");
            }

            const resData = await response.json();
            if (!response.ok || resData.success === false) {
                throw new Error(resData.message || `Server error (${response.status})`);
            }
            return resData;
        } catch (err) {
            console.error("API Request Error:", err);
            throw err;
        }
    },

    /**
     * Artificial delay for mock mode to simulate network latency
     */
    _mockDelay: function(ms = 250) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ==========================================
    // AUTH ENDPOINTS
    // ==========================================
    login: async function(email, password) {
        if (!USE_MOCK) {
            return this.request("POST", "/auth/login", { email, password });
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!user) {
            return { success: false, message: "Invalid email or password." };
        }
        if (user.status === "BLOCKED") {
            return { success: false, message: "Your account has been blocked. Please contact admin." };
        }
        if (user.status === "INACTIVE") {
            return { success: false, message: "Your account is currently inactive." };
        }

        // Return user details without password
        const { password: _, ...userWithoutPassword } = user;
        
        // Log activity
        db.activity_logs.unshift({
            id: Date.now(),
            user_id: user.id,
            user_name: user.name,
            action: "User Login",
            description: `Logged in as ${user.role}`,
            created_at: new Date().toISOString()
        });
        MockStorage.save(db);

        return {
            success: true,
            message: "Login successful!",
            data: userWithoutPassword
        };
    },

    register: async function(name, email, password, role) {
        if (!USE_MOCK) {
            return this.request("POST", "/auth/register", { name, email, password, role });
        }
        await this._mockDelay();
        const db = MockStorage.get();
        
        if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: "Email is already registered." };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: role || "ATTENDEE",
            status: "ACTIVE",
            created_at: new Date().toISOString()
        };

        db.users.push(newUser);
        db.activity_logs.unshift({
            id: Date.now(),
            user_id: newUser.id,
            user_name: newUser.name,
            action: "User Registered",
            description: `New ${newUser.role} account created`,
            created_at: new Date().toISOString()
        });
        MockStorage.save(db);

        return {
            success: true,
            message: "Registration successful! You can now log in.",
            data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        };
    },

    logout: async function() {
        if (!USE_MOCK) {
            return this.request("POST", "/auth/logout");
        }
        await this._mockDelay(100);
        return { success: true, message: "Logged out successfully." };
    },

    // ==========================================
    // EVENTS ENDPOINTS
    // ==========================================
    getEvents: async function(filters = {}) {
        if (!USE_MOCK) {
            const query = new URLSearchParams(filters).toString();
            return this.request("GET", `/events?${query}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        let list = [...db.events];

        if (filters.status) {
            list = list.filter(e => e.status === filters.status);
        }
        if (filters.category && filters.category !== "ALL") {
            list = list.filter(e => e.category === filters.category);
        }
        if (filters.city && filters.city !== "ALL") {
            list = list.filter(e => e.city.toLowerCase() === filters.city.toLowerCase());
        }
        if (filters.organizer_id) {
            list = list.filter(e => e.organizer_id == filters.organizer_id);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
        }

        return { success: true, data: list };
    },

    getEventById: async function(id) {
        if (!USE_MOCK) {
            return this.request("GET", `/events/${id}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const event = db.events.find(e => e.id == id);
        if (!event) {
            return { success: false, message: "Event not found." };
        }
        const organizer = db.users.find(u => u.id == event.organizer_id);
        const tickets = db.tickets.filter(t => t.event_id == event.id);

        return {
            success: true,
            data: { ...event, organizer_name: organizer ? organizer.name : "Organizer", tickets }
        };
    },

    createEvent: async function(eventData) {
        if (!USE_MOCK) {
            return this.request("POST", "/events", eventData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const newEvent = {
            id: Date.now(),
            ...eventData,
            status: "PENDING",
            created_at: new Date().toISOString()
        };
        db.events.unshift(newEvent);

        db.activity_logs.unshift({
            id: Date.now(),
            user_id: eventData.organizer_id,
            user_name: "Organizer",
            action: "Event Created",
            description: `Created event '${newEvent.title}'`,
            created_at: new Date().toISOString()
        });

        MockStorage.save(db);
        return { success: true, message: "Event submitted successfully for Admin approval.", data: newEvent };
    },

    updateEvent: async function(id, eventData) {
        if (!USE_MOCK) {
            return this.request("PUT", `/events/${id}`, eventData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const idx = db.events.findIndex(e => e.id == id);
        if (idx === -1) return { success: false, message: "Event not found." };

        db.events[idx] = { ...db.events[idx], ...eventData };
        MockStorage.save(db);
        return { success: true, message: "Event updated successfully.", data: db.events[idx] };
    },

    deleteEvent: async function(id) {
        if (!USE_MOCK) {
            return this.request("DELETE", `/events/${id}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        db.events = db.events.filter(e => e.id != id);
        db.tickets = db.tickets.filter(t => t.event_id != id);
        MockStorage.save(db);
        return { success: true, message: "Event deleted successfully." };
    },

    // ==========================================
    // ADMIN EVENT APPROVALS
    // ==========================================
    getPendingEvents: async function() {
        return this.getEvents({ status: "PENDING" });
    },

    approveEvent: async function(id) {
        if (!USE_MOCK) {
            return this.request("PUT", `/admin/events/${id}/approve`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const ev = db.events.find(e => e.id == id);
        if (!ev) return { success: false, message: "Event not found." };

        ev.status = "APPROVED";
        db.activity_logs.unshift({
            id: Date.now(),
            user_id: 1,
            user_name: "Admin",
            action: "Event Approved",
            description: `Approved event '${ev.title}'`,
            created_at: new Date().toISOString()
        });

        // Notify organizer
        db.notifications.unshift({
            id: Date.now(),
            user_id: ev.organizer_id,
            event_id: ev.id,
            title: "Event Approved!",
            message: `Your event '${ev.title}' has been approved by admin.`,
            is_read: false,
            created_at: new Date().toISOString()
        });

        MockStorage.save(db);
        return { success: true, message: "Event approved successfully!" };
    },

    rejectEvent: async function(id, reason = "") {
        if (!USE_MOCK) {
            return this.request("PUT", `/admin/events/${id}/reject`, { reason });
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const ev = db.events.find(e => e.id == id);
        if (!ev) return { success: false, message: "Event not found." };

        ev.status = "REJECTED";
        db.activity_logs.unshift({
            id: Date.now(),
            user_id: 1,
            user_name: "Admin",
            action: "Event Rejected",
            description: `Rejected event '${ev.title}'. Reason: ${reason || 'N/A'}`,
            created_at: new Date().toISOString()
        });

        db.notifications.unshift({
            id: Date.now(),
            user_id: ev.organizer_id,
            event_id: ev.id,
            title: "Event Rejected",
            message: `Your event '${ev.title}' was rejected. Reason: ${reason || 'Not specified'}`,
            is_read: false,
            created_at: new Date().toISOString()
        });

        MockStorage.save(db);
        return { success: true, message: "Event rejected." };
    },

    // ==========================================
    // USERS MANAGEMENT
    // ==========================================
    getUsers: async function(filters = {}) {
        if (!USE_MOCK) {
            const query = new URLSearchParams(filters).toString();
            return this.request("GET", `/admin/users?${query}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        let list = [...db.users];

        if (filters.role && filters.role !== "ALL") {
            list = list.filter(u => u.role === filters.role);
        }
        if (filters.status && filters.status !== "ALL") {
            list = list.filter(u => u.status === filters.status);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }

        return { success: true, data: list };
    },

    createUser: async function(userData) {
        if (!USE_MOCK) {
            return this.request("POST", "/admin/users", userData);
        }
        await this._mockDelay();
        const db = MockStorage.get();

        if (db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, message: "User with this email already exists." };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            created_at: new Date().toISOString()
        };
        db.users.push(newUser);
        MockStorage.save(db);
        return { success: true, message: "User created successfully.", data: newUser };
    },

    updateUser: async function(id, userData) {
        if (!USE_MOCK) {
            return this.request("PUT", `/admin/users/${id}`, userData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const idx = db.users.findIndex(u => u.id == id);
        if (idx === -1) return { success: false, message: "User not found." };

        db.users[idx] = { ...db.users[idx], ...userData };
        MockStorage.save(db);
        return { success: true, message: "User updated successfully.", data: db.users[idx] };
    },

    deleteUser: async function(id) {
        if (!USE_MOCK) {
            return this.request("DELETE", `/admin/users/${id}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        db.users = db.users.filter(u => u.id != id);
        MockStorage.save(db);
        return { success: true, message: "User deleted successfully." };
    },

    // ==========================================
    // TICKETS MANAGEMENT
    // ==========================================
    getTicketsByEvent: async function(eventId) {
        if (!USE_MOCK) {
            return this.request("GET", `/events/${eventId}/tickets`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const tickets = db.tickets.filter(t => t.event_id == eventId);
        return { success: true, data: tickets };
    },

    createTicket: async function(eventId, ticketData) {
        if (!USE_MOCK) {
            return this.request("POST", `/events/${eventId}/tickets`, ticketData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const newTicket = {
            id: Date.now(),
            event_id: parseInt(eventId, 10),
            ticket_name: ticketData.ticket_name,
            price: parseFloat(ticketData.price),
            quantity: parseInt(ticketData.quantity, 10),
            available_quantity: parseInt(ticketData.quantity, 10),
            sale_start: ticketData.sale_start,
            sale_end: ticketData.sale_end
        };
        db.tickets.push(newTicket);
        MockStorage.save(db);
        return { success: true, message: "Ticket tier created successfully.", data: newTicket };
    },

    updateTicket: async function(id, ticketData) {
        if (!USE_MOCK) {
            return this.request("PUT", `/tickets/${id}`, ticketData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const idx = db.tickets.findIndex(t => t.id == id);
        if (idx === -1) return { success: false, message: "Ticket not found." };

        db.tickets[idx] = { ...db.tickets[idx], ...ticketData };
        MockStorage.save(db);
        return { success: true, message: "Ticket updated successfully.", data: db.tickets[idx] };
    },

    deleteTicket: async function(id) {
        if (!USE_MOCK) {
            return this.request("DELETE", `/tickets/${id}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        db.tickets = db.tickets.filter(t => t.id != id);
        MockStorage.save(db);
        return { success: true, message: "Ticket tier deleted." };
    },

    // ==========================================
    // TICKET PURCHASES & REGISTRATIONS
    // ==========================================
    purchaseTicket: async function(purchaseData) {
        if (!USE_MOCK) {
            return this.request("POST", "/tickets/purchase", purchaseData);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const ticket = db.tickets.find(t => t.id == purchaseData.ticket_id);
        if (!ticket) return { success: false, message: "Selected ticket tier not found." };
        if (ticket.available_quantity < purchaseData.quantity) {
            return { success: false, message: "Not enough tickets available." };
        }

        ticket.available_quantity -= purchaseData.quantity;

        const regId = Date.now();
        const newReg = {
            id: regId,
            event_id: purchaseData.event_id,
            attendee_id: purchaseData.attendee_id,
            ticket_id: purchaseData.ticket_id,
            quantity: purchaseData.quantity,
            registration_date: new Date().toISOString(),
            status: "APPROVED"
        };
        db.registrations.push(newReg);

        const totalAmount = ticket.price * purchaseData.quantity;
        const newPayment = {
            id: Date.now() + 1,
            registration_id: regId,
            amount: totalAmount,
            payment_method: purchaseData.payment_method || "UPI",
            transaction_id: "TXN" + Math.floor(100000000 + Math.random() * 900000000),
            payment_status: "SUCCESS",
            payment_date: new Date().toISOString()
        };
        db.payments.push(newPayment);

        const ev = db.events.find(e => e.id == purchaseData.event_id);
        const eventTitle = ev ? ev.title : "Event";

        db.notifications.unshift({
            id: Date.now() + 2,
            user_id: purchaseData.attendee_id,
            event_id: purchaseData.event_id,
            title: "Ticket Purchase Confirmed",
            message: `You successfully bought ${purchaseData.quantity} x ${ticket.ticket_name} for '${eventTitle}'.`,
            is_read: false,
            created_at: new Date().toISOString()
        });

        db.activity_logs.unshift({
            id: Date.now() + 3,
            user_id: purchaseData.attendee_id,
            user_name: purchaseData.attendee_name || "Attendee",
            action: "Ticket Purchased",
            description: `Bought ${ticket.ticket_name} for '${eventTitle}' (₹${totalAmount})`,
            created_at: new Date().toISOString()
        });

        MockStorage.save(db);
        return {
            success: true,
            message: "Ticket purchase successful!",
            data: { registration: newReg, payment: newPayment, ticket }
        };
    },

    getAttendeeTickets: async function(attendeeId) {
        if (!USE_MOCK) {
            return this.request("GET", "/attendee/tickets");
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const regs = db.registrations.filter(r => r.attendee_id == attendeeId);

        const result = regs.map(r => {
            const ev = db.events.find(e => e.id == r.event_id) || {};
            const ticket = db.tickets.find(t => t.id == r.ticket_id) || {};
            const pay = db.payments.find(p => p.registration_id == r.id) || {};
            return {
                registration_id: r.id,
                event: ev,
                ticket: ticket,
                payment: pay,
                quantity: r.quantity || 1,
                registration_date: r.registration_date,
                status: r.status
            };
        });

        return { success: true, data: result };
    },

    getAttendeeRegistrations: async function(attendeeId) {
        return this.getAttendeeTickets(attendeeId);
    },

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    getNotifications: async function(userId) {
        if (!USE_MOCK) {
            return this.request("GET", "/notifications");
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const list = db.notifications.filter(n => n.user_id == userId);
        return { success: true, data: list };
    },

    markNotificationRead: async function(id) {
        if (!USE_MOCK) {
            return this.request("PUT", `/notifications/${id}/read`);
        }
        await this._mockDelay(100);
        const db = MockStorage.get();
        const n = db.notifications.find(x => x.id == id);
        if (n) n.is_read = true;
        MockStorage.save(db);
        return { success: true };
    },

    sendOrganizerNotification: async function(eventId, title, message) {
        if (!USE_MOCK) {
            return this.request("POST", "/organizer/notifications", { eventId, title, message });
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const regs = db.registrations.filter(r => r.event_id == eventId);
        const attendeeIds = [...new Set(regs.map(r => r.attendee_id))];

        attendeeIds.forEach(attId => {
            db.notifications.unshift({
                id: Date.now() + Math.random(),
                user_id: attId,
                event_id: parseInt(eventId, 10),
                title: title,
                message: message,
                is_read: false,
                created_at: new Date().toISOString()
            });
        });

        MockStorage.save(db);
        return { success: true, message: `Notification sent to ${attendeeIds.length} registered attendees.` };
    },

    // ==========================================
    // STATISTICS & REPORTS
    // ==========================================
    getAdminStatistics: async function() {
        if (!USE_MOCK) {
            return this.request("GET", "/admin/statistics");
        }
        await this._mockDelay();
        const db = MockStorage.get();

        const totalUsers = db.users.length;
        const totalEvents = db.events.length;
        const pendingEvents = db.events.filter(e => e.status === "PENDING").length;
        const approvedEvents = db.events.filter(e => e.status === "APPROVED").length;
        const totalRegistrations = db.registrations.length;
        const totalRevenue = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);

        return {
            success: true,
            data: {
                totalUsers,
                totalEvents,
                pendingEvents,
                approvedEvents,
                totalRegistrations,
                totalRevenue,
                eventsByStatus: {
                    APPROVED: db.events.filter(e => e.status === "APPROVED").length,
                    PENDING: db.events.filter(e => e.status === "PENDING").length,
                    REJECTED: db.events.filter(e => e.status === "REJECTED").length,
                    COMPLETED: db.events.filter(e => e.status === "COMPLETED").length
                },
                usersByRole: {
                    ADMIN: db.users.filter(u => u.role === "ADMIN").length,
                    ORGANIZER: db.users.filter(u => u.role === "ORGANIZER").length,
                    ATTENDEE: db.users.filter(u => u.role === "ATTENDEE").length
                }
            }
        };
    },

    getOrganizerStatistics: async function(organizerId) {
        if (!USE_MOCK) {
            return this.request("GET", `/organizer/statistics?organizer_id=${organizerId}`);
        }
        await this._mockDelay();
        const db = MockStorage.get();
        const myEvents = db.events.filter(e => e.organizer_id == organizerId);
        const myEventIds = myEvents.map(e => e.id);

        const myRegs = db.registrations.filter(r => myEventIds.includes(r.event_id));
        const myRegIds = myRegs.map(r => r.id);
        const myPayments = db.payments.filter(p => myRegIds.includes(p.registration_id));

        const totalRevenue = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
            success: true,
            data: {
                totalEvents: myEvents.length,
                upcomingEvents: myEvents.filter(e => new Date(e.event_date) >= new Date()).length,
                totalRegistrations: myRegs.length,
                totalRevenue: totalRevenue,
                events: myEvents
            }
        };
    },

    // ==========================================
    // EXTRAS: SETTINGS, ACTIVITIES, ATTENDEES, PROFILE
    // ==========================================
    getAdminSettings: async function() {
        if (!USE_MOCK) return this.request("GET", "/admin/settings");
        await this._mockDelay();
        const db = MockStorage.get();
        return { success: true, data: db.system_settings };
    },

    updateAdminSettings: async function(settingsData) {
        if (!USE_MOCK) return this.request("PUT", "/admin/settings", settingsData);
        await this._mockDelay();
        const db = MockStorage.get();
        db.system_settings = { ...db.system_settings, ...settingsData };
        MockStorage.save(db);
        return { success: true, message: "System settings saved successfully." };
    },

    getActivityLogs: async function() {
        if (!USE_MOCK) return this.request("GET", "/admin/activity");
        await this._mockDelay();
        const db = MockStorage.get();
        return { success: true, data: db.activity_logs };
    },

    getOrganizerAttendees: async function(eventId) {
        if (!USE_MOCK) return this.request("GET", `/organizer/attendees?eventId=${eventId}`);
        await this._mockDelay();
        const db = MockStorage.get();
        let regs = db.registrations;
        if (eventId) {
            regs = regs.filter(r => r.event_id == eventId);
        }

        const data = regs.map(r => {
            const att = db.users.find(u => u.id == r.attendee_id) || {};
            const ticket = db.tickets.find(t => t.id == r.ticket_id) || {};
            const pay = db.payments.find(p => p.registration_id == r.id) || {};
            const ev = db.events.find(e => e.id == r.event_id) || {};
            return {
                id: r.id,
                attendee_name: att.name || "Attendee",
                attendee_email: att.email || "N/A",
                event_title: ev.title || "Event",
                ticket_name: ticket.ticket_name || "General",
                registration_date: r.registration_date,
                payment_status: pay.payment_status || "PENDING",
                amount: pay.amount || 0
            };
        });

        return { success: true, data };
    },

    getAttendeeProfile: async function(userId) {
        if (!USE_MOCK) return this.request("GET", `/attendee/profile?id=${userId}`);
        await this._mockDelay();
        const db = MockStorage.get();
        const u = db.users.find(x => x.id == userId);
        return { success: true, data: u };
    },

    updateAttendeeProfile: async function(userId, profileData) {
        if (!USE_MOCK) return this.request("PUT", `/attendee/profile?id=${userId}`, profileData);
        await this._mockDelay();
        const db = MockStorage.get();
        const idx = db.users.findIndex(x => x.id == userId);
        if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...profileData };
            MockStorage.save(db);
        }
        return { success: true, message: "Profile updated successfully.", data: db.users[idx] };
    }
};

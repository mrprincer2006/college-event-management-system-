/**
 * MOCK DATA & LOCALSTORAGE PERSISTENCE
 * Online Event Management System
 */

const INITIAL_MOCK_DATA = {
    users: [
        { id: 1, name: "Admin User", email: "admin@event.com", password: "admin123", role: "ADMIN", status: "ACTIVE", created_at: "2026-01-10T10:00:00Z" },
        { id: 2, name: "Tech Events Co.", email: "organizer@event.com", password: "org123", role: "ORGANIZER", status: "ACTIVE", created_at: "2026-01-12T11:00:00Z" },
        { id: 3, name: "College Fest Comm", email: "fest@organizer.com", password: "org123", role: "ORGANIZER", status: "ACTIVE", created_at: "2026-01-15T09:30:00Z" },
        { id: 4, name: "Music Pulse India", email: "music@organizer.com", password: "org123", role: "ORGANIZER", status: "ACTIVE", created_at: "2026-01-20T14:15:00Z" },
        { id: 5, name: "Rahul Sharma", email: "attendee@event.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-01T10:00:00Z", phone: "+91 9876543210" },
        { id: 6, name: "Priya Patel", email: "priya@gmail.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-02T12:30:00Z", phone: "+91 9876543211" },
        { id: 7, name: "Aarav Kumar", email: "aarav@gmail.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-05T15:00:00Z", phone: "+91 9876543212" },
        { id: 8, name: "Sneha Reddy", email: "sneha@yahoo.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-10T11:20:00Z", phone: "+91 9876543213" },
        { id: 9, name: "Vikram Singh", email: "vikram@outlook.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-12T16:45:00Z", phone: "+91 9876543214" },
        { id: 10, name: "Ananya Roy", email: "ananya@gmail.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-15T09:10:00Z", phone: "+91 9876543215" },
        { id: 11, name: "Rohan Verma", email: "rohan@gmail.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-18T14:00:00Z", phone: "+91 9876543216" },
        { id: 12, name: "Neha Gupta", email: "neha@gmail.com", password: "att123", role: "ATTENDEE", status: "INACTIVE", created_at: "2026-02-20T10:30:00Z", phone: "+91 9876543217" },
        { id: 13, name: "Karan Johar", email: "karan@gmail.com", password: "att123", role: "ATTENDEE", status: "BLOCKED", created_at: "2026-02-22T17:00:00Z", phone: "+91 9876543218" },
        { id: 14, name: "Diya Joshi", email: "diya@gmail.com", password: "att123", role: "ATTENDEE", status: "ACTIVE", created_at: "2026-02-25T13:15:00Z", phone: "+91 9876543219" }
    ],

    events: [
        {
            id: 101,
            organizer_id: 2,
            title: "National AI & Tech Innovation Summit 2026",
            description: "Explore the latest breakthroughs in Artificial Intelligence, Neural Networks, and Generative Tech with leading industry founders and innovators.",
            event_date: "2026-11-15",
            start_time: "09:00",
            end_time: "17:00",
            venue: "NIMS Convention Centre, Tech Park",
            city: "Bengaluru",
            category: "Technology",
            capacity: 500,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-10T10:00:00Z"
        },
        {
            id: 102,
            organizer_id: 4,
            title: "Sunburn Campus Beats Night",
            description: "An incredible night of electronic music, lights, and non-stop energy featuring top DJs across the country.",
            event_date: "2026-11-20",
            start_time: "18:00",
            end_time: "23:00",
            venue: "Open Air Amphitheatre, Campus Ground",
            city: "Mumbai",
            category: "Music",
            capacity: 1200,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-12T12:00:00Z"
        },
        {
            id: 103,
            organizer_id: 2,
            title: "Startup Founders & Investor Meetup",
            description: "Network with VCs, angel investors, and pitch your startup idea for seed funding opportunities.",
            event_date: "2026-12-05",
            start_time: "10:30",
            end_time: "16:00",
            venue: "The Grand Hyatt Ballroom",
            city: "Hyderabad",
            category: "Business",
            capacity: 250,
            status: "PENDING",
            image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-28T09:00:00Z"
        },
        {
            id: 104,
            organizer_id: 3,
            title: "Inter-College Sports Championship 2026",
            description: "Annual football, basketball, and track & field tournament for university athletes.",
            event_date: "2026-11-10",
            start_time: "08:00",
            end_time: "18:00",
            venue: "University Sports Complex",
            city: "Delhi",
            category: "Sports",
            capacity: 800,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-01-25T11:00:00Z"
        },
        {
            id: 105,
            organizer_id: 3,
            title: "Global Higher Education Expo",
            description: "Meet representatives from top foreign universities, learn about scholarships, and explore study abroad options.",
            event_date: "2026-12-12",
            start_time: "10:00",
            end_time: "17:00",
            venue: "Pragati Maidan Exhibition Centre",
            city: "Delhi",
            category: "Education",
            capacity: 1000,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-05T14:30:00Z"
        },
        {
            id: 106,
            organizer_id: 4,
            title: "Contemporary Art & Digital Photography Exhibition",
            description: "Showcasing student artwork, digital installations, and interactive photography galleries.",
            event_date: "2026-11-28",
            start_time: "11:00",
            end_time: "19:00",
            venue: "Kala Academy Art Gallery",
            city: "Goa",
            category: "Arts",
            capacity: 300,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-18T16:00:00Z"
        },
        {
            id: 107,
            organizer_id: 2,
            title: "Web3 & Blockchain Developers Hackathon",
            description: "24-hour non-stop hackathon with prize pool worth ₹2,00,000 for smart contract innovations.",
            event_date: "2026-12-18",
            start_time: "10:00",
            end_time: "10:00",
            venue: "Innovation Hub Labs",
            city: "Pune",
            category: "Technology",
            capacity: 150,
            status: "PENDING",
            image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-03-01T15:00:00Z"
        },
        {
            id: 108,
            organizer_id: 3,
            title: "Classical Classical Dance & Cultural Night",
            description: "A cultural evening celebrating Kathak, Bharatanatyam, and folk dances of India.",
            event_date: "2026-10-15",
            start_time: "17:30",
            end_time: "21:30",
            venue: "Ravindra Bharathi Auditorium",
            city: "Hyderabad",
            category: "Arts",
            capacity: 450,
            status: "COMPLETED",
            image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-01-05T08:00:00Z"
        },
        {
            id: 109,
            organizer_id: 4,
            title: "Uncensored Standup Comedy Night",
            description: "Get ready to laugh till your stomach hurts with top college comedians and surprise guest acts.",
            event_date: "2026-12-02",
            start_time: "19:00",
            end_time: "21:30",
            venue: "The Comedy Club House",
            city: "Bengaluru",
            category: "Arts",
            capacity: 200,
            status: "REJECTED",
            image_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-14T18:00:00Z"
        },
        {
            id: 110,
            organizer_id: 2,
            title: "Fullstack Web Development Bootcamp",
            description: "Intensive 1-day workshop covering React, Node.js, REST APIs, and Cloud Deployment.",
            event_date: "2026-11-25",
            start_time: "10:00",
            end_time: "16:00",
            venue: "CS Seminar Hall 2",
            city: "Chennai",
            category: "Technology",
            capacity: 100,
            status: "APPROVED",
            image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
            created_at: "2026-02-22T13:00:00Z"
        }
    ],

    tickets: [
        { id: 201, event_id: 101, ticket_name: "Regular Pass", price: 499, quantity: 300, available_quantity: 215, sale_start: "2026-02-15", sale_end: "2026-11-14" },
        { id: 202, event_id: 101, ticket_name: "VIP Delegate Pass", price: 1299, quantity: 100, available_quantity: 45, sale_start: "2026-02-15", sale_end: "2026-11-14" },
        { id: 203, event_id: 102, ticket_name: "Student Entry Ticket", price: 299, quantity: 800, available_quantity: 520, sale_start: "2026-02-15", sale_end: "2026-11-19" },
        { id: 204, event_id: 102, ticket_name: "Fan Pit VIP Pass", price: 899, quantity: 200, available_quantity: 80, sale_start: "2026-02-15", sale_end: "2026-11-19" },
        { id: 205, event_id: 104, ticket_name: "Participant Pass", price: 150, quantity: 500, available_quantity: 340, sale_start: "2026-02-01", sale_end: "2026-11-09" },
        { id: 206, event_id: 105, ticket_name: "General Visitor Ticket", price: 0, quantity: 1000, available_quantity: 750, sale_start: "2026-02-05", sale_end: "2026-12-11" },
        { id: 207, event_id: 106, ticket_name: "Exhibition Entry", price: 199, quantity: 300, available_quantity: 220, sale_start: "2026-02-20", sale_end: "2026-11-27" },
        { id: 208, event_id: 110, ticket_name: "Standard Workshop Seat", price: 350, quantity: 100, available_quantity: 65, sale_start: "2026-02-23", sale_end: "2026-11-24" }
    ],

    registrations: [
        { id: 301, event_id: 101, attendee_id: 5, ticket_id: 201, registration_date: "2026-02-20T10:15:00Z", status: "APPROVED" },
        { id: 302, event_id: 102, attendee_id: 5, ticket_id: 204, registration_date: "2026-02-22T14:30:00Z", status: "APPROVED" },
        { id: 303, event_id: 105, attendee_id: 6, ticket_id: 206, registration_date: "2026-02-24T11:00:00Z", status: "APPROVED" },
        { id: 304, event_id: 101, attendee_id: 7, ticket_id: 202, registration_date: "2026-02-25T16:20:00Z", status: "APPROVED" },
        { id: 305, event_id: 104, attendee_id: 8, ticket_id: 205, registration_date: "2026-02-26T09:45:00Z", status: "APPROVED" }
    ],

    payments: [
        { id: 401, registration_id: 301, amount: 499, payment_method: "UPI", transaction_id: "TXN984728410", payment_status: "SUCCESS", payment_date: "2026-02-20T10:16:00Z" },
        { id: 402, registration_id: 302, amount: 899, payment_method: "CARD", transaction_id: "TXN984729115", payment_status: "SUCCESS", payment_date: "2026-02-22T14:31:00Z" },
        { id: 403, registration_id: 303, amount: 0, payment_method: "FREE", transaction_id: "TXN984730000", payment_status: "SUCCESS", payment_date: "2026-02-24T11:00:00Z" },
        { id: 404, registration_id: 304, amount: 1299, payment_method: "NET_BANKING", transaction_id: "TXN984731450", payment_status: "SUCCESS", payment_date: "2026-02-25T16:21:00Z" },
        { id: 405, registration_id: 305, amount: 150, payment_method: "UPI", transaction_id: "TXN984732100", payment_status: "SUCCESS", payment_date: "2026-02-26T09:46:00Z" }
    ],

    notifications: [
        { id: 501, user_id: 5, event_id: 101, title: "Registration Confirmed!", message: "Your registration for National AI & Tech Innovation Summit 2026 is confirmed. Ticket #201.", is_read: false, created_at: "2026-02-20T10:16:00Z" },
        { id: 502, user_id: 5, event_id: 102, title: "Sunburn Beats Ticket Ready", message: "Your Fan Pit VIP Pass ticket is available in 'My Tickets'. Show the QR code at the gate.", is_read: false, created_at: "2026-02-22T14:31:00Z" },
        { id: 503, user_id: 2, event_id: 101, title: "Event Approved", message: "Admin has approved your event 'National AI & Tech Innovation Summit 2026'.", is_read: true, created_at: "2026-02-11T09:00:00Z" },
        { id: 504, user_id: 5, event_id: 101, title: "Organizer Announcement", message: "Venue parking details update: Gate 3 is reserved for attendee parking.", is_read: false, created_at: "2026-02-27T15:00:00Z" }
    ],

    system_settings: {
        website_name: "CampusEventHub - Online Event Management",
        registration_enabled: true,
        max_ticket_limit: 10,
        notification_enabled: true,
        event_approval_required: true
    },

    activity_logs: [
        { id: 601, user_id: 5, user_name: "Rahul Sharma", action: "Ticket Purchased", description: "Purchased Regular Pass for National AI & Tech Innovation Summit 2026 (₹499)", created_at: "2026-02-20T10:16:00Z" },
        { id: 602, user_id: 5, user_name: "Rahul Sharma", action: "Ticket Purchased", description: "Purchased Fan Pit VIP Pass for Sunburn Campus Beats Night (₹899)", created_at: "2026-02-22T14:31:00Z" },
        { id: 603, user_id: 1, user_name: "Admin User", action: "Event Approved", description: "Approved event 'National AI & Tech Innovation Summit 2026'", created_at: "2026-02-11T09:00:00Z" },
        { id: 604, user_id: 2, user_name: "Tech Events Co.", action: "Event Created", description: "Submitted new event 'Web3 & Blockchain Developers Hackathon' for approval", created_at: "2026-03-01T15:00:00Z" },
        { id: 605, user_id: 6, user_name: "Priya Patel", action: "User Login", description: "Logged into Attendee portal from Chrome/macOS", created_at: "2026-03-02T11:20:00Z" }
    ]
};

// Initialize localStorage mock state if not present
(function initMockStorage() {
    if (!localStorage.getItem("oems_db")) {
        localStorage.setItem("oems_db", JSON.stringify(INITIAL_MOCK_DATA));
    }
})();

/**
 * Storage Helper for CRUD in Mock Mode
 */
const MockStorage = {
    get: function() {
        try {
            return JSON.parse(localStorage.getItem("oems_db")) || INITIAL_MOCK_DATA;
        } catch (e) {
            return INITIAL_MOCK_DATA;
        }
    },
    save: function(data) {
        localStorage.setItem("oems_db", JSON.stringify(data));
    },
    reset: function() {
        localStorage.setItem("oems_db", JSON.stringify(INITIAL_MOCK_DATA));
    }
};

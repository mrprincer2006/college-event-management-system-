# Online Event Management System — Frontend

> **Academic Project** | Java Programming — Review 1  
> Department of Computer Science & Engineering  

A fully-functional, role-based **web event management platform** built with pure HTML5, CSS3, Bootstrap 5, and Vanilla JavaScript. The frontend communicates exclusively with a Java Servlets + JDBC + MySQL backend over HTTP/JSON. All pages operate in **mock mode** by default — no backend needed to explore the full UI.

---

## ✨ Features by Role

### 👨‍💼 ADMIN
- System overview dashboard with Chart.js analytics (status breakdown, revenue trends)
- Full user management: create, edit, block/activate, delete accounts
- Event approval queue: approve or reject with reason
- Activity audit log with 30-second auto-refresh
- Global system settings: registration toggle, max tickets, approval enforcement
- Statistics: role distribution, category breakup, monthly revenue bar charts

### 📋 ORGANIZER
- Personal dashboard: event count, registration count, revenue totals
- Create & edit events with full validation (date/time/capacity)
- Ticket tier management: price (₹), quantity, sale window
- Attendee roster by event with CSV export
- Broadcast announcements to registered attendees
- Event performance analytics via Chart.js

### 🎫 ATTENDEE
- Browse events with search, category, and city filters
- Event detail page with live ticket price summary calculator
- Simulated payment flow (UPI / CARD / Net Banking / Cash)
- My Tickets page with printable digital pass + SVG QR code placeholder
- Registration history with payment status filter
- Notifications inbox with mark-read functionality
- Profile management: photo upload, phone, password change, notification preferences

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic) |
| Styling | Bootstrap 5 + Custom CSS3 (CSS Variables) |
| Scripting | Vanilla JavaScript ES6+ (no frameworks) |
| Icons | Font Awesome 6 (CDN) |
| Charts | Chart.js (CDN) |
| Fonts | Google Fonts — Inter |
| Backend (planned) | Java Servlets + JDBC + MySQL on Apache Tomcat |
| API Communication | Fetch API + JSON |

---

## 📁 Folder Structure

```
online-event-management/
├── frontend/
│   ├── index.html                  ← Public home page
│   ├── login.html                  ← Login (role-based redirect)
│   ├── register.html               ← Register (Attendee / Organizer)
│   ├── admin/
│   │   ├── dashboard.html          ← Admin overview + charts
│   │   ├── users.html              ← User CRUD + filter
│   │   ├── event-approvals.html    ← Approve/Reject queue
│   │   ├── settings.html           ← System configuration
│   │   ├── statistics.html         ← Advanced analytics
│   │   └── activity.html           ← Real-time audit log
│   ├── organizer/
│   │   ├── dashboard.html
│   │   ├── events.html
│   │   ├── create-event.html
│   │   ├── edit-event.html
│   │   ├── tickets.html
│   │   ├── attendees.html
│   │   ├── communication.html
│   │   └── statistics.html
│   ├── attendee/
│   │   ├── dashboard.html
│   │   ├── events.html
│   │   ├── event-details.html      ← Ticket purchase + payment modal
│   │   ├── my-tickets.html         ← QR pass + print
│   │   ├── registrations.html
│   │   ├── notifications.html
│   │   └── profile.html
│   ├── css/
│   │   ├── style.css               ← Global design system + CSS variables
│   │   ├── auth.css
│   │   ├── dashboard.css           ← Sidebar/navbar shared layout
│   │   ├── admin.css
│   │   ├── organizer.css
│   │   └── attendee.css
│   ├── js/
│   │   ├── main.js                 ← UI helpers (toast, spinner, sidebar)
│   │   ├── auth.js                 ← Session + route guards
│   │   ├── api.js                  ← ALL API calls (mock + real)
│   │   ├── utils.js                ← Formatters, validators, helpers
│   │   ├── mock-data.js            ← In-memory mock database
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── users.js
│   │   │   ├── approvals.js
│   │   │   ├── settings.js
│   │   │   ├── statistics.js
│   │   │   └── activity.js
│   │   ├── organizer/
│   │   │   ├── dashboard.js
│   │   │   ├── events.js
│   │   │   ├── tickets.js
│   │   │   ├── attendees.js
│   │   │   ├── communication.js
│   │   │   └── statistics.js
│   │   └── attendee/
│   │       ├── dashboard.js
│   │       ├── events.js
│   │       ├── event-details.js
│   │       ├── tickets.js
│   │       ├── registrations.js
│   │       └── notifications.js
│   └── assets/
│       ├── images/
│       └── icons/
└── README.md
```

---

## 🚀 How to Run (Frontend Only)

### Option 1 — VS Code Live Server (Recommended)
1. Open the `online-event-management/` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `frontend/index.html` → **Open with Live Server**
4. Navigate to `http://127.0.0.1:5500/frontend/index.html`

### Option 2 — Python Simple HTTP Server
```bash
cd online-event-management/frontend
python3 -m http.server 8080
# Open: http://localhost:8080
```

### Option 3 — npx serve
```bash
npx serve online-event-management/frontend
```

---

## 🔐 Mock Login Credentials

> Available as quick-fill buttons on the Login page

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@event.com` | `admin123` |
| **ORGANIZER** | `organizer@event.com` | `org123` |
| **ATTENDEE** | `attendee@event.com` | `att123` |

---

## 🔄 Switching to Real Java Backend

1. Open `frontend/js/api.js`
2. Change the configuration at the top:
```js
// BEFORE (mock mode)
const API_BASE = "/api";
const USE_MOCK = true;

// AFTER (Java Servlets on Tomcat)
const API_BASE = "http://localhost:8080/online-event-management/api";
const USE_MOCK = false;
```
3. Deploy the WAR file to Apache Tomcat
4. Ensure CORS headers are set in your `Filter` class (or use `web.xml`)

That's the **only** change needed — all API function names remain identical.

---

## 🌐 REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/events` | List approved events |
| GET | `/api/events/{id}` | Event detail + tickets |
| POST | `/api/events` | Create event (Organizer) |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/admin/events/pending` | Pending approval queue |
| PUT | `/api/admin/events/{id}/approve` | Approve event |
| PUT | `/api/admin/events/{id}/reject` | Reject event |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/events/{id}/tickets` | List ticket tiers |
| POST | `/api/events/{id}/tickets` | Create ticket tier |
| PUT | `/api/tickets/{id}` | Update ticket tier |
| DELETE | `/api/tickets/{id}` | Delete ticket tier |
| POST | `/api/tickets/purchase` | Purchase ticket |
| GET | `/api/attendee/tickets` | Attendee purchased passes |
| GET | `/api/attendee/registrations` | Registration history |
| GET | `/api/notifications` | User notification inbox |
| PUT | `/api/notifications/{id}/read` | Mark notification read |
| POST | `/api/organizer/notifications` | Broadcast to attendees |
| GET | `/api/admin/statistics` | Admin analytics data |
| GET | `/api/organizer/statistics` | Organizer analytics |
| GET | `/api/admin/settings` | System settings |
| PUT | `/api/admin/settings` | Update system settings |
| GET | `/api/admin/activity` | Audit activity log |
| GET | `/api/organizer/attendees` | Attendee roster by event |
| GET | `/api/attendee/profile` | Attendee profile |
| PUT | `/api/attendee/profile` | Update profile |

---

## 🖼 Screenshots

> _Screenshots to be captured after running the application. Place in `screenshots/` folder._

| Page | Screenshot |
|---|---|
| Home / Landing | ![Home](screenshots/home.png) |
| Login | ![Login](screenshots/login.png) |
| Admin Dashboard | ![Admin Dashboard](screenshots/admin-dashboard.png) |
| Event Approvals | ![Approvals](screenshots/admin-approvals.png) |
| Organizer Dashboard | ![Organizer](screenshots/organizer-dashboard.png) |
| Create Event Form | ![Create Event](screenshots/create-event.png) |
| Ticket Management | ![Tickets](screenshots/tickets.png) |
| Attendee Browse Events | ![Browse](screenshots/browse-events.png) |
| Event Details & Booking | ![Booking](screenshots/event-details.png) |
| My Ticket Pass (QR) | ![My Tickets](screenshots/my-tickets.png) |
| Notifications Inbox | ![Notifications](screenshots/notifications.png) |
| Profile Settings | ![Profile](screenshots/profile.png) |

---

## 👥 Team Members

| Name | Roll Number | Contribution |
|---|---|---|
| Prince Raj | [Roll No.] | Frontend Development, System Design |
| [Member 2] | [Roll No.] | [Role] |
| [Member 3] | [Roll No.] | [Role] |

---

## 🔭 Future Scope

- **Real-time WebSocket notifications** (JSR-356 WebSocket API on Tomcat)
- **Payment gateway integration** (Razorpay / PayU for Indian payments)
- **Event check-in QR scanner** using camera API (Progressive Web App)
- **Email confirmation system** (JavaMail API with SMTP)
- **Event recommendations** using collaborative filtering
- **Multi-language support** (i18n with property files)
- **Admin export reports** (PDF generation with iText)
- **Google Calendar / ICS file integration** for event reminders

---

## 📜 License

Academic project for educational purposes. Not for commercial use.

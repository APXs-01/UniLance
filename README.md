# UniLance

**Sri Lanka's #1 University-Exclusive Freelance Marketplace**

UniLance connects Sri Lankan university students with buyers who need talented, verified freelancers. Student freelancers must register with a verified `.lk` university email, complete skill validation via AI-powered SmartQuest, and build a portfolio — while buyers browse gigs, place orders, and pay securely through Stripe.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Frontend    | React 18 (Vite), React Router v6, Axios         |
| Backend     | Node.js, Express.js                             |
| Database    | MongoDB Atlas (Mongoose ODM)                    |
| Auth        | JWT (7-day expiry), OTP via Gmail SMTP          |
| Payments    | Stripe (Payments + Webhooks + Payouts)          |
| AI          | Google Gemini API (SmartQuest MCQ generation)   |
| Repo Verify | GitHub API (gig repository verification)        |

---

## Project Structure

```
UniLance/
├── frontend/                    # React (Vite) app
│   ├── public/                  # Static assets (images, icons)
│   └── src/
│       ├── api/                 # Axios API clients (authAPI, gigAPI, orderAPI, ...)
│       ├── components/
│       │   ├── common/          # Navbar, shared UI
│       │   └── member1/         # StripePaymentForm
│       ├── context/             # AuthContext (JWT, user state)
│       └── pages/
│           ├── Home.jsx         # Public landing page
│           ├── FreelancersPage.jsx
│           ├── member1/         # Transactions & Payouts
│           ├── member2/         # Orders
│           ├── member3/         # Gigs & Communities
│           ├── member4/         # Auth, Profile, SmartQuest
│           └── admin/           # Admin Dashboard
│
└── backend/                     # Express REST API
    ├── controllers/             # Business logic
    ├── models/                  # Mongoose schemas
    │   ├── User.js
    │   ├── Gig.js
    │   ├── Order.js
    │   ├── Transaction.js
    │   ├── PayoutRequest.js
    │   ├── Review.js
    │   ├── Community.js
    │   ├── ChatMessage.js
    │   ├── SmartQuest.js
    │   ├── Badge.js
    │   ├── OTP.js
    │   ├── Notification.js
    │   └── Discount.js
    ├── routes/                  # Express route handlers
    └── middleware/              # Auth guard, role check
```

---

## Features

### Member 1 — Payments, Transactions & Payouts

- **Stripe Payment Integration** — Secure card payments via Stripe Elements
- **Transaction History** — View all payments, refunds, payouts, and platform fees with color-coded badges
- **Wallet Stats** — Total spent, total earned, transaction count
- **Export PDF** — Download full transaction history as PDF
- **Discount Code Validation** — Apply discount codes at checkout with percentage or flat-value discounts
- **Payout Requests** — Freelancers request payouts with bank name, account number, and account holder name
- **OTP Payout Verification** — Each payout is secured with an email OTP before processing
- **Payout History** — Track payout status: Pending → OTP Sent → Approved → Completed
- **Admin Discount Management** — Admin can create, list, and manage discount codes

### Member 2 — Orders

- **Order Dashboard** — Buyers and freelancers see their orders with status filter tabs:
  `Pending → Accepted → In Progress → Delivered → Completed → Cancelled`
- **Order Detail Page** — Full order view with:
  - Visual step-by-step status tracker
  - Stripe payment trigger from within the order
  - Delivery submission (freelancer uploads files/notes)
  - Accept / Reject delivery (buyer)
  - Cancel order
  - Leave a review and rating (buyer, after completion)

### Member 3 — Gigs & Communities

- **Browse Gigs** — Search, filter by category, price range, and sort (Newest, Top Rated, Popular, Price)
- **Gig Detail Page** — Full gig view with reviews, freelancer profile preview, and Place Order button
- **Create / Edit Gig** — Freelancers create gigs with title, description, category, price, delivery days, revisions, tags
- **GitHub Repo Verification** — Gig creation validates a linked GitHub repository via the GitHub API
- **Freelancer Gigs Dashboard** — Freelancers manage their own gigs (edit, delete, toggle active/inactive)
- **Communities** — Skill-based communities (Graphic Design, Full Stack, Cyber Security, Data Science, Business Analysis)
  - Join / Leave communities
  - View members
  - Community chat / discussion board

### Member 4 — Authentication, Profile & SmartQuest

- **Role Selection** — Register as a Student Freelancer or Buyer
- **University Email Validation** — Freelancers must use a verified Sri Lankan university email domain:
  `my.sliit.lk`, `uom.lk`, `cmb.ac.lk`, `pdn.ac.lk`, `kln.ac.lk`, `sjp.ac.lk`, `nibm.lk`, `nsbm.ac.lk`, `iit.ac.lk`, `apiit.lk`, `cinec.edu.lk`, `ruh.ac.lk`, `sab.ac.lk`, `seu.ac.lk`, `wyb.ac.lk`, `ou.ac.lk`, `horizon.ac.lk`, `rajarata.ac.lk`, `esn.ac.lk`, `vau.ac.lk`
- **OTP Email Verification** — 6-digit OTP sent to email after registration, expires in 10 minutes
- **JWT Login** — Role-based redirection on login:
  - Admin → `/admin`
  - Freelancer → `/dashboard/gigs`
  - Buyer → `/gigs`
- **Password Reset** — OTP-based forgot password flow
- **Profile Management** — Update name, bio, phone (Sri Lankan number validation), location, portfolio theme
- **Profile Completion Tracker** — Live percentage bar based on filled profile steps
- **Skills Management** — Add / remove skills with proficiency levels (Beginner / Intermediate / Expert)
- **Availability Scheduler** — Set available days and time slots (Monday–Sunday)
- **Freelancer Analytics Dashboard** — Profile views, orders completed, wallet balance, average rating
- **Portfolio PDF Export** — Auto-generated PDF with skills, verified badges, gigs, and profile info
- **Public Freelancer Profile** — Shareable profile page (`/freelancer/:id`) visible to buyers
- **SmartQuest (AI Skill Validation)** — Powered by Google Gemini:
  - Categories: Graphic Design, Full Stack Web Development, Cyber Security, Data Science, Business Analysis
  - 10 AI-generated MCQ questions
  - 30-minute timed session
  - Score 80%+ → Verified Badge added to profile and portfolio PDF
  - 2 attempts per 24 hours

### Admin Dashboard

- **Overview** — Platform-wide financial stats, user counts, order metrics
- **Users** — View and manage all registered users
- **Orders** — Monitor all orders across the platform
- **Communities** — Manage skill communities
- **Discounts** — Create and manage discount codes (percentage or flat value, min order amount, expiry, max uses)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account
- Gmail account with App Password enabled (for SMTP)
- Stripe account (test keys from dashboard.stripe.com)
- Google AI Studio account (Gemini API key from aistudio.google.com)
- GitHub Personal Access Token (for gig repo verification)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` (see Environment Variables below), then:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

---

## Environment Variables

Create `/backend/.env` — **never commit this file.**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=UniLance <no-reply@unilance.lk>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Gemini AI (SmartQuest)
GEMINI_API_KEY=your_gemini_api_key

# GitHub (Gig Repo Verification)
GITHUB_TOKEN=your_github_personal_access_token

# App
FRONTEND_URL=http://localhost:3000
OTP_EXPIRE_MINUTES=10
```

Create `/frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000/api
```

---

## API Routes

| Method | Route                            | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/api/auth/register`             | Register new user                  |
| POST   | `/api/auth/login`                | Login, returns JWT                 |
| POST   | `/api/auth/verify-email`         | Verify OTP after registration      |
| POST   | `/api/auth/resend-otp`           | Resend verification OTP            |
| POST   | `/api/auth/forgot-password`      | Send password reset OTP            |
| GET    | `/api/users/profile`             | Get logged-in user profile         |
| PUT    | `/api/users/profile`             | Update profile                     |
| GET    | `/api/users/:id`                 | Public freelancer profile          |
| GET    | `/api/gigs`                      | Browse gigs (search/filter/sort)   |
| POST   | `/api/gigs`                      | Create gig (freelancer)            |
| GET    | `/api/gigs/:id`                  | Gig detail                         |
| POST   | `/api/orders`                    | Place order                        |
| GET    | `/api/orders/my`                 | My orders                          |
| GET    | `/api/orders/:id`                | Order detail                       |
| POST   | `/api/payments/create-intent`    | Create Stripe payment intent       |
| GET    | `/api/payments/history`          | Transaction history                |
| POST   | `/api/payouts/request`           | Request payout                     |
| POST   | `/api/payouts/verify-otp`        | Verify payout OTP                  |
| GET    | `/api/communities`               | List communities                   |
| POST   | `/api/communities/:id/join`      | Join community                     |
| POST   | `/api/smartquest/start`          | Start SmartQuest session           |
| POST   | `/api/smartquest/:id/submit`     | Submit SmartQuest answers          |

---

## Pages & Routes (Frontend)

| Path                    | Page                          | Access          |
|-------------------------|-------------------------------|-----------------|
| `/`                     | Home (landing page)           | Public          |
| `/register`             | Register                      | Public          |
| `/login`                | Login                         | Public          |
| `/verify-email`         | OTP Email Verification        | Public          |
| `/gigs`                 | Browse Gigs                   | Public          |
| `/gigs/:id`             | Gig Detail                    | Public          |
| `/freelancer/:id`       | Public Freelancer Profile     | Public          |
| `/freelancers`          | Browse Freelancers            | Public          |
| `/profile`              | My Profile                    | Auth            |
| `/smartquest`           | SmartQuest AI Quiz            | Auth (Freelancer)|
| `/dashboard/gigs`       | My Gigs Dashboard             | Freelancer      |
| `/dashboard/gigs/new`   | Create Gig                    | Freelancer      |
| `/orders`               | My Orders                     | Auth            |
| `/orders/:id`           | Order Detail                  | Auth            |
| `/transactions`         | Transaction History           | Auth            |
| `/payouts`              | Payout Requests               | Freelancer      |
| `/communities`          | Communities                   | Auth            |
| `/communities/:id`      | Community Detail              | Auth            |
| `/admin`                | Admin Dashboard               | Admin           |

---

## Team

| Member   | Responsibility                                                      |
|----------|----------------------------------------------------------------------|
| Member 1 | Stripe payments, transactions, wallet, payout OTP, discount codes   |
| Member 2 | Order management, delivery flow, reviews, Stripe in-order payment   |
| Member 3 | Gigs (browse/create/manage), GitHub verification, communities/chat  |
| Member 4 | Auth (register/login/OTP), profile, skills, SmartQuest (Gemini AI)  |

---

## License

For academic use only — ITPM Project 2026.

# 🚗 AutoMart - Full-Stack Car E-Commerce & Showroom Platform

A modern, responsive full-stack automotive e-commerce and interactive showroom platform. Features dynamic car listings, an interactive **360° 3D GLTF/GLB vehicle model viewer**, real-time photo gallery multi-angle scrubbing, valuation calculators, user reviews, order management, interactive maps, and a complete admin management dashboard.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [File & Module Catalog (Why Each File is Used)](#-file--module-catalog)
  - [Root Files](#root-files)
  - [Backend Directory](#backend-directory)
  - [Frontend Directory](#frontend-directory)
- [Prerequisites](#-prerequisites)
- [How to Set Up and Run](#-how-to-set-up-and-run)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables Guide](#-environment-variables-guide)
- [Default Admin Credentials & Seed Data](#-default-admin-credentials)
- [API Endpoints Overview](#-api-endpoints-overview)

---

## ✨ Features

- **Interactive 360° 3D Vehicle Showcase**: View real `.glb` and `.gltf` 3D car models in a simulated studio showroom with click-and-drag and mobile touch rotation, zoom controls, and lighting.
- **Multi-Angle Photo Fallback**: If a vehicle has no 3D model, genuine multi-angle photography can be rotated/scrubbed horizontally.
- **Card Hover Animations**: Smooth image zoom-in/out and elevated shadow transitions when browsing vehicles.
- **Authentication & Role-Based Access**: Secure JWT authentication, user registration, login, and protected admin routes.
- **Password Reset**: Automated token-based password reset via Gmail SMTP (Nodemailer).
- **Vehicle Catalog & Filtering**: Search and filter cars by brand, price, body type, fuel type, transmission, and condition.
- **Car Valuation Engine**: Instant estimated market value calculator based on make, model year, mileage, and condition.
- **Shopping Cart & Checkout**: Add to cart, wishlist items, and place simulated orders with delivery address tracking.
- **Service & Support**: Submit service requests, support tickets, and general contact inquiries.
- **Admin Dashboard**: Manage inventory, upload 50MB 3D car models, view customer feedback, update order statuses, and handle user support tickets.

---

## 🛠 Architecture & Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **3D Graphics & Rendering**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) + [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) (supports 3D model `.glb`/`.gltf` up to 50MB)
- **Email Service**: [Nodemailer](https://nodemailer.com/) (Gmail SMTP)

---

## 📂 Directory Structure

```plaintext
car_website/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── cartController.js
│   │   ├── feedbackController.js
│   │   ├── orderController.js
│   │   ├── supportController.js
│   │   ├── userController.js
│   │   ├── valuationController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadModelMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Car.js
│   │   ├── Cart.js
│   │   ├── Contact.js
│   │   ├── Feedback.js
│   │   ├── Order.js
│   │   ├── ServiceRequest.js
│   │   ├── SupportTicket.js
│   │   ├── User.js
│   │   ├── ValuationLead.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── supportRoutes.js
│   │   ├── userRoutes.js
│   │   ├── valuationRoutes.js
│   │   └── wishlistRoutes.js
│   ├── uploads/
│   │   └── models3d/
│   └── utils/
│       └── emailService.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── logo.png
    │   └── brands/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── assets/
        ├── components/
        │   ├── AdminLayout.jsx
        │   ├── AdminRoute.jsx
        │   ├── BrandLogoCarousel.jsx
        │   ├── CarViewer360.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── ExploreOtherCars.jsx
        │   ├── FeedbackSection.jsx
        │   ├── Footer.jsx
        │   ├── Header.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── UserLayout.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── data/
        │   ├── brandsData.js
        │   └── valuationCatalog.js
        └── pages/
            ├── About.jsx
            ├── BuyUsedCars.jsx
            ├── CarDetails.jsx
            ├── Cars.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── Contact.jsx
            ├── Dashboard.jsx
            ├── Feedback.jsx
            ├── ForgotPassword.jsx
            ├── Home.jsx
            ├── Login.jsx
            ├── MyOrders.jsx
            ├── Profile.jsx
            ├── Register.jsx
            ├── ResetPassword.jsx
            ├── SellUsedCars.jsx
            ├── ServiceSupport.jsx
            ├── Wishlist.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── AdminLogin.jsx
                ├── AdminRegister.jsx
                ├── CarForm.jsx
                ├── ManageCars.jsx
                ├── ManageFeedback.jsx
                ├── ManageMessages.jsx
                ├── ManageOrders.jsx
                ├── ManageUsers.jsx
                └── UserIssues.jsx
```

---

## 🔍 File & Module Catalog (Why Each File is Used)

### Root Files
| File | Description & Purpose |
|---|---|
| `.gitignore` | Specifies files ignored by git (e.g. `node_modules`, `.env`, build files, OS cache). |
| `README.md` | Primary documentation and startup manual for the repository. |

---

### Backend Directory (`/backend`)

#### Core & Config
| File | Purpose |
|---|---|
| `server.js` | Main entry point for the backend Express server. Sets up CORS, JSON parsers, static uploads hosting, route mounting, database connection, and starts the HTTP server. |
| `package.json` | Declares backend dependencies (`express`, `mongoose`, `nodemailer`, `bcrypt`, `jsonwebtoken`, `multer`) and startup scripts. |
| `.env.example` | Template demonstrating required environment keys (MongoDB URI, JWT secret, Gmail SMTP credentials) without exposing private secrets. |
| `.gitignore` | Prevents local backend `.env` and `node_modules/` from being committed. |
| `config/db.js` | Connects the application to MongoDB using Mongoose. |

#### Controllers (`/backend/controllers`)
| Controller | Purpose |
|---|---|
| `adminController.js` | Handles administrative authentication, dashboard metrics, customer feedback moderation, and user management. |
| `authController.js` | Manages user registration, login, JWT issuance, and forgot/reset password email workflows. |
| `carController.js` | Performs CRUD operations for vehicles, filters by brand/price/condition, and handles 3D model file uploads. |
| `cartController.js` | Manages adding, removing, and fetching items in the user's shopping cart. |
| `feedbackController.js` | Handles submitting, querying, and rating feedback and reviews for cars and the platform. |
| `orderController.js` | Processes car checkouts, generates orders, and updates order fulfillment statuses. |
| `supportController.js` | Manages service booking requests and support tickets. |
| `userController.js` | Handles user profile inspection and updates. |
| `valuationController.js` | Calculates instant car valuations based on market algorithms and captures seller leads. |
| `wishlistController.js` | Toggles and tracks saved favorite cars per user account. |

#### Middleware (`/backend/middleware`)
| Middleware | Purpose |
|---|---|
| `authMiddleware.js` | Verifies JWT tokens in request headers to protect authenticated user and admin endpoints. |
| `uploadModelMiddleware.js` | Multer storage engine configured specifically for `.glb` and `.gltf` 3D car models with a 50MB file size limit. |

#### Models (`/backend/models`)
| Model | Purpose |
|---|---|
| `Admin.js` | Mongoose schema for system administrators. |
| `Car.js` | Comprehensive vehicle schema (brand, model, year, price, specifications, images, 3D model URL, inspection, warranty). |
| `Cart.js` | Schema linking cars to user carts. |
| `Contact.js` | Stores user inquiries and contact form submissions. |
| `Feedback.js` | Stores verified reviews, ratings, and comments. |
| `Order.js` | Tracks car purchases, buyer details, delivery addresses, and payment statuses. |
| `ServiceRequest.js` | Stores maintenance, repair, and inspection booking requests. |
| `SupportTicket.js` | Tracks customer support inquiries and issue tickets. |
| `User.js` | User account schema with hashed passwords and profile info. |
| `ValuationLead.js` | Captures vehicle valuation estimations and seller contact leads. |
| `Wishlist.js` | Tracks saved vehicles per user. |

#### Routes (`/backend/routes`)
| Route File | Endpoint Base | Purpose |
|---|---|---|
| `adminRoutes.js` | `/api/admin` | Admin authentication and management endpoints. |
| `authRoutes.js` | `/api/auth` | User sign-up, login, and password reset routes. |
| `carRoutes.js` | `/api/cars` | Car catalog listing, search, details, and 3D upload endpoints. |
| `cartRoutes.js` | `/api/cart` | Cart modification and item retrieval. |
| `contactRoutes.js` | `/api/contact` | Public contact form submissions. |
| `feedbackRoutes.js` | `/api/feedback` | Customer review and testimonial endpoints. |
| `orderRoutes.js` | `/api/orders` | Checkout, order creation, and order tracking. |
| `supportRoutes.js` | `/api/support` | Service bookings and help tickets. |
| `userRoutes.js` | `/api/users` | User profile access. |
| `valuationRoutes.js` | `/api/valuation`| Used car valuation estimations. |
| `wishlistRoutes.js` | `/api/wishlist` | Toggling and querying wishlist items. |

#### Utilities (`/backend/utils`)
| File | Purpose |
|---|---|
| `emailService.js` | Handles Nodemailer transport configuration, SMTP verification, and sends templated HTML emails for password resets and notifications. |

---

### Frontend Directory (`/frontend`)

#### Setup & Assets
| File | Purpose |
|---|---|
| `index.html` | Single-page HTML skeleton hosting the React root and meta tags. |
| `package.json` | Declares frontend dependencies (React, Vite, Three.js, Lucide, Leaflet, Axios). |
| `vite.config.js` | Vite bundler configuration including React plugin and proxy settings. |
| `src/main.jsx` | Application bootstrap file initializing React DOM and global CSS. |
| `src/App.jsx` | Top-level router configuring public, user, and admin route hierarchies. |
| `src/index.css` | Global styling tokens, reset rules, and layout styles. |
| `public/brands/` | Optimized SVG brand logos (Audi, BMW, Bentley, Mercedes, Tata, Toyota, etc.). |

#### Contexts (`/frontend/src/context`)
| Context | Purpose |
|---|---|
| `AuthContext.jsx` | Global state management for logged-in user, JWT tokens, login/logout actions, and cart/wishlist counters. |
| `ToastContext.jsx` | Global notification system for displaying success, error, and info toast banners. |

#### Components (`/frontend/src/components`)
| Component | Purpose |
|---|---|
| `CarViewer360.jsx` | **Core 3D Viewer**: Canvas utilizing Three.js and React Three Fiber to display `.glb` / `.gltf` models with click-and-drag 360° rotation, damping interpolation, mobile touch support, zoom in/out, auto-rotation toggle, and reset controls. |
| `ExploreOtherCars.jsx` | Horizontal carousel showcasing similar vehicles with card hover zoom effects. |
| `BrandLogoCarousel.jsx` | Interactive brand slider allowing users to filter cars by brand. |
| `FeedbackSection.jsx` | Displays ratings, review submissions, and testimonials on car pages. |
| `Header.jsx` & `Navbar.jsx` | Main responsive navigation headers with search bar, navigation links, and account dropdowns. |
| `Footer.jsx` | Site-wide footer with quick links, social media, and copyright info. |
| `AdminLayout.jsx` | Sidebar and layout wrapper for administrative dashboard pages. |
| `AdminRoute.jsx` | Route guard that restricts access exclusively to authenticated admins. |
| `ProtectedRoute.jsx` | Route guard restricting access to authenticated users. |
| `UserLayout.jsx` | Layout wrapper for account dashboards and profile sections. |
| `ErrorBoundary.jsx` | Catches runtime UI errors gracefully and provides fallback visuals. |

#### Pages (`/frontend/src/pages`)
| Page | Purpose |
|---|---|
| `Home.jsx` | Main landing page featuring the hero section, quick search, brand logos, and featured car cards with zoom animations. |
| `Cars.jsx` | Vehicle catalog with filter sidebar (price, brand, body type, fuel) and card grid. |
| `CarDetails.jsx` | Detailed car page with the **360° 3D viewer**, multi-angle photo scrub fallback, specs, reasons to buy, pricing, and buy/cart buttons. |
| `BuyUsedCars.jsx` | Curated used car inventory with "Assured" badges and inspection guarantees. |
| `SellUsedCars.jsx` | Interactive vehicle valuation calculator and seller submission form. |
| `Cart.jsx` | Shopping cart overview with quantity updates and order summary. |
| `Checkout.jsx` | Shipping address entry and order placement confirmation. |
| `MyOrders.jsx` | History of placed orders and fulfillment status. |
| `Wishlist.jsx` | User's collection of saved vehicles. |
| `Profile.jsx` | User profile details and account management. |
| `Login.jsx` & `Register.jsx` | User sign-in and sign-up interfaces. |
| `ForgotPassword.jsx` & `ResetPassword.jsx` | Workflow for requesting password reset links via email and setting a new password. |
| `Contact.jsx` | Customer support inquiry form and dealership location map. |
| `ServiceSupport.jsx` | Service booking scheduler for vehicle maintenance and repair. |
| `About.jsx` | AutoMart story, mission, team, and company background. |

#### Admin Pages (`/frontend/src/pages/admin`)
| Page | Purpose |
|---|---|
| `AdminLogin.jsx` & `AdminRegister.jsx` | Admin authentication portals. |
| `AdminDashboard.jsx` | High-level metrics: revenue, total cars, user counts, and pending orders. |
| `CarForm.jsx` | Form to create and edit cars, including **50MB .glb/.gltf 3D model uploads**. |
| `ManageCars.jsx` | Inventory management table with edit/delete actions. |
| `ManageOrders.jsx` | Order processing and status tracking (Pending, Confirmed, Shipped, Delivered). |
| `ManageUsers.jsx` | View registered user accounts and activity. |
| `ManageMessages.jsx` | View inquiries submitted through the contact form. |
| `ManageFeedback.jsx` | Review and moderate submitted ratings and testimonials. |
| `UserIssues.jsx` | Support ticket management and issue resolution. |

---

## ⚡ Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)

---

## 🚀 How to Set Up and Run

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   - Create a `.env` file in the `backend/` directory by copying the example template:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your values (see [Environment Variables Guide](#-environment-variables-guide)).

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on [http://localhost:5000](http://localhost:5000).*

---

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will run on [http://localhost:5173](http://localhost:5173).*

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔐 Environment Variables Guide

Create a file named `.env` inside the `backend/` folder:

```ini
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/car_ecommerce

# Authentication Secret
JWT_SECRET=super_secret_jwt_key_automart_2026

# Gmail SMTP Configuration for Password Reset & Inquiries
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_google_app_password
EMAIL_FROM="AutoMart Support" <your_email@gmail.com>

# Notifications
CONTACT_RECEIVER=admin@automart.com
ADMIN_NOTIFICATION_EMAIL=admin@automart.com
```

> **Note on Gmail SMTP**: If you wish to send real password reset emails, generate a 16-character **Google App Password** in your Google Account security settings and supply it in `SMTP_PASS`.

---

## 🔑 Default Admin Credentials

To access the Admin Portal:
1. Navigate to `/admin/login`.
2. Register an admin account via `/admin/register` or log in with existing admin credentials created in your MongoDB database.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cars` | Get all cars with filtering and search | No |
| `GET` | `/api/cars/:id` | Get single car details | No |
| `POST` | `/api/cars` | Create new car | Admin |
| `POST` | `/api/cars/upload-model` | Upload `.glb` / `.gltf` 3D car model | Admin |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | User login & JWT retrieval | No |
| `POST` | `/api/auth/forgot-password`| Send password reset email token | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |
| `GET` | `/api/cart` | View logged-in user's cart | User |
| `POST` | `/api/cart/add` | Add car to cart | User |
| `POST` | `/api/orders` | Place a vehicle order | User |
| `POST` | `/api/valuation/estimate` | Calculate car market valuation | No |
| `POST` | `/api/contact` | Submit general contact message | No |

---

## 📄 License
This project is for educational and commercial demonstration purposes. All car brands and assets belong to their respective owners.

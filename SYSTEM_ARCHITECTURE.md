# 📦 Inventory Management System — System Architecture

> **Project:** StockFlow IMS  
> **Version:** 2.3 — Phase 5 Blueprint Added (Advanced Scale & Integrations)  
> **Stack:** React 19 + Vite + Supabase Cloud Backend (PostgreSQL, OAuth, RLS, Storage)  
> **Last Updated:** 2026-06-30  
> **Status:** ✅ Phase 2 Complete — Cloud Backend, OAuth Auth, Storage, and Realtime Done  

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Specification](#2-feature-specification)
3. [Tech Stack Decision](#3-tech-stack-decision)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Data Models](#6-data-models)
7. [Component Architecture](#7-component-architecture)
8. [State Management Strategy](#8-state-management-strategy)
9. [UI/UX Design System](#9-uiux-design-system)
10. [Export & Reporting System](#10-export--reporting-system)
11. [Development Roadmap](#11-development-roadmap)
12. [Implementation Summary](#12-implementation-summary)

---

## 1. Project Overview

**StockFlow IMS** is a modern, responsive Inventory Management System built for small-to-medium businesses (SMBs) and warehouse teams. It enables efficient product tracking, stock-level monitoring, transaction history, and detailed reporting — all with a premium, dark-mode-first UI featuring flat glassmorphism styling and sequential micro-interactions.

### 🎯 Goals

| Goal | Description |
|------|-------------|
| **Efficiency** | Reduce manual stock errors by providing a single source of truth |
| **Visibility** | Real-time visual stats so teams can act before running out of stock |
| **Simplicity** | Intuitive UI that requires zero training for new users |
| **Portability** | Phase 1 runs fully in the browser with localStorage persistence |
| **Scalability** | Architecture designed to easily migrate to Supabase in Phase 2 |

---

## 2. Feature Specification

### ✅ Core Features - Implementation Status

| # | Feature | Description | Priority | Status |
|---|---------|-------------|----------|--------|
| 1 | **Add New Product** | Create product with name, SKU, category, description, unit price, reorder level, and initial stock quantity | 🔴 Critical | ✅ Done |
| 2 | **View All Products** | Paginated, sortable product list with status badges and stock levels | 🔴 Critical | ✅ Done |
| 3 | **Search Products** | Live search by name, SKU, or category with debounced input | 🔴 Critical | ✅ Done |
| 4 | **Stock In** | Increase stock quantity with a logged reason (e.g., "Purchase Order") | 🔴 Critical | ✅ Done |
| 5 | **Stock Out** | Decrease stock quantity with a logged reason (e.g., "Sale", "Damaged") | 🔴 Critical | ✅ Done |
| 6 | **Edit Product** | Modify product metadata (name, description, price, category, reorder level) | 🔴 Critical | ✅ Done |
| 7 | **Delete Product** | Soft-delete with confirmation dialog | 🟠 High | ✅ Done |
| 8 | **Inventory Dashboard** | Statistical dashboard with KPI cards, recent activity, low stock alerts | 🔴 Critical | ✅ Done |
| 9 | **Export Report** | Export reports as executive PDFs and raw datasets CSVs | 🟠 High | ✅ Done |

### 💡 Advanced Features - Status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10 | **Low Stock Alerts** | ✅ Done | Displayed on Dashboard and Sidebar indicators |
| 11 | **Stock Transaction History** | ✅ Done | Paginated history with multi-filter and stock delta flow modals |
| 12 | **Product Categories & Filtering** | ✅ Done | Filter by category, status, and sort dynamically |
| 13 | **Dashboard Overview Page** | ✅ Done | KPI cards (valuation, alerts, catalog counters) |
| 14 | **Bulk Import (CSV Upload)** | ⏳ Pending | Slated for Phase 2 integration |
| 15 | **Barcode / SKU Generator** | ✅ Done | Auto-generate unique SKU codes on product addition |
| 16 | **Dark / Light Mode Toggle** | ✅ Done | Persisted Context-based switcher |
| 17 | **Product Image Upload** | ⏳ Pending | Slated for Phase 2 integration |
| 18 | **Keyboard Shortcuts** | ✅ Done | Shortcut `/` for search, `N` for new products, `Esc` to close modal |
| 19 | **Activity Feed** | ✅ Done | Dashboard widget displaying last 5 audit entries |

---

## 3. Tech Stack Decision

### 🏆 Chosen Stack

Given the project is bootstrapped with **React 19 + Vite**, we have structured the architecture around the following core modules:

```
Frontend Framework:   React 19
Build Tool:           Vite 8
Styling:              Vanilla CSS + CSS Custom Properties (Design Tokens System)
State Management:     React Context API + useReducer (State Persistence & Schema Versioning)
Routing:              React Router v7
Charts:               Recharts (Dynamic, theme-aware responsive SVGs)
PDF Export:           jsPDF + jsPDF-AutoTable
CSV Export:           Native Blob Engine
Icons:                Lucide React
Date Handling:        Day.js (Lightweight date parsing & ranges)
Notifications:        react-hot-toast
Persistence:          localStorage (v1 schema) → Supabase (Phase 2 migration target)
Linting:              OXLint
```

---

## 4. System Architecture

### 4.1 High-Level Architecture (Phase 1 — Client-Side Only)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│  ┌──────────────┐    ┌────────────────┐    ┌─────────────┐ │
│  │   UI Layer   │ ── │  State Layer   │ ── │  Data Layer │ │
│  │  (React 19)  │    │ (Context/Reducer│    │(localStorage│ │
│  │  Components  │    │   + Custom      │    │  / JSON v1) │ │
│  │  + Routing   │    │   Hooks)        │    └─────────────┘ │
│  └──────────────┘    └────────────────┘                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Service Layer                      │  │
│  │  productService | stockService | exportService        │  │
│  │  storageService                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 High-Level Architecture (Phase 2 — With Supabase Backend)

```
┌──────────────────────┐         ┌──────────────────────────┐
│   React 19 (Client)  │ ──────▶ │   Supabase (BaaS)        │
│                      │         │                          │
│  ─ UI Components     │         │  ─ PostgreSQL Database   │
│  ─ React Router v7   │ ◀────── │  ─ Row Level Security    │
│  ─ Context API       │         │  ─ REST API              │
│  ─ Recharts          │         │  ─ Realtime Subscriptions│
│  ─ jsPDF             │         │  ─ Storage (images)      │
│                      │         │  ─ Auth (email/OAuth)    │
└──────────────────────┘         └──────────────────────────┘
```

### 4.3 Data Flow

```
User Action (e.g., "Stock In")
        │
        ▼
   UI Component (StockModal)
        │
        ▼
   Custom Hook (useStock)
        │
        ▼
   stockService.addTransaction()
        │
        ├─── Updates product.currentStock in store (dispatch 'STOCK_IN')
        │
        ├─── Appends transaction to ledger log
        │
        └─── Persists JSON to localStorage (storageService.saveState)
```

---

## 5. Folder Structure

```
src/
├── assets/                    # Static images, logos
├── components/
│   ├── common/                # Reusable UI atoms
│   │   ├── Badge/             # Status indicators
│   │   ├── Button/            # Accent + 5 variants, 3 sizes
│   │   ├── Input/             # Theme-aware Input, Textarea, Select
│   │   ├── Modal/             # Overlay, scale spring animation, preventClose
│   │   ├── SearchBar/         # Debounced search (300ms) + keyboard badge
│   │   ├── CategoryModal/     # Dynamic category creation
│   │   ├── ConfirmDialog/     # Confirmation dialogs
│   │   └── index.js           # Central export
│   ├── layout/                # App shell
│   │   ├── Sidebar/           # Navigation + theme toggle + collapsed animations
│   │   ├── Topbar/            # Header + breadcrumbs + alert indicator
│   │   ├── PageWrapper/       # Content wrapper with fade entrance
│   │   └── AppLayout.jsx      # Main layout
│   ├── products/              # Product components
│   │   ├── ProductForm/       # Add/Edit with validation
│   │   └── ProductTable/      # Table with actions and centered icons
│   └── stock/                 # Stock transactions
│       └── StockModal/        # Stock In/Out
├── contexts/
│   ├── InventoryContext.jsx   # Global state provider
│   ├── inventoryReducer.js    # Global store dispatch rules
│   └── ThemeContext.jsx       # Dark/light mode context
├── hooks/
│   ├── useProducts.js         # Product CRUD wrapper
│   ├── useStock.js            # Stock adjustments wrapper
│   ├── useFilters.js          # Search, filter, sort utils
│   ├── useKeyboardShortcuts.js# Global shortcuts hook
│   └── index.js               # Central export
├── pages/
│   ├── Dashboard/             # KPI cards + Staggered entrance animations
│   ├── Products/              # Full CRUD page
│   ├── Transactions/          # Transaction history + query filters + delta modals
│   └── Reports/               # KPI metrics + export cards + 4 Recharts SVGs
├── services/
│   ├── productService.js      # Product business logic
│   ├── stockService.js        # Stock transaction logic
│   ├── exportService.js       # Client-side PDF/CSV generation
│   ├── storageService.js      # localStorage version check & write abstractions
│   └── index.js               # Central export
├── utils/
│   ├── formatters.js          # Currency, date, stock status formatter
│   └── skuGenerator.js        # Auto-generate SKU codes
├── styles/
│   ├── tokens.css             # CSS Custom Properties (Design tokens)
│   ├── reset.css              # Baseline CSS resets
│   └── utilities.css          # Semantic background & color utilities
├── App.jsx                    # Root configuration + Router tree
├── main.jsx                   # React entry point
└── index.css                  # Global entry imports
```

---

## 6. Data Models

### 6.1 Product

```javascript
{
  id: "uuid-v4",                    // Auto-generated
  sku: "SKU-2026-0001",             // Auto-generated or user-defined
  name: "Wireless Mouse",           // Required
  description: "Ergonomic...",      // Optional
  category: "Electronics",          // Required
  imageUrl: "base64string | url",   // Optional
  unitPrice: 29.99,                 // Required (number)
  currentStock: 45,                 // Required (integer)
  reorderLevel: 10,                 // Alert threshold
  unit: "pcs",                      // e.g., pcs, kg, liters
  supplier: "TechSupply Co.",       // Optional
  location: "Shelf A-3",            // Optional warehouse location
  isDeleted: false,                 // Soft delete flag
  createdAt: "2026-06-29T08:00:00", // ISO timestamp
  updatedAt: "2026-06-29T08:00:00"  // ISO timestamp
}
```

### 6.2 Stock Transaction

```javascript
{
  id: "uuid-v4",
  productId: "uuid-v4",            // Reference to Product.id
  type: "STOCK_IN" | "STOCK_OUT",  // Transaction type
  quantity: 20,                    // Positive integer
  reason: "Purchase Order #045",   // User-provided reason
  previousStock: 25,               // Stock before this transaction
  newStock: 45,                    // Stock after this transaction
  performedBy: "Admin",            // User name (Phase 2: user.id)
  createdAt: "2026-06-29T08:00:00"
}
```

---

## 7. Component Architecture

### 7.1 Page Hierarchy

```
App.jsx  (React Router v7)
  ├── <ThemeProvider>
  ├── <InventoryProvider>
  ├── <BrowserRouter>
  │     └── <Routes>
  │           └── <AppLayout>
  │                 ├── <Sidebar> (with theme toggle & collapse actions)
  │                 ├── <Topbar>
  │                 └── <Outlet>
  │                       ├── /dashboard    → <DashboardPage> (staggered KPI cards + alerts)
  │                       ├── /products     → <ProductsPage> (crud + filter select triggers)
  │                       ├── /transactions → <TransactionsPage> (ledger history + filters)
  │                       └── /reports      → <ReportsPage> (4 charts + PDF/CSV export engine)
  └── <Toaster>
```

---

## 8. State Management Strategy

We use **React Context + useReducer** with a versioned migration checker.

### 8.1 Inventory Reducer Actions

```javascript
"ADD_PRODUCT"
"UPDATE_PRODUCT"
"DELETE_PRODUCT"    // Soft-deletes product
"STOCK_IN"          // Adds stock & pushes ledger log
"STOCK_OUT"         // Subtracts stock & pushes ledger log
"SET_SEARCH"
"SET_FILTER"
"SET_SORT"
"TOGGLE_SIDEBAR"
```

---

## 9. UI/UX Design System

### 9.1 Visual Style Guidelines

All colors, widths, and animations are managed in [tokens.css](file:///c:/Users/Jomari/Desktop/React-Project/Inventory-Management-System/src/styles/tokens.css):

*   **Palette**: Dark-mode primary (`#0F172A`), Surface cards (`#1E293B`), Accent cyan (`#22D3EE`), and active Indigo (`#6366F1`) components.
*   **Adaptive Theme**: Full light theme token overrides configured mapping light backgrounds to `#F8FAFC` and surface cards to `#FFFFFF` dynamically.
*   **Micro-interactions**: Scale actions mapped on click triggers (`scale(0.97)` spring) and spring slide effects configured for all entry points.

---

## 10. Export & Reporting System

All exports are resolved client-side in [exportService.js](file:///c:/Users/Jomari/Desktop/React-Project/Inventory-Management-System/src/services/exportService.js):
*   **PDF Engine**: Leverages `jsPDF` + `jsPDF-AutoTable` to draw dynamic headers, audit metrics summary tables, and format category stock assets correctly.
*   **CSV Engine**: Encapsulates arrays into structured, spreadsheet-compatible CSV tables using custom escaping functions.

---

## 11. Development Roadmap

### Phase 1 — MVP (Core Framework) ✅ COMPLETE
*   ✅ Design System Tokens & Base Theme Swapper
*   ✅ Product CRUD Page & Unsaved Warning Confirmation Modals
*   ✅ Stock adjustment tools with dynamic inventory validation schema

### Phase 1B — Reports & Transactions ✅ COMPLETE
*   ✅ Ledger Transactions log with query filters (date ranges, types, search)
*   ✅ Ledgers Detail modal displaying calculating steps
*   ✅ 4 Recharts interactive panels (Value distribution, count breakdown, trend timelines)
*   ✅ Professional CSV / PDF document exports
*   ✅ Global Keyboard Shortcuts Hook
*   ✅ UI/UX design refinements (spring actions, staggered entrance transitions)

### Phase 2 — Cloud Backend Integration ✅ COMPLETE
*   ✅ **Supabase Setup**: Project, database schemas, tables (`products`, `stock_transactions`, `categories`, `user_roles`), triggers, and Row Level Security (RLS) policies.
*   ✅ **Service Refactoring**: Transitioned `productService.js`, `stockService.js`, and new `categoryService.js` to asynchronously query and mutate data directly via `supabase-js`.
*   ✅ **Authentication (Email & OAuth)**: Integrated `AuthContext` guarding routes with Google Sign-In and Email-password sign-in mechanisms.
*   ✅ **Supabase Storage**: Created `storageService.js` handling product image uploads, retrieves, and updates directly into Supabase Storage buckets.
*   ✅ **Realtime Integration**: Subscribed context data models to Postgres Changes for automated local state updates on remote mutations.
*   ✅ **UI/UX Polishing**: Refactored `ConfirmDialog` layouts, modal state timers, and implemented dynamic category caches and outside-click closeable notifications flyout.

### Phase 3 — Future Extensions (Next Steps)
*   [ ] **Product Image Upload UI**: Add file selection/preview controls to `ProductForm` component to hook into `storageService.uploadProductImage`.
*   [ ] **Bulk Data Operations**: CSV import/export upload parsing directly to table seeds.
*   [ ] **Multi-Warehouse Support**: Schema modifications adding warehouse node tracking.
*   [ ] **User Settings & Profile Management**:
    *   **Profile Customization**: Change display name, edit email, and upload profile pictures to a Supabase storage bucket (`avatars`).
    *   **Application Preferences**: Allow toggling custom defaults: default landing page, default currency formatting, notification thresholds, and persistent theme overrides.
    *   **Account Settings**: Password reset flow and OAuth provider management.
*   [ ] **Role-Based Access Control (RBAC)**:
    *   Enforce security tiers: `admin` (super-user), `manager` (read-write data access), and `viewer` (read-only monitoring).
    *   Apply UI gating and endpoint authorization checks restricting view permissions and mutations.

### Phase 4 — Production Readiness & Security Hardening
*   [ ] **Automated Reorder Alerts**: Supabase Edge Functions integrated with Resend/SendGrid/Twilio to trigger emails/SMS when items fall below reorder levels.
*   [ ] **Comprehensive Audit Ledger**: Secure, immutable system logging for all mutations with before/after snapshots.
*   [ ] **Database Optimizations**: Index strategy, connection pooling setup, and partition handling for scaling transaction histories.
*   [ ] **Advanced Security Hardening**: Strict RLS audits, Multi-Factor Authentication (MFA), and rate-limiting rules.

### Phase 5 — Advanced Automation, Integrations & Enterprise Scale
*   [ ] **Integrations & Automated Workflows**: Sync inventory levels with third-party storefronts (Shopify, WooCommerce) and accounting software.
*   [ ] **Barcode Scanner & PWA Mobile Capabilities**: Support camera barcode scanning natively via a mobile progressive web app.
*   [ ] **Supplier & Purchase Order (PO) Management**: Link suppliers to products and automate PO generation.
*   [ ] **Multi-Tenant SaaS Architecture**: Support multiple companies running isolated workspaces under Stripe subscriptions.
*   [ ] **AI Demand Forecasting**: Integrate regression models to predict future inventory needs based on velocity history.

---

### 🛡️ Role-Based Access Control (RBAC) Specification

To enforce security and compartmentalize operations, we define three primary user tiers. The system leverages Supabase Row Level Security (RLS) policies based on the `user_roles` lookup table and UI route/button guards to restrict actions:

| Action / Capability | Admin (`admin`) | Manager (`manager`) | Viewer (`viewer`) |
| :--- | :---: | :---: | :---: |
| **View Dashboard & Reports** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Product Catalog & Ledger** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Perform Stock Adjustments (In/Out)** | ✅ Yes | ✅ Yes | ❌ No |
| **Add / Edit Product Details** | ✅ Yes | ✅ Yes | ❌ No |
| **Delete Products (Soft Delete)** | ✅ Yes | ❌ No | ❌ No |
| **Configure System-wide Settings** | ✅ Yes | ❌ No | ❌ No |
| **Manage User Roles & Permissions** | ✅ Yes | ❌ No | ❌ No |
| **Execute Bulk Data Imports (CSV)** | ✅ Yes | ❌ No | ❌ No |

#### 🔑 Access Matrix Highlights
1. **Admin (Super-User)**: Complete administrative control. Only admins can assign or modify roles, edit system configurations (like system-wide currency or reorder defaults), perform soft-deletes of products, or run bulk CSV updates.
2. **Manager (Operator)**: Authorized to update stock levels (perform Stock In/Stock Out adjustments) and add or edit products in the catalog. They have full access to reports and ledgers but cannot delete any catalog history or manage other users.
3. **Viewer (Auditor)**: Strictly read-only access. Useful for clients, external auditors, or warehouse observers. All action buttons (e.g. "Stock In", "Stock Out", "Add Product", "Delete") are hidden or disabled in the UI, and RLS policies block any database mutations.

---

### ⚙️ User Settings Page Specification

A new settings interface (`/settings`) will allow users to manage their credentials, preferences, and personal details:

1. **User Profile**:
   - **Avatar Upload**: Support for uploading personal profile photos, saved in Supabase `avatars` bucket and linked via the user metadata.
   - **Personal Info**: Fields to update full name and primary email.
2. **System Preferences**:
   - **Theme Selector**: Force light/dark mode or sync with system settings (persisted to profile).
   - **Alert Settings**: Define custom reorder level multipliers or default stock alert thresholds.
   - **Default Landing Page**: Choose whether to open at `/dashboard` or `/products` upon logging in.
3. **Security & Integration**:
   - **Password Change**: Standard form with password strength validation.
   - **OAuth Connections**: Link or unlink external identity providers (Google OAuth, etc.).

---

### 🚀 Phase 4 — Production Readiness, Backend & Security Blueprint

To scale **StockFlow IMS** into a highly resilient, enterprise-grade application, the following blueprint will guide our production readiness phase:

#### 1. Production Features
*   **Intelligent Inventory Notifications**: Add a notification service using **Supabase Edge Functions** to listen to DB triggers (low stock) and send automated emails (via Resend) or push alerts to Slack/Teams webhooks.
*   **Immutable System Audit Log**: Create an `audit_logs` table tracking every write/delete operation. Record user ID, action type, timestamp, IP, client agent, and a JSON-diff of the changes. This log will be accessible only to `admin` profiles via an Audit dashboard.
*   **Predictive Stock Reordering**: Analytics widget displaying inventory velocity, average days-to-depletion, and auto-generated purchase orders when stock levels hit low thresholds.

#### 2. Enterprise Backend Implementation
*   **Query Performance Tuning**: Implement PostgreSQL indexes on columns like `products(sku)`, `products(name)`, `stock_transactions(product_id, created_at)` to support high-speed pagination and search.
*   **Supabase Edge Functions Migration**: Move high-memory actions (like compiling massive PDF/CSV reports and parsing large bulk import sheets) from the client browser to server-side Edge Functions.
*   **Database Scaling & Backups**: Configure automated point-in-time recovery (PITR) backups and setup connection pooling (PgBouncer) to handle concurrent traffic spikes smoothly.
*   **Sentry & Monitoring Integration**: Add client-side error boundaries and connect performance-monitoring SDKs (like Sentry) to trace slow network calls and catch crashes in real-time.

#### 3. Production Security & Hardening Measures
*   **Zero-Trust Row Level Security (RLS)**:
    *   Hard-restrict table operations. Ensure all queries reference the authenticated user context (`auth.uid()`) or associated organization/tenant ID.
    *   Prevent anonymous public reads across all buckets and endpoints.
*   **Multi-Factor Authentication (MFA)**: Toggle Supabase Auth's native TOTP-based MFA support, requiring administrators and managers to confirm logins via authenticator apps (e.g., Google Authenticator).
*   **API Rate Limiting & Cloudflare integration**: Route traffic through Cloudflare for DDoS protection and enable rate-limiting policies on auth attempts and API queries to prevent brute-force attacks.
*   **Secure Dependency Practices**: Integrate automated security scanning pipelines (`npm audit`, Dependabot, Snyk) to proactively discover and patch known vulnerabilities in our dependencies.

---

### 🌐 Phase 5 — Advanced Automation, Integrations & Enterprise Scale

To position **StockFlow IMS** as a market-leading SaaS solution or a highly integrated internal system, Phase 5 will focus on connectivity, mobility, procurement workflows, and advanced intelligence:

#### 1. E-Commerce & Third-Party Integrations
*   **Realtime Storefront Sync**: Build bidirectional sync connectors with major platforms (Shopify, WooCommerce, Amazon Seller Central). When an order is placed on a storefront, trigger a webhook that executes a `STOCK_OUT` transaction in StockFlow IMS.
*   **ERP & Accounting Sync**: Synchronize transaction ledgers with bookkeeping platforms (e.g., QuickBooks, Xero) to automatically sync cost of goods sold (COGS) and inventory valuation.

#### 2. Mobility & Barcode Operations
*   **PWA Setup & Camera Scanning**: Transform the application into a Progressive Web App (PWA) allowing warehouse staff to install it on mobile devices. Use browser-native barcode APIs (e.g., Shape Detection API or html5-qrcode) to scan barcodes/SKUs directly through the device camera for instant stock adjustments.
*   **Hardware Scanner Support**: Allow listening to physical keyboard-wedge barcode scanners, enabling rapid, hands-free product lookup and transactions.

#### 3. Procurement & Supplier Relations
*   **Supplier Directory**: Build a catalog of vendors/suppliers, mapping them to products, lead times, and unit costs.
*   **Automated Purchase Orders (POs)**: Enable operators to generate PDF purchase orders directly. When a PO is marked as "Approved", it enters a "Pending Delivery" state. Once the delivery arrives, scanning the PO auto-creates a bulk `STOCK_IN` transaction.

#### 4. Multi-Tenant SaaS Architecture
*   **Tenant Isolation**: Restructure the PostgreSQL schema to filter all tables by a `tenant_id` linked to an `organizations` table.
*   **Stripe Subscription Billing**: Integrate Stripe Billing for tier-based subscription management (e.g., Starter, Pro, Enterprise) based on catalog size, transactions per month, or seat count.
*   **Workspace Invites**: Allow organization administrators to invite team members via secure, tokenized emails.

#### 5. Intelligent Forecasting
*   **Demand Prediction Engine**: Apply moving-average and seasonal regression models to transaction history to predict stockout dates and recommend optimal purchase order quantities.
*   **Smart Dashboard Recommendations**: Add proactive insights like "Dead Stock Alerts" (unsold products in 90 days) and "High Velocity Trends" (alerting admins to adjust stock levels ahead of seasonal spikes).

---

## 12. Implementation Summary

### ✅ Technology Usage Audit

| Library | Status | Purpose |
|---------|--------|---------|
| **React 19** | ✅ Used | Context, custom state lifecycle |
| **Vite 8** | ✅ Used | Compiles builds in < 3s |
| **React Router v7** | ✅ Used | Navigation layout outlets |
| **Lucide React** | ✅ Used | Visual interface vectors |
| **Recharts** | ✅ Used | Dynamic, theme-aware SVG charts |
| **jsPDF** | ✅ Used | Professional document layouts |
| **jsPDF-AutoTable** | ✅ Used | Table alignment styling for reports |
| **react-hot-toast** | ✅ Used | Interactive system logs |
| **Day.js** | ✅ Used | Date range filters and timestamp formats |

---

*StockFlow IMS — System Architecture v2.3 | Updated: 2026-06-30*

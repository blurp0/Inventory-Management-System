# 📦 Inventory Management System — System Architecture

> **Project:** StockFlow IMS  
> **Version:** 1.0  
> **Stack:** React 19 + Vite + localStorage (Phase 1) → Supabase (Phase 2)  
> **Last Updated:** 2026-06-29  
> **Author:** Senior Fullstack Developer

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
12. [Open Questions](#12-open-questions)

---

## 1. Project Overview

**StockFlow IMS** is a modern, responsive Inventory Management System built for small-to-medium businesses (SMBs) and warehouse teams. It enables efficient product tracking, stock-level monitoring, transaction history, and detailed reporting — all with a premium, dark-mode-first UI.

### 🎯 Goals

| Goal | Description |
|------|-------------|
| **Efficiency** | Reduce manual stock errors by providing a single source of truth |
| **Visibility** | Real-time visual stats so teams can act before running out of stock |
| **Simplicity** | Intuitive UI that requires zero training for new users |
| **Portability** | Phase 1 runs fully in the browser (no server needed) |
| **Scalability** | Architecture designed to plug into a real backend in Phase 2 |

---

## 2. Feature Specification

### ✅ Core Features (User-Requested)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Add New Product** | Create product with name, SKU, category, description, unit price, reorder level, and initial stock quantity | 🔴 Critical |
| 2 | **View All Products** | Paginated, sortable product list with thumbnail, status badges, and stock levels | 🔴 Critical |
| 3 | **Search Products** | Live search by name, SKU, or category with debounced input | 🔴 Critical |
| 4 | **Stock In** | Increase stock quantity with a logged reason (e.g., "Purchase Order #001") | 🔴 Critical |
| 5 | **Stock Out** | Decrease stock quantity with a logged reason (e.g., "Sale", "Damaged") | 🔴 Critical |
| 6 | **Edit Product** | Modify product metadata (name, description, price, category, reorder level) | 🔴 Critical |
| 7 | **Delete Product** | Soft-delete with confirmation modal and optional restore within session | 🟠 High |
| 8 | **Inventory Report** | Statistical dashboard with charts: total SKUs, stock value, low stock alerts, top/bottom movers | 🔴 Critical |
| 9 | **Export Report** | Export data as PDF (professional layout) and CSV (raw data) | 🟠 High |

---

### 💡 Suggested Additional Features

These are strongly recommended additions based on industry best practices:

| # | Feature | Why It Matters |
|---|---------|----------------|
| 10 | **Low Stock Alerts** | Automatically flag products below their `reorderLevel` threshold with a prominent badge/banner |
| 11 | **Stock Transaction History** | Full audit log of every Stock In / Stock Out event with timestamp, quantity delta, and reason — critical for reconciliation |
| 12 | **Product Categories & Filtering** | Filter product list by category, status (In Stock / Low Stock / Out of Stock), and sort by name, price, or quantity |
| 13 | **Dashboard Overview Page** | A dedicated home screen with KPI cards: Total Products, Total Stock Value, Low Stock Items count, Recent Transactions |
| 14 | **Bulk Import (CSV Upload)** | Allow users to import multiple products at once via a CSV template |
| 15 | **Barcode / SKU Generator** | Auto-generate unique SKU codes (e.g., `SKU-2026-0001`) when creating a product |
| 16 | **Dark / Light Mode Toggle** | A premium toggle to switch between dark and light themes, persisted to localStorage |
| 17 | **Product Image Upload** | Attach a product image (stored as Base64 in localStorage / URL in Phase 2) |
| 18 | **Undo Delete** | Toast-based undo for the last deleted product within a 5-second window before permanent removal |
| 19 | **Keyboard Shortcuts** | Power-user shortcuts: `N` → New Product, `/` → Focus Search, `Esc` → Close Modal |
| 20 | **Activity Feed / Recent Actions** | A sidebar or widget showing the last 10 actions taken (added, edited, stocked in/out, deleted) |

---

## 3. Tech Stack Decision

### 🏆 Recommended Stack (What We'll Use)

Given the project already has **React 19 + Vite** bootstrapped, we build on that solid foundation and add the right libraries:

```
Frontend Framework:   React 19 (already installed)
Build Tool:           Vite 8 (already installed)
Styling:              Vanilla CSS + CSS Custom Properties (Design Tokens)
State Management:     React Context API + useReducer (Phase 1) → Zustand (if complexity grows)
Routing:              React Router v7
Charts:               Recharts (lightweight, composable, React-native)
PDF Export:           jsPDF + jsPDF-AutoTable
CSV Export:           Native Blob / papaparse
Icons:                Lucide React (consistent SVG icon set)
Date Handling:        Day.js (lightweight, 2KB alternative to Moment)
Notifications:        react-hot-toast
Persistence:          localStorage (Phase 1) → Supabase (Phase 2)
Linting:              OXLint (already installed)
```

### 🤔 Stack Comparison (Alternatives Considered)

| Concern | Option A (Chosen) | Option B | Option C |
|---------|-------------------|----------|----------|
| **Styling** | Vanilla CSS + tokens | Tailwind CSS | styled-components |
| **Why chosen** | Zero runtime cost, full control, already in project | Would require npm install + config changes | Runtime overhead |
| **State** | Context + useReducer | Zustand | Redux Toolkit |
| **Why chosen** | Built-in, zero deps, sufficient for Phase 1 | Great upgrade path if needed | Overkill for this scale |
| **Charts** | Recharts | Chart.js | Victory |
| **Why chosen** | React-first, composable, good docs | Imperative API, harder to integrate | Heavier bundle |
| **Backend (Phase 2)** | Supabase | Firebase | Custom Node.js API |
| **Why chosen** | Postgres SQL, auth built-in, free tier, REST + realtime | NoSQL (less ideal for inventory queries) | Requires separate server |

### 📦 Libraries to Install

```bash
npm install react-router-dom recharts jspdf jspdf-autotable lucide-react dayjs react-hot-toast
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
│  │  Components  │    │   + Custom      │    │  / JSON     │ │
│  │  + Routing   │    │   Hooks)        │    │  Storage)   │ │
│  └──────────────┘    └────────────────┘    └─────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Service Layer                      │  │
│  │  productService | stockService | reportService        │  │
│  │  exportService  | storageService                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 High-Level Architecture (Phase 2 — With Backend)

```
┌──────────────────────┐         ┌──────────────────────────┐
│   React 19 (Client)  │ ──────▶ │   Supabase (BaaS)        │
│                      │         │                          │
│  ─ UI Components     │         │  ─ PostgreSQL Database   │
│  ─ React Router v7   │ ◀────── │  ─ Row Level Security    │
│  ─ Zustand / Context │         │  ─ REST API              │
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
   UI Component (StockInModal)
        │
        ▼
   Custom Hook (useStock)
        │
        ▼
   stockService.addTransaction()
        │
        ├─── Updates product.currentStock in store
        │
        ├─── Appends transaction to transactionLog
        │
        └─── Persists to localStorage
```

---

## 5. Folder Structure

```
src/
├── assets/                    # Static images, logos
├── components/
│   ├── common/                # Reusable UI atoms
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Table/
│   │   ├── Toast/
│   │   ├── SearchBar/
│   │   └── EmptyState/
│   ├── layout/                # App shell
│   │   ├── Sidebar/
│   │   ├── Topbar/
│   │   └── PageWrapper/
│   ├── products/              # Product-specific components
│   │   ├── ProductCard/
│   │   ├── ProductTable/
│   │   ├── ProductForm/       # Add & Edit
│   │   └── ProductFilters/
│   ├── stock/                 # Stock transaction components
│   │   ├── StockInModal/
│   │   ├── StockOutModal/
│   │   └── TransactionHistory/
│   └── reports/               # Charts & report components
│       ├── KPICard/
│       ├── StockValueChart/
│       ├── CategoryBreakdown/
│       ├── LowStockAlert/
│       └── RecentActivity/
├── contexts/
│   ├── InventoryContext.jsx   # Products + transactions global state
│   └── ThemeContext.jsx       # Dark/light mode
├── hooks/
│   ├── useProducts.js
│   ├── useStock.js
│   ├── useSearch.js           # Debounced search
│   ├── useFilter.js
│   └── useExport.js
├── pages/
│   ├── Dashboard/             # KPI overview
│   ├── Products/              # Product list + search
│   ├── StockMovements/        # Transaction history
│   └── Reports/               # Charts + export
├── services/
│   ├── productService.js      # CRUD operations
│   ├── stockService.js        # Stock in/out + transaction log
│   ├── storageService.js      # localStorage abstraction
│   ├── reportService.js       # Compute stats/aggregations
│   └── exportService.js       # PDF + CSV generation
├── utils/
│   ├── skuGenerator.js        # Auto-generate SKU codes
│   ├── formatters.js          # Currency, date, number formatting
│   └── validators.js          # Form validation rules
├── styles/
│   ├── tokens.css             # CSS Custom Properties (design tokens)
│   ├── reset.css              # CSS reset
│   └── utilities.css          # Spacing, flex, grid helpers
├── App.jsx
├── main.jsx
└── index.css
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

### 6.3 App State Shape

```javascript
{
  products: Product[],
  transactions: Transaction[],
  filters: {
    search: "",
    category: "all",
    status: "all",       // "all" | "in_stock" | "low_stock" | "out_of_stock"
    sortBy: "name",
    sortOrder: "asc"
  },
  ui: {
    theme: "dark",       // "dark" | "light"
    sidebarOpen: true,
    activeModal: null    // null | "addProduct" | "stockIn" | "stockOut" | "delete"
  }
}
```

---

## 7. Component Architecture

### 7.1 Page Hierarchy

```
App.jsx  (Router)
  ├── Layout (Sidebar + Topbar)
  │     ├── /dashboard      → <DashboardPage>
  │     │       ├── <KPICard> × 4
  │     │       ├── <StockValueChart>
  │     │       ├── <CategoryBreakdown>
  │     │       ├── <LowStockAlert>
  │     │       └── <RecentActivity>
  │     ├── /products       → <ProductsPage>
  │     │       ├── <SearchBar>
  │     │       ├── <ProductFilters>
  │     │       ├── <ProductTable>
  │     │       │       └── <ProductTableRow> × N
  │     │       └── Modals:
  │     │             ├── <ProductForm> (Add/Edit)
  │     │             ├── <StockInModal>
  │     │             ├── <StockOutModal>
  │     │             └── <DeleteConfirmModal>
  │     ├── /transactions   → <StockMovementsPage>
  │     │       └── <TransactionHistory> (filterable, paginated)
  │     └── /reports        → <ReportsPage>
  │             ├── <ReportChart> × N
  │             └── <ExportControls> (PDF + CSV buttons)
  └── <ToastProvider>
```

---

## 8. State Management Strategy

We use **React Context + useReducer** (zero extra dependencies) with a clean action-based pattern.

### 8.1 Inventory Reducer Actions

```javascript
// Products
"ADD_PRODUCT"
"UPDATE_PRODUCT"
"DELETE_PRODUCT"    // Soft delete (sets isDeleted: true)
"RESTORE_PRODUCT"   // Undo delete

// Stock
"STOCK_IN"          // Add qty + log transaction
"STOCK_OUT"         // Remove qty + log transaction

// Filters / UI
"SET_SEARCH"
"SET_FILTER"
"SET_SORT"
"TOGGLE_THEME"
"OPEN_MODAL"
"CLOSE_MODAL"
```

### 8.2 Persistence Strategy

All state changes are automatically synced to `localStorage` via a custom `usePersistState` hook. On app load, state is hydrated from `localStorage` with schema version checking to handle future migrations.

```javascript
// storageService.js
const STORAGE_KEY = "stockflow_v1";
const SCHEMA_VERSION = 1;

export const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, ...state }));
};

export const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (parsed.version !== SCHEMA_VERSION) return null; // Force fresh state on schema change
  return parsed;
};
```

---

## 9. UI/UX Design System

### 9.1 Visual Style

| Token | Value |
|-------|-------|
| **Primary Style** | Dark mode, Glassmorphism + subtle gradients |
| **Primary Font** | Inter (Google Fonts) |
| **Code Font** | JetBrains Mono (for SKUs) |
| **Primary Color** | `#6366F1` (Indigo) |
| **Accent Color** | `#22D3EE` (Cyan) |
| **Success** | `#10B981` (Emerald) |
| **Warning** | `#F59E0B` (Amber) |
| **Danger** | `#EF4444` (Red) |
| **Background** | `#0F172A` (Slate 900) |
| **Surface** | `#1E293B` (Slate 800) |
| **Border** | `rgba(255,255,255,0.08)` |
| **Text Primary** | `#F1F5F9` (Slate 100) |
| **Text Secondary** | `#94A3B8` (Slate 400) |
| **Spacing Scale** | 4px base (4, 8, 12, 16, 24, 32, 48, 64) |
| **Border Radius** | `8px` components, `16px` cards, `24px` modals |

### 9.2 Stock Status Badges

| Status | Condition | Color |
|--------|-----------|-------|
| 🟢 **In Stock** | `currentStock > reorderLevel` | Emerald |
| 🟡 **Low Stock** | `currentStock > 0 && currentStock <= reorderLevel` | Amber |
| 🔴 **Out of Stock** | `currentStock === 0` | Red |

### 9.3 KPI Cards (Dashboard)

| Card | Metric |
|------|--------|
| 📦 **Total Products** | Count of non-deleted products |
| 💰 **Total Stock Value** | `Σ (currentStock × unitPrice)` |
| ⚠️ **Low Stock Items** | Count where `currentStock <= reorderLevel` |
| 📋 **Total Transactions** | All-time transaction count |

---

## 10. Export & Reporting System

### 10.1 PDF Export (Professional Report)

Using **jsPDF + jsPDF-AutoTable**:

```
┌────────────────────────────────────────┐
│  STOCKFLOW IMS — Inventory Report      │
│  Generated: June 29, 2026              │
├────────────────────────────────────────┤
│  SUMMARY KPIs                          │
│  • Total Products: 128                 │
│  • Total Stock Value: ₱ 2,450,000      │
│  • Low Stock Alerts: 14 items          │
├────────────────────────────────────────┤
│  PRODUCT TABLE (AutoTable)             │
│  SKU | Name | Category | Qty | Value  │
│  ─────────────────────────────────── │
│  ...                                   │
├────────────────────────────────────────┤
│  LOW STOCK ITEMS (Highlighted Table)   │
├────────────────────────────────────────┤
│  RECENT TRANSACTIONS (Last 30)         │
└────────────────────────────────────────┘
```

### 10.2 CSV Export

Raw data export with all columns for spreadsheet analysis.

```
exportService.js:
  ├── exportToPDF(products, transactions, stats)
  ├── exportToCSV(products)
  └── exportTransactionsToCSV(transactions)
```

---

## 11. Development Roadmap

### Phase 1 — MVP (Client-Side, ~3–4 weeks)

```
Week 1: Foundation
  ✅ Project setup (Vite + React 19) — DONE
  □  Install dependencies (Router, Recharts, Lucide, jsPDF, etc.)
  □  Design tokens (tokens.css) + Reset
  □  App layout (Sidebar + Topbar + Router)
  □  Context + Reducer (Inventory state)
  □  localStorage persistence layer

Week 2: Core CRUD
  □  Product Form (Add/Edit) — with validation
  □  Product Table/List view
  □  Search (debounced) + Filter + Sort
  □  Stock In / Stock Out Modals
  □  Delete with undo toast
  □  Transaction History page

Week 3: Dashboard & Reports
  □  Dashboard KPI Cards
  □  Recharts: Stock Value by Category (Bar)
  □  Recharts: Low Stock Overview (Horizontal Bar)
  □  Recharts: Stock Movements over time (Line)
  □  Low Stock Alert banner
  □  Recent Activity feed

Week 4: Export + Polish
  □  PDF Export (jsPDF + AutoTable)
  □  CSV Export
  □  Dark/Light mode toggle
  □  Keyboard shortcuts
  □  Bulk CSV Import
  □  Mobile responsiveness pass
  □  Accessibility audit
  □  Final UI polish + animations
```

### Phase 2 — Backend Integration (Optional, +2–3 weeks)

```
  □  Supabase project setup (PostgreSQL tables mirroring data models)
  □  Auth: Email/password login (Supabase Auth)
  □  Replace localStorage with Supabase REST calls
  □  Realtime stock updates (Supabase Realtime)
  □  Image storage (Supabase Storage for product images)
  □  Multi-user support with Row Level Security (RLS)
  □  Role-based access: Admin vs. Staff (Staff can only do Stock In/Out)
  □  Deploy frontend to Vercel / Netlify
```

---

## 12. Open Questions

> These are decisions we need to align on before or during development:

| # | Question | Default Assumption |
|---|----------|--------------------|
| 1 | **Currency** — What currency symbol to use? | Philippine Peso (₱) |
| 2 | **Units** — Fixed unit types or free-text? | Free-text input (e.g., pcs, kg, box) |
| 3 | **Image support** — Should products have images in Phase 1? | Optional — Base64 in localStorage |
| 4 | **User authentication** — Phase 1 single-user or skip auth? | Skip auth in Phase 1 (single user) |
| 5 | **Categories** — Predefined list or dynamic (user-created)? | Dynamic — user creates categories |
| 6 | **Date format** — International or local format? | `MMM DD, YYYY` (e.g., Jun 29, 2026) |
| 7 | **Stock Out below 0** — Allow negative stock or block? | Block — show error if qty exceeds current stock |
| 8 | **PDF branding** — Company name/logo on exported reports? | Use "StockFlow IMS" as default |
| 9 | **Mobile priority** — Fully responsive or desktop-first? | Desktop-first, responsive to tablet/mobile |
| 10 | **Phase 2 backend** — Is Supabase acceptable or prefer another BaaS/custom API? | Supabase (open to discussion) |

---

> **📌 Next Step:** Once this architecture is approved, we'll begin execution starting with **installing dependencies**, setting up the **design token system**, and building the **app layout shell**.

---

*StockFlow IMS — System Architecture v1.0 | Senior Fullstack Developer*

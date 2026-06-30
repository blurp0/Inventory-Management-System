# 📦 Inventory Management System — System Architecture

> **Project:** StockFlow IMS  
> **Version:** 1.0 - Phase 1 Complete  
> **Stack:** React 19 + Vite + localStorage (Phase 1) → Supabase (Phase 2)  
> **Last Updated:** 2025-01-20  
> **Status:** ⚠️ Phase 1 Partial - Core Features Done, Reports Pending

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

### ✅ Core Features - Implementation Status

| # | Feature | Description | Priority | Status |
|---|---------|-------------|----------|--------|
| 1 | **Add New Product** | Create product with name, SKU, category, description, unit price, reorder level, and initial stock quantity | 🔴 Critical | ✅ Done |
| 2 | **View All Products** | Paginated, sortable product list with thumbnail, status badges, and stock levels | 🔴 Critical | ✅ Done |
| 3 | **Search Products** | Live search by name, SKU, or category with debounced input | 🔴 Critical | ✅ Done |
| 4 | **Stock In** | Increase stock quantity with a logged reason (e.g., "Purchase Order #001") | 🔴 Critical | ✅ Done |
| 5 | **Stock Out** | Decrease stock quantity with a logged reason (e.g., "Sale", "Damaged") | 🔴 Critical | ✅ Done |
| 6 | **Edit Product** | Modify product metadata (name, description, price, category, reorder level) | 🔴 Critical | ✅ Done |
| 7 | **Delete Product** | Soft-delete with confirmation dialog | 🟠 High | ✅ Done |
| 8 | **Inventory Dashboard** | Statistical dashboard with KPI cards, recent activity, low stock alerts | 🔴 Critical | ✅ Done |
| 9 | **Export Report** | Export data as PDF and CSV | 🟠 High | ⏳ Pending |

### 💡 Suggested Additional Features - Status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10 | **Low Stock Alerts** | ✅ Done | In Dashboard |
| 11 | **Stock Transaction History** | ⏳ Pending | Page is placeholder |
| 12 | **Product Categories & Filtering** | ✅ Done | Category filter + status filter |
| 13 | **Dashboard Overview Page** | ✅ Done | KPI cards + activity |
| 14 | **Bulk Import (CSV Upload)** | ⏳ Pending | Phase 2 |
| 15 | **Barcode / SKU Generator** | ✅ Done | Auto-generate on add |
| 16 | **Dark / Light Mode Toggle** | ✅ Done | Persisted to localStorage |
| 17 | **Product Image Upload** | ⏳ Pending | Phase 2 |
| 18 | **Undo Delete** | ⏳ Removed | Using confirm dialog instead |
| 19 | **Keyboard Shortcuts** | ⏳ Pending | Not implemented |
| 20 | **Activity Feed** | ✅ Done | Dashboard shows last 5 |

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
│   ├── common/                # ✅ Reusable UI atoms
│   │   ├── Badge/             # ✅ Status indicators
│   │   ├── Button/            # ✅ 6 variants, 3 sizes
│   │   ├── Input/             # ✅ Input, Textarea, Select
│   │   ├── Modal/             # ✅ Overlay, keyboard, preventClose
│   │   ├── SearchBar/         # ✅ Debounced search (300ms)
│   │   ├── CategoryModal/     # ✅ Dynamic category creation
│   │   ├── ConfirmDialog/     # ✅ Confirmation dialogs
│   │   └── index.js           # ✅ Central export
│   ├── layout/                # ✅ App shell
│   │   ├── Sidebar/           # ✅ Navigation
│   │   ├── Topbar/            # ✅ Header + theme toggle
│   │   ├── PageWrapper/       # ✅ Content wrapper
│   │   └── AppLayout.jsx      # ✅ Main layout
│   ├── products/              # ✅ Product components
│   │   ├── ProductForm/       # ✅ Add/Edit with validation
│   │   └── ProductTable/      # ✅ Table with actions
│   └── stock/                 # ✅ Stock transactions
│       └── StockModal/        # ✅ Stock In/Out
├── contexts/
│   ├── InventoryContext.jsx   # ✅ Global state provider
│   ├── inventoryReducer.js    # ✅ 12 actions
│   └── ThemeContext.jsx       # ✅ Dark/light mode
├── hooks/
│   ├── useProducts.js         # ✅ Product CRUD operations
│   ├── useStock.js            # ✅ Stock transactions
│   ├── useFilters.js          # ✅ Search, filter, sort
│   └── index.js               # Central export
├── pages/
│   ├── Dashboard/             # ✅ KPI cards + Recent Activity
│   ├── Products/              # ✅ Full CRUD operations
│   ├── Transactions/          # ⚠️ PLACEHOLDER - Shows "Coming soon"
│   └── Reports/               # ⚠️ PLACEHOLDER - Shows "Coming soon"
├── services/
│   ├── productService.js      # ✅ Product business logic
│   ├── stockService.js        # ✅ Stock transaction logic
│   ├── storageService.js      # ✅ localStorage abstraction
│   └── index.js               # Central export
├── utils/
│   ├── formatters.js          # ✅ Currency, date, stock status
│   └── skuGenerator.js        # ✅ Auto-generate SKU
├── styles/
│   ├── tokens.css             # ✅ CSS Custom Properties
│   ├── reset.css              # ✅ CSS reset
│   └── utilities.css          # ✅ Utility classes
├── App.jsx                    # ✅ Root with routing
├── main.jsx                   # ✅ Entry point
└── index.css                  # ✅ Global styles
```

### 📊 Pages Implementation Status

| Page | Route | Status | Implementation |
|------|-------|--------|----------------|
| Dashboard | `/dashboard` | ✅ Complete | KPI cards (4), Recent Activity (5), Low Stock Alerts |
| Products | `/products` | ✅ Complete | Full CRUD, Search, Filter, Sort, Stock In/Out |
| Transactions | `/transactions` | ⚠️ Placeholder | Shows "Coming soon" message only |
| Reports | `/reports` | ⚠️ Placeholder | Shows "Coming soon" message only |

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

### 7.1 Actual Page Hierarchy

```
App.jsx  (React Router v7)
  ├── <ThemeProvider>
  ├── <InventoryProvider>
  ├── <BrowserRouter>
  │     └── <Routes>
  │           └── <AppLayout>
  │                 ├── <Sidebar>
  │                 ├── <Topbar>
  │                 └── <Outlet>
  │                       ├── /dashboard    → <DashboardPage> ✅
  │                       │       ├── KPI Cards (inline)
  │                       │       ├── Recent Activity (inline)
  │                       │       └── Low Stock Alerts (inline)
  │                       │
  │                       ├── /products     → <ProductsPage> ✅
  │                       │       ├── <SearchBar>
  │                       │       ├── Filters (3 × <Select>)
  │                       │       ├── <ProductTable>
  │                       │       ├── <ProductForm> (modal)
  │                       │       └── <StockModal> (modal)
  │                       │
  │                       ├── /transactions → <TransactionsPage> ⚠️ PLACEHOLDER
  │                       │       └── "Coming soon..."
  │                       │
  │                       └── /reports      → <ReportsPage> ⚠️ PLACEHOLDER
  │                               └── "Coming soon..."
  │
  └── <Toaster>
```

### 7.2 Component Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Button | ✅ Complete | 6 variants (primary, secondary, success, danger, ghost, warning) |
| Input/Textarea/Select | ✅ Complete | With validation |
| Modal | ✅ Complete | Keyboard support, preventClose |
| Badge | ✅ Complete | 4 variants (success, warning, danger, default) |
| SearchBar | ✅ Complete | 300ms debounce |
| CategoryModal | ✅ Complete | Dynamic categories |
| ConfirmDialog | ✅ Complete | Warning variant for unsaved changes |
| ProductForm | ✅ Complete | Add/Edit, validation, unsaved protection |
| ProductTable | ✅ Complete | Actions, centered icons |
| StockModal | ✅ Complete | Stock In/Out with validation |
| Sidebar | ✅ Complete | Navigation |
| Topbar | ✅ Complete | Theme toggle |
| PageWrapper | ✅ Complete | Consistent layout |
| KPICard | ✅ Inline | In Dashboard |
| StockValueChart | ⏳ Pending | Not implemented |
| CategoryBreakdown | ⏳ Pending | Not implemented |
| TransactionHistory | ⏳ Pending | Placeholder page |

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

### Phase 1 — MVP (Client-Side) ⚠️ PARTIALLY COMPLETE

```
Week 1: Foundation ✅
  ✅ Project setup (Vite + React 19)
  ✅ Install dependencies (Router, Recharts, Lucide, jsPDF, etc.)
  ✅ Design tokens (tokens.css) + Reset
  ✅ App layout (Sidebar + Topbar + Router)
  ✅ Context + Reducer (Inventory state)
  ✅ localStorage persistence layer

Week 2: Core CRUD ✅ COMPLETED
  ✅ Product Form (Add/Edit) with validation
  ✅ Product Table/List view
  ✅ Search (debounced) + Filter + Sort
  ✅ Stock In / Stock Out Modals
  ✅ Delete with confirmation
  ✅ Category Management with Modal
  ✅ Unsaved Changes Confirmation Dialog

Week 3: Dashboard ✅ COMPLETED
  ✅ Dashboard KPI Cards (4 cards)
  ✅ Recent Activity feed (last 5 transactions)
  ✅ Low Stock Alert section

Week 4: Reports & Transactions ⚠️ PENDING
  ⏳ Transaction History Page (placeholder)
  ⏳ Reports & Analytics Page (placeholder)
  ⏳ PDF Export (jsPDF + AutoTable)
  ⏳ CSV Export
  ⏳ Interactive Charts (Recharts)
  ⏳ Export functionality

Extra: Polish ✅ COMPLETED
  ✅ Dark/Light mode toggle
  ✅ Responsive design (mobile)
  ✅ Toast notifications
  ✅ Confirmation dialogs
  ✅ UI/UX refinements
```

### 🎯 Phase 1 Achievements

**Core Features Implemented:**
- ✅ Complete CRUD operations for products (Add, Edit, Delete, View)
- ✅ Stock In/Out transaction management with validation
- ✅ Real-time search, filter, and sort functionality
- ✅ Dashboard with KPI cards (4 cards: Total Products, Stock Value, Low Stock Alerts, Transactions)
- ✅ Recent Activity feed (last 5 transactions)
- ✅ Low Stock Alert section in Dashboard
- ✅ Dark/Light theme toggle with persistence
- ✅ Responsive design (desktop, tablet, mobile)

**UI/UX Components:**
- ✅ Reusable Button component (6 variants: primary, secondary, success, danger, ghost, warning)
- ✅ Input/Textarea/Select components with validation
- ✅ Modal component with keyboard support & preventClose
- ✅ Badge component for status indicators
- ✅ SearchBar with debounced input (300ms)
- ✅ CategoryModal for dynamic category management
- ✅ ConfirmDialog for user confirmations
- ✅ ProductForm with unsaved changes protection
- ✅ ProductTable with action buttons (centered, 20px icons)
- ✅ StockModal for stock transactions with validation
- ✅ PageWrapper for consistent page layout

**Technical Implementation:**
- ✅ Context API + useReducer for state management (12 actions)
- ✅ localStorage persistence with schema versioning
- ✅ Custom hooks (useProducts, useStock, useFilters)
- ✅ Service layer architecture (productService, stockService, storageService)
- ✅ Utility functions (formatters.js, skuGenerator.js)
- ✅ CSS Design tokens system (tokens.css)
- ✅ Toast notifications (react-hot-toast)
- ✅ Icon library (Lucide React)

**Pending (Not Yet Implemented):**
- ⏳ Transaction History Page (placeholder only)
- ⏳ Reports & Analytics Page (placeholder only)
- ⏳ Interactive Charts (Recharts - NOT integrated)
- ⏳ PDF Export functionality
- ⏳ CSV Export functionality
- ⏳ Low Stock Alert banner component
- ⏳ Recent Activity full component
- ⏳ Keyboard shortcuts (N, /, Esc)

### Phase 1B — Reports & Transactions (PENDING - High Priority)

```
Week 5: Transaction History Page ⏳
  ⏳ Full transaction history table
  ⏳ Filter by date range
  ⏳ Filter by transaction type (Stock In/Out)
  ⏳ Filter by product
  ⏳ Sort by date, quantity
  ⏳ Search transactions
  ⏳ Transaction details modal

Week 6: Reports & Analytics Page ⏳
  ⏳ Stock Value by Category Chart (Recharts Bar)
  ⏳ Category Distribution Chart (Recharts Pie)
  ⏳ Stock Movements Trend (Recharts Line)
  ⏳ Low Stock Overview (Recharts Horizontal Bar)
  ⏳ PDF Export (jsPDF + AutoTable)
  ⏳ CSV Export for products
  ⏳ CSV Export for transactions
```

### Phase 2 — Backend Integration (Future)

```
  □  Supabase project setup (PostgreSQL tables mirroring data models)
  □  Auth: Email/password login (Supabase Auth)
  □  Replace localStorage with Supabase REST calls
  □  Realtime stock updates (Supabase Realtime)
  □  Image storage (Supabase Storage for product images)
  □  Multi-user support with Row Level Security (RLS)
  □  Role-based access: Admin vs. Staff
  □  Barcode scanning support
  □  Advanced analytics and forecasting
  □  Bulk CSV Import functionality
  □  Deploy frontend to Vercel / Netlify
```

---

## 12. Implementation Summary

### ✅ Completed (Phase 1 Core)

| Item | Status | Implementation |
|------|--------|----------------|
| Product CRUD | ✅ Done | ProductForm, ProductTable, useProducts |
| Stock In/Out | ✅ Done | StockModal, useStock |
| Search & Filter | ✅ Done | SearchBar, useFilters |
| Dashboard | ✅ Done | KPI cards, Recent Activity, Low Stock |
| Theme Toggle | ✅ Done | ThemeContext |
| Categories | ✅ Done | CategoryModal, dynamic dropdown |
| Confirmation Dialogs | ✅ Done | ConfirmDialog component |
| Unsaved Changes | ✅ Done | preventClose in Modal |
| localStorage | ✅ Done | storageService with versioning |

### ⏳ Pending (Phase 1B - Reports)

| Item | Priority | Description |
|------|----------|-------------|
| Transaction History Page | High | Full table with filters |
| Reports Page | High | Charts + export buttons |
| PDF Export | High | jsPDF + AutoTable |
| CSV Export | High | Blob API for products/transactions |
| Interactive Charts | Medium | Recharts integration |
| Keyboard Shortcuts | Low | N, /, Esc handlers |

### 📋 Technology Usage

| Library | Status | Notes |
|---------|--------|-------|
| React 19 | ✅ Used | Latest features |
| Vite 8 | ✅ Used | Fast dev server |
| React Router v7 | ✅ Used | Client-side routing |
| Lucide React | ✅ Used | All icons |
| react-hot-toast | ✅ Used | Notifications |
| Recharts | ⚠️ Installed | Not integrated into pages |
| jsPDF | ⚠️ Installed | Not integrated into pages |
| jsPDF-AutoTable | ⚠️ Installed | Not integrated |

---

> **📌 Current Status:** Phase 1 Core Complete. Transactions and Reports pages are placeholders.
> 
> **Next Step:** Implement Transaction History and Reports pages with charts and export functionality.

---

*StockFlow IMS — System Architecture v1.1 | Updated: 2025-01-20*

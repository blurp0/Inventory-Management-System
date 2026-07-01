# 📦 StockFlow IMS — Inventory Management System

> A modern, responsive inventory management system built for small-to-medium businesses and warehouse teams. Track products, monitor stock levels, manage transactions, and generate detailed reports with a premium dark-mode-first UI.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

### ✅ Implemented (Phase 1 Complete)

- **📝 Product Management** — Add, edit, and delete products with comprehensive details (SKU, name, category, price, reorder level, location, supplier)
- **🔍 Smart Search & Filter** — Real-time search by name, SKU, or category with multi-filter (category, stock status) and dynamic sorting
- **📦 Stock Operations** — Track stock in/out transactions with reason logging, validation, and delta flow visualization
- **📊 Analytics Dashboard** — KPI cards showing total products, stock value, low stock alerts, out-of-stock items, and recent transactions
- **⚠️ Low Stock Alerts** — Visual alerts for products below reorder level threshold in Dashboard and Sidebar
- **📋 Recent Activity** — Shows last 5 transactions in Dashboard
- **🌓 Dark/Light Mode** — Premium theme toggle with persistent user preference synced to profile
- **📱 Responsive Design** — Desktop-first, fully responsive to tablets and mobile devices
- **Auto-SKU Generation** — Automatically generate unique SKU codes for new products
- **Category Management** — Create and manage product categories dynamically
- **Confirmation Dialogs** — Professional modal confirmations with undo toast support
- **Unsaved Changes Protection** — Warns before closing forms with unsaved data
- **Status Badges** — Visual indicators for stock status (In Stock, Low Stock, Out of Stock)
- **🖼️ Product Image Upload** — Upload and preview product images for products with Supabase Storage
- **📁 Bulk CSV Import** — Import multiple products at once via CSV upload

### ✅ Completed Reports & Analytics

- **📈 Interactive Charts** — Stock value breakdown, category distribution, inventory trends using Recharts
- **📋 Transaction History** — Paginated audit trail with multi-filter (type, product, date range, search) and transaction detail modals
- **📄 Export Reports** — PDF and CSV export functionality from Reports page
- **⌨️ Keyboard Shortcuts** — Power-user shortcuts (N, /, Esc)

### ✅ Phase 2 — Cloud Backend Integration

- **☁️ Supabase PostgreSQL** — Full cloud backend with real-time sync
- **🔐 Authentication** — Email/password and Google OAuth sign-in
- **⚡ Realtime Updates** — Live inventory updates across all open tabs
- **🖼️ Cloud Image Storage** — Product images stored in Supabase Storage
- **🔔 Realtime Subscriptions** — Products and transactions auto-update on remote changes

### ✅ Phase 3 — RBAC & Deleted Products Archive (Current)

- **🔒 Manager Permissions** — Managers can now perform Stock In/Out and edit products via fixed RLS policies
- **🗄️ Deleted Products Archive** — Soft-deleted products are stored in `deleted_products` table with full snapshot
- **📜 Transaction Preservation** — All stock transactions are archived as JSONB when a product is deleted
- **♻️ Restore Functionality** — Admins can restore deleted products along with their complete transaction history
- **🔍 Archived Transaction Viewer** — Admin-only page to search deleted products and view archived transactions in a modal
- **🚫 Immediate Cache Cleanup** — Deleted product transactions disappear instantly from all views
- **✅ Real-time Consistency** — Realtime subscriptions listen for all events (INSERT/UPDATE/DELETE) ensuring immediate UI updates

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with latest features and performance improvements |
| **Vite 8** | Lightning-fast build tool with HMR |
| **React Router v7** | Client-side routing and navigation |
| **Vanilla CSS + Tokens** | Custom design system with CSS variables for theming |
| **Lucide React** | Consistent, lightweight SVG icon library |

### Data & State

| Technology | Purpose |
|------------|---------|
| **Context API + useReducer** | Global state management across app and UI flows |
| **localStorage** | Preference persistence only (theme, default page, low stock threshold) |
| **Supabase** | Primary backend for products, transactions, categories, auth, and storage |

### Charts & Visualization

| Technology | Purpose |
|------------|---------|
| **Recharts** | Composable, React-native charting library |
| **jsPDF + jsPDF-AutoTable** | Professional PDF report generation |
| **PapaParse / Blob API** | CSV export and import functionality |

### Utilities

| Technology | Purpose |
|------------|---------|
| **Day.js** | Lightweight date formatting (2KB alternative to Moment.js) |
| **react-hot-toast** | Elegant toast notifications |
| **OXLint** | Fast JavaScript/React linter |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project (for cloud backend features)
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Inventory-Management-System

# Install dependencies
npm install

# Configure environment
# Create .env file with Supabase credentials:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the Phase 2 migration SQL in the Supabase SQL Editor
3. Run `docs/phase_3_fix_migration.sql` to enable manager permissions and deleted products archive
4. Update `.env` with your Supabase credentials

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── assets/                    # Static images, logos
├── components/
│   ├── common/                # Reusable UI atoms (Badge, Button, Input, Modal, SearchBar, ConfirmDialog)
│   ├── layout/                # App shell (Sidebar, Topbar, PageWrapper, AppLayout)
│   ├── products/              # Product components (ProductForm, ProductTable)
│   └── stock/                 # Stock transaction components (StockModal)
├── contexts/                  # React Context providers
│   ├── InventoryContext.jsx   # Global state provider with Realtime subscriptions
│   ├── inventoryReducer.js    # State management dispatch rules
│   └── ThemeContext.jsx       # Dark/light mode
├── hooks/                     # Custom React hooks
│   ├── useProducts.js         # Product CRUD wrapper with cache management
│   ├── useStock.js            # Stock adjustments wrapper with server re-fetch
│   ├── useFilters.js          # Search, filter, sort utilities
│   └── useKeyboardShortcuts.js # Global shortcuts hook
├── pages/
│   ├── Dashboard/             # KPI cards + Staggered entrance animations
│   ├── Products/              # Full CRUD page
│   ├── Transactions/          # Transaction history + query filters + delta modals
│   ├── Reports/               # KPI metrics + export cards + 4 Recharts SVGs
│   ├── Settings/              # Profile, preferences, security
│   └── DeletedProducts/       # Admin restore page for archived products
├── services/                  # Business logic layer
│   ├── productService.js      # Product CRUD operations
│   ├── stockService.js        # Stock transaction logic
│   ├── exportService.js       # Client-side PDF/CSV generation
│   ├── storageService.js      # localStorage version check & write abstractions
│   └── deletedProductService.js # Deleted product archive & restore RPC calls
├── utils/                     # Helper functions
│   ├── formatters.js          # Currency, date, stock status formatter
│   └── skuGenerator.js        # Auto-generate SKU codes
├── styles/                    # Global styles & design tokens
│   ├── tokens.css             # CSS Custom Properties (Design tokens)
│   ├── reset.css              # Baseline CSS resets
│   └── utilities.css          # Semantic background & color utilities
├── App.jsx                    # Root configuration + Router tree
├── main.jsx                   # React entry point
└── index.css                  # Global entry imports
```

---

## 🎨 Design System

### Color Palette (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366F1` (Indigo) | Buttons, links, active states |
| Accent | `#22D3EE` (Cyan) | Highlights, badges |
| Success | `#10B981` (Emerald) | In Stock, success messages |
| Warning | `#F59E0B` (Amber) | Low Stock alerts |
| Danger | `#EF4444` (Red) | Out of Stock, delete actions |
| Background | `#0F172A` (Slate 900) | App background |
| Surface | `#1E293B` (Slate 800) | Cards, panels |

### Stock Status Indicators

- 🟢 **In Stock** — Quantity > Reorder Level
- 🟡 **Low Stock** — 0 < Quantity ≤ Reorder Level  
- 🔴 **Out of Stock** — Quantity = 0

---

## 📊 Data Models

### Product Schema

```javascript
{
  id: "uuid-v4",
  sku: "SKU-2026-0001",
  name: "Product Name",
  description: "Product description",
  category: "Category Name",
  imageUrl: "base64 | url",
  unitPrice: 29.99,
  currentStock: 45,
  reorderLevel: 10,
  unit: "pcs",
  supplier: "Supplier Name",
  location: "Shelf A-3",
  isDeleted: false,
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

### Transaction Schema

```javascript
{
  id: "uuid-v4",
  productId: "uuid-v4",
  type: "STOCK_IN | STOCK_OUT",
  quantity: 20,
  reason: "Purchase Order #045",
  previousStock: 25,
  newStock: 45,
  performedBy: "Admin",
  createdAt: "ISO timestamp"
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New Product |
| `/` | Focus Search |
| `Esc` | Close Modal |

---

## 📖 Usage Guide

### Adding a New Product

1. Navigate to **Products** page
2. Click **"+ New Product"** button or press `N`
3. Fill in product details (name, SKU, category, price, reorder level)
4. Set initial stock quantity
5. Click **"Save Product"**

### Managing Stock

**Stock In (Receive Inventory)**
1. Find product in Products table
2. Click **"Stock In"** action
3. Enter quantity and reason (e.g., "Purchase Order #123")
4. Confirm transaction

**Stock Out (Remove Inventory)**
1. Find product in Products table
2. Click **"Stock Out"** action
3. Enter quantity and reason (e.g., "Sale", "Damaged")
4. Confirm transaction

### Generating Reports

1. Navigate to **Reports** page
2. View interactive charts and statistics
3. Click **"Export as PDF"** for professional report
4. Click **"Export as CSV"** for raw data export

---

## 🗺️ Roadmap

### Phase 1 — MVP ✅ Complete

Core product management, stock tracking, dashboard, search/filter, dark mode, responsive design, keyboard shortcuts, and confirmation dialogs.

### Phase 1B — Reports & Transactions ✅ Complete

Transaction history with multi-filter, detail modals with delta flow visualization, 4 interactive Recharts panels, PDF/CSV export engine, and activity feed.

### Phase 2 — Cloud Backend Integration ✅ Complete

- Supabase PostgreSQL database with Row Level Security (RLS)
- Email & Google OAuth authentication
- Multi-user role-based access control (admin, manager, viewer)
- Realtime subscriptions for products and transactions
- Supabase Storage for product image uploads
- Category service and settings persistence

### Phase 3 — RBAC Hardening & Deleted Products Archive ✅ Complete

- **Manager Role Permissions**: Fixed RLS policies to allow managers to perform Stock In/Out and product edits
- **Deleted Products Archive**: New `deleted_products` table preserving full product snapshot + transaction history as JSONB
- **Auto-Archive Trigger**: On soft-delete, transactions are automatically collected, archived, and removed from active ledger
- **Restore Functionality**: Admins can restore deleted products; all transactions are re-inserted into `stock_transactions`
- **Admin Restore UI**: `/deleted-products` page with searchable archive, transaction viewer modal, and restore confirmation
- **Immediate UI Consistency**: Transactions for deleted products disappear instantly across all views without page refresh
- **Immediate UI Feedback**: Stock In/Out triggers server re-fetch after optimistic update for transactional consistency

### Phase 4 — Production Readiness & Security 🔜 Planned

- Automated reorder alerts via Supabase Edge Functions (email/SMS)
- Immutable audit log table for compliance
- PostgreSQL performance tuning (indexes, connection pooling)
- Multi-Factor Authentication (MFA)
- Advanced security hardening

### Phase 5 — Advanced Automation & Integrations 🔜 Planned

- E-commerce integrations (Shopify, WooCommerce)
- Supplier & Purchase Order management
- PWA with barcode scanner support
- Multi-tenant SaaS architecture with Stripe billing
- AI demand forecasting

> **Note**: Multi-warehouse support UI is implemented but product-side warehouse assignment remains deferred.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React 19](https://react.dev) and [Vite 8](https://vitejs.dev)
- Charts powered by [Recharts](https://recharts.org)
- Icons by [Lucide](https://lucide.dev)
- Architecture designed by Senior Fullstack Developer

---

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**StockFlow IMS** — Simplifying inventory management for modern businesses.

# 📦 StockFlow IMS — Inventory Management System

> A modern, responsive inventory management system built for small-to-medium businesses and warehouse teams. Track products, monitor stock levels, manage transactions, and generate detailed reports with a premium dark-mode-first UI.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

### ✅ Implemented (Phase 1 Complete)

- **📝 Product Management** — Add, edit, and delete products with comprehensive details (SKU, name, category, price, description)
- **🔍 Smart Search & Filter** — Real-time search by name, SKU, or category with filtering and sorting
- **📦 Stock Operations** — Track stock in/out transactions with reason logging and validation
- **📊 Analytics Dashboard** — KPI cards showing total products, stock value, low stock alerts, and transactions
- **⚠️ Low Stock Alerts** — Visual alerts for products below reorder level threshold in Dashboard
- **📋 Recent Activity** — Shows last 5 transactions in Dashboard
- **🌓 Dark/Light Mode** — Premium theme toggle with persistent user preference
- **📱 Responsive Design** — Desktop-first, fully responsive to tablets and mobile devices
- **Auto-SKU Generation** — Automatically generate unique SKU codes for new products
- **Category Management** — Create and manage product categories dynamically
- **Confirmation Dialogs** — Professional modal confirmations for actions
- **Unsaved Changes Protection** — Warns before closing forms with unsaved data
- **Status Badges** — Visual indicators for stock status (In Stock, Low Stock, Out of Stock)

### ⏳ Coming Soon (Phase 1B)

- **📈 Interactive Charts** — Stock value breakdown, category distribution using Recharts
- **📋 Transaction History** — Complete audit trail page with filters
- **📄 Export Reports** — PDF and CSV export functionality
- **⌨️ Keyboard Shortcuts** — Power-user shortcuts (N, /, Esc)
- **Bulk CSV Import** — Import multiple products at once via CSV

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
| **Context API + useReducer** | Global state management (Phase 1) |
| **localStorage** | Client-side data persistence (Phase 1) |
| **Supabase** | Backend-as-a-Service with PostgreSQL (Phase 2) |

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
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Inventory-Management-System

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

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
│   ├── common/                # Reusable UI components (Button, Input, Modal, Badge, Table)
│   ├── layout/                # App shell (Sidebar, Topbar, PageWrapper)
│   ├── products/              # Product-specific components (ProductCard, ProductTable, ProductForm)
│   ├── stock/                 # Stock transaction components (StockInModal, StockOutModal)
│   └── reports/               # Charts & reporting (KPICard, Charts, LowStockAlert)
├── contexts/                  # React Context providers
│   ├── InventoryContext.jsx   # Products & transactions state
│   └── ThemeContext.jsx       # Dark/light mode
├── hooks/                     # Custom React hooks
├── pages/                     # Route pages (Dashboard, Products, StockMovements, Reports)
├── services/                  # Business logic layer
│   ├── productService.js      # Product CRUD operations
│   ├── stockService.js        # Stock transactions
│   ├── storageService.js      # localStorage abstraction
│   ├── reportService.js       # Statistics & aggregations
│   └── exportService.js       # PDF & CSV generation
├── utils/                     # Helper functions
├── styles/                    # Global styles & design tokens
│   ├── tokens.css             # CSS Custom Properties
│   ├── reset.css              # CSS reset
│   └── utilities.css          # Utility classes
└── App.jsx                    # Root component
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

### Phase 1 — MVP

#### ✅ Core Features (Complete)
- Project setup with React 19 + Vite
- Product CRUD operations
- Stock In/Out transaction management
- Dashboard with KPI cards
- Search, filter, and sort functionality
- Dark/Light mode toggle
- Mobile responsive design
- Category management system
- Confirmation dialogs
- Unsaved changes protection
- Status badges and indicators

#### ⏳ Reports & Analytics (Pending)
- Transaction History page
- Reports & Analytics page
- Interactive Charts (Recharts)
- PDF Export
- CSV Export
- Keyboard Shortcuts

### Phase 2 — Backend Integration (Future)

- Supabase PostgreSQL database
- User authentication
- Multi-user support
- Real-time stock updates
- Cloud image storage
- Advanced analytics
- Barcode scanning support

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

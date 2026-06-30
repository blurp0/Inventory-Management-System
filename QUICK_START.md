# 🚀 Quick Start Guide - StockFlow IMS

> **Status:** ✅ Phase 1 Complete - Production Ready  
> **Last Updated:** January 20, 2025

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview, features, installation |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Detailed technical architecture |
| [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) | Phase 1 completion report |

---

## 🏗️ Project Structure (Simplified)

```
src/
├── components/       # 22 UI components
│   ├── common/      # Reusable components (Button, Modal, Input, etc.)
│   ├── layout/      # App shell (Sidebar, Topbar, PageWrapper)
│   ├── products/    # Product-specific (ProductForm, ProductTable)
│   └── stock/       # Stock transactions (StockModal)
├── contexts/        # Global state (Inventory, Theme)
├── hooks/           # Custom hooks (useProducts, useStock, useFilters)
├── pages/           # Route pages (Dashboard, Products, Reports, Transactions)
├── services/        # Business logic (product, stock, storage)
├── utils/           # Utilities (formatters, SKU generator)
└── styles/          # CSS tokens, reset, utilities
```

---

## 🎯 Key Features

### Core Functionality
- ✅ **Product Management** - Add, edit, delete products
- ✅ **Stock Operations** - Stock in/out with transaction logging
- ✅ **Search & Filter** - Real-time search, category/status filters
- ✅ **Dashboard** - KPI cards, charts, low stock alerts
- ✅ **Reports** - PDF & CSV export
- ✅ **Theme Toggle** - Dark/light mode with persistence

### Advanced Features
- ✅ **Auto SKU Generation** - Unique product codes
- ✅ **Category Management** - Dynamic category creation
- ✅ **Confirmation Dialogs** - Professional modals (no browser prompts)
- ✅ **Unsaved Changes Protection** - Warns before closing forms
- ✅ **Soft Delete** - Undo delete within 5 seconds
- ✅ **Toast Notifications** - Success/error messages
- ✅ **Responsive Design** - Works on all devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool |
| React Router 7 | Routing |
| Recharts | Charts |
| jsPDF | PDF export |
| Lucide React | Icons |
| react-hot-toast | Notifications |
| localStorage | Data persistence |

---

## 📊 Application Routes

```
/                    → Redirects to /dashboard
/dashboard           → KPI cards, charts, analytics
/products            → Product list, CRUD operations
/transactions        → Transaction history, audit trail
/reports             → Charts, export functionality
```

---

## 💾 Data Storage

### localStorage Keys
- `stockflow_v1` - Main application state
- `stockflow_theme` - Theme preference (dark/light)

### Data Structure
```javascript
{
  version: 1,
  products: [...],
  transactions: [...],
  categories: [...]
}
```

---

## 🎨 Design Tokens

### Colors (Dark Mode)
```css
Primary:    #6366F1 (Indigo)
Success:    #10B981 (Emerald)
Warning:    #F59E0B (Amber)
Danger:     #EF4444 (Red)
Background: #0F172A (Slate 900)
Surface:    #1E293B (Slate 800)
Text:       #F1F5F9 (Slate 100)
```

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

---

## 🔧 Development Tips

### Adding a New Component
1. Create folder in `src/components/[category]/[ComponentName]/`
2. Add `ComponentName.jsx` and `ComponentName.css`
3. Export from `src/components/[category]/index.js` (if applicable)

### Adding a New Page
1. Create folder in `src/pages/[PageName]/`
2. Add `PageNamePage.jsx` and styles
3. Add route in `src/App.jsx`

### Adding a Reducer Action
1. Add action type to `src/contexts/inventoryReducer.js`
2. Implement reducer logic
3. Use in component with `dispatch({ type: 'ACTION_NAME', payload: data })`

### Using Custom Hooks
```javascript
// Product operations
const { addProduct, updateProduct, deleteProduct } = useProducts();

// Stock operations
const { stockIn, stockOut } = useStock();

// Filters
const { filters, setSearch, setCategoryFilter, setStatusFilter } = useFilters();
```

---

## 🐛 Troubleshooting

### Data not persisting
- Check browser console for localStorage errors
- Ensure localStorage is enabled
- Check localStorage quota (usually 5-10MB)

### Theme not changing
- Clear localStorage and refresh
- Check ThemeContext provider in App.jsx

### Charts not displaying
- Verify Recharts is installed
- Check data structure matches chart props
- Look for console errors

### Modal not closing
- Check if preventClose prop is set correctly
- Verify onClose function is passed
- Check for keyboard event listeners

---

## 📈 Performance

### Current Metrics
- **Initial Load:** < 2s
- **Search Debounce:** 300ms
- **Smooth 60fps** animations
- **Bundle Size:** ~500KB (gzipped)

### Optimization Tips
- Use React DevTools Profiler
- Implement React.memo for expensive components
- Add virtual scrolling for large lists (Phase 2)
- Consider code splitting for routes (Phase 2)

---

## 🔒 Security Notes

### Phase 1 Limitations
- No user authentication (single-user system)
- Data stored in browser localStorage (client-side only)
- No server-side validation
- No SQL injection protection needed (no SQL)

### Phase 2 Security (Planned)
- Supabase authentication
- Row-level security (RLS)
- Server-side validation
- Input sanitization
- HTTPS enforced

---

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Output: dist/
```

### Deploy Options
- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop `dist/` folder
- **GitHub Pages** - Use `gh-pages` package
- **Any static host** - Upload `dist/` folder

---

## 📞 Getting Help

### Resources
1. **Documentation** - Read README and SYSTEM_ARCHITECTURE
2. **Code Comments** - Check component JSDoc comments
3. **Console** - Browser DevTools for errors
4. **React DevTools** - Component hierarchy and state

### Common Questions

**Q: How do I reset all data?**  
A: Open DevTools → Application → Local Storage → Delete `stockflow_v1`

**Q: Can I use this in production?**  
A: Yes! Phase 1 is production-ready for single-user use.

**Q: How do I add authentication?**  
A: Wait for Phase 2 with Supabase integration.

**Q: Can I deploy this?**  
A: Yes! Build and deploy to any static hosting.

---

## 🎓 Learning Resources

### React
- [React Official Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)

### Recharts
- [Recharts Documentation](https://recharts.org)

### CSS
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)

### localStorage
- [MDN Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## ✅ Phase 1 Checklist

- [x] Project setup
- [x] Component architecture
- [x] State management
- [x] CRUD operations
- [x] Search & filter
- [x] Dashboard & charts
- [x] Transaction history
- [x] PDF & CSV export
- [x] Theme toggle
- [x] Responsive design
- [x] Toast notifications
- [x] Confirmation dialogs
- [x] Category management
- [x] Unsaved changes protection
- [x] Code cleanup
- [x] Documentation

**🎉 Phase 1 Complete!**

---

*StockFlow IMS - Built with ❤️ using React 19 + Vite*

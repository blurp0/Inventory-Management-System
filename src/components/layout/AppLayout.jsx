import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar/Sidebar';
import Topbar from './Topbar/Topbar';
import { useInventory } from '../../contexts/InventoryContext';
import './AppLayout.css';

export default function AppLayout() {
  const { state } = useInventory();
  const isCollapsed = !state.ui.sidebarOpen;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className={`app-layout__main${isCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar />

        <main className="app-layout__content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
          },
          success: {
            iconTheme: { primary: 'var(--color-success)', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}

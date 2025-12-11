import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
    { to: '/orders', label: 'Orders', icon: Receipt },
    // Only show user management for admins (super admins)
    ...(user?.role === 'admin'
      ? [{ to: '/users', label: 'Users', icon: UsersIcon }]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-semibold tracking-tight">
            Product Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="text-sm font-medium text-muted-foreground">
            {user?.role === 'admin' ? 'Admin' : 'User'} panel
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase">
                {user?.name?.[0] ?? '?'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 bg-background px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



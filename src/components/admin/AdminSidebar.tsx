import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  ShoppingCart, 
  Package, 
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AdminSidebarProps {
  onSignOut: () => void;
}

const navItems = [
  { 
    title: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    end: true 
  },
  { 
    title: 'User Management', 
    href: '/admin/users', 
    icon: Users 
  },
  { 
    title: 'Deposit Requests', 
    href: '/admin/deposits', 
    icon: Wallet 
  },
  { 
    title: 'Order Management', 
    href: '/admin/orders', 
    icon: ShoppingCart 
  },
  { 
    title: 'Products', 
    href: '/admin/products', 
    icon: Package 
  },
];

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-card border-r h-screen sticky top-0 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-muted",
                isActive && "bg-primary/10 text-primary font-medium",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}

import { useEffect, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from './AdminSidebar';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { user, isAdmin, loading, adminLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const hasVerifiedOnce = useRef(false);

  useEffect(() => {
    // Only redirect if we've finished loading and user is not admin
    if (!loading && !adminLoading) {
      if (!user || !isAdmin) {
        navigate('/admin/login');
      } else {
        // Mark that we've successfully verified admin access
        hasVerifiedOnce.current = true;
      }
    }
  }, [user, isAdmin, loading, adminLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // If we've already verified once and still have a user, don't show loading
  // This prevents the loading spinner on tab switches
  const shouldShowLoading = (loading || adminLoading) && !hasVerifiedOnce.current;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Checking admin access...</p>
      </div>
    );
  }

  // If still loading but we've verified before, show the content
  // The auth check will happen in the background
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <AdminSidebar onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

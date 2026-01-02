import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, ShoppingCart, Package, TrendingUp, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  pendingDeposits: number;
  totalOrders: number;
  totalBalance: number;
  recentDeposits: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: productsCount },
        { data: pendingDepositsData },
        { count: ordersCount },
        { data: walletsData },
        { data: recentDepositsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('deposits').select('id').eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('wallets').select('balance'),
        supabase.from('deposits').select('id').eq('status', 'approved').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalBalance = walletsData?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        pendingDeposits: pendingDepositsData?.length || 0,
        totalOrders: ordersCount || 0,
        totalBalance,
        recentDeposits: recentDepositsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Users</CardDescription>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">{stats?.totalUsers}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Products</CardDescription>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">{stats?.totalProducts}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Digital products</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending Deposits</CardDescription>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl text-yellow-600">{stats?.pendingDeposits}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Orders</CardDescription>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">{stats?.totalOrders}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Completed purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Wallet Balance</CardDescription>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl">৳{stats?.totalBalance?.toLocaleString()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Recent Deposits</CardDescription>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl text-green-600">{stats?.recentDeposits}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Last 7 days (approved)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShoppingCart, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LinkifyText } from '@/components/RichDescription';

interface OrderWithUser {
  id: string;
  user_id: string;
  product_id: string | null;
  product_title: string;
  amount: number;
  status: string;
  created_at: string;
  customer_instructions?: string | null;
  username?: string;
  email?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Sort to show pending orders first
      const sortedOrders = ordersData.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Get unique user IDs
      const userIds = [...new Set(sortedOrders.map(o => o.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enrichedOrders = sortedOrders.map(order => ({
        ...order,
        username: profileMap.get(order.user_id)?.username,
        email: profileMap.get(order.user_id)?.email
      }));

      setOrders(enrichedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_order', { p_order_id: orderId });
      
      if (error) throw error;
      
      if (data) {
        toast.success('Order approved successfully');
        fetchOrders();
      } else {
        toast.error('Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      order.product_title.toLowerCase().includes(query) ||
      order.username?.toLowerCase().includes(query) ||
      order.email?.toLowerCase().includes(query)
    );
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? order.status === 'pending' :
      statusFilter === 'completed' ? order.status === 'completed' : true;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">View all customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  All Orders
                </CardTitle>
                <CardDescription>
                  {orders.length} total orders
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'pending' | 'completed')}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="ml-1">{orders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  <Badge variant="outline" className="ml-1 text-yellow-600 border-yellow-600">{pendingCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  Completed
                  <Badge className="ml-1 bg-green-600">{completedCount}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No orders found matching your search' : 
                 statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer Instructions</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className={order.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        <span className="block text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('bn-BD')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">@{order.username || 'Unknown'}</span>
                          {order.email && (
                            <span className="block text-xs text-muted-foreground">{order.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {order.product_title}
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        {order.customer_instructions ? (
                          <div className="text-sm bg-muted/50 p-2 rounded-md">
                            <LinkifyText 
                              text={order.customer_instructions} 
                              className="break-all"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">No instructions</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">৳{order.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveOrder(order.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

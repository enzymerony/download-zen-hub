import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package, Download, ShoppingBag, Loader2, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Order {
  id: string;
  product_id: string | null;
  product_title: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ProductFile {
  file_url: string | null;
  external_link: string | null;
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productFiles, setProductFiles] = useState<Map<string, ProductFile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
        
        // Fetch product files for completed orders
        const completedOrders = (data || []).filter(o => o.status === 'completed' && o.product_id);
        if (completedOrders.length > 0) {
          const productIds = completedOrders.map(o => o.product_id).filter(Boolean) as string[];
          const { data: products } = await supabase
            .from('products')
            .select('id, file_url, external_link')
            .in('id', productIds);
          
          if (products) {
            const fileMap = new Map<string, ProductFile>();
            products.forEach(p => {
              fileMap.set(p.id, { file_url: p.file_url, external_link: p.external_link });
            });
            setProductFiles(fileMap);
          }
        }
      }
      setLoading(false);
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleDownload = (order: Order) => {
    if (!order.product_id) {
      toast.error('Product not found');
      return;
    }

    const files = productFiles.get(order.product_id);
    if (!files) {
      toast.error('Download not available');
      return;
    }

    if (files.external_link) {
      window.open(files.external_link, '_blank');
    } else if (files.file_url) {
      window.open(files.file_url, '_blank');
    } else {
      toast.error('No download available for this product');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">সম্পন্ন</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">পেন্ডিং</Badge>;
      case "cancelled":
        return <Badge variant="destructive">বাতিল</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        হোমে ফিরুন
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <ShoppingBag className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">আমার অর্ডার সমূহ</h1>
          <p className="text-muted-foreground">আপনার সকল ক্রয়ের ইতিহাস</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোনো অর্ডার নেই</h3>
            <p className="text-muted-foreground text-center mb-4">
              আপনি এখনো কোনো প্রোডাক্ট কেনেননি
            </p>
            <Button asChild>
              <Link to="/products">প্রোডাক্ট দেখুন</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className={`hover:shadow-md transition-shadow ${order.status === 'pending' ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.product_title}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>অর্ডার আইডি: {order.id.slice(0, 8)}...</p>
                      <p>তারিখ: {format(new Date(order.created_at), "dd/MM/yyyy hh:mm a")}</p>
                    </div>
                    {order.status === 'pending' && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>এডমিন অনুমোদনের অপেক্ষায়</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">৳{order.amount}</p>
                    </div>
                    
                    {order.status === "completed" && order.product_id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleDownload(order)}
                      >
                        {productFiles.get(order.product_id)?.external_link ? (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            লিংক খুলুন
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            ডাউনলোড
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

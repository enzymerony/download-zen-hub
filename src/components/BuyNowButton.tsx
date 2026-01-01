import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

interface BuyNowButtonProps {
  productId: string;
  productTitle: string;
  price: number;
  className?: string;
}

export function BuyNowButton({ productId, productTitle, price, className }: BuyNowButtonProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { balance, purchaseWithBalance, loading: walletLoading } = useWallet();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBuyNow = () => {
    if (!user) {
      toast.error("অনুগ্রহ করে প্রথমে লগইন করুন");
      navigate("/admin/login");
      return;
    }

    if (balance < price) {
      // Not enough balance - show dialog
      setDialogOpen(true);
    } else {
      // Enough balance - proceed with purchase
      processPurchase();
    }
  };

  const processPurchase = async () => {
    setProcessing(true);
    try {
      const success = await purchaseWithBalance(productId, productTitle, price);
      if (success) {
        toast.success(`🎉 সফলভাবে ${productTitle} ক্রয় করা হয়েছে!`);
        setDialogOpen(false);
      } else {
        toast.error("ব্যালেন্স কম আছে, অনুগ্রহ করে Top-up করুন");
        setDialogOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || "ক্রয় করতে সমস্যা হয়েছে");
    } finally {
      setProcessing(false);
    }
  };

  const goToTopUp = () => {
    setDialogOpen(false);
    navigate("/topup");
  };

  if (authLoading || walletLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={handleBuyNow} 
        disabled={processing}
        className={className}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now - ৳{price}
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-destructive" />
              ব্যালেন্স কম আছে
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p><strong>{productTitle}</strong> কিনতে ৳{price} প্রয়োজন।</p>
              <p>আপনার বর্তমান ব্যালেন্স: <strong className="text-primary">৳{balance.toFixed(2)}</strong></p>
              <p>আরও প্রয়োজন: <strong className="text-destructive">৳{(price - balance).toFixed(2)}</strong></p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={goToTopUp}>
              <Wallet className="h-4 w-4 mr-2" />
              Top-up করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

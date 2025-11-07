import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OrderTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderTrackDialog = ({ open, onOpenChange }: OrderTrackDialogProps) => {
  const [orderId, setOrderId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  const handleTrack = () => {
    // Track order logic here
    console.log("Tracking order:", orderId, billingEmail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Order Track</DialogTitle>
          <DialogDescription className="text-center pt-4 text-base">
            To track your order please enter your Order ID in the box below and press
            the "Track" button. This was given to you on your receipt and in the
            confirmation email you should have received.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="orderId" className="text-sm font-medium">
              Order ID
            </Label>
            <Input
              id="orderId"
              placeholder="Found in your order confirmation email"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="billingEmail" className="text-sm font-medium">
              Billing email
            </Label>
            <Input
              id="billingEmail"
              type="email"
              placeholder="Email you used during checkout."
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <Button 
            onClick={handleTrack} 
            className="w-full h-12 bg-[hsl(30,100%,50%)] hover:bg-[hsl(30,100%,45%)] text-white font-semibold text-base"
          >
            Track
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";

export function WalletBadge() {
  const { user } = useAuth();
  const { balance, loading } = useWallet();

  if (!user) {
    return null;
  }

  return (
    <Link to="/topup">
      <Button variant="outline" size="sm" className="gap-2">
        <Wallet className="h-4 w-4" />
        <span className="font-semibold">৳{loading ? '...' : balance.toFixed(0)}</span>
      </Button>
    </Link>
  );
}

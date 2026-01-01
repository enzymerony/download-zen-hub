import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Wallet, Phone, CreditCard, AlertCircle, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

const TopUp = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { balance, deposits, loading: walletLoading, createDeposit } = useWallet();
  
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");
  const [amount, setAmount] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to access your wallet</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/admin/login">
              <Button>Login Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading || walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("অনুগ্রহ করে সঠিক পরিমাণ লিখুন");
      return;
    }
    
    if (!senderNumber.trim()) {
      toast.error("অনুগ্রহ করে আপনার নম্বর লিখুন");
      return;
    }
    
    if (!transactionId.trim()) {
      toast.error("অনুগ্রহ করে Transaction ID লিখুন");
      return;
    }

    setSubmitting(true);
    try {
      await createDeposit(amountNum, paymentMethod, senderNumber, transactionId);
      toast.success("আপনার Top-up রিকোয়েস্ট সফলভাবে জমা হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।");
      setAmount("");
      setSenderNumber("");
      setTransactionId("");
    } catch (error: any) {
      toast.error(error.message || "একটি সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">আপনার বর্তমান ব্যালেন্স</p>
                  <p className="text-3xl font-bold text-primary">৳{balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                পেমেন্ট তথ্য
              </CardTitle>
              <CardDescription>
                নিচের নম্বরগুলোতে Send Money করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-pink-500/50 bg-pink-50 dark:bg-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold">
                    বি
                  </div>
                  <div>
                    <p className="font-semibold text-pink-700 dark:text-pink-400">bKash (Personal)</p>
                    <p className="text-lg font-bold">01733117419</p>
                  </div>
                </div>
              </Alert>

              <Alert className="border-purple-500/50 bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-400">Rocket (Personal)</p>
                    <p className="text-lg font-bold">01571383784</p>
                  </div>
                </div>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>গুরুত্বপূর্ণ:</strong> Send Money করার পর নিচের ফর্মে Transaction ID সহ সব তথ্য জমা দিন। আমরা ভেরিফাই করে আপনার ব্যালেন্স আপডেট করব।
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Top-up Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Top-up Request
              </CardTitle>
              <CardDescription>
                পেমেন্ট করার পর এই ফর্মটি পূরণ করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>পেমেন্ট মেথড</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label htmlFor="bkash" className="cursor-pointer">bKash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rocket" id="rocket" />
                      <Label htmlFor="rocket" className="cursor-pointer">Rocket</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">পরিমাণ (টাকা)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="যেমন: 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderNumber">যে নম্বর থেকে পাঠিয়েছেন</Label>
                  <Input
                    id="senderNumber"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID (TrxID)</Label>
                  <Input
                    id="transactionId"
                    placeholder="যেমন: 9KD7F8H2JK"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      জমা হচ্ছে...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Deposit History */}
        {deposits.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>আপনার Top-up হিস্টোরি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">৳{deposit.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {deposit.payment_method.toUpperCase()} • TrxID: {deposit.transaction_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(deposit.status)}
                      {deposit.admin_notes && deposit.status === 'rejected' && (
                        <p className="text-xs text-destructive mt-1">{deposit.admin_notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopUp;

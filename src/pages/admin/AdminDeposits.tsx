import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminDeposits } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wallet, Clock, CheckCircle, XCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface DepositWithUser {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  username?: string;
  email?: string;
}

export default function AdminDeposits() {
  const { deposits, loading, approveDeposit, rejectDeposit, refetch } = useAdminDeposits();
  const [depositsWithUsers, setDepositsWithUsers] = useState<DepositWithUser[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (deposits.length > 0) {
      fetchUserDetails();
    } else {
      setDepositsWithUsers([]);
    }
  }, [deposits]);

  const fetchUserDetails = async () => {
    const userIds = [...new Set(deposits.map(d => d.user_id))];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, email')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const enrichedDeposits = deposits.map(deposit => ({
      ...deposit,
      username: profileMap.get(deposit.user_id)?.username,
      email: profileMap.get(deposit.user_id)?.email
    }));

    setDepositsWithUsers(enrichedDeposits as DepositWithUser[]);
  };

  const handleApprove = async (depositId: string) => {
    setProcessingId(depositId);
    try {
      await approveDeposit(depositId);
      toast.success('Deposit approved! Balance updated.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (depositId: string) => {
    setProcessingId(depositId);
    try {
      await rejectDeposit(depositId, 'Rejected by admin');
      toast.success('Deposit rejected');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingDeposits = depositsWithUsers.filter(d => d.status === 'pending');
  const approvedDeposits = depositsWithUsers.filter(d => d.status === 'approved');
  const rejectedDeposits = depositsWithUsers.filter(d => d.status === 'rejected');

  const renderTable = (depositsList: DepositWithUser[], showActions = false) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>TrxID</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {depositsList.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>
                {new Date(deposit.created_at).toLocaleDateString('bn-BD')}
                <span className="block text-xs text-muted-foreground">
                  {new Date(deposit.created_at).toLocaleTimeString('bn-BD')}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">@{deposit.username || 'Unknown'}</span>
                  {deposit.email && (
                    <span className="block text-xs text-muted-foreground">{deposit.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold">৳{deposit.amount.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase">
                  {deposit.payment_method}
                </Badge>
              </TableCell>
              <TableCell>{deposit.sender_number}</TableCell>
              <TableCell className="font-mono text-sm">{deposit.transaction_id}</TableCell>
              <TableCell>
                {deposit.status === 'pending' && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {deposit.status === 'approved' && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                )}
                {deposit.status === 'rejected' && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                )}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  {deposit.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(deposit.id)}
                        disabled={processingId === deposit.id}
                      >
                        {processingId === deposit.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(deposit.id)}
                        disabled={processingId === deposit.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Deposit Requests</h1>
        <p className="text-muted-foreground">Manage customer top-up requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            All Deposits
            {pendingDeposits.length > 0 && (
              <Badge variant="destructive">{pendingDeposits.length} pending</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve deposit requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : depositsWithUsers.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No deposit requests yet</p>
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                  {pendingDeposits.length > 0 && (
                    <Badge variant="secondary">{pendingDeposits.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved ({approvedDeposits.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected ({rejectedDeposits.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending deposits
                  </div>
                ) : (
                  renderTable(pendingDeposits, true)
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No approved deposits
                  </div>
                ) : (
                  renderTable(approvedDeposits, false)
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rejected deposits
                  </div>
                ) : (
                  renderTable(rejectedDeposits, false)
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

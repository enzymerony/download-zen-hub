import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet:', error);
    } else {
      setWallet(data);
    }
    setLoading(false);
  };

  const fetchDeposits = async () => {
    if (!user) {
      setDeposits([]);
      return;
    }

    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deposits:', error);
    } else {
      setDeposits(data as Deposit[] || []);
    }
  };

  const createDeposit = async (
    amount: number,
    paymentMethod: string,
    senderNumber: string,
    transactionId: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deposits')
      .insert({
        user_id: user.id,
        amount,
        payment_method: paymentMethod,
        sender_number: senderNumber,
        transaction_id: transactionId,
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchDeposits();
    return data;
  };

  const purchaseWithBalance = async (productId: string, productTitle: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('deduct_balance', {
      p_user_id: user.id,
      p_amount: amount,
      p_product_id: productId,
      p_product_title: productTitle,
    });

    if (error) throw error;
    
    if (data === true) {
      await fetchWallet();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchWallet();
    fetchDeposits();
  }, [user]);

  return {
    wallet,
    balance: wallet?.balance || 0,
    deposits,
    loading,
    createDeposit,
    purchaseWithBalance,
    refetch: () => {
      fetchWallet();
      fetchDeposits();
    },
  };
}

// Admin hook to manage all deposits
export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllDeposits = async () => {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deposits:', error);
    } else {
      setDeposits(data as Deposit[] || []);
    }
    setLoading(false);
  };

  const approveDeposit = async (depositId: string) => {
    const { data, error } = await supabase.rpc('approve_deposit', {
      deposit_id: depositId,
    });

    if (error) throw error;
    
    await fetchAllDeposits();
    return data;
  };

  const rejectDeposit = async (depositId: string, notes?: string) => {
    const { error } = await supabase
      .from('deposits')
      .update({ 
        status: 'rejected', 
        admin_notes: notes || 'Rejected by admin' 
      })
      .eq('id', depositId);

    if (error) throw error;
    
    await fetchAllDeposits();
  };

  useEffect(() => {
    fetchAllDeposits();
  }, []);

  return {
    deposits,
    loading,
    approveDeposit,
    rejectDeposit,
    refetch: fetchAllDeposits,
  };
}

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

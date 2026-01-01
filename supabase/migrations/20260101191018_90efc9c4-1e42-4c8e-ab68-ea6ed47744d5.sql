
-- Create wallet balance table for users
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own wallet (for first-time creation)
CREATE POLICY "Users can create their own wallet"
ON public.wallets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can update wallets (for balance changes)
CREATE POLICY "Admins can update wallets"
ON public.wallets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create deposits table for top-up requests
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- 'bkash' or 'rocket'
  sender_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view their own deposits"
ON public.deposits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create deposit requests
CREATE POLICY "Users can create deposits"
ON public.deposits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all deposits
CREATE POLICY "Admins can view all deposits"
ON public.deposits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update deposits (approve/reject)
CREATE POLICY "Admins can update deposits"
ON public.deposits
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table for purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
BEFORE UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to approve deposit and add balance (security definer)
CREATE OR REPLACE FUNCTION public.approve_deposit(deposit_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deposit_record RECORD;
BEGIN
  -- Get the deposit
  SELECT * INTO deposit_record FROM deposits WHERE id = deposit_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update deposit status
  UPDATE deposits SET status = 'approved', updated_at = now() WHERE id = deposit_id;
  
  -- Update or create wallet balance
  INSERT INTO wallets (user_id, balance)
  VALUES (deposit_record.user_id, deposit_record.amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = wallets.balance + deposit_record.amount, updated_at = now();
  
  RETURN TRUE;
END;
$$;

-- Function to deduct balance for purchase (security definer)
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id UUID, p_amount NUMERIC, p_product_id UUID, p_product_title TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance FROM wallets WHERE user_id = p_user_id;
  
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct balance
  UPDATE wallets SET balance = balance - p_amount, updated_at = now() WHERE user_id = p_user_id;
  
  -- Create order record
  INSERT INTO orders (user_id, product_id, product_title, amount)
  VALUES (p_user_id, p_product_id, p_product_title, p_amount);
  
  RETURN TRUE;
END;
$$;

-- Add file_url and external_link columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS external_link text;

-- Update the deduct_balance function to set order status to 'pending' instead of 'completed'
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id uuid, p_amount numeric, p_product_id uuid, p_product_title text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Create order record with 'pending' status
  INSERT INTO orders (user_id, product_id, product_title, amount, status)
  VALUES (p_user_id, p_product_id, p_product_title, p_amount, 'pending');
  
  RETURN TRUE;
END;
$function$;

-- Create approve_order function for admins
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if order exists and is pending
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND status = 'pending') THEN
    RETURN FALSE;
  END IF;
  
  -- Update order status to completed
  UPDATE orders SET status = 'completed' WHERE id = p_order_id;
  
  RETURN TRUE;
END;
$function$;

-- Add RLS policy for admins to update orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' 
    AND policyname = 'Admins can update orders'
  ) THEN
    CREATE POLICY "Admins can update orders" 
    ON public.orders 
    FOR UPDATE 
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;
-- Update the deduct_balance function to accept customer instructions
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id uuid, 
  p_amount numeric, 
  p_product_id uuid, 
  p_product_title text,
  p_customer_instructions text DEFAULT NULL
)
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
  
  -- Create order record with 'pending' status and customer instructions
  INSERT INTO orders (user_id, product_id, product_title, amount, status, customer_instructions)
  VALUES (p_user_id, p_product_id, p_product_title, p_amount, 'pending', p_customer_instructions);
  
  RETURN TRUE;
END;
$function$;
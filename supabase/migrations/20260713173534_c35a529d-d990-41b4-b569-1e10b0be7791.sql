
-- 1. Add admin authorization to approve_deposit
CREATE OR REPLACE FUNCTION public.approve_deposit(deposit_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deposit_record RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  SELECT * INTO deposit_record FROM deposits WHERE id = deposit_id AND status = 'pending';
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE deposits SET status = 'approved', updated_at = now() WHERE id = deposit_id;

  INSERT INTO wallets (user_id, balance)
  VALUES (deposit_record.user_id, deposit_record.amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = wallets.balance + deposit_record.amount, updated_at = now();

  RETURN TRUE;
END;
$$;

-- Also protect approve_order (admin-only)
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND status = 'pending') THEN
    RETURN FALSE;
  END IF;

  UPDATE orders SET status = 'completed' WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;

-- 2. Restrict EXECUTE on SECURITY DEFINER functions
-- Revoke default PUBLIC execute on all SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.approve_deposit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_order(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_id_by_username(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Grant only where the app legitimately calls these RPCs
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_deposit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_order(uuid) TO authenticated;

-- service_role retains full access
GRANT EXECUTE ON FUNCTION public.approve_deposit(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_username(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 3. Storage: remove broad SELECT that allows listing the public bucket.
-- Public URLs continue to work; only listing/enumeration is blocked.
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;

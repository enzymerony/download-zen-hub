-- Fix products RLS policy to be PERMISSIVE for public read
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;

-- Create PERMISSIVE policy for public read access
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
TO public
USING (true);

-- Fix user_roles policies - make SELECT policies PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create PERMISSIVE policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create PERMISSIVE policy for admins to view all roles  
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
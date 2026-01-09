-- Add customer_instructions column to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_instructions text;
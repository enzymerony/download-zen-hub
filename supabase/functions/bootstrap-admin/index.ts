import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed admin email - only this email can be bootstrapped as admin
const ALLOWED_ADMIN_EMAIL = 'enzymerony@gmail.com';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Bootstrap admin: No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's JWT to get authenticated user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Bootstrap admin: Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Bootstrap admin: Request from authenticated user: ${authUser.email}`);

    // SECURITY: User can only request admin role for themselves
    // And only if their email matches the allowed admin email
    if (authUser.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      console.error(`Bootstrap admin: Unauthorized user attempt: ${authUser.email}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Only designated admin email can request admin role.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleCheckError) {
      console.error('Bootstrap admin: Error checking existing role:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingRole) {
      console.log(`Bootstrap admin: User ${authUser.email} already has admin role`);
      return new Response(
        JSON.stringify({ message: 'User already has admin role', success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: authUser.id, role: 'admin' });

    if (insertError) {
      console.error('Bootstrap admin: Error inserting admin role:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign admin role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Bootstrap admin: Successfully assigned admin role to ${authUser.email}`);
    return new Response(
      JSON.stringify({ message: 'Admin role assigned successfully', success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bootstrap admin: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
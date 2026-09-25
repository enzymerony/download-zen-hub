import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EMAIL = 'ejobs.xyz@gmail.com';
const PASSWORD = '@Rony85698569#';

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let userId: string | undefined;
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === EMAIL);
  if (existing) {
    const { error } = await sb.auth.admin.updateUserById(existing.id, { password: PASSWORD, email_confirm: true });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = existing.id;
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL, password: PASSWORD, email_confirm: true,
      user_metadata: { username: 'ejobs_admin' },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = data.user?.id;
  }
  const { error: roleErr } = await sb.from('user_roles').upsert(
    { user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
  if (roleErr) return new Response(JSON.stringify({ error: roleErr.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, existed: !!existing }));
});

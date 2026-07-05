// supabase/functions/delete-account/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // 1) Parse body
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
      });
    }

    // 2) Verify caller is the same user (optional but recommended)
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing JWT' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role (server-side only)
      {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      },
    );

    const {
      data: { user },
      error: getUserErr,
    } = await supabase.auth.getUser(jwt);

    if (getUserErr || !user || user.id !== user_id) {
      return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 403 });
    }

    // 3) Delete public data (if not using ON DELETE CASCADE)
    try {
      await supabase.from('user_roadmap').delete().eq('user_id', user_id);
    } catch (e) {
      console.log('EF user_roadmap delete error:', e);
    }

    try {
      await supabase.from('profiles').delete().eq('id', user_id);
      // or .eq('user_id', user_id) depending on your schema
    } catch (e) {
      console.log('EF profiles delete error:', e);
    }

    // 4) Delete the Auth user
    const { error: delErr } = await supabase.auth.admin.deleteUser(user_id);
    if (delErr) {
      console.log('auth.admin.deleteUser error:', delErr);
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.log('delete-account EF error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
    });
  }
});

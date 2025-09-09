const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: true
    }
  });

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    await new Promise(resolve => req.on('end', resolve));
    const { email, password } = JSON.parse(body || '{}');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    const { access_token, refresh_token } = data.session;
    res.setHeader('Set-Cookie', [
      `sb-access-token=${access_token}; HttpOnly; Path=/; SameSite=Lax; Secure`,
      `sb-refresh-token=${refresh_token}; HttpOnly; Path=/; SameSite=Lax; Secure`
    ]);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } else if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', [
      'sb-access-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure',
      'sb-refresh-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure'
    ]);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
};

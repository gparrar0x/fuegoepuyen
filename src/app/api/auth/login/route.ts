import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const supabase = await createClient()

  // Check if already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  // Redirect to Supabase Auth UI or show login page
  // For MVP, we'll use magic link via email

  // Generate HTML for simple login form
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Fuego Epuyén</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔥</div>
        <h1 class="text-2xl font-bold">Fuego Epuyén</h1>
        <p class="text-gray-600 mt-1">Dashboard de administración</p>
      </div>

      <form id="loginForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <button
          type="submit"
          id="submitBtn"
          class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Enviar enlace mágico
        </button>
      </form>

      <div id="message" class="hidden mt-4 p-4 rounded-lg text-center"></div>

      <p class="text-center text-sm text-gray-500 mt-6">
        <a href="/" class="hover:text-orange-500">← Volver al mapa</a>
      </p>
    </div>
  </div>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

    const supabase = createClient(
      '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
      '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
    );

    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/api/auth/callback',
        },
      });

      if (error) {
        message.className = 'mt-4 p-4 rounded-lg text-center bg-red-100 text-red-700';
        message.textContent = error.message;
      } else {
        message.className = 'mt-4 p-4 rounded-lg text-center bg-green-100 text-green-700';
        message.textContent = '¡Enlace enviado! Revisa tu correo electrónico.';
        form.reset();
      }

      message.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar enlace mágico';
    });
  </script>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

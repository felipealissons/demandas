// ... (restante do arquivo que você já tem)

async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setErro("Informe seu e-mail para recuperar a senha."); return; }
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    setLoading(false);
    if (error) { setErro(error.message); return; }
    alert("Enviamos um e-mail com o link para redefinir sua senha.");
  }
  
  // No JSX do form (logo abaixo do botão "Entrar"), adicione:
  <button
    type="button"
    onClick={handleReset}
    className="text-sm text-indigo-600 hover:underline"
  >
    Esqueci minha senha
  </button>
  
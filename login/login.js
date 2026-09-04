const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const formulario = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  // Corrigido de "usuarios" para "usuario" para bater com o ID do HTML
  const usuarioInput = document.getElementById("usuario").value.trim();
  const senhaInput = document.getElementById("senha").value.trim();

  if (usuarioInput === "" || senhaInput === "") {
    mensagem.textContent = "Preencha o usuário e a senha.";
    mensagem.className = "mensagem erro";
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("*")
      .eq("usuario", usuarioInput)
      .eq("senha", senhaInput);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      mensagem.textContent = "Login realizado com sucesso! Redirecionando...";
      mensagem.className = "mensagem sucesso";
      
      setTimeout(() => {
        window.location.href = "/menu/menuindex.html";
      }, 1000);
    } else {
      mensagem.textContent = "Usuário ou senha incorretos.";
      mensagem.className = "mensagem erro";
    }

  } catch (erro) {
    mensagem.textContent = "Erro ao tentar fazer login: " + erro.message;
    mensagem.className = "mensagem erro";
  }
});
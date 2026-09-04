const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const formulario = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const usuarioInput = document.getElementById("usuario").value.trim();
  const senhaInput = document.getElementById("senha").value.trim();

  if (usuarioInput === "" || senhaInput === "") {
    mensagem.textContent = "Preencha o usuário e a senha.";
    mensagem.className = "mensagem erro";
    return;
  }

  try {
    console.log("Tentando buscar o usuário:", usuarioInput);

    // Buscamos apenas pelo usuário primeiro para diagnosticar com precisão
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("*")
      .eq("usuario", usuarioInput);

    console.log("Resposta do Supabase:", { data, error });

    if (error) {
      throw error;
    }

    // Verifica se encontrou o usuário na tabela
    if (data && data.length > 0) {
      const usuarioCadastrado = data[0];

      // Compara a senha digitada com a senha que está no banco
      if (usuarioCadastrado.senha === senhaInput) {
        mensagem.textContent = "Login realizado com sucesso! Redirecionando...";
        mensagem.className = "mensagem sucesso";
        
        setTimeout(() => {
          window.location.href = "/menu/menuindex.html";
        }, 1000);
      } else {
        mensagem.textContent = "Senha incorreta.";
        mensagem.className = "mensagem erro";
      }
    } else {
      mensagem.textContent = "Usuário não encontrado.";
      mensagem.className = "mensagem erro";
    }

  } catch (erro) {
    console.error("Erro completo no login:", erro);
    mensagem.textContent = "Erro ao tentar fazer login: " + erro.message;
    mensagem.className = "mensagem erro";
  }
});
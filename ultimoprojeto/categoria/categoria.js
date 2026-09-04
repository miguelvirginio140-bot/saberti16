const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);  

const formCliente = document.getElementById("formCliente");
const tabelaClientes = document.getElementById("tabelaClientes");
const mensagem = document.getElementById("mensagem");

const clienteIdInput = document.getElementById("categoriaprodutoid");
const dsCategoriaProdutoInput = document.getElementById("ds_categoria_produto");

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnVoltar = document.getElementById("voltar");

btnVoltar.addEventListener("click", function () {
  window.location.href = "/menu/menuindex.html";
});

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem " + tipo;
}

async function carregarClientes() {
  const { data, error } = await supabaseClient
    .from("categoria_produto")
    .select("categoriaprodutoid, ds_categoria_produto")
    .order("categoriaprodutoid", { ascending: true });

  if (error) {
    tabelaClientes.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center;">Erro ao carregar categorias.</td>
      </tr>
    `;
    mostrarMensagem("Erro ao buscar categorias: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaClientes.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center;">Nenhuma categoria cadastrada.</td>
      </tr>
    `;
    return;
  }

  tabelaClientes.innerHTML = "";

  data.forEach(function(categoria) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${categoria.categoriaprodutoid}</td>
      <td>${categoria.ds_categoria_produto}</td>
      <td class="coluna-acoes" style="text-align: center; white-space: nowrap;"></td>
    `;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-editar";
    botaoEditar.type = "button";
    botaoEditar.addEventListener("click", function() {
      prepararEdicao(categoria);
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.addEventListener("click", function() {
      excluirCliente(categoria);
    });

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);

    tabelaClientes.appendChild(linha);
  });
}

function prepararEdicao(categoria) {
  clienteIdInput.value = categoria.categoriaprodutoid;
  dsCategoriaProdutoInput.value = categoria.ds_categoria_produto;

  dsCategoriaProdutoInput.focus();

  btnSalvar.textContent = "Atualizar";
  btnCancelarEdicao.style.display = "inline-block";

  mostrarMensagem("Editando a categoria: " + categoria.ds_categoria_produto, "sucesso");
}

function cancelarEdicao() {
  formCliente.reset();
  clienteIdInput.value = "";
  dsCategoriaProdutoInput.readOnly = false;

  btnSalvar.textContent = "Salvar";
  btnCancelarEdicao.style.display = "none";

  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function salvarCliente() {
  const dsCategoriaProduto = dsCategoriaProdutoInput.value;

  const novaCategoria = {
    ds_categoria_produto: dsCategoriaProduto
  };

  const { error } = await supabaseClient
    .from("categoria_produto")
    .insert(novaCategoria);

  if (error) {
    mostrarMensagem("Erro ao salvar categoria: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Categoria salva com sucesso!", "sucesso");
  formCliente.reset();
  carregarClientes();
}

async function atualizarNomeCliente() {
  const categoriaId = clienteIdInput.value;
  const dsCategoriaProduto = dsCategoriaProdutoInput.value;

  const { error } = await supabaseClient
    .from("categoria_produto")
    .update({
      ds_categoria_produto: dsCategoriaProduto
    })
    .eq("categoriaprodutoid", categoriaId);

  if (error) {
    mostrarMensagem("Erro ao atualizar categoria: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Categoria atualizada com sucesso!", "sucesso");
  cancelarEdicao();
  carregarClientes();
}

async function excluirCliente(categoria) {
  const confirmou = confirm(
    "Tem certeza que deseja excluir a categoria " + categoria.ds_categoria_produto + "?"
  );

  if (!confirmou) {
    return;
  }

  const { error } = await supabaseClient
    .from("categoria_produto")
    .delete()
    .eq("categoriaprodutoid", categoria.categoriaprodutoid);

  if (error) {
    mostrarMensagem("Erro ao excluir categoria: " + error.message, "erro");
    return;
  }

  if (clienteIdInput.value == categoria.categoriaprodutoid) {
    cancelarEdicao();
  }

  mostrarMensagem("Categoria excluída com sucesso!", "sucesso");
  carregarClientes();
}

formCliente.addEventListener("submit", async function(evento) {
  evento.preventDefault();
  const estaEditando = clienteIdInput.value !== "";

  if (estaEditando) {
    await atualizarNomeCliente();
  } else {
    await salvarCliente();
  }
});

btnCancelarEdicao.addEventListener("click", function() {
  cancelarEdicao();
});

carregarClientes();
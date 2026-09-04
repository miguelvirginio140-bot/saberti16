const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);  

const formProduto = document.getElementById("formProduto");
const tabelaProdutos = document.getElementById("tabelaProdutos");
const mensagem = document.getElementById("mensagem");

const produtoidInput = document.getElementById("produtoid");
const categoriaprodutoidInput = document.getElementById("categoriaprodutoid");
const dsProdutoInput = document.getElementById("ds_produto");
const obsProdutoInput = document.getElementById("obs_produto");
const vlVendaProdutoInput = document.getElementById("vl_venda_produto");
const dtCadastroProdutoInput = document.getElementById("dt_cadastro_produto");
const statusProdutoInput = document.getElementById("status_produto");

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

function definirDataHoje() {
  const hoje = new Date().toISOString().split("T")[0];
  dtCadastroProdutoInput.value = hoje;
}

async function carregarCategorias() {
  const { data, error } = await supabaseClient
    .from("categoria_produto")
    .select("categoriaprodutoid, ds_categoria_produto")
    .order("categoriaprodutoid", { ascending: true });
 
  if (error) {
    mostrarMensagem("Erro ao carregar categorias: " + error.message, "erro");
    categoriaprodutoidInput.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }

  categoriaprodutoidInput.innerHTML = '<option value="">Selecione...</option>';

  data.forEach(function(categoria) {
    const option = document.createElement("option");
    option.value = categoria.categoriaprodutoid;
    option.textContent = `${categoria.categoriaprodutoid} - ${categoria.ds_categoria_produto || "Categoria"}`;
    categoriaprodutoidInput.appendChild(option);
  });
}

async function carregarProdutos() {
  const { data, error } = await supabaseClient
    .from("produto")
    .select("produtoid, categoriaprodutoid, ds_produto, obs_produto, vl_venda_produto, dt_cadastro_produto, status_produto")
    .order("produtoid", { ascending: true });

  if (error) {
    tabelaProdutos.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center;">Erro ao carregar produtos.</td>
      </tr>
    `;
    mostrarMensagem("Erro ao buscar produtos: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaProdutos.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center;">Nenhum produto cadastrado.</td>
      </tr>
    `;
    return;
  }

  tabelaProdutos.innerHTML = "";

  data.forEach(function(produto) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td style="text-align: center;">${produto.produtoid}</td>
      <td style="text-align: center;">${produto.categoriaprodutoid}</td>
      <td>${produto.ds_produto}</td>
      <td>${produto.obs_produto || ""}</td>
      <td>R$ ${parseFloat(produto.vl_venda_produto || 0).toFixed(2)}</td>
      <td>${produto.dt_cadastro_produto || ""}</td>
      <td>${produto.status_produto}</td>
      <td class="coluna-acoes" style="text-align: center; white-space: nowrap;"></td>
    `;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-editar";
    botaoEditar.type = "button";
    botaoEditar.addEventListener("click", function() {
      prepararEdicao(produto);
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.addEventListener("click", function() {
      excluirProduto(produto);
    });

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);

    tabelaProdutos.appendChild(linha);
  });
}

function prepararEdicao(produto) {
  produtoidInput.value = produto.produtoid;
  categoriaprodutoidInput.value = produto.categoriaprodutoid;
  dsProdutoInput.value = produto.ds_produto;
  obsProdutoInput.value = produto.obs_produto || "";
  vlVendaProdutoInput.value = produto.vl_venda_produto;
  dtCadastroProdutoInput.value = produto.dt_cadastro_produto || "";
  statusProdutoInput.value = produto.status_produto;

  dsProdutoInput.focus();

  btnSalvar.textContent = "Atualizar";
  btnCancelarEdicao.style.display = "inline-block";

  mostrarMensagem("Editando o produto: " + produto.ds_produto, "sucesso");
}

function cancelarEdicao() {
  formProduto.reset();
  produtoidInput.value = "";
  definirDataHoje();

  btnSalvar.textContent = "Salvar";
  btnCancelarEdicao.style.display = "none";

  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function salvarProduto() {
  const novoProduto = {
    categoriaprodutoid: categoriaprodutoidInput.value,
    ds_produto: dsProdutoInput.value,
    obs_produto: obsProdutoInput.value,
    vl_venda_produto: vlVendaProdutoInput.value,
    dt_cadastro_produto: dtCadastroProdutoInput.value || null,
    status_produto: statusProdutoInput.value
  };

  const { error } = await supabaseClient
    .from("produto")
    .insert(novoProduto);

  if (error) {
    mostrarMensagem("Erro ao salvar produto: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Produto salvo com sucesso!", "sucesso");
  formProduto.reset();
  definirDataHoje();
  carregarProdutos();
}

async function atualizarProduto() {
  const produtoId = produtoidInput.value;

  const produtoAtualizado = {
    categoriaprodutoid: categoriaprodutoidInput.value,
    ds_produto: dsProdutoInput.value,
    obs_produto: obsProdutoInput.value,
    vl_venda_produto: vlVendaProdutoInput.value,
    dt_cadastro_produto: dtCadastroProdutoInput.value || null,
    status_produto: statusProdutoInput.value
  };

  const { error } = await supabaseClient
    .from("produto")
    .update(produtoAtualizado)
    .eq("produtoid", produtoId);

  if (error) {
    mostrarMensagem("Erro ao atualizar produto: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Produto atualizado com sucesso!", "sucesso");
  cancelarEdicao();
  carregarProdutos();
}

async function excluirProduto(produto) {
  const confirmou = confirm(
    "Tem certeza que deseja excluir o produto " + produto.ds_produto + "?"
  );

  if (!confirmou) {
    return;
  }

  const { error } = await supabaseClient
    .from("produto")
    .delete()
    .eq("produtoid", produto.produtoid);

  if (error) {
    mostrarMensagem("Erro ao excluir produto: " + error.message, "erro");
    return;
  }

  if (produtoidInput.value == produto.produtoid) {
    cancelarEdicao();
  }

  mostrarMensagem("Produto excluído com sucesso!", "sucesso");
  carregarProdutos();
}

formProduto.addEventListener("submit", async function(evento) {
  evento.preventDefault();

  const estaEditando = produtoidInput.value !== "";

  if (estaEditando) {
    await atualizarProduto();
  } else {
    await salvarProduto();
  }
});

btnCancelarEdicao.addEventListener("click", function() {
  cancelarEdicao();
});

// Inicialização
carregarCategorias();
definirDataHoje();
carregarProdutos();
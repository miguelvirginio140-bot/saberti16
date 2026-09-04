const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);  

const formOrcamentoItem = document.getElementById("formOrcamentoItem");
const tabelaOrcamentoItens = document.getElementById("tabelaOrcamentoItens");
const mensagem = document.getElementById("mensagem");

const orcamentoItemIdInput = document.getElementById("orcamentoitemid");
const orcamentoIdInput = document.getElementById("orcamentoid");
const produtoIdInput = document.getElementById("produtoid");
const produtoDescInput = document.getElementById("produtodesc");
const qtProdutoInput = document.getElementById("qt_produto");
const vlUnitarioInput = document.getElementById("vl_unitario");
const vlTotalInput = document.getElementById("vl_total");

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

function calcularTotal() {
  const qt = parseFloat(qtProdutoInput.value) || 0;
  const unitario = parseFloat(vlUnitarioInput.value) || 0;
  vlTotalInput.value = (qt * unitario).toFixed(2);
}

qtProdutoInput.addEventListener("input", calcularTotal);
vlUnitarioInput.addEventListener("input", calcularTotal);

async function carregarOrcamentoItens() {

  const { data, error } = await supabaseClient
    .from("orcamento_item")
    .select("orcamentoid, orcamentoitemid, produtoid, produtodesc, qt_produto, vl_unitario, vl_total")
    .order("orcamentoid", { ascending: true })
    .order("orcamentoitemid", { ascending: true });

  if (error) {
    tabelaOrcamentoItens.innerHTML = `
      <tr>
        <td colspan="8">Erro ao carregar itens de orçamento.</td>
      </tr>
    `;

    mostrarMensagem("Erro ao buscar itens: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaOrcamentoItens.innerHTML = `
      <tr>
        <td colspan="8">Nenhum item cadastrado.</td>
      </tr>
    `;
    return;
  }

  tabelaOrcamentoItens.innerHTML = "";

  data.forEach(function(item) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${item.orcamentoid}</td>
      <td>${item.orcamentoitemid}</td>
      <td>${item.produtoid}</td>
      <td>${item.produtodesc}</td>
      <td>${item.qt_produto}</td>
      <td>${item.vl_unitario}</td>
      <td>${item.vl_total}</td>
      <td class="coluna-acoes"></td>
    `;

    const botaoEditar = document.createElement("button");

    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-editar";
    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", function() {
      prepararEdicao(item);
    });

    const botaoExcluir = document.createElement("button");

    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", function() {
      excluirOrcamentoItem(item);
    });

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);

    tabelaOrcamentoItens.appendChild(linha);
  });
}

function prepararEdicao(item) {

  orcamentoItemIdInput.value = item.orcamentoitemid;
  orcamentoIdInput.value = item.orcamentoid;
  produtoIdInput.value = item.produtoid;
  produtoDescInput.value = item.produtodesc;
  qtProdutoInput.value = item.qt_produto;
  vlUnitarioInput.value = item.vl_unitario;
  vlTotalInput.value = item.vl_total;

  orcamentoItemIdInput.disabled = true;
  orcamentoIdInput.disabled = true;

  btnSalvar.textContent = "Atualizar";

  btnCancelarEdicao.style.display = "inline-block";

  mostrarMensagem("Editando o item ID: " + item.orcamentoitemid, "sucesso");
}

function cancelarEdicao() {

  formOrcamentoItem.reset();

  orcamentoItemIdInput.disabled = false;
  orcamentoIdInput.disabled = false;

  btnSalvar.textContent = "Salvar";

  btnCancelarEdicao.style.display = "none";

  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function salvarOrcamentoItem() {

  const novoItem = {
    orcamentoitemid: orcamentoItemIdInput.value,
    orcamentoid: orcamentoIdInput.value,
    produtoid: produtoIdInput.value,
    produtodesc: produtoDescInput.value,
    qt_produto: qtProdutoInput.value,
    vl_unitario: vlUnitarioInput.value,
    vl_total: vlTotalInput.value
  };

  const { error } = await supabaseClient
    .from("orcamento_item")
    .insert(novoItem);

  if (error) {
    mostrarMensagem("Erro ao salvar item: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Item salvo com sucesso!", "sucesso");

  formOrcamentoItem.reset();

  carregarOrcamentoItens();
}

async function atualizarOrcamentoItem() {

  const orcamentoItemId = orcamentoItemIdInput.value;

  const itemAtualizado = {
    produtoid: produtoIdInput.value,
    produtodesc: produtoDescInput.value,
    qt_produto: qtProdutoInput.value,
    vl_unitario: vlUnitarioInput.value,
    vl_total: vlTotalInput.value
  };

  const { error } = await supabaseClient
    .from("orcamento_item")
    .update(itemAtualizado)
    .eq("orcamentoitemid", orcamentoItemId);

  if (error) {
    mostrarMensagem("Erro ao atualizar item: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Item atualizado com sucesso!", "sucesso");

  cancelarEdicao();

  carregarOrcamentoItens();
}

async function excluirOrcamentoItem(item) {

  const confirmou = confirm(
    "Tem certeza que deseja excluir o item ID " + item.orcamentoitemid + "?"
  );

  if (!confirmou) {
    return;
  }

  const { error } = await supabaseClient
    .from("orcamento_item")
    .delete()
    .eq("orcamentoitemid", item.orcamentoitemid);

  if (error) {
    mostrarMensagem("Erro ao excluir item: " + error.message, "erro");
    return;
  }

  if (orcamentoItemIdInput.value == item.orcamentoitemid) {
    cancelarEdicao();
  }

  mostrarMensagem("Item excluído com sucesso!", "sucesso");

  carregarOrcamentoItens();
}

formOrcamentoItem.addEventListener("submit", async function(evento) {

  evento.preventDefault();

  const estaEditando = orcamentoItemIdInput.disabled;

  if (estaEditando) {
    await atualizarOrcamentoItem();
  } else {
    await salvarOrcamentoItem();
  }
});

btnCancelarEdicao.addEventListener("click", function() {
  cancelarEdicao();
});

carregarOrcamentoItens();
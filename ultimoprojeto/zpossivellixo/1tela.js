const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  

// --- ELEMENTOS ORÇAMENTO ---
const formOrcamento = document.getElementById("formOrcamento");
const mensagemOrcamento = document.getElementById("mensagemOrcamento");

const orcamentoIdInput = document.getElementById("orcamentoid");
const clienteIdInput = document.getElementById("clienteid");
const dtOrcamentoInput = document.getElementById("dt_orcamento");
const dtValidadeOrcamentoInput = document.getElementById("dt_validade_orcamento");
const vlTotalOrcamentoInput = document.getElementById("vl_total_orcamento");

const btnSalvarOrcamento = document.getElementById("btnSalvarOrcamento");
const btnCancelarEdicaoOrcamento = document.getElementById("btnCancelarEdicaoOrcamento");
const btnVoltar = document.getElementById("voltar");

// --- ELEMENTOS ITENS DE ORÇAMENTO ---
const formOrcamentoItem = document.getElementById("formOrcamentoItem");
const mensagemItem = document.getElementById("mensagemItem");

const orcamentoItemIdInput = document.getElementById("orcamentoitemid");
const itemOrcamentoIdInput = document.getElementById("item_orcamentoid");
const produtoIdInput = document.getElementById("produtoid");
const produtoDescInput = document.getElementById("produtodesc");
const qtProdutoInput = document.getElementById("qt_produto");
const vlUnitarioInput = document.getElementById("vl_unitario");
const vlTotalInput = document.getElementById("vl_total");

const btnSalvarItem = document.getElementById("btnSalvarItem");
const btnCancelarEdicaoItem = document.getElementById("btnCancelarEdicaoItem");

// --- TABELA GERAL ÚNICA ---
const tabelaGeral = document.getElementById("tabelaGeral");

btnVoltar.addEventListener("click", function () {
  window.location.href = "/menu/menuindex.html";
});

function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "mensagem " + tipo;
}

function definirDataHojeOrcamento() {
  const hoje = new Date().toISOString().split("T")[0];
  dtOrcamentoInput.value = hoje;
}

// ==================== CARREGAR SELECTS ====================
async function carregarClientes() {
  const { data, error } = await supabaseClient
    .from("cliente")
    .select("clienteid, nome_cliente") 
    .order("clienteid", { ascending: true });

  if (error) {
    mostrarMensagem(mensagemOrcamento, "Erro ao carregar clientes: " + error.message, "erro");
    clienteIdInput.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }

  clienteIdInput.innerHTML = '<option value="">Selecione um cliente</option>';
  data.forEach(function(cliente) {
    const option = document.createElement("option");
    option.value = cliente.clienteid;
    option.textContent = `${cliente.clienteid} - ${cliente.nome_cliente || "Cliente"}`;
    clienteIdInput.appendChild(option);
  });
}

async function carregarOrcamentosSelect() {
  const { data, error } = await supabaseClient
    .from("orcamento")
    .select("orcamentoid, dt_orcamento")
    .order("orcamentoid", { ascending: true });

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao carregar orçamentos para o item: " + error.message, "erro");
    itemOrcamentoIdInput.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }

  itemOrcamentoIdInput.innerHTML = '<option value="">Selecione um orçamento</option>';
  data.forEach(function(orc) {
    const option = document.createElement("option");
    option.value = orc.orcamentoid;
    option.textContent = `Orçamento ID: ${orc.orcamentoid} (${orc.dt_orcamento || "Data não informada"})`;
    itemOrcamentoIdInput.appendChild(option);
  });
}

async function carregarProdutosSelect() {
   const { data, error } = await supabaseClient
    .from("produto")
    .select("produtoid, ds_produto, vl_venda_produto")
    .order("produtoid", { ascending: true });

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao carregar produtos para o item: " + error.message, "erro");
    produtoIdInput.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }

  produtoIdInput.innerHTML = '<option value="">Selecione um produto</option>';
  data.forEach(function(prod) {
    const option = document.createElement("option");
    option.value = prod.produtoid;
    option.dataset.descricao = prod.ds_produto || "";
    option.dataset.unitario = prod.vl_venda_produto || 0;
    option.textContent = `${prod.produtoid} - ${prod.ds_produto || "Produto"}`;
    produtoIdInput.appendChild(option);
  });
}

produtoIdInput.addEventListener("change", function() {
  const selectedOption = produtoIdInput.options[produtoIdInput.selectedIndex];
  if (selectedOption && selectedOption.value) {
    if (selectedOption.dataset.descricao) {
      produtoDescInput.value = selectedOption.dataset.descricao;
    }
    if (selectedOption.dataset.unitario) {
      vlUnitarioInput.value = selectedOption.dataset.unitario;
      calcularTotal();
    }
  }
});

// ==================== CARREGAR TABELA GERAL (UNIFICADA) ====================
async function carregarTabelaGeral() {
  // Fazendo o join utilizando o Supabase para buscar os dados do orcamento, cliente e itens simultaneamente
  const { data, error } = await supabaseClient
    .from("orcamento_item")
    .select(`
      orcamentoitemid,
      produtoid,
      produtodesc,
      qt_produto,
      vl_unitario,
      vl_total,
      orcamento:orcamentoid (
        orcamentoid,
        dt_orcamento,
        dt_validade_orcamento,
        vl_total_orcamento,
        cliente:clienteid (
          clienteid,
          nome_cliente
        )
      )
    `)
    .order("orcamentoid", { referencedTable: "orcamento", ascending: true })
    .order("orcamentoitemid", { ascending: true });

  if (error) {
    tabelaGeral.innerHTML = `<tr><td colspan="12">Erro ao carregar dados consolidados.</td></tr>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    tabelaGeral.innerHTML = `<tr><td colspan="12">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  tabelaGeral.innerHTML = "";

  data.forEach(function(item) {
    const orc = item.orcamento || {};
    const cli = orc.cliente || {};

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${orc.orcamentoid || ""}</td>
      <td>${cli.nome_cliente ? `${cli.clienteid} - ${cli.nome_cliente}` : (orc.clienteid || "")}</td>
      <td>${orc.dt_orcamento || ""}</td>
      <td>${orc.dt_validade_orcamento || ""}</td>
      <td>${orc.vl_total_orcamento || ""}</td>
      <td>${item.orcamentoitemid}</td>
      <td>${item.produtoid}</td>
      <td>${item.produtodesc}</td>
      <td>${item.qt_produto}</td>
      <td>${item.vl_unitario}</td>
      <td>${item.vl_total}</td>
      <td class="coluna-acoes"></td>
    `;

    const botaoExcluirItem = document.createElement("button");
    botaoExcluirItem.textContent = "Excluir Item";
    botaoExcluirItem.className = "btn-excluir";
    botaoExcluirItem.type = "button";
    botaoExcluirItem.addEventListener("click", () => excluirOrcamentoItem(item));

    linha.querySelector(".coluna-acoes").appendChild(botaoExcluirItem);
    tabelaGeral.appendChild(linha);
  });
}

// ==================== LÓGICA DE ORÇAMENTO ====================
async function salvarOrcamento() {
  const novoOrcamento = {
    clienteid: clienteIdInput.value,
    dt_orcamento: dtOrcamentoInput.value,
    dt_validade_orcamento: dtValidadeOrcamentoInput.value,
    vl_total_orcamento: vlTotalOrcamentoInput.value
  };

  const { error } = await supabaseClient.from("orcamento").insert(novoOrcamento);

  if (error) {
    mostrarMensagem(mensagemOrcamento, "Erro ao salvar orçamento: " + error.message, "erro");
    return;
  }

  mostrarMensagem(mensagemOrcamento, "Orçamento salvo com sucesso!", "sucesso");
  formOrcamento.reset();
  definirDataHojeOrcamento();
  carregarOrcamentosSelect();
  carregarTabelaGeral();
}

formOrcamento.addEventListener("submit", async function(evento) {
  evento.preventDefault();
  await salvarOrcamento();
});

// ==================== LÓGICA DE ITENS DE ORÇAMENTO ====================
function calcularTotal() {
  const qt = parseFloat(qtProdutoInput.value) || 0;
  const unitario = parseFloat(vlUnitarioInput.value) || 0;
  vlTotalInput.value = (qt * unitario).toFixed(2);
}

qtProdutoInput.addEventListener("input", calcularTotal);
vlUnitarioInput.addEventListener("input", calcularTotal);

async function salvarOrcamentoItem() {
  const novoItem = {
    orcamentoitemid: orcamentoItemIdInput.value,
    orcamentoid: itemOrcamentoIdInput.value,
    produtoid: produtoIdInput.value,
    produtodesc: produtoDescInput.value,
    qt_produto: qtProdutoInput.value,
    vl_unitario: vlUnitarioInput.value,
    vl_total: vlTotalInput.value
  };

  const { error } = await supabaseClient.from("orcamento_item").insert(novoItem);

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao salvar item: " + error.message, "erro");
    return;
  }

  mostrarMensagem(mensagemItem, "Item salvo com sucesso!", "sucesso");
  formOrcamentoItem.reset();
  carregarTabelaGeral();
}

async function excluirOrcamentoItem(item) {
  if (!confirm("Tem certeza que deseja excluir o item ID " + item.orcamentoitemid + "?")) return;

  const { error } = await supabaseClient.from("orcamento_item").delete().eq("orcamentoitemid", item.orcamentoitemid);

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao excluir item: " + error.message, "erro");
    return;
  }

  mostrarMensagem(mensagemItem, "Item excluído com sucesso!", "sucesso");
  carregarTabelaGeral();
}

formOrcamentoItem.addEventListener("submit", async function(evento) {
  evento.preventDefault();
  await salvarOrcamentoItem();
});

// Inicialização Geral
carregarClientes();
carregarOrcamentosSelect();
carregarProdutosSelect();
definirDataHojeOrcamento();
carregarTabelaGeral();
const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  

// --- ELEMENTOS ORÇAMENTO ---
const formOrcamento = document.getElementById("formOrcamento");
const tabelaOrcamentos = document.getElementById("tabelaOrcamentos");
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
const tabelaOrcamentoItens = document.getElementById("tabelaOrcamentoItens");
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

// ==================== CARREGAR CLIENTES (SELECT) ====================
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

// ==================== CARREGAR ORÇAMENTOS (SELECT PARA ITENS) ====================
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

// ==================== CARREGAR PRODUTOS (SELECT PARA ITENS) ====================
async function carregarProdutosSelect() {
  // ATENÇÃO: Ajuste "ds_produto" ou o nome real da coluna de descrição/nome do produto na sua tabela se for diferente
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
    // Guardamos dados extras no dataset caso queira preencher descrição ou valor unitário automático depois
    option.dataset.descricao = prod.ds_produto || "";
    option.dataset.unitario = prod.vl_venda_produto || 0;
    
    option.textContent = `${prod.produtoid} - ${prod.ds_produto || "Produto"}`;
    produtoIdInput.appendChild(option);
  });
}


// Opcional: Se quiser que ao selecionar o produto preencha a descrição e o valor unitário automaticamente
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

// ==================== LÓGICA DE ORÇAMENTO ====================

async function carregarOrcamentos() {
  const { data, error } = await supabaseClient
    .from("orcamento")
    .select("orcamentoid, clienteid, dt_orcamento, dt_validade_orcamento, vl_total_orcamento")
    .order("orcamentoid", { ascending: true });

  if (error) {
    tabelaOrcamentos.innerHTML = `<tr><td colspan="6">Erro ao carregar orçamentos.</td></tr>`;
    mostrarMensagem(mensagemOrcamento, "Erro ao buscar orçamentos: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaOrcamentos.innerHTML = `<tr><td colspan="6">Nenhum orçamento cadastrado.</td></tr>`;
    return;
  }

  tabelaOrcamentos.innerHTML = "";

  data.forEach(function(orcamento) {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${orcamento.orcamentoid}</td>
      <td>${orcamento.clienteid}</td>
      <td>${orcamento.dt_orcamento}</td>
      <td>${orcamento.dt_validade_orcamento}</td>
      <td>${orcamento.vl_total_orcamento}</td>
      <td class="coluna-acoes"></td>
    `;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-editar";
    botaoEditar.type = "button";
    botaoEditar.addEventListener("click", () => prepararEdicaoOrcamento(orcamento));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.addEventListener("click", () => excluirOrcamento(orcamento));

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);
    tabelaOrcamentos.appendChild(linha);
  });
}

function prepararEdicaoOrcamento(orcamento) {
  orcamentoIdInput.value = orcamento.orcamentoid;
  clienteIdInput.value = orcamento.clienteid;
  dtOrcamentoInput.value = orcamento.dt_orcamento;
  dtValidadeOrcamentoInput.value = orcamento.dt_validade_orcamento;
  vlTotalOrcamentoInput.value = orcamento.vl_total_orcamento;

  orcamentoIdInput.disabled = true;
  btnSalvarOrcamento.textContent = "Atualizar";
  btnCancelarEdicaoOrcamento.style.display = "inline-block";
  mostrarMensagem(mensagemOrcamento, "Editando o orçamento ID: " + orcamento.orcamentoid, "sucesso");
}

function cancelarEdicaoOrcamento() {
  formOrcamento.reset();
  orcamentoIdInput.disabled = false;
  btnSalvarOrcamento.textContent = "Salvar";
  btnCancelarEdicaoOrcamento.style.display = "none";
  mensagemOrcamento.textContent = "";
  mensagemOrcamento.className = "mensagem";
  definirDataHojeOrcamento();
}

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
  carregarOrcamentos();
  carregarOrcamentosSelect();
}

async function atualizarOrcamento() {
  const orcamentoId = orcamentoIdInput.value;
  const orcamentoAtualizado = {
    clienteid: clienteIdInput.value,
    dt_orcamento: dtOrcamentoInput.value,
    dt_validade_orcamento: dtValidadeOrcamentoInput.value,
    vl_total_orcamento: vlTotalOrcamentoInput.value
  };

  const { error } = await supabaseClient.from("orcamento").update(orcamentoAtualizado).eq("orcamentoid", orcamentoId);

  if (error) {
    mostrarMensagem(mensagemOrcamento, "Erro ao atualizar orçamento: " + error.message, "erro");
    return;
  }

  mostrarMensagem(mensagemOrcamento, "Orçamento atualizado com sucesso!", "sucesso");
  cancelarEdicaoOrcamento();
  carregarOrcamentos();
  carregarOrcamentosSelect();
}

async function excluirOrcamento(orcamento) {
  if (!confirm("Tem certeza que deseja excluir o orçamento ID " + orcamento.orcamentoid + "?")) return;

  const { error } = await supabaseClient.from("orcamento").delete().eq("orcamentoid", orcamento.orcamentoid);

  if (error) {
    mostrarMensagem(mensagemOrcamento, "Erro ao excluir orçamento: " + error.message, "erro");
    return;
  }

  if (orcamentoIdInput.value == orcamento.orcamentoid) cancelarEdicaoOrcamento();
  mostrarMensagem(mensagemOrcamento, "Excluído com sucesso!", "sucesso");
  carregarOrcamentos();
  carregarOrcamentosSelect();
}

formOrcamento.addEventListener("submit", async function(evento) {
  evento.preventDefault();
  if (orcamentoIdInput.disabled) {
    await atualizarOrcamento();
  } else {
    await salvarOrcamento();
  }
});

btnCancelarEdicaoOrcamento.addEventListener("click", cancelarEdicaoOrcamento);


// ==================== LÓGICA DE ITENS DE ORÇAMENTO ====================

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
    tabelaOrcamentoItens.innerHTML = `<tr><td colspan="8">Erro ao carregar itens de orçamento.</td></tr>`;
    mostrarMensagem(mensagemItem, "Erro ao buscar itens: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaOrcamentoItens.innerHTML = `<tr><td colspan="8">Nenhum item cadastrado.</td></tr>`;
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
    botaoEditar.addEventListener("click", () => prepararEdicaoItem(item));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.addEventListener("click", () => excluirOrcamentoItem(item));

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);
    tabelaOrcamentoItens.appendChild(linha);
  });
}

function prepararEdicaoItem(item) {
  orcamentoItemIdInput.value = item.orcamentoitemid;
  itemOrcamentoIdInput.value = item.orcamentoid;
  produtoIdInput.value = item.produtoid;
  produtoDescInput.value = item.produtodesc;
  qtProdutoInput.value = item.qt_produto;
  vlUnitarioInput.value = item.vl_unitario;
  vlTotalInput.value = item.vl_total;

  orcamentoItemIdInput.disabled = true;
  itemOrcamentoIdInput.disabled = true;
  btnSalvarItem.textContent = "Atualizar";
  btnCancelarEdicaoItem.style.display = "inline-block";
  mostrarMensagem(mensagemItem, "Editando o item ID: " + item.orcamentoitemid, "sucesso");
}

function cancelarEdicaoItem() {
  formOrcamentoItem.reset();
  orcamentoItemIdInput.disabled = false;
  itemOrcamentoIdInput.disabled = false;
  btnSalvarItem.textContent = "Salvar";
  btnCancelarEdicaoItem.style.display = "none";
  mensagemItem.textContent = "";
  mensagemItem.className = "mensagem";
}

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

  const { error } = await supabaseClient.from("orcamento_item").update(itemAtualizado).eq("orcamentoitemid", orcamentoItemId);

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao atualizar item: " + error.message, "erro");
    return;
  }
 
  mostrarMensagem(mensagemItem, "Item atualizado com sucesso!", "sucesso");
  cancelarEdicaoItem();
  carregarOrcamentoItens();
}

async function excluirOrcamentoItem(item) {
  if (!confirm("Tem certeza que deseja excluir o item ID " + item.orcamentoitemid + "?")) return;

  const { error } = await supabaseClient.from("orcamento_item").delete().eq("orcamentoitemid", item.orcamentoitemid);

  if (error) {
    mostrarMensagem(mensagemItem, "Erro ao excluir item: " + error.message, "erro");
    return;
  }

  if (orcamentoItemIdInput.value == item.orcamentoitemid) cancelarEdicaoItem();
  mostrarMensagem(mensagemItem, "Item excluído com sucesso!", "sucesso");
  carregarOrcamentoItens();
}

formOrcamentoItem.addEventListener("submit", async function(evento) {
  evento.preventDefault();
  if (orcamentoItemIdInput.disabled) {
    await atualizarOrcamentoItem();
  } else {
    await salvarOrcamentoItem();
  }
});

btnCancelarEdicaoItem.addEventListener("click", cancelarEdicaoItem);

// Inicialização: Carrega todos os selects, data de hoje e as tabelas
carregarClientes();
carregarOrcamentosSelect();
carregarProdutosSelect();
definirDataHojeOrcamento();
carregarOrcamentos();
carregarOrcamentoItens();
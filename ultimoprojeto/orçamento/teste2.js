const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  

// --- ELEMENTOS DE CONTROLE DE TELA ---
const telaTabela = document.getElementById("telaTabela");
const telaCadastro = document.getElementById("telaCadastro");
const btnNovoOrcamento = document.getElementById("btnNovoOrcamento");
const btnVoltarTela1 = document.getElementById("btnVoltarTela1");
const btnLimparOrcamento = document.getElementById("btnLimparOrcamento");
const btnVoltarMenu = document.getElementById("voltar");
const mensagemTabela = document.getElementById("mensagemTabela");

// --- ELEMENTOS DO FORMULÁRIO ---
const formOrcamentoGeral = document.getElementById("formOrcamentoGeral");
const mensagemGeral = document.getElementById("mensagemGeral");

const orcamentoIdInput = document.getElementById("orcamentoid");
const clienteIdInput = document.getElementById("clienteid");
const dtOrcamentoInput = document.getElementById("dt_orcamento");
const dtValidadeOrcamentoInput = document.getElementById("dt_validade_orcamento");
const vlTotalOrcamentoInput = document.getElementById("vl_total_orcamento");

const orcamentoItemIdInput = document.getElementById("orcamentoitemid");
const produtoIdInput = document.getElementById("produtoid");
const qtProdutoInput = document.getElementById("qt_produto");
const vlUnitarioInput = document.getElementById("vl_unitario");
const vlTotalInput = document.getElementById("vl_total");
const btnAddItem = document.getElementById("btnAddItem");
const corpoTabelaCarrinho = document.getElementById("corpoTabelaCarrinho");

const tabelaGeral = document.getElementById("tabelaGeral");

// Carrinho de itens temporários e contadores
let carrinhoItens = [];
let contadorItem = 1;
let indiceEditando = -1; // Variável para controlar qual item do carrinho está sendo editado (-1 = nenhum)
let modoEdicaoOrcamento = false; // Controla se estamos editando um orçamento existente na Tela 2

// --- CONTROLE DE NAVEGAÇÃO ---
btnNovoOrcamento.addEventListener("click", function() {
  telaTabela.style.display = "none";
  telaCadastro.style.display = "block";
  limparEAtualizarTelaCadastro();
});

// Botão Voltar da Tela 2
btnVoltarTela1.addEventListener("click", function() {
  telaCadastro.style.display = "none";
  telaTabela.style.display = "block";
  carregarTabelaGeral();
});

// Botão Limpar Orçamento (dentro do formulário)
btnLimparOrcamento.addEventListener("click", function() {
  if (confirm("Deseja realmente limpar todos os dados e produtos deste orçamento?")) {
    limparEAtualizarTelaCadastro();
  }
});

btnVoltarMenu.addEventListener("click", function () {
  window.location.href = "/menu/menuindex.html";
});

function definirDataHoje() {
  const hoje = new Date().toISOString().split("T")[0];
  dtOrcamentoInput.value = hoje;
}

// Função auxiliar para resetar campos, limpar carrinho e atualizar IDs
function limparEAtualizarTelaCadastro() {
  formOrcamentoGeral.reset();
  definirDataHoje();
  carrinhoItens = [];
  contadorItem = 1;
  indiceEditando = -1;
  modoEdicaoOrcamento = false;
  orcamentoItemIdInput.value = contadorItem;
  btnAddItem.textContent = "Adicionar Item"; 
  atualizarTabelaCarrinho();
  vlTotalOrcamentoInput.value = "0.00";
  mensagemGeral.textContent = "";
  carregarProximoOrcamentoId();
}

// ==================== BUSCAR PRÓXIMO ORCAMENTO ID ====================
async function carregarProximoOrcamentoId() {
  if (modoEdicaoOrcamento) return; // Se estiver editando, não mexe no ID do orçamento

  const { data, error } = await supabaseClient
    .from("orcamento")
    .select("orcamentoid")
    .order("orcamentoid", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Erro ao buscar próximo orcamentoid:", error.message);
    orcamentoIdInput.value = "1";
    return;
  }

  if (data && data.length > 0) {
    const ultimoId = parseInt(data[0].orcamentoid) || 0;
    orcamentoIdInput.value = ultimoId + 1;
  } else {
    orcamentoIdInput.value = 1;
  }
}

// ==================== CARREGAR SELECTS ====================
async function carregarClientes() {
  const { data, error } = await supabaseClient
    .from("cliente")
    .select("clienteid, nome_cliente") 
    .order("clienteid", { ascending: true });

  if (error) {
    console.error("Erro ao carregar clientes:", error.message);
    clienteIdInput.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    return;
  }

  clienteIdInput.innerHTML = '<option value="">Selecione um cliente...</option>';
  data.forEach(function(cliente) {
    const option = document.createElement("option");
    option.value = cliente.clienteid;
    option.textContent = `${cliente.clienteid} - ${cliente.nome_cliente || "Cliente"}`;
    clienteIdInput.appendChild(option);
  });
}

async function carregarProdutosSelect() {
  const { data, error } = await supabaseClient
    .from("produto")
    .select("produtoid, ds_produto, vl_venda_produto")
    .order("produtoid", { ascending: true });

  if (error) {
    console.error("Erro ao carregar produtos:", error.message);
    produtoIdInput.innerHTML = '<option value="">Erro ao carregar produtos</option>';
    return;
  }

  produtoIdInput.innerHTML = '<option value="">Selecione um produto...</option>';
  data.forEach(function(prod) {
    const option = document.createElement("option");
    option.value = prod.produtoid;
    option.dataset.unitario = prod.vl_venda_produto || 0;
    option.dataset.descricao = prod.ds_produto || "Produto";
    option.textContent = `${prod.ds_produto || "Produto"} (ID: ${prod.produtoid})`;
    produtoIdInput.appendChild(option);
  });
}

produtoIdInput.addEventListener("change", function() {
  const selectedOption = produtoIdInput.options[produtoIdInput.selectedIndex];
  if (selectedOption && selectedOption.value) {
    vlUnitarioInput.value = selectedOption.dataset.unitario || 0;
    calcularTotalItem();
  } else {
    vlUnitarioInput.value = "";
    vlTotalInput.value = "";
  }
});

function calcularTotalItem() {
  const qt = parseFloat(qtProdutoInput.value) || 0;
  const unitario = parseFloat(vlUnitarioInput.value) || 0;
  vlTotalInput.value = (qt * unitario).toFixed(2);
}

qtProdutoInput.addEventListener("input", calcularTotalItem);

// ==================== ADICIONAR OU ATUALIZAR ITEM NO CARRINHO ====================
btnAddItem.addEventListener("click", function() {
  const clienteVal = clienteIdInput.value;
  const dtValidadeVal = dtValidadeOrcamentoInput.value;
  const produtoIdVal = produtoIdInput.value;
  const qtVal = qtProdutoInput.value;

  if (!clienteVal || !dtValidadeVal || !produtoIdVal || !qtVal) {
    alert("Preencha todos os campos obrigatórios: Cliente, Data de Validade, Produto e Quantidade antes de adicionar.");
    return;
  }

  const selectedOption = produtoIdInput.options[produtoIdInput.selectedIndex];
  const nomeProduto = selectedOption ? selectedOption.dataset.descricao : "";

  if (indiceEditando > -1) {
    carrinhoItens[indiceEditando].produtoid = produtoIdVal;
    carrinhoItens[indiceEditando].nome_produto = nomeProduto;
    carrinhoItens[indiceEditando].qt_produto = parseFloat(qtVal);
    carrinhoItens[indiceEditando].vl_unitario = parseFloat(vlUnitarioInput.value) || 0;
    carrinhoItens[indiceEditando].vl_total = parseFloat(vlTotalInput.value) || 0;

    indiceEditando = -1;
    btnAddItem.textContent = "Adicionar Item";
    orcamentoItemIdInput.value = contadorItem;
  } else {
    const novoItem = {
      orcamentoitemid: contadorItem,
      produtoid: produtoIdVal,
      nome_produto: nomeProduto,
      qt_produto: parseFloat(qtVal),
      vl_unitario: parseFloat(vlUnitarioInput.value) || 0,
      vl_total: parseFloat(vlTotalInput.value) || 0
    };

    carrinhoItens.push(novoItem);
    contadorItem++;
    orcamentoItemIdInput.value = contadorItem;
  }

  atualizarTabelaCarrinho();
  recalcularValorTotalOrcamento();

  produtoIdInput.value = "";
  qtProdutoInput.value = "";
  vlUnitarioInput.value = "";
  vlTotalInput.value = "";
});

function atualizarTabelaCarrinho() {
  if (carrinhoItens.length === 0) {
    corpoTabelaCarrinho.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum produto adicionado ainda.</td></tr>`;
    return;
  }

  corpoTabelaCarrinho.innerHTML = "";
  carrinhoItens.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.orcamentoitemid}</td>
      <td>${item.produtoid}</td>
      <td>${item.nome_produto}</td>
      <td>${item.qt_produto}</td>
      <td>${item.vl_unitario.toFixed(2)}</td>
      <td>${item.vl_total.toFixed(2)}</td>
      <td style="text-align: center; white-space: nowrap;">
        <button type="button" class="btn-editar" onclick="editarItemCarrinho(${index})">Editar</button>
        <button type="button" class="btn-excluir" onclick="removerItemCarrinho(${index})">Remover</button>
      </td>
    `;
    corpoTabelaCarrinho.appendChild(tr);
  });
}

window.editarItemCarrinho = function(index) {
  const item = carrinhoItens[index];
  indiceEditando = index;

  orcamentoItemIdInput.value = item.orcamentoitemid;
  produtoIdInput.value = item.produtoid;
  qtProdutoInput.value = item.qt_produto;
  vlUnitarioInput.value = item.vl_unitario;
  vlTotalInput.value = item.vl_total.toFixed(2);

  btnAddItem.textContent = "Salvar Edição do Item";
};

window.removerItemCarrinho = function(index) {
  if (indiceEditando === index) {
    indiceEditando = -1;
    btnAddItem.textContent = "Adicionar Item";
    orcamentoItemIdInput.value = carrinhoItens.length > 0 ? carrinhoItens.length + 1 : 1;
    produtoIdInput.value = "";
    qtProdutoInput.value = "";
    vlUnitarioInput.value = "";
    vlTotalInput.value = "";
  } else if (indiceEditando > index) {
    indiceEditando--;
  }

  carrinhoItens.splice(index, 1);
  
  carrinhoItens.forEach((item, idx) => {
    item.orcamentoitemid = idx + 1;
  });

  if (indiceEditando === -1) {
    contadorItem = carrinhoItens.length + 1;
    orcamentoItemIdInput.value = contadorItem;
  }

  atualizarTabelaCarrinho();
  recalcularValorTotalOrcamento();
};

function recalcularValorTotalOrcamento() {
  const somaTotal = carrinhoItens.reduce((acc, item) => acc + item.vl_total, 0);
  vlTotalOrcamentoInput.value = somaTotal.toFixed(2);
}

// ==================== SALVAR OU ATUALIZAR ORÇAMENTO COMPLETO ====================
formOrcamentoGeral.addEventListener("submit", async function(evento) {
  evento.preventDefault();

  if (carrinhoItens.length === 0) {
    alert("Adicione pelo menos um produto ao orçamento antes de salvar.");
    return;
  }

  const orcamentoidAtual = parseInt(orcamentoIdInput.value);

  const dadosOrcamento = {
    orcamentoid: orcamentoidAtual,
    clienteid: clienteIdInput.value,
    dt_orcamento: dtOrcamentoInput.value,
    dt_validade_orcamento: dtValidadeOrcamentoInput.value,
    vl_total_orcamento: parseFloat(vlTotalOrcamentoInput.value) || 0
  };

  if (modoEdicaoOrcamento) {
    const { error: errorUpd } = await supabaseClient
      .from("orcamento")
      .update(dadosOrcamento)
      .eq("orcamentoid", orcamentoidAtual);

    if (errorUpd) {
      mensagemGeral.textContent = "Erro ao atualizar orçamento: " + errorUpd.message;
      mensagemGeral.className = "mensagem erro";
      return;
    }

    await supabaseClient.from("orcamento_item").delete().eq("orcamentoid", orcamentoidAtual);
  } else {
    const { error: errorOrc } = await supabaseClient
      .from("orcamento")
      .insert(dadosOrcamento);

    if (errorOrc) {
      mensagemGeral.textContent = "Erro ao salvar orçamento: " + errorOrc.message;
      mensagemGeral.className = "mensagem erro";
      return;
    }
  }

  const itensParaSalvar = carrinhoItens.map(item => ({
    orcamentoid: orcamentoidAtual,
    orcamentoitemid: item.orcamentoitemid,
    produtoid: item.produtoid,
    qt_produto: item.qt_produto,
    vl_unitario: item.vl_unitario,
    vl_total: item.vl_total
  }));

  const { error: errorItens } = await supabaseClient
    .from("orcamento_item")
    .insert(itensParaSalvar);

  if (errorItens) {
    mensagemGeral.textContent = "Erro ao salvar itens: " + errorItens.message;
    mensagemGeral.className = "mensagem erro";
    return;
  }

  telaCadastro.style.display = "none";
  telaTabela.style.display = "block";
  
  mensagemTabela.textContent = modoEdicaoOrcamento ? "Orçamento atualizado com sucesso!" : "Orçamento e itens salvos com sucesso!";
  mensagemTabela.className = "mensagem sucesso";

  carregarTabelaGeral();
});

// ==================== CARREGAR TABELA GERAL (TELA 1) ====================
async function carregarTabelaGeral() {
  const { data: orcamentos, error: errorOrc } = await supabaseClient
    .from("orcamento")
    .select("*")
    .order("orcamentoid", { ascending: true });

  if (errorOrc) {
    tabelaGeral.innerHTML = `<tr><td colspan="7">Erro ao carregar orçamentos.</td></tr>`;
    return;
  }

  const { data: itens, error: errorItens } = await supabaseClient
    .from("orcamento_item")
    .select("orcamentoid, qt_produto");

  if (errorItens) {
    tabelaGeral.innerHTML = `<tr><td colspan="7">Erro ao carregar itens.</td></tr>`;
    return;
  }

  if (!orcamentos || orcamentos.length === 0) {
    tabelaGeral.innerHTML = `<tr><td colspan="7">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  const somasQtde = {};
  if (itens) {
    itens.forEach(item => {
      const id = item.orcamentoid;
      const qt = parseFloat(item.qt_produto) || 0;
      somasQtde[id] = (somasQtde[id] || 0) + qt;
    });
  }

  tabelaGeral.innerHTML = "";

  orcamentos.forEach(function(orc) {
    const totalQtde = somasQtde[orc.orcamentoid] || 0;

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${orc.orcamentoid}</td>
      <td>${totalQtde}</td>
      <td>${orc.clienteid || ""}</td>
      <td>${orc.dt_orcamento || ""}</td>
      <td>${orc.dt_validade_orcamento || ""}</td>
      <td>${orc.vl_total_orcamento || ""}</td>
      <td class="coluna-acoes" style="text-align: center; white-space: nowrap;"></td>
    `;

    // Botão Ver Orçamento (Painel Flutuante Estilo Alerta)
    const botaoVer = document.createElement("button");
    botaoVer.textContent = "Ver";
    botaoVer.className = "btn-ver";
    botaoVer.type = "button";
    botaoVer.style.cssText = "background-color: #17a2b8; color: white; padding: 6px 10px; margin-right: 5px; border: none; border-radius: 5px; cursor: pointer;";
    botaoVer.addEventListener("click", () => mostrarPainelDetalhesOrcamento(orc.orcamentoid));

    // Botão Editar Orçamento Completo
    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-editar";
    botaoEditar.type = "button";
    botaoEditar.addEventListener("click", () => carregarOrcamentoParaEdicao(orc.orcamentoid));

    // Botão Excluir Orçamento Completo
    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.addEventListener("click", () => excluirOrcamentoCompleto(orc.orcamentoid));

    const tdAcoes = linha.querySelector(".coluna-acoes");
    tdAcoes.appendChild(botaoVer);
    tdAcoes.appendChild(botaoEditar);
    tdAcoes.appendChild(botaoExcluir);

    tabelaGeral.appendChild(linha);
  });
}

// ==================== PAINEL FLUTUANTE (ESTILO ALERTA) COM ID DO ITEM ====================
async function mostrarPainelDetalhesOrcamento(orcamentoid) {
  const { data: orcData, error: orcError } = await supabaseClient
    .from("orcamento")
    .select("*, cliente ( nome_cliente )")
    .eq("orcamentoid", orcamentoid)
    .single();

  if (orcError || !orcData) {
    alert("Erro ao carregar detalhes do orçamento.");
    return;
  }

  const { data: itensData, error: itensError } = await supabaseClient
    .from("orcamento_item")
    .select("*, produto ( ds_produto )")
    .eq("orcamentoid", orcamentoid)
    .order("orcamentoitemid", { ascending: true });

  if (itensError) {
    alert("Erro ao carregar os itens do orçamento.");
    return;
  }

  const nomeCliente = orcData.cliente ? orcData.cliente.nome_cliente : orcData.clienteid;

  const painelAntigo = document.getElementById("painelDetalhesEmergencia");
  if (painelAntigo) painelAntigo.remove();

  const overlay = document.createElement("div");
  overlay.id = "painelDetalhesEmergencia";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  const card = document.createElement("div");
  card.style.cssText = `
    background: #ffffff;
    width: 680px;
    max-width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border-top: 5px solid #17a2b8;
    padding: 20px;
    font-family: Arial, sans-serif;
    position: relative;
  `;

  let linhasTabelaItens = "";
  if (itensData && itensData.length > 0) {
    itensData.forEach(item => {
      const nomeProd = item.produto ? item.produto.ds_produto : `ID: ${item.produtoid}`;
      linhasTabelaItens += `
        <tr>
          <td style="text-align: center;">${item.orcamentoitemid}</td>
          <td style="text-align: center;">${item.produtoid}</td>
          <td>${nomeProd}</td>
          <td style="text-align: center;">${item.qt_produto}</td>
          <td style="text-align: right;">R$ ${parseFloat(item.vl_unitario).toFixed(2)}</td>
          <td style="text-align: right;">R$ ${parseFloat(item.vl_total).toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    linhasTabelaItens = `<tr><td colspan="6" style="text-align: center;">Nenhum item cadastrado.</td></tr>`;
  }

  card.innerHTML = `
    <button type="button" id="fecharPainelDetalhes" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #666;">&times;</button>
    <h3 style="margin-top: 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">Detalhes do Orçamento #${orcData.orcamentoid}</h3>
    
    <div style="margin-bottom: 15px; font-size: 14px; color: #444; line-height: 1.6;">
      <div><strong>Cliente:</strong> ${nomeCliente}</div>
      <div><strong>Data do Orçamento:</strong> ${orcData.dt_orcamento || ""}</div>
      <div><strong>Data de Validade:</strong> ${orcData.dt_validade_orcamento || ""}</div>
      <div><strong>Valor Total Geral:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${parseFloat(orcData.vl_total_orcamento || 0).toFixed(2)}</span></div>
    </div>

    <h4 style="margin-bottom: 8px; color: #555;">Itens do Orçamento:</h4>
    <table>
      <thead>
        <tr>
          <th>ID Item</th>
          <th>ID Prod</th>
          <th>Produto</th>
          <th>Qtd</th>
          <th>Vlr. Unit</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${linhasTabelaItens}
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: right;">
      <button type="button" id="btnOkPainel" class="btn-limpar" style="padding: 8px 20px;">Fechar</button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  document.getElementById("fecharPainelDetalhes").addEventListener("click", () => overlay.remove());
  document.getElementById("btnOkPainel").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ==================== CARREGAR ORÇAMENTO PARA EDIÇÃO ====================
async function carregarOrcamentoParaEdicao(orcamentoid) {
  const { data: orcData, error: orcError } = await supabaseClient
    .from("orcamento")
    .select("*")
    .eq("orcamentoid", orcamentoid)
    .single();

  if (orcError || !orcData) {
    alert("Erro ao carregar dados do orçamento para edição.");
    return;
  }

  const { data: itensData, error: itensError } = await supabaseClient
    .from("orcamento_item")
    .select(`
      orcamentoitemid,
      produtoid,
      qt_produto,
      vl_unitario,
      vl_total,
      produto ( ds_produto )
    `)
    .eq("orcamentoid", orcamentoid)
    .order("orcamentoitemid", { ascending: true });

  if (itensError) {
    alert("Erro ao carregar os itens do orçamento.");
    return;
  }

  modoEdicaoOrcamento = true;
  telaTabela.style.display = "none";
  telaCadastro.style.display = "block";

  orcamentoIdInput.value = orcData.orcamentoid;
  clienteIdInput.value = orcData.clienteid || "";
  dtOrcamentoInput.value = orcData.dt_orcamento || "";
  dtValidadeOrcamentoInput.value = orcData.dt_validade_orcamento || "";
  vlTotalOrcamentoInput.value = orcData.vl_total_orcamento || "0.00";

  carrinhoItens = [];
  if (itensData && itensData.length > 0) {
    itensData.forEach((item, idx) => {
      carrinhoItens.push({
        orcamentoitemid: item.orcamentoitemid || (idx + 1),
        produtoid: item.produtoid,
        nome_produto: item.produto ? item.produto.ds_produto : "Produto",
        qt_produto: parseFloat(item.qt_produto) || 0,
        vl_unitario: parseFloat(item.vl_unitario) || 0,
        vl_total: parseFloat(item.vl_total) || 0
      });
    });
  }

  contadorItem = carrinhoItens.length + 1;
  orcamentoItemIdInput.value = contadorItem;
  indiceEditando = -1;
  btnAddItem.textContent = "Adicionar Item";

  atualizarTabelaCarrinho();
  recalcularValorTotalOrcamento();
  mensagemGeral.textContent = "";
}

// ==================== EXCLUIR ORÇAMENTO ====================
async function excluirOrcamentoCompleto(orcamentoid) {
  if (!confirm("Deseja excluir este orçamento e seus itens?")) return;

  await supabaseClient.from("orcamento_item").delete().eq("orcamentoid", orcamentoid);
  const { error } = await supabaseClient.from("orcamento").delete().eq("orcamentoid", orcamentoid);

  if (error) {
    mensagemTabela.textContent = "Erro ao excluir: " + error.message;
    mensagemTabela.className = "mensagem erro";
    return;
  }

  mensagemTabela.textContent = "Excluído com sucesso!";
  mensagemTabela.className = "mensagem sucesso";
  carregarTabelaGeral();
}

// Inicializações da página
carregarClientes();
carregarProdutosSelect();
definirDataHoje();
carregarTabelaGeral();
carregarProximoOrcamentoId();
orcamentoItemIdInput.value = contadorItem;
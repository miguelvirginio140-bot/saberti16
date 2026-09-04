const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);  

const formOrcamento = document.getElementById("formOrcamento");
const tabelaOrcamentos = document.getElementById("tabelaOrcamentos");
const mensagem = document.getElementById("mensagem");

const orcamentoIdInput = document.getElementById("orcamentoid");
const clienteIdInput = document.getElementById("clienteid");
const dtOrcamentoInput = document.getElementById("dt_orcamento");
const dtValidadeOrcamentoInput = document.getElementById("dt_validade_orcamento");
const vlTotalOrcamentoInput = document.getElementById("vl_total_orcamento");

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

async function carregarOrcamentos() {

  const { data, error } = await supabaseClient
    .from("orcamento")
    .select("orcamentoid, clienteid, dt_orcamento, dt_validade_orcamento, vl_total_orcamento")
    .order("orcamentoid", { ascending: true });

  if (error) {
    tabelaOrcamentos.innerHTML = `
      <tr>
        <td colspan="6">Erro ao carregar orçamentos.</td>
      </tr>
    `;

    mostrarMensagem("Erro ao buscar orçamentos: " + error.message, "erro");
    return;
  }

  if (data.length === 0) {
    tabelaOrcamentos.innerHTML = `
      <tr>
        <td colspan="6">Nenhum orçamento cadastrado.</td>
      </tr>
    `;
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

    botaoEditar.addEventListener("click", function() {
      prepararEdicao(orcamento);
    });

    const botaoExcluir = document.createElement("button");

    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", function() {
      excluirOrcamento(orcamento);
    });

    linha.querySelector(".coluna-acoes").appendChild(botaoEditar);
    linha.querySelector(".coluna-acoes").appendChild(botaoExcluir);

    tabelaOrcamentos.appendChild(linha);
  });
}

function prepararEdicao(orcamento) {

  orcamentoIdInput.value = orcamento.orcamentoid;
  clienteIdInput.value = orcamento.clienteid;
  dtOrcamentoInput.value = orcamento.dt_orcamento;
  dtValidadeOrcamentoInput.value = orcamento.dt_validade_orcamento;
  vlTotalOrcamentoInput.value = orcamento.vl_total_orcamento;

  // Trava o ID do orçamento para não ser alterado durante a edição na chave primária
  orcamentoIdInput.disabled = true;
  clienteIdInput.disabled = true;

  btnSalvar.textContent = "Atualizar";

  btnCancelarEdicao.style.display = "inline-block";

  mostrarMensagem("Editando o orçamento ID: " + orcamento.orcamentoid, "sucesso");
}

function cancelarEdicao() {

  formOrcamento.reset();

  orcamentoIdInput.disabled = false;
  clienteIdInput.disabled = false;

  btnSalvar.textContent = "Salvar";

  btnCancelarEdicao.style.display = "none";

  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function salvarOrcamento() {

  const novoOrcamento = {
    orcamentoid: orcamentoIdInput.value,
    clienteid: clienteIdInput.value,
    dt_orcamento: dtOrcamentoInput.value,
    dt_validade_orcamento: dtValidadeOrcamentoInput.value,
    vl_total_orcamento: vlTotalOrcamentoInput.value
  };

  const { error } = await supabaseClient
    .from("orcamento")
    .insert(novoOrcamento);

  if (error) {
    mostrarMensagem("Erro ao salvar orçamento: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Orçamento salvo com sucesso!", "sucesso");

  formOrcamento.reset();

  carregarOrcamentos();
}

async function atualizarOrcamento() {

  const orcamentoId = orcamentoIdInput.value;

  const orcamentoAtualizado = {
    dt_orcamento: dtOrcamentoInput.value,
    dt_validade_orcamento: dtValidadeOrcamentoInput.value,
    vl_total_orcamento: vlTotalOrcamentoInput.value
  };

  const { error } = await supabaseClient
    .from("orcamento")
    .update(orcamentoAtualizado)
    .eq("orcamentoid", orcamentoId);

  if (error) {
    mostrarMensagem("Erro ao atualizar orçamento: " + error.message, "erro");
    return;
  }

  mostrarMensagem("Orçamento atualizado com sucesso!", "sucesso");

  cancelarEdicao();

  carregarOrcamentos();
}

async function excluirOrcamento(orcamento) {

  const confirmou = confirm(
    "Tem certeza que deseja excluir o orçamento ID " + orcamento.orcamentoid + "?"
  );

  if (!confirmou) {
    return;
  }

  const { error } = await supabaseClient
    .from("orcamento")
    .delete()
    .eq("orcamentoid", orcamento.orcamentoid);

  if (error) {
    mostrarMensagem("Erro ao excluir orçamento: " + error.message, "erro");
    return;
  }

  if (orcamentoIdInput.value == orcamento.orcamentoid) {
    cancelarEdicao();
  }

  mostrarMensagem("Excluído com sucesso!", "sucesso");

  carregarOrcamentos();
}

formOrcamento.addEventListener("submit", async function(evento) {

  evento.preventDefault();

  const estaEditando = orcamentoIdInput.disabled; // Se estiver travado, é sinal de edição

  if (estaEditando) {
    await atualizarOrcamento();
  } else {
    await salvarOrcamento();
  }
});

btnCancelarEdicao.addEventListener("click", function() {
  cancelarEdicao();
});

carregarOrcamentos();
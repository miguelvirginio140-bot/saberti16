// =========================================================
// CONFIGURAÇÃO SUPABASE
// =========================================================

const SUPABASE_URL = "https://hbedlnqymzpwgdcmjzfp.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// =========================================================
// ELEMENTOS
// =========================================================

const formCliente =
  document.getElementById("formCliente");

const tabelaClientes =
  document.getElementById("tabelaClientes");

const mensagem =
  document.getElementById("mensagem");


const clienteIdInput =
  document.getElementById("clienteId");

const tipoClienteInput =
  document.getElementById("tipoCliente");

const cpfCnpjClienteInput =
  document.getElementById("cpfCnpjCliente");

const nomeClienteInput =
  document.getElementById("nomeCliente");


const btnSalvar =
  document.getElementById("btnSalvar");

const btnCancelarEdicao =
  document.getElementById("btnCancelarEdicao");

const btnVoltar =
  document.getElementById("voltar");


// =========================================================
// ELEMENTOS DA PESQUISA
// =========================================================

const pesquisaCliente =
  document.getElementById("pesquisaCliente");

const filtroCliente =
  document.getElementById("filtroCliente");

const limparPesquisaCliente =
  document.getElementById("limparPesquisaCliente");


// =========================================================
// VOLTAR AO MENU
// =========================================================

btnVoltar.addEventListener(
  "click",
  function () {

    window.location.href =
      "/menu/menuindex.html";

  }
);


// =========================================================
// MENSAGEM
// =========================================================

function mostrarMensagem(texto, tipo) {

  mensagem.textContent = texto;

  mensagem.className =
    "mensagem " + tipo;

}


// =========================================================
// FORMATAR TIPO DO CLIENTE
// =========================================================

function formatarTipoCliente(tipoCliente) {

  if (tipoCliente === "F") {

    return "Pessoa Física";

  }


  if (tipoCliente === "J") {

    return "Pessoa Jurídica";

  }


  return "Não informado";

}


// =========================================================
// BUSCAR PRÓXIMO CLIENTE ID
// =========================================================

async function carregarProximoClienteId() {

  const { data, error } =
    await supabaseClient

      .from("cliente")

      .select("clienteid")

      .order(
        "clienteid",
        {
          ascending: false
        }
      )

      .limit(1);


  if (error) {

    console.error(
      "Erro ao buscar próximo clienteid:",
      error.message
    );

    clienteIdInput.value = "1";

    return;

  }


  if (
    data &&
    data.length > 0
  ) {

    const ultimoId =
      parseInt(data[0].clienteid) || 0;


    clienteIdInput.value =
      ultimoId + 1;

  } else {

    clienteIdInput.value = 1;

  }

}


// =========================================================
// CARREGAR CLIENTES
// =========================================================

async function carregarClientes() {

  const { data, error } =
    await supabaseClient

      .from("cliente")

      .select(
        "clienteid, tipo_cliente, cpf_cnpj_cliente, nome_cliente"
      )

      .order(
        "clienteid",
        {
          ascending: true
        }
      );


  // =======================================================
  // ERRO
  // =======================================================

  if (error) {

    console.error(
      "Erro ao carregar clientes:",
      error.message
    );


    tabelaClientes.innerHTML = `

      <tr>

        <td
          colspan="5"
          style="text-align: center;"
        >
          Erro ao carregar clientes.
        </td>

      </tr>

    `;


    mostrarMensagem(
      "Erro ao buscar clientes: " +
      error.message,
      "erro"
    );


    return;

  }


  // =======================================================
  // NENHUM CLIENTE
  // =======================================================

  if (
    !data ||
    data.length === 0
  ) {

    tabelaClientes.innerHTML = `

      <tr>

        <td
          colspan="5"
          style="text-align: center;"
        >
          Nenhum cliente cadastrado.
        </td>

      </tr>

    `;


    return;

  }


  // =======================================================
  // LIMPAR TABELA
  // =======================================================

  tabelaClientes.innerHTML = "";


  // =======================================================
  // CRIAR LINHAS
  // =======================================================

  data.forEach(
    function (cliente) {

      const linha =
        document.createElement("tr");


      linha.innerHTML = `

        <td
          style="text-align: center;"
        >
          ${cliente.clienteid}
        </td>


        <td>
          ${formatarTipoCliente(
            cliente.tipo_cliente
          )}
        </td>


        <td>
          ${cliente.cpf_cnpj_cliente || ""}
        </td>


        <td>
          ${cliente.nome_cliente || ""}
        </td>


        <td
          class="coluna-acoes"
          style="
            text-align: center;
            white-space: nowrap;
          "
        ></td>

      `;


      // =====================================================
      // BOTÃO EDITAR
      // =====================================================

      const botaoEditar =
        document.createElement("button");


      botaoEditar.textContent =
        "Editar";


      botaoEditar.className =
        "btn-editar";


      botaoEditar.type =
        "button";


      botaoEditar.addEventListener(
        "click",
        function () {

          prepararEdicao(cliente);

        }
      );


      // =====================================================
      // BOTÃO EXCLUIR
      // =====================================================

      const botaoExcluir =
        document.createElement("button");


      botaoExcluir.textContent =
        "Excluir";


      botaoExcluir.className =
        "btn-excluir";


      botaoExcluir.type =
        "button";


      botaoExcluir.addEventListener(
        "click",
        function () {

          excluirCliente(cliente);

        }
      );


      // =====================================================
      // ADICIONAR BOTÕES
      // =====================================================

      const colunaAcoes =
        linha.querySelector(
          ".coluna-acoes"
        );


      colunaAcoes.appendChild(
        botaoEditar
      );


      colunaAcoes.appendChild(
        botaoExcluir
      );


      // =====================================================
      // ADICIONAR LINHA
      // =====================================================

      tabelaClientes.appendChild(
        linha
      );

    }
  );


  // =======================================================
  // APLICAR PESQUISA ATUAL
  // =======================================================

  pesquisarClientes();

}


// =========================================================
// PREPARAR EDIÇÃO
// =========================================================

function prepararEdicao(cliente) {

  clienteIdInput.value =
    cliente.clienteid;


  tipoClienteInput.value =
    cliente.tipo_cliente;


  cpfCnpjClienteInput.value =
    cliente.cpf_cnpj_cliente;


  nomeClienteInput.value =
    cliente.nome_cliente;


  // =======================================================
  // BLOQUEAR TIPO
  // =======================================================

  tipoClienteInput.disabled =
    true;


  // =======================================================
  // BLOQUEAR CPF/CNPJ
  // =======================================================

  cpfCnpjClienteInput.readOnly =
    true;


  // =======================================================
  // ALTERAR BOTÃO
  // =======================================================

  btnSalvar.textContent =
    "Atualizar";


  btnCancelarEdicao.style.display =
    "inline-block";


  mostrarMensagem(
    "Editando o cliente: " +
    cliente.nome_cliente,
    "sucesso"
  );

}


// =========================================================
// CANCELAR EDIÇÃO
// =========================================================

function cancelarEdicao() {

  formCliente.reset();


  tipoClienteInput.disabled =
    false;


  cpfCnpjClienteInput.readOnly =
    false;


  btnSalvar.textContent =
    "Salvar";


  btnCancelarEdicao.style.display =
    "none";


  mensagem.textContent =
    "";


  mensagem.className =
    "mensagem";


  carregarProximoClienteId();

}


// =========================================================
// SALVAR CLIENTE
// =========================================================

async function salvarCliente() {

  const tipoCliente =
    tipoClienteInput.value;


  const cpfCnpjCliente =
    cpfCnpjClienteInput.value.trim();


  const nomeCliente =
    nomeClienteInput.value.trim();


  // =======================================================
  // OBJETO
  // =======================================================

  const novoCliente = {

    tipo_cliente:
      tipoCliente,

    cpf_cnpj_cliente:
      cpfCnpjCliente,

    nome_cliente:
      nomeCliente

  };


  // =======================================================
  // INSERT
  // =======================================================

  const { error } =
    await supabaseClient

      .from("cliente")

      .insert(
        novoCliente
      );


  // =======================================================
  // ERRO
  // =======================================================

  if (error) {

    console.error(
      "Erro ao salvar cliente:",
      error.message
    );


    mostrarMensagem(
      "Erro ao salvar cliente: " +
      error.message,
      "erro"
    );


    return;

  }


  // =======================================================
  // SUCESSO
  // =======================================================

  mostrarMensagem(
    "Cliente salvo com sucesso!",
    "sucesso"
  );


  formCliente.reset();


  await carregarClientes();


  await carregarProximoClienteId();

}


// =========================================================
// ATUALIZAR CLIENTE
// =========================================================

async function atualizarNomeCliente() {

  const clienteId =
    clienteIdInput.value;


  const nomeCliente =
    nomeClienteInput.value.trim();


  // =======================================================
  // UPDATE
  // =======================================================

  const { error } =
    await supabaseClient

      .from("cliente")

      .update({

        nome_cliente:
          nomeCliente

      })

      .eq(
        "clienteid",
        clienteId
      );


  // =======================================================
  // ERRO
  // =======================================================

  if (error) {

    mostrarMensagem(
      "Erro ao atualizar cliente: " +
      error.message,
      "erro"
    );


    return;

  }


  // =======================================================
  // SUCESSO
  // =======================================================

  mostrarMensagem(
    "Nome atualizado com sucesso!",
    "sucesso"
  );


  cancelarEdicao();


  await carregarClientes();


  await carregarProximoClienteId();

}


// =========================================================
// EXCLUIR CLIENTE
// =========================================================

async function excluirCliente(cliente) {

  const confirmou =
    confirm(
      "Tem certeza que deseja excluir o cliente " +
      cliente.nome_cliente +
      "?"
    );


  if (!confirmou) {

    return;

  }


  // =======================================================
  // DELETE
  // =======================================================

  const { error } =
    await supabaseClient

      .from("cliente")

      .delete()

      .eq(
        "clienteid",
        cliente.clienteid
      );


  // =======================================================
  // ERRO
  // =======================================================

  if (error) {

    mostrarMensagem(
      "Erro ao excluir cliente: " +
      error.message,
      "erro"
    );


    return;

  }


  // =======================================================
  // SE ESTIVER EDITANDO ESTE CLIENTE
  // =======================================================

  if (
    clienteIdInput.value ==
    cliente.clienteid
  ) {

    cancelarEdicao();

  }


  // =======================================================
  // SUCESSO
  // =======================================================

  mostrarMensagem(
    "Cliente excluído com sucesso!",
    "sucesso"
  );


  await carregarClientes();


  await carregarProximoClienteId();

}


// =========================================================
// SUBMIT DO FORMULÁRIO
// =========================================================

formCliente.addEventListener(
  "submit",
  async function (evento) {

    evento.preventDefault();


    const estaEditando =
      clienteIdInput.value !== "" &&
      btnSalvar.textContent ===
      "Atualizar";


    if (estaEditando) {

      await atualizarNomeCliente();

    } else {

      await salvarCliente();

    }

  }
);


// =========================================================
// CANCELAR EDIÇÃO
// =========================================================

btnCancelarEdicao.addEventListener(
  "click",
  function () {

    cancelarEdicao();

  }
);


// =========================================================
// PESQUISAR CLIENTES
// =========================================================

function pesquisarClientes() {

  const texto =
    pesquisaCliente.value
      .toLowerCase()
      .trim();


  const filtro =
    filtroCliente.value;


  const linhas =
    tabelaClientes.querySelectorAll("tr");


  linhas.forEach(
    function (linha) {

      const celulas =
        linha.querySelectorAll("td");


      // Ignora linhas de mensagem
      if (
        celulas.length < 5
      ) {

        return;

      }


      let valor = "";


      // ===================================================
      // TODOS OS CAMPOS
      // ===================================================

      if (
        filtro === "todos"
      ) {

        valor =
          Array.from(celulas)

            .slice(0, 4)

            .map(
              function (td) {

                return td.textContent;

              }
            )

            .join(" ")

            .toLowerCase();

      }


      // ===================================================
      // FILTRO ESPECÍFICO
      // ===================================================

      else {

        const colunas = {

          clienteid: 0,

          tipo_cliente: 1,

          cpf_cnpj_cliente: 2,

          nome_cliente: 3

        };


        const indice =
          colunas[filtro];


        if (
          indice !== undefined &&
          celulas[indice]
        ) {

          valor =
            celulas[indice]
              .textContent
              .toLowerCase();

        }

      }


      // ===================================================
      // MOSTRAR / ESCONDER
      // ===================================================

      if (
        valor.includes(texto)
      ) {

        linha.style.display =
          "";

      } else {

        linha.style.display =
          "none";

      }

    }
  );

}


// =========================================================
// EVENTO DA PESQUISA
// =========================================================

pesquisaCliente.addEventListener(
  "input",
  function () {

    pesquisarClientes();

  }
);


// =========================================================
// EVENTO DO FILTRO
// =========================================================

filtroCliente.addEventListener(
  "change",
  function () {

    pesquisarClientes();

  }
);


// =========================================================
// LIMPAR PESQUISA
// =========================================================

limparPesquisaCliente.addEventListener(
  "click",
  function () {

    pesquisaCliente.value =
      "";


    filtroCliente.value =
      "todos";


    pesquisarClientes();


    pesquisaCliente.focus();

  }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

carregarClientes();


carregarProximoClienteId();

// =========================================================
// CONFIGURAÇÃO SUPABASE
// =========================================================

const SUPABASE_URL =
  "https://hbedlnqymzpwgdcmjzfp.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_E2eocS-DFipYaYFjSnMe3Q_qE294rJJ";


const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// =========================================================
// ELEMENTOS DE CONTROLE DE TELA
// =========================================================

const telaTabela =
  document.getElementById("telaTabela");

const telaCadastro =
  document.getElementById("telaCadastro");


const btnNovoOrcamento =
  document.getElementById("btnNovoOrcamento");


const btnVoltarTela1 =
  document.getElementById("btnVoltarTela1");


const btnLimparOrcamento =
  document.getElementById("btnLimparOrcamento");


const btnVoltarMenu =
  document.getElementById("voltar");


const mensagemTabela =
  document.getElementById("mensagemTabela");


// =========================================================
// ELEMENTOS DA PESQUISA
// =========================================================

const pesquisaOrcamento =
  document.getElementById("pesquisaOrcamento");


const btnLimparPesquisa =
  document.getElementById("btnLimparPesquisa");


const filtroPesquisa =
  document.getElementById("filtroPesquisa");


// =========================================================
// ELEMENTOS DO FORMULÁRIO
// =========================================================

const formOrcamentoGeral =
  document.getElementById(
    "formOrcamentoGeral"
  );


const mensagemGeral =
  document.getElementById(
    "mensagemGeral"
  );


const orcamentoIdInput =
  document.getElementById(
    "orcamentoid"
  );


const clienteIdInput =
  document.getElementById(
    "clienteid"
  );


const dtOrcamentoInput =
  document.getElementById(
    "dt_orcamento"
  );


const dtValidadeOrcamentoInput =
  document.getElementById(
    "dt_validade_orcamento"
  );


const vlTotalOrcamentoInput =
  document.getElementById(
    "vl_total_orcamento"
  );


const orcamentoItemIdInput =
  document.getElementById(
    "orcamentoitemid"
  );


const produtoIdInput =
  document.getElementById(
    "produtoid"
  );


const qtProdutoInput =
  document.getElementById(
    "qt_produto"
  );


const vlUnitarioInput =
  document.getElementById(
    "vl_unitario"
  );


const vlTotalInput =
  document.getElementById(
    "vl_total"
  );


const btnAddItem =
  document.getElementById(
    "btnAddItem"
  );


const corpoTabelaCarrinho =
  document.getElementById(
    "corpoTabelaCarrinho"
  );


const tabelaGeral =
  document.getElementById(
    "tabelaGeral"
  );


// =========================================================
// VARIÁVEIS
// =========================================================

let carrinhoItens = [];

let contadorItem = 1;

let indiceEditando = -1;

let modoEdicaoOrcamento = false;


// =========================================================
// NAVEGAÇÃO
// =========================================================

btnNovoOrcamento.addEventListener(
  "click",
  function () {

    telaTabela.style.display =
      "none";

    telaCadastro.style.display =
      "block";

    limparEAtualizarTelaCadastro();

  }
);


btnVoltarTela1.addEventListener(
  "click",
  function () {

    telaCadastro.style.display =
      "none";

    telaTabela.style.display =
      "block";

    carregarTabelaGeral();

  }
);


btnLimparOrcamento.addEventListener(
  "click",
  function () {

    if (
      confirm(
        "Deseja realmente limpar todos os dados e produtos deste orçamento?"
      )
    ) {

      limparEAtualizarTelaCadastro();

    }

  }
);


btnVoltarMenu.addEventListener(
  "click",
  function () {

    window.location.href =
      "/menu/menuindex.html";

  }
);


// =========================================================
// PESQUISA
// =========================================================

function normalizarTexto(texto) {

  return String(texto ?? "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


// =========================================================
// NORMALIZAR VALOR
// =========================================================

function normalizarValor(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return normalizarTexto(valor);

}


// =========================================================
// FORMATAR DATA PARA PESQUISA
// =========================================================

function formatarDataPesquisa(data) {

  if (!data) {

    return "";

  }


  const texto =
    String(data);


  if (
    /^\d{4}-\d{2}-\d{2}$/.test(texto)
  ) {

    const partes =
      texto.split("-");


    return normalizarTexto(
      `${partes[2]}/${partes[1]}/${partes[0]}`
    );

  }


  return normalizarTexto(texto);

}


// =========================================================
// MENSAGEM DA PESQUISA
// =========================================================

function obterMensagemPesquisa() {

  let mensagemPesquisa =
    document.getElementById(
      "mensagemPesquisa"
    );


  if (!mensagemPesquisa) {

    mensagemPesquisa =
      document.createElement(
        "div"
      );


    mensagemPesquisa.id =
      "mensagemPesquisa";


    mensagemPesquisa.className =
      "mensagem-pesquisa";


    const tabelaContainer =
      document.querySelector(
        "#telaTabela .tabela-container"
      );


    if (tabelaContainer) {

      tabelaContainer.parentNode.insertBefore(
        mensagemPesquisa,
        tabelaContainer
      );

    }

  }


  return mensagemPesquisa;

}


// =========================================================
// PESQUISA PRINCIPAL
// =========================================================

function filtrarTabelaOrcamentos() {

  const termo =
    normalizarTexto(
      pesquisaOrcamento.value
    );


  const filtro =
    filtroPesquisa.value;


  const linhas =
    tabelaGeral.querySelectorAll(
      "tr[data-pesquisa='true']"
    );


  let quantidadeEncontrada = 0;


  linhas.forEach(
    function (linha) {

      let encontrou = false;


      // ===================================================
      // SEM TEXTO
      // ===================================================

      if (termo === "") {

        encontrou = true;

      }


      // ===================================================
      // TODOS OS CAMPOS
      // ===================================================

      else if (filtro === "") {

        const campos = [

          linha.dataset.orcamentoid,

          linha.dataset.clienteid,

          linha.dataset.dtOrcamento,

          linha.dataset.dtValidade,

          linha.dataset.valorTotal

        ];


        encontrou =
          campos.some(
            function (campo) {

              return normalizarValor(
                campo
              ).startsWith(
                termo
              );

            }
          );


        // Pesquisa de data em DD/MM/AAAA

        if (!encontrou) {

          const dataOrcamento =
            formatarDataPesquisa(
              linha.dataset.dtOrcamento
            );


          const dataValidade =
            formatarDataPesquisa(
              linha.dataset.dtValidade
            );


          encontrou =
            dataOrcamento.startsWith(
              termo
            ) ||
            dataValidade.startsWith(
              termo
            );

        }

      }


      // ===================================================
      // CAMPO ESPECÍFICO
      // ===================================================

      else {

        let valorCampo = "";


        switch (filtro) {

          case "orcamentoid":

            valorCampo =
              linha.dataset.orcamentoid;

            break;


          case "clienteid":

            valorCampo =
              linha.dataset.clienteid;

            break;


          case "dt_orcamento":

            valorCampo =
              linha.dataset.dtOrcamento;

            break;


          case "dt_validade_orcamento":

            valorCampo =
              linha.dataset.dtValidade;

            break;


          case "vl_total_orcamento":

            valorCampo =
              linha.dataset.valorTotal;

            break;

        }


        encontrou =
          normalizarValor(
            valorCampo
          ).startsWith(
            termo
          );


        // Pesquisa de data em DD/MM/AAAA

        if (
          !encontrou &&
          (
            filtro === "dt_orcamento" ||
            filtro === "dt_validade_orcamento"
          )
        ) {

          valorCampo =
            formatarDataPesquisa(
              valorCampo
            );


          encontrou =
            valorCampo.startsWith(
              termo
            );

        }

      }


      // ===================================================
      // MOSTRAR / ESCONDER
      // ===================================================

      if (encontrou) {

        linha.style.display =
          "";

        quantidadeEncontrada++;

      } else {

        linha.style.display =
          "none";

      }

    }
  );


  // =====================================================
  // MENSAGEM
  // =====================================================

  const mensagemPesquisa =
    obterMensagemPesquisa();


  if (
    mensagemPesquisa
  ) {

    if (
      termo !== "" &&
      quantidadeEncontrada === 0
    ) {

      mensagemPesquisa.textContent =
        "Nenhum orçamento encontrado para a pesquisa.";


      mensagemPesquisa.style.display =
        "block";

    } else {

      mensagemPesquisa.textContent =
        "";


      mensagemPesquisa.style.display =
        "none";

    }

  }

}


// =========================================================
// PESQUISA ENQUANTO DIGITA
// =========================================================

pesquisaOrcamento.addEventListener(
  "input",
  function () {

    filtrarTabelaOrcamentos();

  }
);


// =========================================================
// ALTERAR CAMPO DE PESQUISA
// =========================================================

filtroPesquisa.addEventListener(
  "change",
  function () {

    filtrarTabelaOrcamentos();

    pesquisaOrcamento.focus();

  }
);


// =========================================================
// BOTÃO LIMPAR PESQUISA
// =========================================================

btnLimparPesquisa.addEventListener(
  "click",
  function () {

    pesquisaOrcamento.value =
      "";

    filtroPesquisa.value =
      "";

    filtrarTabelaOrcamentos();

    pesquisaOrcamento.focus();

  }
);


// =========================================================
// DATA DE HOJE
// =========================================================

function definirDataHoje() {

  const hoje =
    new Date()
      .toISOString()
      .split("T")[0];


  dtOrcamentoInput.value =
    hoje;

}


// =========================================================
// LIMPAR TELA DE CADASTRO
// =========================================================

function limparEAtualizarTelaCadastro() {

  formOrcamentoGeral.reset();


  definirDataHoje();


  carrinhoItens = [];


  contadorItem = 1;


  indiceEditando = -1;


  modoEdicaoOrcamento = false;


  orcamentoItemIdInput.value =
    contadorItem;


  btnAddItem.textContent =
    "Adicionar Item";


  atualizarTabelaCarrinho();


  vlTotalOrcamentoInput.value =
    "0.00";


  mensagemGeral.textContent =
    "";


  carregarProximoOrcamentoId();

}


// =========================================================
// PRÓXIMO CÓDIGO DO ORÇAMENTO
// =========================================================

async function carregarProximoOrcamentoId() {

  if (modoEdicaoOrcamento) {

    return;

  }


  const {
    data,
    error
  } = await supabaseClient

    .from("orcamento")

    .select("orcamentoid")

    .order(
      "orcamentoid",
      {
        ascending: false
      }
    )

    .limit(1);


  if (error) {

    console.error(
      "Erro ao buscar próximo orcamentoid:",
      error.message
    );


    orcamentoIdInput.value =
      "1";


    return;

  }


  if (
    data &&
    data.length > 0
  ) {

    const ultimoId =
      parseInt(
        data[0].orcamentoid
      ) || 0;


    orcamentoIdInput.value =
      ultimoId + 1;

  } else {

    orcamentoIdInput.value =
      1;

  }

}


// =========================================================
// CARREGAR CLIENTES
// =========================================================

async function carregarClientes() {

  const {
    data,
    error
  } = await supabaseClient

    .from("cliente")

    .select(
      "clienteid, nome_cliente"
    )

    .order(
      "clienteid",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "Erro ao carregar clientes:",
      error.message
    );


    clienteIdInput.innerHTML =
      '<option value="">Erro ao carregar clientes</option>';


    return;

  }


  clienteIdInput.innerHTML =
    '<option value="">Selecione um cliente...</option>';


  data.forEach(
    function (cliente) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        cliente.clienteid;


      option.textContent =
        `${cliente.clienteid} - ${
          cliente.nome_cliente ||
          "Cliente"
        }`;


      clienteIdInput.appendChild(
        option
      );

    }
  );

}


// =========================================================
// CARREGAR PRODUTOS
// =========================================================

async function carregarProdutosSelect() {

  const {
    data,
    error
  } = await supabaseClient

    .from("produto")

    .select(
      "produtoid, ds_produto, vl_venda_produto"
    )

    .order(
      "produtoid",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "Erro ao carregar produtos:",
      error.message
    );


    produtoIdInput.innerHTML =
      '<option value="">Erro ao carregar produtos</option>';


    return;

  }


  produtoIdInput.innerHTML =
    '<option value="">Selecione um produto...</option>';


  data.forEach(
    function (prod) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        prod.produtoid;


      option.dataset.unitario =
        prod.vl_venda_produto || 0;


      option.dataset.descricao =
        prod.ds_produto || "Produto";


      option.textContent =
        `${prod.ds_produto || "Produto"} (ID: ${prod.produtoid})`;


      produtoIdInput.appendChild(
        option
      );

    }
  );

}


// =========================================================
// SELEÇÃO DO PRODUTO
// =========================================================

produtoIdInput.addEventListener(
  "change",
  function () {

    const selectedOption =
      produtoIdInput.options[
        produtoIdInput.selectedIndex
      ];


    if (
      selectedOption &&
      selectedOption.value
    ) {

      vlUnitarioInput.value =
        selectedOption.dataset.unitario ||
        0;


      calcularTotalItem();

    } else {

      vlUnitarioInput.value =
        "";

      vlTotalInput.value =
        "";

    }

  }
);


// =========================================================
// CALCULAR TOTAL DO ITEM
// =========================================================

function calcularTotalItem() {

  const qt =
    parseFloat(
      qtProdutoInput.value
    ) || 0;


  const unitario =
    parseFloat(
      vlUnitarioInput.value
    ) || 0;


  vlTotalInput.value =
    (
      qt *
      unitario
    ).toFixed(2);

}


qtProdutoInput.addEventListener(
  "input",
  calcularTotalItem
);


// =========================================================
// ADICIONAR / EDITAR ITEM
// =========================================================

btnAddItem.addEventListener(
  "click",
  function () {

    const clienteVal =
      clienteIdInput.value;


    const dtValidadeVal =
      dtValidadeOrcamentoInput.value;


    const produtoIdVal =
      produtoIdInput.value;


    const qtVal =
      qtProdutoInput.value;


    if (
      !clienteVal ||
      !dtValidadeVal ||
      !produtoIdVal ||
      !qtVal
    ) {

      alert(
        "Preencha todos os campos obrigatórios: Cliente, Data de Validade, Produto e Quantidade antes de adicionar."
      );


      return;

    }


    const selectedOption =
      produtoIdInput.options[
        produtoIdInput.selectedIndex
      ];


    const nomeProduto =
      selectedOption
        ? selectedOption.dataset.descricao
        : "";


    if (
      indiceEditando > -1
    ) {

      carrinhoItens[
        indiceEditando
      ].produtoid =
        produtoIdVal;


      carrinhoItens[
        indiceEditando
      ].nome_produto =
        nomeProduto;


      carrinhoItens[
        indiceEditando
      ].qt_produto =
        parseFloat(qtVal);


      carrinhoItens[
        indiceEditando
      ].vl_unitario =
        parseFloat(
          vlUnitarioInput.value
        ) || 0;


      carrinhoItens[
        indiceEditando
      ].vl_total =
        parseFloat(
          vlTotalInput.value
        ) || 0;


      indiceEditando = -1;


      btnAddItem.textContent =
        "Adicionar Item";


      orcamentoItemIdInput.value =
        contadorItem;

    } else {

      const novoItem = {

        orcamentoitemid:
          contadorItem,

        produtoid:
          produtoIdVal,

        nome_produto:
          nomeProduto,

        qt_produto:
          parseFloat(qtVal),

        vl_unitario:
          parseFloat(
            vlUnitarioInput.value
          ) || 0,

        vl_total:
          parseFloat(
            vlTotalInput.value
          ) || 0

      };


      carrinhoItens.push(
        novoItem
      );


      contadorItem++;


      orcamentoItemIdInput.value =
        contadorItem;

    }


    atualizarTabelaCarrinho();


    recalcularValorTotalOrcamento();


    produtoIdInput.value =
      "";


    qtProdutoInput.value =
      "";


    vlUnitarioInput.value =
      "";


    vlTotalInput.value =
      "";

  }
);


// =========================================================
// ATUALIZAR TABELA DE ITENS
// =========================================================

function atualizarTabelaCarrinho() {

  if (
    carrinhoItens.length === 0
  ) {

    corpoTabelaCarrinho.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="sem-itens"
        >
          Nenhum produto adicionado ainda.
        </td>

      </tr>

    `;


    return;

  }


  corpoTabelaCarrinho.innerHTML =
    "";


  carrinhoItens.forEach(
    function (item, index) {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${item.orcamentoitemid}
        </td>

        <td>
          ${item.produtoid}
        </td>

        <td>
          ${item.nome_produto}
        </td>

        <td>
          ${item.qt_produto}
        </td>

        <td>
          ${item.vl_unitario.toFixed(2)}
        </td>

        <td>
          ${item.vl_total.toFixed(2)}
        </td>

        <td class="coluna-acoes">

          <button
            type="button"
            class="btn-editar"
            onclick="editarItemCarrinho(${index})"
          >
            Editar
          </button>


          <button
            type="button"
            class="btn-excluir"
            onclick="removerItemCarrinho(${index})"
          >
            Remover
          </button>

        </td>

      `;


      corpoTabelaCarrinho.appendChild(
        tr
      );

    }
  );

}


// =========================================================
// EDITAR ITEM
// =========================================================

window.editarItemCarrinho =
  function (index) {

    const item =
      carrinhoItens[index];


    indiceEditando =
      index;


    orcamentoItemIdInput.value =
      item.orcamentoitemid;


    produtoIdInput.value =
      item.produtoid;


    qtProdutoInput.value =
      item.qt_produto;


    vlUnitarioInput.value =
      item.vl_unitario;


    vlTotalInput.value =
      item.vl_total.toFixed(2);


    btnAddItem.textContent =
      "Salvar Edição do Item";

  };


// =========================================================
// REMOVER ITEM
// =========================================================

window.removerItemCarrinho =
  function (index) {

    if (
      indiceEditando === index
    ) {

      indiceEditando = -1;


      btnAddItem.textContent =
        "Adicionar Item";


      orcamentoItemIdInput.value =
        carrinhoItens.length > 0
          ? carrinhoItens.length + 1
          : 1;


      produtoIdInput.value =
        "";


      qtProdutoInput.value =
        "";


      vlUnitarioInput.value =
        "";


      vlTotalInput.value =
        "";

    } else if (
      indiceEditando > index
    ) {

      indiceEditando--;

    }


    carrinhoItens.splice(
      index,
      1
    );


    carrinhoItens.forEach(
      function (item, idx) {

        item.orcamentoitemid =
          idx + 1;

      }
    );


    if (
      indiceEditando === -1
    ) {

      contadorItem =
        carrinhoItens.length + 1;


      orcamentoItemIdInput.value =
        contadorItem;

    }


    atualizarTabelaCarrinho();


    recalcularValorTotalOrcamento();

  };


// =========================================================
// TOTAL DO ORÇAMENTO
// =========================================================

function recalcularValorTotalOrcamento() {

  const somaTotal =
    carrinhoItens.reduce(
      function (acc, item) {

        return acc +
          item.vl_total;

      },
      0
    );


  vlTotalOrcamentoInput.value =
    somaTotal.toFixed(2);

}


// =========================================================
// SALVAR / ATUALIZAR ORÇAMENTO
// =========================================================

formOrcamentoGeral.addEventListener(
  "submit",
  async function (evento) {

    evento.preventDefault();


    if (
      carrinhoItens.length === 0
    ) {

      alert(
        "Adicione pelo menos um produto ao orçamento antes de salvar."
      );


      return;

    }


    const orcamentoidAtual =
      parseInt(
        orcamentoIdInput.value
      );


    const dadosOrcamento = {

      orcamentoid:
        orcamentoidAtual,

      clienteid:
        clienteIdInput.value,

      dt_orcamento:
        dtOrcamentoInput.value,

      dt_validade_orcamento:
        dtValidadeOrcamentoInput.value,

      vl_total_orcamento:
        parseFloat(
          vlTotalOrcamentoInput.value
        ) || 0

    };


    if (
      modoEdicaoOrcamento
    ) {

      const {
        error: errorUpd
      } = await supabaseClient

        .from("orcamento")

        .update(
          dadosOrcamento
        )

        .eq(
          "orcamentoid",
          orcamentoidAtual
        );


      if (errorUpd) {

        mensagemGeral.textContent =
          "Erro ao atualizar orçamento: " +
          errorUpd.message;


        mensagemGeral.className =
          "mensagem erro";


        return;

      }


      const {
        error: errorDeleteItens
      } = await supabaseClient

        .from("orcamento_item")

        .delete()

        .eq(
          "orcamentoid",
          orcamentoidAtual
        );


      if (errorDeleteItens) {

        mensagemGeral.textContent =
          "Erro ao atualizar itens: " +
          errorDeleteItens.message;


        mensagemGeral.className =
          "mensagem erro";


        return;

      }

    } else {

      const {
        error: errorOrc
      } = await supabaseClient

        .from("orcamento")

        .insert(
          dadosOrcamento
        );


      if (errorOrc) {

        mensagemGeral.textContent =
          "Erro ao salvar orçamento: " +
          errorOrc.message;


        mensagemGeral.className =
          "mensagem erro";


        return;

      }

    }


    const itensParaSalvar =
      carrinhoItens.map(
        function (item) {

          return {

            orcamentoid:
              orcamentoidAtual,

            orcamentoitemid:
              item.orcamentoitemid,

            produtoid:
              item.produtoid,

            qt_produto:
              item.qt_produto,

            vl_unitario:
              item.vl_unitario,

            vl_total:
              item.vl_total

          };

        }
      );


    const {
      error: errorItens
    } = await supabaseClient

      .from("orcamento_item")

      .insert(
        itensParaSalvar
      );


    if (errorItens) {

      mensagemGeral.textContent =
        "Erro ao salvar itens: " +
        errorItens.message;


      mensagemGeral.className =
        "mensagem erro";


      return;

    }


    const estavaEditando =
      modoEdicaoOrcamento;


    telaCadastro.style.display =
      "none";


    telaTabela.style.display =
      "block";


    mensagemTabela.textContent =
      estavaEditando
        ? "Orçamento atualizado com sucesso!"
        : "Orçamento e itens salvos com sucesso!";


    mensagemTabela.className =
      "mensagem sucesso";


    carregarTabelaGeral();

  }
);


// =========================================================
// CARREGAR TABELA PRINCIPAL
// =========================================================

async function carregarTabelaGeral() {

  const {
    data: orcamentos,
    error: errorOrc
  } = await supabaseClient

    .from("orcamento")

    .select("*")

    .order(
      "orcamentoid",
      {
        ascending: true
      }
    );


  if (errorOrc) {

    tabelaGeral.innerHTML = `

      <tr>

        <td colspan="7">
          Erro ao carregar orçamentos.
        </td>

      </tr>

    `;


    return;

  }


  const {
    data: itens,
    error: errorItens
  } = await supabaseClient

    .from("orcamento_item")

    .select(
      "orcamentoid, qt_produto"
    );


  if (errorItens) {

    tabelaGeral.innerHTML = `

      <tr>

        <td colspan="7">
          Erro ao carregar itens.
        </td>

      </tr>

    `;


    return;

  }


  if (
    !orcamentos ||
    orcamentos.length === 0
  ) {

    tabelaGeral.innerHTML = `

      <tr>

        <td colspan="7">
          Nenhum registro encontrado.
        </td>

      </tr>

    `;


    return;

  }


  const somasQtde = {};


  if (itens) {

    itens.forEach(
      function (item) {

        const id =
          item.orcamentoid;


        const qt =
          parseFloat(
            item.qt_produto
          ) || 0;


        somasQtde[id] =
          (
            somasQtde[id] || 0
          ) + qt;

      }
    );

  }


  tabelaGeral.innerHTML =
    "";


  orcamentos.forEach(
    function (orc) {

      const totalQtde =
        somasQtde[
          orc.orcamentoid
        ] || 0;


      const linha =
        document.createElement(
          "tr"
        );


      // ===================================================
      // VALOR TOTAL
      // ===================================================

      const valorTotal =
        parseFloat(
          orc.vl_total_orcamento || 0
        ).toFixed(2);


      // ===================================================
      // DADOS DA PESQUISA
      // ===================================================

      linha.dataset.pesquisa =
        "true";


      linha.dataset.orcamentoid =
        orc.orcamentoid ?? "";


      linha.dataset.clienteid =
        orc.clienteid ?? "";


      linha.dataset.dtOrcamento =
        orc.dt_orcamento ?? "";


      linha.dataset.dtValidade =
        orc.dt_validade_orcamento ?? "";


      linha.dataset.valorTotal =
        valorTotal;


      // ===================================================
      // HTML DA LINHA
      // ===================================================

      linha.innerHTML = `

        <td>
          ${orc.orcamentoid}
        </td>

        <td>
          ${totalQtde}
        </td>

        <td>
          ${orc.clienteid || ""}
        </td>

        <td>
          ${orc.dt_orcamento || ""}
        </td>

        <td>
          ${orc.dt_validade_orcamento || ""}
        </td>

        <td>
          R$ ${valorTotal}
        </td>

        <td class="coluna-acoes"></td>

      `;


      // ===================================================
      // BOTÃO VER
      // ===================================================

      const botaoVer =
        document.createElement(
          "button"
        );


      botaoVer.textContent =
        "Ver";


      botaoVer.className =
        "btn-ver";


      botaoVer.type =
        "button";


      botaoVer.addEventListener(
        "click",
        function () {

          mostrarPainelDetalhesOrcamento(
            orc.orcamentoid
          );

        }
      );


      // ===================================================
      // BOTÃO EDITAR
      // ===================================================

      const botaoEditar =
        document.createElement(
          "button"
        );


      botaoEditar.textContent =
        "Editar";


      botaoEditar.className =
        "btn-editar";


      botaoEditar.type =
        "button";


      botaoEditar.addEventListener(
        "click",
        function () {

          carregarOrcamentoParaEdicao(
            orc.orcamentoid
          );

        }
      );


      // ===================================================
      // BOTÃO EXCLUIR
      // ===================================================

      const botaoExcluir =
        document.createElement(
          "button"
        );


      botaoExcluir.textContent =
        "Excluir";


      botaoExcluir.className =
        "btn-excluir";


      botaoExcluir.type =
        "button";


      botaoExcluir.addEventListener(
        "click",
        function () {

          excluirOrcamentoCompleto(
            orc.orcamentoid
          );

        }
      );


      // ===================================================
      // AÇÕES
      // ===================================================

      const tdAcoes =
        linha.querySelector(
          ".coluna-acoes"
        );


      tdAcoes.appendChild(
        botaoVer
      );


      tdAcoes.appendChild(
        botaoEditar
      );


      tdAcoes.appendChild(
        botaoExcluir
      );


      tabelaGeral.appendChild(
        linha
      );

    }
  );


  // Reaplica pesquisa atual

  filtrarTabelaOrcamentos();

}


// =========================================================
// PAINEL DE DETALHES
// =========================================================

async function mostrarPainelDetalhesOrcamento(
  orcamentoid
) {

  const {
    data: orcData,
    error: orcError
  } = await supabaseClient

    .from("orcamento")

    .select(
      "*, cliente ( nome_cliente )"
    )

    .eq(
      "orcamentoid",
      orcamentoid
    )

    .single();


  if (
    orcError ||
    !orcData
  ) {

    alert(
      "Erro ao carregar detalhes do orçamento."
    );


    return;

  }


  const {
    data: itensData,
    error: itensError
  } = await supabaseClient

    .from("orcamento_item")

    .select(
      "*, produto ( ds_produto )"
    )

    .eq(
      "orcamentoid",
      orcamentoid
    )

    .order(
      "orcamentoitemid",
      {
        ascending: true
      }
    );


  if (itensError) {

    alert(
      "Erro ao carregar os itens do orçamento."
    );


    return;

  }


  const nomeCliente =
    orcData.cliente
      ? orcData.cliente.nome_cliente
      : orcData.clienteid;


  const painelAntigo =
    document.getElementById(
      "painelDetalhesEmergencia"
    );


  if (painelAntigo) {

    painelAntigo.remove();

  }


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "painelDetalhesEmergencia";


  overlay.style.cssText = `

    position: fixed;

    top: 0;

    left: 0;

    width: 100%;

    height: 100%;

    background-color:
      rgba(0, 0, 0, 0.5);

    display: flex;

    justify-content: center;

    align-items: center;

    z-index: 9999;

  `;


  const card =
    document.createElement(
      "div"
    );


  card.style.cssText = `

    background: #ffffff;

    width: 680px;

    max-width: 90%;

    max-height: 85vh;

    overflow-y: auto;

    border-radius: 8px;

    box-shadow:
      0 5px 15px
      rgba(0,0,0,0.3);

    border-top:
      5px solid #17a2b8;

    padding: 20px;

    font-family:
      Arial, sans-serif;

    position: relative;

  `;


  let linhasTabelaItens = "";


  if (
    itensData &&
    itensData.length > 0
  ) {

    itensData.forEach(
      function (item) {

        const nomeProd =
          item.produto
            ? item.produto.ds_produto
            : `ID: ${item.produtoid}`;


        linhasTabelaItens += `

          <tr>

            <td>
              ${item.orcamentoitemid}
            </td>

            <td>
              ${item.produtoid}
            </td>

            <td>
              ${nomeProd}
            </td>

            <td>
              ${item.qt_produto}
            </td>

            <td>
              R$ ${
                parseFloat(
                  item.vl_unitario
                ).toFixed(2)
              }
            </td>

            <td>
              R$ ${
                parseFloat(
                  item.vl_total
                ).toFixed(2)
              }
            </td>

          </tr>

        `;

      }
    );

  } else {

    linhasTabelaItens = `

      <tr>

        <td
          colspan="6"
          class="sem-itens"
        >
          Nenhum item cadastrado.
        </td>

      </tr>

    `;

  }


  card.innerHTML = `

    <button
      type="button"
      id="fecharPainelDetalhes"
      class="fechar-painel"
    >
      &times;
    </button>


    <h3 class="titulo-painel">

      Detalhes do Orçamento
      #${orcData.orcamentoid}

    </h3>


    <div class="dados-painel">


      <div>

        <strong>
          Cliente:
        </strong>

        ${nomeCliente}

      </div>


      <div>

        <strong>
          Data do Orçamento:
        </strong>

        ${orcData.dt_orcamento || ""}

      </div>


      <div>

        <strong>
          Data de Validade:
        </strong>

        ${orcData.dt_validade_orcamento || ""}

      </div>


      <div>

        <strong>
          Valor Total Geral:
        </strong>


        <span class="valor-verde">

          R$
          ${
            parseFloat(
              orcData.vl_total_orcamento || 0
            ).toFixed(2)
          }

        </span>

      </div>

    </div>


    <h4>
      Itens do Orçamento:
    </h4>


    <table class="tabela-detalhes">


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


    <div class="fechar-final">

      <button
        type="button"
        id="btnOkPainel"
        class="btn-limpar"
      >
        Fechar
      </button>

    </div>

  `;


  overlay.appendChild(
    card
  );


  document.body.appendChild(
    overlay
  );


  document
    .getElementById(
      "fecharPainelDetalhes"
    )
    .addEventListener(
      "click",
      function () {

        overlay.remove();

      }
    );


  document
    .getElementById(
      "btnOkPainel"
    )
    .addEventListener(
      "click",
      function () {

        overlay.remove();

      }
    );


  overlay.addEventListener(
    "click",
    function (e) {

      if (
        e.target === overlay
      ) {

        overlay.remove();

      }

    }
  );

}


// =========================================================
// CARREGAR ORÇAMENTO PARA EDIÇÃO
// =========================================================

async function carregarOrcamentoParaEdicao(
  orcamentoid
) {

  const {
    data: orcData,
    error: orcError
  } = await supabaseClient

    .from("orcamento")

    .select("*")

    .eq(
      "orcamentoid",
      orcamentoid
    )

    .single();


  if (
    orcError ||
    !orcData
  ) {

    alert(
      "Erro ao carregar dados do orçamento para edição."
    );


    return;

  }


  const {
    data: itensData,
    error: itensError
  } = await supabaseClient

    .from("orcamento_item")

    .select(`

      orcamentoitemid,

      produtoid,

      qt_produto,

      vl_unitario,

      vl_total,

      produto (
        ds_produto
      )

    `)

    .eq(
      "orcamentoid",
      orcamentoid
    )

    .order(
      "orcamentoitemid",
      {
        ascending: true
      }
    );


  if (itensError) {

    alert(
      "Erro ao carregar os itens do orçamento."
    );


    return;

  }


  modoEdicaoOrcamento =
    true;


  telaTabela.style.display =
    "none";


  telaCadastro.style.display =
    "block";


  orcamentoIdInput.value =
    orcData.orcamentoid;


  clienteIdInput.value =
    orcData.clienteid || "";


  dtOrcamentoInput.value =
    orcData.dt_orcamento || "";


  dtValidadeOrcamentoInput.value =
    orcData.dt_validade_orcamento || "";


  vlTotalOrcamentoInput.value =
    orcData.vl_total_orcamento ||
    "0.00";


  carrinhoItens = [];


  if (
    itensData &&
    itensData.length > 0
  ) {

    itensData.forEach(
      function (item, idx) {

        carrinhoItens.push({

          orcamentoitemid:
            item.orcamentoitemid ||
            (idx + 1),

          produtoid:
            item.produtoid,

          nome_produto:
            item.produto
              ? item.produto.ds_produto
              : "Produto",

          qt_produto:
            parseFloat(
              item.qt_produto
            ) || 0,

          vl_unitario:
            parseFloat(
              item.vl_unitario
            ) || 0,

          vl_total:
            parseFloat(
              item.vl_total
            ) || 0

        });

      }
    );

  }


  contadorItem =
    carrinhoItens.length + 1;


  orcamentoItemIdInput.value =
    contadorItem;


  indiceEditando =
    -1;


  btnAddItem.textContent =
    "Adicionar Item";


  atualizarTabelaCarrinho();


  recalcularValorTotalOrcamento();


  mensagemGeral.textContent =
    "";

}


// =========================================================
// EXCLUIR ORÇAMENTO
// =========================================================

async function excluirOrcamentoCompleto(
  orcamentoid
) {

  if (
    !confirm(
      "Deseja excluir este orçamento e seus itens?"
    )
  ) {

    return;

  }


  const {
    error: errorItens
  } = await supabaseClient

    .from("orcamento_item")

    .delete()

    .eq(
      "orcamentoid",
      orcamentoid
    );


  if (errorItens) {

    mensagemTabela.textContent =
      "Erro ao excluir itens: " +
      errorItens.message;


    mensagemTabela.className =
      "mensagem erro";


    return;

  }


  const {
    error
  } = await supabaseClient

    .from("orcamento")

    .delete()

    .eq(
      "orcamentoid",
      orcamentoid
    );


  if (error) {

    mensagemTabela.textContent =
      "Erro ao excluir: " +
      error.message;


    mensagemTabela.className =
      "mensagem erro";


    return;

  }


  mensagemTabela.textContent =
    "Excluído com sucesso!";


  mensagemTabela.className =
    "mensagem sucesso";


  carregarTabelaGeral();

}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

carregarClientes();

carregarProdutosSelect();

definirDataHoje();

carregarTabelaGeral();

carregarProximoOrcamentoId();


orcamentoItemIdInput.value =
  contadorItem;

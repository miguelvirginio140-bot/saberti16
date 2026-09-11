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
// ELEMENTOS
// =========================================================

const formProduto =
  document.getElementById("formProduto");


const tabelaProdutos =
  document.getElementById("tabelaProdutos");


const mensagem =
  document.getElementById("mensagem");


const produtoidInput =
  document.getElementById("produtoid");


const categoriaprodutoidInput =
  document.getElementById("categoriaprodutoid");


const dsProdutoInput =
  document.getElementById("ds_produto");


const obsProdutoInput =
  document.getElementById("obs_produto");


const vlVendaProdutoInput =
  document.getElementById("vl_venda_produto");


const dtCadastroProdutoInput =
  document.getElementById("dt_cadastro_produto");


const statusProdutoInput =
  document.getElementById("status_produto");


const btnSalvar =
  document.getElementById("btnSalvar");


const btnCancelarEdicao =
  document.getElementById("btnCancelarEdicao");


const btnVoltar =
  document.getElementById("voltar");


// =========================================================
// ELEMENTOS DA PESQUISA
// =========================================================

const pesquisaProduto =
  document.getElementById("pesquisaProduto");


const btnLimparPesquisa =
  document.getElementById("btnLimparPesquisa");


const filtroPesquisa =
  document.getElementById("filtroPesquisa");


// =========================================================
// VOLTAR
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

function mostrarMensagem(
  texto,
  tipo
) {

  mensagem.textContent =
    texto;


  mensagem.className =
    "mensagem " + tipo;

}


// =========================================================
// DATA DE HOJE
// =========================================================

function definirDataHoje() {

  const hoje =
    new Date()
      .toISOString()
      .split("T")[0];


  dtCadastroProdutoInput.value =
    hoje;

}


// =========================================================
// PRÓXIMO ID DO PRODUTO
// =========================================================

async function carregarProximoProdutoId() {

  const {
    data,
    error
  } = await supabaseClient

    .from("produto")

    .select("produtoid")

    .order(
      "produtoid",
      {
        ascending: false
      }
    )

    .limit(1);


  if (error) {

    console.error(
      "Erro ao buscar próximo ID:",
      error.message
    );


    produtoidInput.value =
      "";


    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    produtoidInput.value =
      1;

  } else {

    produtoidInput.value =
      Number(
        data[0].produtoid
      ) + 1;

  }

}


// =========================================================
// CARREGAR CATEGORIAS
// =========================================================

async function carregarCategorias() {

  const {
    data,
    error
  } = await supabaseClient

    .from("categoria_produto")

    .select(
      "categoriaprodutoid, ds_categoria_produto"
    )

    .order(
      "categoriaprodutoid",
      {
        ascending: true
      }
    );


  if (error) {

    mostrarMensagem(
      "Erro ao carregar categorias: " +
      error.message,
      "erro"
    );


    categoriaprodutoidInput.innerHTML =
      '<option value="">Erro ao carregar</option>';


    return;

  }


  categoriaprodutoidInput.innerHTML =
    '<option value="">Selecione...</option>';


  data.forEach(
    function (categoria) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        categoria.categoriaprodutoid;


      option.textContent =
        `${categoria.categoriaprodutoid} - ${
          categoria.ds_categoria_produto ||
          "Categoria"
        }`;


      categoriaprodutoidInput.appendChild(
        option
      );

    }
  );

}


// =========================================================
// NORMALIZAR TEXTO
// =========================================================

function normalizarTexto(
  texto
) {

  return String(
    texto ?? ""
  )

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

function normalizarValor(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return normalizarTexto(
    valor
  );

}


// =========================================================
// FORMATAR DATA PARA PESQUISA
// =========================================================

function formatarDataPesquisa(
  data
) {

  if (!data) {

    return "";

  }


  const texto =
    String(data);


  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ) {

    const partes =
      texto.split("-");


    return normalizarTexto(
      `${partes[2]}/${partes[1]}/${partes[0]}`
    );

  }


  return normalizarTexto(
    texto
  );

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
        "#tabelaProdutos"
      );


    if (
      tabelaContainer &&
      tabelaContainer.parentNode
    ) {

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

function filtrarTabelaProdutos() {

  // -------------------------------------------------------
  // Verifica se os elementos existem
  // -------------------------------------------------------

  if (
    !pesquisaProduto ||
    !filtroPesquisa ||
    !tabelaProdutos
  ) {

    return;

  }


  const termo =
    normalizarTexto(
      pesquisaProduto.value
    );


  const filtro =
    filtroPesquisa.value;


  const linhas =
    tabelaProdutos.querySelectorAll(
      "tr[data-pesquisa='true']"
    );


  let quantidadeEncontrada =
    0;


  linhas.forEach(
    function (linha) {

      let encontrou =
        false;


      // ===================================================
      // SEM TEXTO
      // ===================================================

      if (
        termo === ""
      ) {

        encontrou =
          true;

      }


      // ===================================================
      // TODOS OS CAMPOS
      // ===================================================

      else if (
        filtro === ""
      ) {

        const campos = [

          linha.dataset.produtoid,

          linha.dataset.categoriaprodutoid,

          linha.dataset.dsProduto,

          linha.dataset.obsProduto,

          linha.dataset.valorVenda,

          linha.dataset.dtCadastro,

          linha.dataset.statusProduto

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


        // -------------------------------------------------
        // Pesquisa de data em DD/MM/AAAA
        // -------------------------------------------------

        if (!encontrou) {

          const dataCadastro =
            formatarDataPesquisa(
              linha.dataset.dtCadastro
            );


          encontrou =
            dataCadastro.startsWith(
              termo
            );

        }

      }


      // ===================================================
      // CAMPO ESPECÍFICO
      // ===================================================

      else {

        let valorCampo =
          "";


        switch (filtro) {

          case "produtoid":

            valorCampo =
              linha.dataset.produtoid;

            break;


          case "categoriaprodutoid":

            valorCampo =
              linha.dataset.categoriaprodutoid;

            break;


          case "ds_produto":

            valorCampo =
              linha.dataset.dsProduto;

            break;


          case "obs_produto":

            valorCampo =
              linha.dataset.obsProduto;

            break;


          case "vl_venda_produto":

            valorCampo =
              linha.dataset.valorVenda;

            break;


          case "dt_cadastro_produto":

            valorCampo =
              linha.dataset.dtCadastro;

            break;


          case "status_produto":

            valorCampo =
              linha.dataset.statusProduto;

            break;

        }


        encontrou =
          normalizarValor(
            valorCampo
          ).startsWith(
            termo
          );


        // -------------------------------------------------
        // Pesquisa de data em DD/MM/AAAA
        // -------------------------------------------------

        if (
          !encontrou &&
          filtro === "dt_cadastro_produto"
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
        "Nenhum produto encontrado para a pesquisa.";


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

if (pesquisaProduto) {

  pesquisaProduto.addEventListener(
    "input",
    function () {

      filtrarTabelaProdutos();

    }
  );

}


// =========================================================
// ALTERAR FILTRO DE PESQUISA
// =========================================================

if (filtroPesquisa) {

  filtroPesquisa.addEventListener(
    "change",
    function () {

      filtrarTabelaProdutos();


      if (pesquisaProduto) {

        pesquisaProduto.focus();

      }

    }
  );

}


// =========================================================
// BOTÃO LIMPAR PESQUISA
// =========================================================

if (btnLimparPesquisa) {

  btnLimparPesquisa.addEventListener(
    "click",
    function () {

      if (pesquisaProduto) {

        pesquisaProduto.value =
          "";

      }


      if (filtroPesquisa) {

        filtroPesquisa.value =
          "";

      }


      filtrarTabelaProdutos();


      if (pesquisaProduto) {

        pesquisaProduto.focus();

      }

    }
  );

}


// =========================================================
// CARREGAR PRODUTOS
// =========================================================

async function carregarProdutos() {

  const {
    data,
    error
  } = await supabaseClient

    .from("produto")

    .select(`
      produtoid,
      categoriaprodutoid,
      ds_produto,
      obs_produto,
      vl_venda_produto,
      dt_cadastro_produto,
      status_produto
    `)

    .order(
      "produtoid",
      {
        ascending: true
      }
    );


  if (error) {

    tabelaProdutos.innerHTML = `

      <tr>

        <td
          colspan="8"
          style="text-align: center;"
        >
          Erro ao carregar produtos.
        </td>

      </tr>

    `;


    mostrarMensagem(
      "Erro ao buscar produtos: " +
      error.message,
      "erro"
    );


    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    tabelaProdutos.innerHTML = `

      <tr>

        <td
          colspan="8"
          style="text-align: center;"
        >
          Nenhum produto cadastrado.
        </td>

      </tr>

    `;


    return;

  }


  tabelaProdutos.innerHTML =
    "";


  data.forEach(
    function (produto) {

      const linha =
        document.createElement(
          "tr"
        );


      // ===================================================
      // DADOS USADOS PELA PESQUISA
      // ===================================================

      linha.dataset.pesquisa =
        "true";


      linha.dataset.produtoid =
        produto.produtoid ?? "";


      linha.dataset.categoriaprodutoid =
        produto.categoriaprodutoid ?? "";


      linha.dataset.dsProduto =
        produto.ds_produto ?? "";


      linha.dataset.obsProduto =
        produto.obs_produto ?? "";


      linha.dataset.valorVenda =
        produto.vl_venda_produto ?? "";


      linha.dataset.dtCadastro =
        produto.dt_cadastro_produto ?? "";


      linha.dataset.statusProduto =
        produto.status_produto ?? "";


      // ===================================================
      // VALOR DE VENDA
      // ===================================================

      const valorVenda =
        parseFloat(
          produto.vl_venda_produto || 0
        ).toFixed(2);


      // ===================================================
      // HTML DA LINHA
      // ===================================================

      linha.innerHTML = `

        <td style="text-align: center;">
          ${produto.produtoid}
        </td>

        <td style="text-align: center;">
          ${produto.categoriaprodutoid}
        </td>

        <td>
          ${produto.ds_produto || ""}
        </td>

        <td>
          ${produto.obs_produto || ""}
        </td>

        <td>
          R$ ${valorVenda}
        </td>

        <td>
          ${produto.dt_cadastro_produto || ""}
        </td>

        <td>
          ${produto.status_produto || ""}
        </td>

        <td
          class="coluna-acoes"
          style="
            text-align: center;
            white-space: nowrap;
          "
        ></td>

      `;


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

          prepararEdicao(
            produto
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

          excluirProduto(
            produto
          );

        }
      );


      // ===================================================
      // AÇÕES
      // ===================================================

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


      tabelaProdutos.appendChild(
        linha
      );

    }
  );


  // ===================================================
  // REAPLICAR PESQUISA
  // ===================================================

  filtrarTabelaProdutos();


  // ===================================================
  // ATUALIZAR PRÓXIMO ID
  // ===================================================

  await carregarProximoProdutoId();

}


// =========================================================
// PREPARAR EDIÇÃO
// =========================================================

function prepararEdicao(
  produto
) {

  produtoidInput.value =
    produto.produtoid;


  categoriaprodutoidInput.value =
    produto.categoriaprodutoid;


  dsProdutoInput.value =
    produto.ds_produto;


  obsProdutoInput.value =
    produto.obs_produto || "";


  vlVendaProdutoInput.value =
    produto.vl_venda_produto;


  dtCadastroProdutoInput.value =
    produto.dt_cadastro_produto || "";


  statusProdutoInput.value =
    produto.status_produto;


  dsProdutoInput.focus();


  btnSalvar.textContent =
    "Atualizar";


  btnCancelarEdicao.style.display =
    "inline-block";


  mostrarMensagem(
    "Editando o produto: " +
    produto.ds_produto,
    "sucesso"
  );

}


// =========================================================
// CANCELAR EDIÇÃO
// =========================================================

async function cancelarEdicao() {

  formProduto.reset();


  btnSalvar.textContent =
    "Salvar";


  btnCancelarEdicao.style.display =
    "none";


  mensagem.textContent =
    "";


  mensagem.className =
    "mensagem";


  definirDataHoje();


  await carregarProximoProdutoId();

}


// =========================================================
// SALVAR PRODUTO
// =========================================================

async function salvarProduto() {

  const novoProduto = {

    categoriaprodutoid:
      categoriaprodutoidInput.value,

    ds_produto:
      dsProdutoInput.value,

    obs_produto:
      obsProdutoInput.value,

    vl_venda_produto:
      vlVendaProdutoInput.value,

    dt_cadastro_produto:
      dtCadastroProdutoInput.value || null,

    status_produto:
      statusProdutoInput.value

  };


  const {
    error
  } = await supabaseClient

    .from("produto")

    .insert(
      novoProduto
    );


  if (error) {

    mostrarMensagem(
      "Erro ao salvar produto: " +
      error.message,
      "erro"
    );


    return;

  }


  mostrarMensagem(
    "Produto salvo com sucesso!",
    "sucesso"
  );


  formProduto.reset();


  definirDataHoje();


  await carregarProximoProdutoId();


  await carregarProdutos();

}


// =========================================================
// ATUALIZAR PRODUTO
// =========================================================

async function atualizarProduto() {

  const produtoId =
    produtoidInput.value;


  const produtoAtualizado = {

    categoriaprodutoid:
      categoriaprodutoidInput.value,

    ds_produto:
      dsProdutoInput.value,

    obs_produto:
      obsProdutoInput.value,

    vl_venda_produto:
      vlVendaProdutoInput.value,

    dt_cadastro_produto:
      dtCadastroProdutoInput.value || null,

    status_produto:
      statusProdutoInput.value

  };


  const {
    error
  } = await supabaseClient

    .from("produto")

    .update(
      produtoAtualizado
    )

    .eq(
      "produtoid",
      produtoId
    );


  if (error) {

    mostrarMensagem(
      "Erro ao atualizar produto: " +
      error.message,
      "erro"
    );


    return;

  }


  mostrarMensagem(
    "Produto atualizado com sucesso!",
    "sucesso"
  );


  await cancelarEdicao();


  await carregarProdutos();

}


// =========================================================
// EXCLUIR PRODUTO
// =========================================================

async function excluirProduto(
  produto
) {

  const confirmou =
    confirm(
      "Tem certeza que deseja excluir o produto " +
      produto.ds_produto +
      "?"
    );


  if (!confirmou) {

    return;

  }


  const {
    error
  } = await supabaseClient

    .from("produto")

    .delete()

    .eq(
      "produtoid",
      produto.produtoid
    );


  if (error) {

    mostrarMensagem(
      "Erro ao excluir produto: " +
      error.message,
      "erro"
    );


    return;

  }


  mostrarMensagem(
    "Produto excluído com sucesso!",
    "sucesso"
  );


  await carregarProdutos();

}


// =========================================================
// SUBMIT DO FORMULÁRIO
// =========================================================

formProduto.addEventListener(
  "submit",
  async function (evento) {

    evento.preventDefault();


    const estaEditando =
      produtoidInput.value !== "" &&
      btnSalvar.textContent ===
        "Atualizar";


    if (estaEditando) {

      await atualizarProduto();

    } else {

      await salvarProduto();

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
// INICIALIZAÇÃO
// =========================================================

async function iniciarPagina() {

  definirDataHoje();


  await carregarProximoProdutoId();


  await carregarCategorias();


  await carregarProdutos();

}


iniciarPagina();

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

const formCliente =
  document.getElementById("formCliente");


const tabelaClientes =
  document.getElementById("tabelaClientes");


const mensagem =
  document.getElementById("mensagem");


const clienteIdInput =
  document.getElementById(
    "categoriaprodutoid"
  );


const dsCategoriaProdutoInput =
  document.getElementById(
    "ds_categoria_produto"
  );


const btnSalvar =
  document.getElementById(
    "btnSalvar"
  );


const btnCancelarEdicao =
  document.getElementById(
    "btnCancelarEdicao"
  );


const btnVoltar =
  document.getElementById(
    "voltar"
  );


// =========================================================
// ELEMENTOS DA PESQUISA
// =========================================================

const pesquisa =
  document.getElementById(
    "pesquisa"
  );


const btnLimparPesquisa =
  document.getElementById(
    "btnLimparPesquisa"
  );


const filtroPesquisa =
  document.getElementById(
    "filtroPesquisa"
  );


const mensagemPesquisa =
  document.getElementById(
    "mensagemPesquisa"
  );


// =========================================================
// VARIÁVEIS
// =========================================================

let categorias = [];

let termoPesquisa = "";


// =========================================================
// NORMALIZAR TEXTO
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


  return normalizarTexto(
    valor
  );

}


// =========================================================
// PESQUISA ENQUANTO DIGITA
// =========================================================

pesquisa.addEventListener(
  "input",
  function () {

    termoPesquisa =
      normalizarTexto(
        pesquisa.value
      );


    filtrarCategorias();

  }
);


// =========================================================
// ALTERAR FILTRO
// =========================================================

filtroPesquisa.addEventListener(
  "change",
  function () {

    filtrarCategorias();

    pesquisa.focus();

  }
);


// =========================================================
// BOTÃO LIMPAR PESQUISA
// =========================================================

btnLimparPesquisa.addEventListener(
  "click",
  function () {

    pesquisa.value =
      "";

    filtroPesquisa.value =
      "";

    termoPesquisa =
      "";

    filtrarCategorias();

    pesquisa.focus();

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
// MENSAGEM DA PESQUISA
// =========================================================

function mostrarMensagemPesquisa(
  texto
) {

  if (!mensagemPesquisa) {

    return;

  }


  mensagemPesquisa.textContent =
    texto;


  if (texto) {

    mensagemPesquisa.style.display =
      "block";

  } else {

    mensagemPesquisa.style.display =
      "none";

  }

}


// =========================================================
// MOSTRAR PRÓXIMO CÓDIGO
// =========================================================

async function carregarProximoCodigo() {

  const {
    data,
    error
  } = await supabaseClient

    .from(
      "categoria_produto"
    )

    .select(
      "categoriaprodutoid"
    )

    .order(
      "categoriaprodutoid",
      {
        ascending: false
      }
    )

    .limit(1);


  if (error) {

    console.error(
      "Erro ao buscar próximo código:",
      error
    );


    clienteIdInput.value =
      "";


    return;

  }


  // =======================================================
  // NENHUMA CATEGORIA
  // =======================================================

  if (
    !data ||
    data.length === 0
  ) {

    clienteIdInput.value =
      1;


    return;

  }


  const maiorId =
    Number(
      data[0].categoriaprodutoid
    );


  clienteIdInput.value =
    maiorId + 1;

}


// =========================================================
// CARREGAR CATEGORIAS
// =========================================================

async function carregarCategorias() {

  const {
    data,
    error
  } = await supabaseClient

    .from(
      "categoria_produto"
    )

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

    console.error(
      error
    );


    tabelaClientes.innerHTML = `

      <tr>

        <td
          colspan="3"
          style="text-align:center;"
        >
          Erro ao carregar categorias.

        </td>

      </tr>

    `;


    mostrarMensagem(
      "Erro ao buscar categorias: " +
      error.message,
      "erro"
    );


    return;

  }


  categorias =
    data || [];


  filtrarCategorias();

}


// =========================================================
// FILTRAR CATEGORIAS
// =========================================================

function filtrarCategorias() {

  let resultado =
    [...categorias];


  // =======================================================
  // SEM PESQUISA
  // =======================================================

  if (
    termoPesquisa === ""
  ) {

    renderizarCategorias(
      resultado
    );


    mostrarMensagemPesquisa(
      ""
    );


    return;

  }


  // =======================================================
  // FILTRO
  // =======================================================

  const filtro =
    filtroPesquisa.value;


  // =======================================================
  // TODOS OS CAMPOS
  // =======================================================

  if (
    filtro === ""
  ) {

    resultado =
      resultado.filter(
        function (categoria) {

          const codigo =
            normalizarValor(
              categoria.categoriaprodutoid
            );


          const descricao =
            normalizarValor(
              categoria.ds_categoria_produto
            );


          return (

            codigo.startsWith(
              termoPesquisa
            )

            ||

            descricao.startsWith(
              termoPesquisa
            )

          );

        }
      );

  }


  // =======================================================
  // CÓDIGO
  // =======================================================

  else if (
    filtro ===
    "categoriaprodutoid"
  ) {

    resultado =
      resultado.filter(
        function (categoria) {

          const codigo =
            normalizarValor(
              categoria.categoriaprodutoid
            );


          return codigo.startsWith(
            termoPesquisa
          );

        }
      );

  }


  // =======================================================
  // DESCRIÇÃO
  // =======================================================

  else if (
    filtro ===
    "ds_categoria_produto"
  ) {

    resultado =
      resultado.filter(
        function (categoria) {

          const descricao =
            normalizarValor(
              categoria.ds_categoria_produto
            );


          return descricao.startsWith(
            termoPesquisa
          );

        }
      );

  }


  // =======================================================
  // RENDERIZAR
  // =======================================================

  renderizarCategorias(
    resultado
  );


  // =======================================================
  // MENSAGEM
  // =======================================================

  if (
    resultado.length === 0
  ) {

    mostrarMensagemPesquisa(
      "Nenhuma categoria encontrada para a pesquisa."
    );

  } else {

    mostrarMensagemPesquisa(
      ""
    );

  }

}


// =========================================================
// RENDERIZAR CATEGORIAS
// =========================================================

function renderizarCategorias(
  dados
) {

  if (
    !dados ||
    dados.length === 0
  ) {

    tabelaClientes.innerHTML = `

      <tr>

        <td
          colspan="3"
          style="text-align:center;"
        >
          Nenhuma categoria encontrada.

        </td>

      </tr>

    `;


    return;

  }


  tabelaClientes.innerHTML =
    "";


  dados.forEach(
    function (categoria) {

      const linha =
        document.createElement(
          "tr"
        );


      linha.innerHTML = `

        <td
          style="text-align:center;"
        >
          ${escaparHTML(
            categoria.categoriaprodutoid
          )}
        </td>


        <td>

          ${escaparHTML(
            categoria.ds_categoria_produto
          )}

        </td>


        <td
          class="coluna-acoes"
          style="
            text-align:center;
            white-space:nowrap;
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
            categoria
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

          excluirCategoria(
            categoria
          );

        }
      );


      // ===================================================
      // ADICIONAR BOTÕES
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


      tabelaClientes.appendChild(
        linha
      );

    }
  );

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// =========================================================
// PREPARAR EDIÇÃO
// =========================================================

function prepararEdicao(
  categoria
) {

  clienteIdInput.value =
    categoria.categoriaprodutoid;


  dsCategoriaProdutoInput.value =
    categoria.ds_categoria_produto;


  dsCategoriaProdutoInput.focus();


  btnSalvar.textContent =
    "Atualizar";


  btnCancelarEdicao.style.display =
    "inline-block";


  mostrarMensagem(
    "Editando a categoria: " +
    categoria.ds_categoria_produto,
    "sucesso"
  );

}


// =========================================================
// CANCELAR EDIÇÃO
// =========================================================

function cancelarEdicao() {

  formCliente.reset();


  dsCategoriaProdutoInput.readOnly =
    false;


  btnSalvar.textContent =
    "Salvar";


  btnCancelarEdicao.style.display =
    "none";


  mensagem.textContent =
    "";


  mensagem.className =
    "mensagem";


  carregarProximoCodigo();

}


// =========================================================
// SALVAR
// =========================================================

async function salvarCategoria() {

  const dsCategoriaProduto =
    dsCategoriaProdutoInput.value.trim();


  if (
    !dsCategoriaProduto
  ) {

    mostrarMensagem(
      "Digite a descrição da categoria.",
      "erro"
    );


    return;

  }


  const novaCategoria = {

    ds_categoria_produto:
      dsCategoriaProduto

  };


  const {
    error
  } = await supabaseClient

    .from(
      "categoria_produto"
    )

    .insert([
      novaCategoria
    ]);


  if (error) {

    console.error(
      error
    );


    mostrarMensagem(
      "Erro ao salvar categoria: " +
      error.message,
      "erro"
    );


    return;

  }


  mostrarMensagem(
    "Categoria salva com sucesso!",
    "sucesso"
  );


  dsCategoriaProdutoInput.value =
    "";


  await carregarProximoCodigo();

  await carregarCategorias();

}


// =========================================================
// ATUALIZAR
// =========================================================

async function atualizarCategoria() {

  const categoriaId =
    clienteIdInput.value;


  const dsCategoriaProduto =
    dsCategoriaProdutoInput.value.trim();


  if (
    !dsCategoriaProduto
  ) {

    mostrarMensagem(
      "Digite a descrição da categoria.",
      "erro"
    );


    return;

  }


  const {
    error
  } = await supabaseClient

    .from(
      "categoria_produto"
    )

    .update({

      ds_categoria_produto:
        dsCategoriaProduto

    })

    .eq(
      "categoriaprodutoid",
      categoriaId
    );


  if (error) {

    mostrarMensagem(
      "Erro ao atualizar categoria: " +
      error.message,
      "erro"
    );


    return;

  }


  mostrarMensagem(
    "Categoria atualizada com sucesso!",
    "sucesso"
  );


  cancelarEdicao();


  await carregarCategorias();

}


// =========================================================
// EXCLUIR
// =========================================================

async function excluirCategoria(
  categoria
) {

  const confirmou =
    confirm(
      "Tem certeza que deseja excluir a categoria " +
      categoria.ds_categoria_produto +
      "?"
    );


  if (!confirmou) {

    return;

  }


  const {
    error
  } = await supabaseClient

    .from(
      "categoria_produto"
    )

    .delete()

    .eq(
      "categoriaprodutoid",
      categoria.categoriaprodutoid
    );


  if (error) {

    mostrarMensagem(
      "Erro ao excluir categoria: " +
      error.message,
      "erro"
    );


    return;

  }


  if (
    clienteIdInput.value ==
    categoria.categoriaprodutoid
  ) {

    cancelarEdicao();

  }


  mostrarMensagem(
    "Categoria excluída com sucesso!",
    "sucesso"
  );


  await carregarCategorias();

  await carregarProximoCodigo();

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


    if (
      estaEditando
    ) {

      await atualizarCategoria();

    } else {

      await salvarCategoria();

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
// INICIAR PÁGINA
// =========================================================

carregarCategorias();

carregarProximoCodigo();

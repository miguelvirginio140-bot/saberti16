const botaoCliente = document.getElementById("botao-cliente");
const botaoCategoria = document.getElementById("botao-categoria");
const botaoProduto = document.getElementById("botao-produto");
const botaoOrçamento = document.getElementById("botao-orçamento");
const botaoSair = document.getElementById("botao-sair");

botaoCliente.addEventListener("click", function () {
  window.location.href = "/cliente/clienteindex.html";
});

botaoCategoria.addEventListener("click", function () {
  window.location.href = "/categoria/categoriaindex.html";
});

botaoProduto.addEventListener("click", function () {
  window.location.href = "/produto/produtoindex.html";
});

botaoOrçamento.addEventListener("click", function () {
  window.location.href = "/orçamento/1telaindex.html";
});

botaoSair.addEventListener("click", function () {
  window.location.href = "/login/loginindex.html";
});

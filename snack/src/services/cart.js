// Cálculos do carrinho. Funções puras, sem AsyncStorage.
// Regra do PRD (FR-CART-02): quantidade total, subtotal, desconto e total recalculados a cada mudança.

export function calcularCarrinho(itens, desconto = 0) {
  const quantidadeTotal = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const descontoAplicado = Math.min(Math.max(desconto, 0), subtotal);
  const total = subtotal - descontoAplicado;
  return {
    quantidadeTotal,
    subtotal: arredondar(subtotal),
    desconto: arredondar(descontoAplicado),
    total: arredondar(total),
  };
}

export function alterarQuantidade(itens, id, novaQuantidade) {
  if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) {
    return itens.filter((item) => item.id !== id);
  }
  return itens.map((item) => (item.id === id ? { ...item, quantidade: novaQuantidade } : item));
}

export function adicionarItem(itens, produto, quantidade = 1) {
  const existente = itens.find((item) => item.id === produto.id);
  if (existente) {
    return alterarQuantidade(itens, produto.id, existente.quantidade + quantidade);
  }
  return [...itens, { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade }];
}

export function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

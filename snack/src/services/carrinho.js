// Carrinho persistido no AsyncStorage (PRD FR-CART-01 e FR-CART-02).
import { lerJson, salvarJson, CHAVES } from './storage';
import { adicionarItem, alterarQuantidade } from './cart';

export async function carregarCarrinho() {
  return lerJson(CHAVES.carrinho, []);
}

export async function salvarCarrinho(itens) {
  await salvarJson(CHAVES.carrinho, itens);
  return itens;
}

export async function adicionarAoCarrinho(produto, quantidade = 1) {
  const itens = await carregarCarrinho();
  return salvarCarrinho(adicionarItem(itens, produto, quantidade));
}

export async function definirQuantidade(id, quantidade) {
  const itens = await carregarCarrinho();
  return salvarCarrinho(alterarQuantidade(itens, id, quantidade));
}

export async function removerDoCarrinho(id) {
  const itens = await carregarCarrinho();
  return salvarCarrinho(alterarQuantidade(itens, id, 0));
}

export async function esvaziarCarrinho() {
  return salvarCarrinho([]);
}

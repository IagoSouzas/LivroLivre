// Pedidos (PRD FR-CART-06, FR-ORD-01 a FR-ORD-02). Status é simulado pelo tempo desde a compra.
import { lerJson, salvarJson, CHAVES } from './storage';

// Cada etapa dura MINUTOS_POR_ETAPA minutos. Simulação para demonstração.
export const MINUTOS_POR_ETAPA = 1;
export const ETAPAS = [
  'Pagamento aprovado',
  'Pedido despachado',
  'Chegou ao centro',
  'Saiu para entrega',
  'Entregue',
];

export function gerarNumeroPedido(data = new Date(), sequencia = 1) {
  const pad = (n, t = 2) => String(n).padStart(t, '0');
  const dia = `${data.getFullYear()}${pad(data.getMonth() + 1)}${pad(data.getDate())}`;
  return `PED-${dia}-${pad(sequencia, 4)}`;
}

// Índice da etapa atual (0 a 4) com base no tempo decorrido.
export function etapaAtual(pedido, agora = new Date()) {
  const decorridoMin = (agora.getTime() - new Date(pedido.criadoEm).getTime()) / 60000;
  return Math.min(ETAPAS.length - 1, Math.max(0, Math.floor(decorridoMin / MINUTOS_POR_ETAPA)));
}

export function statusAtual(pedido, agora = new Date()) {
  return ETAPAS[etapaAtual(pedido, agora)];
}

export function estaEntregue(pedido, agora = new Date()) {
  return etapaAtual(pedido, agora) === ETAPAS.length - 1;
}

// Momento em que o pedido foi entregue (simulado).
export function dataEntrega(pedido) {
  const inicio = new Date(pedido.criadoEm).getTime();
  return new Date(inicio + (ETAPAS.length - 1) * MINUTOS_POR_ETAPA * 60000);
}

export async function listarPedidos() {
  return lerJson(CHAVES.pedidos, []);
}

export async function criarPedido({ itens, total, desconto, endereco, pagamento, parcelas, voucher }, agora = new Date()) {
  const pedidos = await listarPedidos();
  const numero = gerarNumeroPedido(agora, pedidos.length + 1);
  const pedido = {
    numero,
    criadoEm: agora.toISOString(),
    itens,
    total,
    desconto,
    endereco,
    pagamento,
    parcelas,
    voucher: voucher ?? null,
    codigoRastreio: `BR${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}SP`,
  };
  await salvarJson(CHAVES.pedidos, [pedido, ...pedidos]);
  return pedido;
}

export async function atualizarPedido(numero, alteracoes) {
  const pedidos = await listarPedidos();
  const novos = pedidos.map((p) => (p.numero === numero ? { ...p, ...alteracoes } : p));
  await salvarJson(CHAVES.pedidos, novos);
  return novos.find((p) => p.numero === numero) ?? null;
}

export async function buscarPedido(numero) {
  const pedidos = await listarPedidos();
  return pedidos.find((p) => p.numero === numero) ?? null;
}

// Pedidos que contêm o produto e já foram entregues: exigidos para avaliar (FR-ORD-03).
export function pedidosEntreguesComProduto(pedidos, produtoId, agora = new Date()) {
  return pedidos.filter((p) => estaEntregue(p, agora) && p.itens.some((i) => i.id === produtoId));
}

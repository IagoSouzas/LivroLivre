// Devolução e troca (PRD FR-ORD-04).
import { lerJson, salvarJson, CHAVES } from './storage';
import { validarObrigatorio } from '../validators';
import { dataEntrega } from './pedidos';

export const MOTIVOS = ['Produto com defeito', 'Produto diferente do anunciado', 'Não gostei do produto', 'Chegou atrasado'];
export const RESOLUCOES = ['Reembolso', 'Troca', 'Crédito em conta'];
export const PRAZO_DIAS = 7;
export const MINIMO_DESCRICAO = 10;

export function prazoDevolucaoAte(pedido) {
  const limite = dataEntrega(pedido);
  limite.setDate(limite.getDate() + PRAZO_DIAS);
  return limite;
}

export function dentroDoPrazo(pedido, agora = new Date()) {
  return agora <= prazoDevolucaoAte(pedido);
}

export function validarDevolucao({ motivo, descricao, resolucao }) {
  const erros = {};
  const m = validarObrigatorio(motivo, 'Motivo da solicitação');
  if (!m.valido) erros.motivo = m.erro;
  const d = validarObrigatorio(descricao, 'Descrição do problema');
  if (d.valido && String(descricao).trim().length < MINIMO_DESCRICAO) {
    erros.descricao = `Descreva o problema com pelo menos ${MINIMO_DESCRICAO} caracteres`;
  } else if (!d.valido) {
    erros.descricao = d.erro;
  }
  if (!RESOLUCOES.includes(resolucao)) erros.resolucao = 'Escolha o tipo de resolução';
  return erros;
}

export async function listarDevolucoes() {
  return lerJson(CHAVES.devolucoes, []);
}

export async function solicitarDevolucao(pedido, dados, agora = new Date()) {
  if (!dentroDoPrazo(pedido, agora)) return { ok: false, erro: 'Prazo de devolução encerrado' };
  const erros = validarDevolucao(dados);
  if (Object.keys(erros).length) return { ok: false, erros };
  const atuais = await listarDevolucoes();
  const nova = {
    id: `dev-${Date.now()}`,
    numeroPedido: pedido.numero,
    motivo: dados.motivo,
    descricao: dados.descricao.trim(),
    resolucao: dados.resolucao,
    criadaEm: agora.toISOString(),
  };
  await salvarJson(CHAVES.devolucoes, [nova, ...atuais]);
  return { ok: true, devolucao: nova };
}

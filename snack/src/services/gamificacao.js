// Gamificação (PRD FR-GAM-01 a FR-GAM-06). Pontos por ação, níveis, desafios, resgates e conquistas.
import { lerJson, salvarJson, CHAVES } from './storage';

export const NIVEIS = [
  { nome: 'Bronze', minimo: 0 },
  { nome: 'Prata', minimo: 500 },
  { nome: 'Ouro', minimo: 1000 },
  { nome: 'Diamante', minimo: 2500 },
];

export const PONTOS = {
  cadastro: 30, // cadastro completo
  avaliacao: 50, // por avaliação enviada
  indicacao: 100, // por indicação
};

export const RESGATES = [
  { id: 'desc10', titulo: 'Desconto R$ 10', custo: 200, tipo: 'desconto', valor: 10 },
  { id: 'frete', titulo: 'Frete grátis', custo: 100, tipo: 'frete', valor: 0 },
  { id: 'desc25', titulo: 'Desconto R$ 25', custo: 500, tipo: 'desconto', valor: 25 },
];

const ESTADO_PADRAO = {
  acumulado: 0, // total de pontos ganhos (define o nível)
  gasto: 0, // pontos trocados por resgates
  historico: [],
  indicacoes: 0,
  cadastroPontuado: false,
  vouchers: [],
};

export async function carregarGamificacao() {
  const salvo = await lerJson(CHAVES.gamificacao, null);
  return { ...ESTADO_PADRAO, ...(salvo || {}) };
}

async function gravar(estado) {
  await salvarJson(CHAVES.gamificacao, estado);
  return estado;
}

function registrar(estado, evento, pontos, descricao, agora = new Date()) {
  return {
    ...estado,
    acumulado: estado.acumulado + pontos,
    historico: [{ evento, pontos, descricao, data: agora.toISOString() }, ...estado.historico],
  };
}

export async function pontuarCadastro() {
  const estado = await carregarGamificacao();
  if (estado.cadastroPontuado) return estado;
  return gravar({ ...registrar(estado, 'cadastro', PONTOS.cadastro, 'Cadastro completo'), cadastroPontuado: true });
}

// FR-GAM-01: 1 ponto a cada R$ 1 de compra.
export async function pontuarCompra(total, numeroPedido) {
  const estado = await carregarGamificacao();
  const pontos = Math.floor(total);
  return gravar(registrar(estado, 'compra', pontos, `Pedido ${numeroPedido}`));
}

export async function pontuarAvaliacao(titulo) {
  const estado = await carregarGamificacao();
  return gravar(registrar(estado, 'avaliacao', PONTOS.avaliacao, `Avaliação: ${titulo}`));
}

// Indicação conta uma vez (desafio "Indique um amigo").
export async function registrarIndicacao() {
  const estado = await carregarGamificacao();
  if (estado.indicacoes >= 1) return { ok: false, estado };
  const novo = registrar({ ...estado, indicacoes: estado.indicacoes + 1 }, 'indicacao', PONTOS.indicacao, 'Indicação de amigo');
  return { ok: true, estado: await gravar(novo) };
}

export function saldoDisponivel(estado) {
  return estado.acumulado - estado.gasto;
}

// FR-GAM-04: resgate troca pontos por um voucher usado no checkout.
export async function resgatar(idResgate) {
  const estado = await carregarGamificacao();
  const resgate = RESGATES.find((r) => r.id === idResgate);
  if (!resgate) return { ok: false, erro: 'Resgate inválido' };
  if (saldoDisponivel(estado) < resgate.custo) {
    return { ok: false, erro: 'Saldo insuficiente para este resgate' };
  }
  const voucher = {
    uid: `${resgate.id}-${Date.now()}`,
    titulo: resgate.titulo,
    tipo: resgate.tipo,
    valor: resgate.valor,
    usado: false,
  };
  const novo = { ...estado, gasto: estado.gasto + resgate.custo, vouchers: [...estado.vouchers, voucher] };
  return { ok: true, estado: await gravar(novo) };
}

export async function marcarVoucherUsado(uid) {
  const estado = await carregarGamificacao();
  const vouchers = estado.vouchers.map((v) => (v.uid === uid ? { ...v, usado: true } : v));
  return gravar({ ...estado, vouchers });
}

export function nivelPara(acumulado) {
  return NIVEIS.filter((n) => acumulado >= n.minimo).pop();
}

export function proximoNivel(acumulado) {
  return NIVEIS.find((n) => n.minimo > acumulado) ?? null;
}

// Resumo usado por desafios e conquistas. Recebe os dados já carregados.
export function resumoGamificacao({ estado, pedidos, avaliacoes, agora = new Date() }) {
  const doMes = pedidos.filter((p) => {
    const d = new Date(p.criadoEm);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  });
  return {
    totalPedidos: pedidos.length,
    pedidosNoMes: doMes.length,
    totalAvaliacoes: avaliacoes.length,
    indicacoes: estado.indicacoes,
    nivel: nivelPara(estado.acumulado).nome,
    acumulado: estado.acumulado,
  };
}

// FR-GAM-03: desafios ativos com progresso.
export function desafios(resumo) {
  return [
    { id: 'compra3', titulo: 'Compre 3x este mês', pontos: 200, atual: Math.min(resumo.pedidosNoMes, 3), meta: 3 },
    { id: 'avalie1', titulo: 'Avalie um produto', pontos: 50, atual: Math.min(resumo.totalAvaliacoes, 1), meta: 1 },
    { id: 'indique1', titulo: 'Indique um amigo', pontos: 100, atual: Math.min(resumo.indicacoes, 1), meta: 1 },
  ];
}

// FR-GAM-05: conquistas com estado desbloqueado ou bloqueado.
export function conquistas(resumo) {
  return [
    { id: 'primeira-compra', titulo: '1ª Compra', desbloqueada: resumo.totalPedidos >= 1 },
    { id: 'cinco-avaliacoes', titulo: '5 Avaliações', desbloqueada: resumo.totalAvaliacoes >= 5 },
    { id: 'primeira-indicacao', titulo: '1ª Indicação', desbloqueada: resumo.indicacoes >= 1 },
    { id: 'nivel-ouro', titulo: 'Nível Ouro', desbloqueada: resumo.acumulado >= 1000 },
    { id: 'dez-pedidos', titulo: '10 Pedidos', desbloqueada: resumo.totalPedidos >= 10 },
  ];
}

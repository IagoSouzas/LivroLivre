// Avaliações de produtos (PRD FR-CAT-05, FR-ORD-03), salvas no AsyncStorage.
import { lerJson, salvarJson, CHAVES } from './storage';
import { validarObrigatorio } from '../validators';

export async function listarAvaliacoes() {
  return lerJson(CHAVES.avaliacoes, []);
}

export async function avaliacoesDoProduto(produtoId) {
  const todas = await listarAvaliacoes();
  return todas.filter((a) => a.produtoId === produtoId);
}

// Valida nota (1 a 5), título e comentário.
export function validarAvaliacao({ nota, titulo, comentario }) {
  const n = Number(nota);
  if (!Number.isInteger(n) || n < 1 || n > 5) return { valido: false, erro: 'Escolha uma nota de 1 a 5' };
  const t = validarObrigatorio(titulo, 'Título da avaliação');
  if (!t.valido) return t;
  const c = validarObrigatorio(comentario, 'Comentário');
  if (!c.valido) return c;
  if (String(comentario).trim().length < 10) return { valido: false, erro: 'Comentário deve ter pelo menos 10 caracteres' };
  return { valido: true };
}

export async function salvarAvaliacao({ produtoId, nota, titulo, comentario }, agora = new Date()) {
  const valida = validarAvaliacao({ nota, titulo, comentario });
  if (!valida.valido) return { ok: false, erro: valida.erro };
  const todas = await listarAvaliacoes();
  const nova = {
    id: `av-${Date.now()}`,
    produtoId,
    nota: Number(nota),
    titulo: String(titulo).trim(),
    comentario: String(comentario).trim(),
    criadaEm: agora.toISOString(),
  };
  await salvarJson(CHAVES.avaliacoes, [nova, ...todas]);
  return { ok: true, avaliacao: nova };
}

// FR-CAT-05: média e distribuição 5★ a 1★.
export function resumoAvaliacoes(avaliacoes) {
  const total = avaliacoes.length;
  const distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  avaliacoes.forEach((a) => {
    distribuicao[a.nota] += 1;
  });
  const media = total === 0 ? 0 : Math.round((avaliacoes.reduce((s, a) => s + a.nota, 0) / total) * 10) / 10;
  return { total, media, distribuicao };
}

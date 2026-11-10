// Busca e filtros do catálogo (PRD FR-CAT-01, FR-CAT-02, FR-CAT-03).
import { buscarMangas, buscarLivros, buscarRpg, CATEGORIAS } from './catalog';

// Termos usados quando não há busca digitada (escolha do desenvolvedor).
export const TERMOS_PADRAO = {
  [CATEGORIAS.mangas]: 'one piece',
  [CATEGORIAS.livros]: 'machado de assis',
  [CATEGORIAS.rpg]: '',
};

export const FILTROS_CATEGORIA = ['Todos', CATEGORIAS.mangas, CATEGORIAS.livros, CATEGORIAS.rpg];

export const ORDENACOES = [
  { id: 'relevancia', titulo: 'Relevância' },
  { id: 'preco-asc', titulo: 'Menor preço' },
  { id: 'preco-desc', titulo: 'Maior preço' },
];

// Busca nas APIs da categoria escolhida. Falha de uma fonte não derruba as outras.
export async function carregarCatalogo(termo = '', categoria = 'Todos') {
  const t = String(termo).trim();
  const buscas = [];
  if (categoria === 'Todos' || categoria === CATEGORIAS.mangas) {
    buscas.push(buscarMangas(t || TERMOS_PADRAO[CATEGORIAS.mangas]));
  }
  if (categoria === 'Todos' || categoria === CATEGORIAS.livros) {
    buscas.push(buscarLivros(t || TERMOS_PADRAO[CATEGORIAS.livros]));
  }
  if (categoria === 'Todos' || categoria === CATEGORIAS.rpg) {
    buscas.push(buscarRpg(t));
  }
  const resultados = await Promise.allSettled(buscas);
  return {
    itens: resultados.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value),
    falhou: resultados.some((r) => r.status === 'rejected'),
  };
}

// filtros: { precoMin, precoMax, autor, avaliacaoMin, ordem }
// mediaPorProduto: { [produtoId]: média } vinda das avaliações locais.
export function filtrarProdutos(itens, filtros = {}, mediaPorProduto = {}) {
  const { precoMin, precoMax, autor, avaliacaoMin, ordem = 'relevancia' } = filtros;
  const termoAutor = String(autor ?? '').trim().toLowerCase();

  let resultado = itens.filter((p) => {
    if (precoMin !== undefined && precoMin !== '' && p.preco < Number(precoMin)) return false;
    if (precoMax !== undefined && precoMax !== '' && p.preco > Number(precoMax)) return false;
    if (termoAutor && !`${p.nome} ${p.descricao}`.toLowerCase().includes(termoAutor)) return false;
    if (avaliacaoMin && (mediaPorProduto[p.id] ?? 0) < Number(avaliacaoMin)) return false;
    return true;
  });

  if (ordem === 'preco-asc') resultado = [...resultado].sort((a, b) => a.preco - b.preco);
  if (ordem === 'preco-desc') resultado = [...resultado].sort((a, b) => b.preco - a.preco);
  return resultado;
}

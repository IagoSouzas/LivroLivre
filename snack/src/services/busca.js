// Busca e filtros do catálogo de livros (PRD FR-CAT-01, FR-CAT-03).
// O catálogo é interno (src/data/livros.js): não há consulta a API externa.
import { LIVROS, imagemDoLivro } from '../data/livros';
import { definirPreco } from '../data/precos';

export const ORDENACOES = [
  { id: 'relevancia', titulo: 'Relevância' },
  { id: 'preco-asc', titulo: 'Menor preço' },
  { id: 'preco-desc', titulo: 'Maior preço' },
];

// Monta os produtos do catálogo com categoria, imagem e preço.
export function produtosDoCatalogo() {
  return LIVROS.map((livro) =>
    definirPreco({
      id: livro.id,
      origem: 'interno',
      categoria: 'Livros',
      nome: livro.nome,
      descricao: `Autor: ${livro.autor}`,
      imagem: imagemDoLivro(livro),
      preco: null,
    }),
  );
}

// Busca por título ou autor. Sem termo, devolve o catálogo inteiro.
export async function carregarCatalogo(termo = '') {
  const alvo = String(termo).trim().toLowerCase();
  const todos = produtosDoCatalogo();
  const itens = alvo ? todos.filter((p) => `${p.nome} ${p.descricao}`.toLowerCase().includes(alvo)) : todos;
  return { itens, falhou: false };
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

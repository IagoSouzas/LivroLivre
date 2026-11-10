import { LIVROS, imagemDoLivro } from '../src/data/livros';
import { carregarCatalogo, produtosDoCatalogo, filtrarProdutos } from '../src/services/busca';
import { FAIXAS_PRECO } from '../src/data/precos';

describe('catálogo interno de livros', () => {
  test('tem pelo menos 20 livros com nome, autor, preço e id únicos', () => {
    expect(LIVROS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(LIVROS.map((l) => l.id)).size).toBe(LIVROS.length);
    const produtos = produtosDoCatalogo();
    produtos.forEach((p) => {
      expect(p.nome).toBeTruthy();
      expect(p.descricao).toMatch(/^Autor: /);
      expect(p.preco).toBeGreaterThanOrEqual(FAIXAS_PRECO.Livros.min);
      expect(p.preco).toBeLessThanOrEqual(FAIXAS_PRECO.Livros.max);
    });
  });

  test('imagem vem da capa da Open Library ou fica vazia', () => {
    expect(imagemDoLivro({ capa: 647501 })).toBe('https://covers.openlibrary.org/b/id/647501-M.jpg');
    expect(imagemDoLivro({ capa: null })).toBeNull();
  });

  test('busca por título ou autor sem chamada à rede', async () => {
    const fetchImpl = jest.fn();
    global.fetch = fetchImpl;
    const todos = await carregarCatalogo('');
    const machado = await carregarCatalogo('machado');
    expect(todos.itens.length).toBe(LIVROS.length);
    expect(machado.itens.every((p) => p.descricao.includes('Machado'))).toBe(true);
    expect(machado.itens.length).toBeGreaterThan(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('filtro de preço funciona sobre o catálogo', () => {
    const produtos = produtosDoCatalogo();
    const filtrados = filtrarProdutos(produtos, { precoMin: 1000 });
    expect(filtrados).toHaveLength(0);
  });
});

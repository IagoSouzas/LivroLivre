import { calcularCarrinho, alterarQuantidade, adicionarItem, formatarMoeda } from '../src/services/cart';

const livro = { id: 'a', nome: 'Dom Casmurro', preco: 34.9 };
const manga = { id: 'b', nome: 'Naruto vol. 1', preco: 19.5 };

describe('calcularCarrinho', () => {
  test('carrinho vazio zera tudo', () => {
    expect(calcularCarrinho([])).toEqual({ quantidadeTotal: 0, subtotal: 0, desconto: 0, total: 0 });
  });

  test('calcula quantidade, subtotal e total', () => {
    const itens = [
      { ...livro, quantidade: 2 },
      { ...manga, quantidade: 1 },
    ];
    expect(calcularCarrinho(itens)).toEqual({
      quantidadeTotal: 3,
      subtotal: 89.3,
      desconto: 0,
      total: 89.3,
    });
  });

  test('aplica desconto no total', () => {
    const itens = [{ ...livro, quantidade: 1 }];
    expect(calcularCarrinho(itens, 10).total).toBe(24.9);
  });

  test('desconto não deixa total negativo', () => {
    const itens = [{ ...livro, quantidade: 1 }];
    expect(calcularCarrinho(itens, 100)).toEqual({ quantidadeTotal: 1, subtotal: 34.9, desconto: 34.9, total: 0 });
  });

  test('desconto negativo é tratado como zero', () => {
    const itens = [{ ...livro, quantidade: 1 }];
    expect(calcularCarrinho(itens, -5).desconto).toBe(0);
  });
});

describe('alterarQuantidade', () => {
  test('altera a quantidade do item certo', () => {
    const itens = [{ ...livro, quantidade: 1 }, { ...manga, quantidade: 1 }];
    const novos = alterarQuantidade(itens, 'b', 4);
    expect(novos.find((i) => i.id === 'b').quantidade).toBe(4);
    expect(novos.find((i) => i.id === 'a').quantidade).toBe(1);
  });

  test('quantidade zero remove o item', () => {
    const itens = [{ ...livro, quantidade: 1 }];
    expect(alterarQuantidade(itens, 'a', 0)).toEqual([]);
  });
});

describe('adicionarItem', () => {
  test('adiciona produto novo', () => {
    expect(adicionarItem([], livro)).toEqual([{ id: 'a', nome: 'Dom Casmurro', preco: 34.9, quantidade: 1 }]);
  });

  test('soma quantidade se o produto já existe', () => {
    const itens = adicionarItem([{ ...livro, quantidade: 1 }], livro, 2);
    expect(itens).toHaveLength(1);
    expect(itens[0].quantidade).toBe(3);
  });
});

describe('formatarMoeda', () => {
  test('formata com vírgula decimal', () => {
    expect(formatarMoeda(1057)).toBe('R$ 1057,00');
    expect(formatarMoeda(34.9)).toBe('R$ 34,90');
  });
});

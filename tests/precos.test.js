import { precoPara, definirPreco, FAIXAS_PRECO, hashTexto } from '../src/data/precos';

describe('precoPara', () => {
  test.each(Object.keys(FAIXAS_PRECO))('%s fica dentro da faixa e termina em ,90', (categoria) => {
    const faixa = FAIXAS_PRECO[categoria];
    for (let i = 0; i < 200; i += 1) {
      const preco = precoPara(`id-${i}`, categoria);
      expect(preco).toBeGreaterThanOrEqual(faixa.min);
      expect(preco).toBeLessThanOrEqual(faixa.max);
      expect(Math.round(preco * 100) % 100).toBe(90);
    }
  });

  test('é determinístico: mesmo id, mesmo preço', () => {
    expect(precoPara('mangadex:abc', 'Mangás')).toBe(precoPara('mangadex:abc', 'Mangás'));
  });

  test('categoria desconhecida não recebe preço', () => {
    expect(precoPara('x', 'Outra')).toBeNull();
  });
});

describe('definirPreco', () => {
  test('preenche o campo preco sem alterar o restante do item', () => {
    const item = { id: 'open5e:srd', categoria: 'RPG', nome: 'SRD' };
    const comPreco = definirPreco(item);
    expect(comPreco.preco).toBeGreaterThanOrEqual(FAIXAS_PRECO.RPG.min);
    expect(comPreco.nome).toBe('SRD');
    expect(item.preco).toBeUndefined();
  });
});

describe('hashTexto', () => {
  test('retorna inteiro não negativo', () => {
    expect(hashTexto('livro')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashTexto('livro'))).toBe(true);
  });
});

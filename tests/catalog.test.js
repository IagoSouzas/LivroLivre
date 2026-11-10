import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import {
  buscarMangas,
  buscarLivros,
  buscarRpg,
  normalizarMangaDex,
  normalizarOpenLibrary,
  normalizarOpen5e,
  LIMITE_ITENS,
} from '../src/services/catalog';
import { TTL_PADRAO_MS } from '../src/services/cache';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

function resposta(corpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => corpo };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('normalização', () => {
  test('MangaDex: usa título em inglês e monta URL da capa', () => {
    const itens = normalizarMangaDex({
      data: [
        {
          id: 'abc',
          attributes: { title: { en: 'Naruto' }, description: { en: 'Ninja story' } },
          relationships: [{ type: 'cover_art', attributes: { fileName: 'capa.png' } }],
        },
      ],
    });
    expect(itens[0]).toMatchObject({
      id: 'mangadex:abc',
      categoria: 'Mangás',
      nome: 'Naruto',
      descricao: 'Ninja story',
      imagem: 'https://uploads.mangadex.org/covers/abc/capa.png.256.jpg',
      preco: null,
    });
  });

  test('MangaDex: sem capa, imagem fica nula', () => {
    const itens = normalizarMangaDex({ data: [{ id: 'x', attributes: { title: { en: 'A' } }, relationships: [] }] });
    expect(itens[0].imagem).toBeNull();
  });

  test('Open Library: monta autor e URL da capa', () => {
    const itens = normalizarOpenLibrary({
      docs: [{ key: '/works/OL1W', title: 'Dom Casmurro', author_name: ['Machado de Assis'], cover_i: 42, first_publish_year: 1899 }],
    });
    expect(itens[0]).toMatchObject({
      id: 'openlibrary:/works/OL1W',
      categoria: 'Livros',
      nome: 'Dom Casmurro',
      descricao: 'Autor: Machado de Assis · 1899',
      imagem: 'https://covers.openlibrary.org/b/id/42-M.jpg',
    });
  });

  test('Open Library: limita a 20 itens', () => {
    const docs = Array.from({ length: 30 }, (_, i) => ({ key: `/works/${i}`, title: `Livro ${i}` }));
    expect(normalizarOpenLibrary({ docs })).toHaveLength(LIMITE_ITENS);
  });

  test('Open5e: usa display_name e desc', () => {
    const itens = normalizarOpen5e({ results: [{ key: 'srd', display_name: 'SRD', desc: 'Regras' }] });
    expect(itens[0]).toMatchObject({ id: 'open5e:srd', categoria: 'RPG', nome: 'SRD', descricao: 'Regras' });
  });
});

describe('buscarMangas', () => {
  const corpoMangaDex = {
    data: [{ id: 'm1', attributes: { title: { en: 'One Piece' } }, relationships: [] }],
  };

  test('consulta a API, normaliza e grava no cache', async () => {
    const fetchImpl = jest.fn(async () => resposta(corpoMangaDex));

    const itens = await buscarMangas('one piece', { fetchImpl, agora: 1000 });

    expect(fetchImpl.mock.calls[0][0]).toContain('https://api.mangadex.org/manga?title=one%20piece&limit=20');
    expect(itens[0].nome).toBe('One Piece');
  });

  test('segunda consulta dentro do TTL usa o cache', async () => {
    const fetchImpl = jest.fn(async () => resposta(corpoMangaDex));

    await buscarMangas('one piece', { fetchImpl, agora: 1000 });
    await buscarMangas('one piece', { fetchImpl, agora: 2000 });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  test('após o TTL, consulta a API de novo', async () => {
    const fetchImpl = jest.fn(async () => resposta(corpoMangaDex));

    await buscarMangas('one piece', { fetchImpl, agora: 1000 });
    await buscarMangas('one piece', { fetchImpl, agora: 1000 + TTL_PADRAO_MS + 1 });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  test('erro HTTP gera exceção com o status', async () => {
    const fetchImpl = jest.fn(async () => resposta({}, 503));
    await expect(buscarMangas('x', { fetchImpl })).rejects.toThrow('HTTP 503');
  });
});

describe('buscarLivros', () => {
  test('consulta Open Library com campos reduzidos', async () => {
    const fetchImpl = jest.fn(async () => resposta({ docs: [] }));
    await buscarLivros('harry potter', { fetchImpl });
    const [url] = fetchImpl.mock.calls[0];
    expect(url).toContain('openlibrary.org/search.json?q=harry%20potter&limit=20&fields=');
  });
});

describe('buscarRpg', () => {
  const lista = {
    results: [
      { key: 'srd', display_name: 'System Reference', desc: 'Regras base' },
      { key: 'guia', display_name: "Adventurer's Guide", desc: 'Aventuras' },
    ],
  };

  test('baixa a lista uma vez e filtra localmente pelo termo', async () => {
    const fetchImpl = jest.fn(async () => resposta(lista));

    const achados = await buscarRpg('guide', { fetchImpl });
    const todos = await buscarRpg('', { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.open5e.com/v2/documents/?limit=100');
    expect(achados.map((i) => i.nome)).toEqual(["Adventurer's Guide"]);
    expect(todos).toHaveLength(2);
  });
});

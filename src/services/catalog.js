// Consultas aos catálogos externos (PRD seção 9). Cada função:
// 1. tenta o cache (24 h);
// 2. se não houver, consulta a API com limite de 20 itens;
// 3. normaliza para o formato do app e grava no cache.
// fetchImpl é injetável para os testes.
import { chaveCache, lerCache, gravarCache } from './cache';
import { definirPreco } from '../data/precos';

export const LIMITE_ITENS = 20;

export const CATEGORIAS = {
  mangas: 'Mangás',
  livros: 'Livros',
  rpg: 'RPG',
};

const USER_AGENT = 'LivroLivre/1.0 (IAGO SOUZA)';

async function buscarJson(fetchImpl, url) {
  const resposta = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!resposta.ok) {
    throw new Error(`Falha na API (HTTP ${resposta.status})`);
  }
  return resposta.json();
}

// ---------- Mangás: MangaDex ----------

export function normalizarMangaDex(json) {
  return (json.data || []).map((manga) => {
    const titulos = manga.attributes?.title || {};
    const nome = titulos.en || Object.values(titulos)[0] || 'Sem título';
    const descricoes = manga.attributes?.description || {};
    const descricao = descricoes.pt || descricoes.en || Object.values(descricoes)[0] || '';
    const capa = (manga.relationships || []).find((r) => r.type === 'cover_art');
    const arquivo = capa?.attributes?.fileName;
    return {
      id: `mangadex:${manga.id}`,
      origem: 'mangadex',
      categoria: CATEGORIAS.mangas,
      nome,
      descricao,
      imagem: arquivo ? `https://uploads.mangadex.org/covers/${manga.id}/${arquivo}.256.jpg` : null,
      preco: null,
    };
  });
}

export async function buscarMangas(termo, { fetchImpl = fetch, agora = Date.now() } = {}) {
  const chave = chaveCache('mangadex', termo);
  const emCache = await lerCache(chave, agora);
  if (emCache) return emCache;

  const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(termo)}&limit=${LIMITE_ITENS}&includes[]=cover_art`;
  const itens = normalizarMangaDex(await buscarJson(fetchImpl, url)).map(definirPreco);
  await gravarCache(chave, itens, agora);
  return itens;
}

// ---------- Livros: Open Library ----------

export function normalizarOpenLibrary(json) {
  return (json.docs || []).slice(0, LIMITE_ITENS).map((doc) => ({
    id: `openlibrary:${doc.key}`,
    origem: 'openlibrary',
    categoria: CATEGORIAS.livros,
    nome: doc.title || 'Sem título',
    descricao: (doc.author_name || []).length
      ? `Autor: ${doc.author_name.join(', ')}${doc.first_publish_year ? ` · ${doc.first_publish_year}` : ''}`
      : '',
    imagem: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    preco: null,
  }));
}

export async function buscarLivros(termo, { fetchImpl = fetch, agora = Date.now() } = {}) {
  const chave = chaveCache('openlibrary', termo);
  const emCache = await lerCache(chave, agora);
  if (emCache) return emCache;

  const campos = 'key,title,author_name,cover_i,first_publish_year';
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(termo)}&limit=${LIMITE_ITENS}&fields=${campos}`;
  const itens = normalizarOpenLibrary(await buscarJson(fetchImpl, url)).map(definirPreco);
  await gravarCache(chave, itens, agora);
  return itens;
}

// ---------- RPG: Open5e ----------

export function normalizarOpen5e(json) {
  return (json.results || []).map((doc) => ({
    id: `open5e:${doc.key}`,
    origem: 'open5e',
    categoria: CATEGORIAS.rpg,
    nome: doc.display_name || doc.name || 'Sem título',
    descricao: doc.desc || '',
    imagem: null,
    preco: null,
  }));
}

// A Open5e ignora os parâmetros de busca (search, display_name__icontains) em /v2/documents/,
// verificado em 2026-11-10. Por isso a lista inteira é baixada uma vez, cacheada,
// e a filtragem por termo é feita localmente.
export async function buscarRpg(termo = '', { fetchImpl = fetch, agora = Date.now() } = {}) {
  const chave = chaveCache('open5e', 'lista-documentos');
  let itens = await lerCache(chave, agora);
  if (!itens) {
    itens = normalizarOpen5e(await buscarJson(fetchImpl, 'https://api.open5e.com/v2/documents/?limit=100')).map(definirPreco);
    await gravarCache(chave, itens, agora);
  }
  const alvo = String(termo).trim().toLowerCase();
  if (!alvo) return itens.slice(0, LIMITE_ITENS);
  return itens
    .filter((item) => `${item.nome} ${item.descricao}`.toLowerCase().includes(alvo))
    .slice(0, LIMITE_ITENS);
}

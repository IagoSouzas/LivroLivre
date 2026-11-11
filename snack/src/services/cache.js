// Cache com validade (TTL) no AsyncStorage, usado pelas consultas às APIs externas.
import { lerJson, salvarJson } from './storage';

export const TTL_PADRAO_MS = 24 * 60 * 60 * 1000; // 24 h, conforme o PRD (seção 9.4)

export function chaveCache(fonte, termo) {
  return `@livrolivre/cache/${fonte}/${String(termo).trim().toLowerCase()}`;
}

// Retorna o valor em cache se ainda estiver dentro do TTL, senão null.
export async function lerCache(chave, agora = Date.now(), ttl = TTL_PADRAO_MS) {
  const registro = await lerJson(chave, null);
  if (!registro || typeof registro.salvoEm !== 'number') return null;
  if (agora - registro.salvoEm > ttl) return null;
  return registro.dados;
}

export async function gravarCache(chave, dados, agora = Date.now()) {
  return salvarJson(chave, { salvoEm: agora, dados });
}

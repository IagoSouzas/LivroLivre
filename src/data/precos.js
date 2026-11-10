// Preços dos produtos vindos das APIs externas (que não trazem preço).
// Regra definida em 2026-11-10: cada categoria tem uma faixa, e o preço de cada item é
// escolhido de forma determinística pelo id, sempre terminando em ,90.
// Assim o mesmo produto tem sempre o mesmo preço, em qualquer consulta.

export const FAIXAS_PRECO = {
  Mangás: { min: 24.9, max: 39.9 },
  Livros: { min: 29.9, max: 79.9 },
  RPG: { min: 49.9, max: 149.9 },
};

export function hashTexto(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function precoPara(id, categoria) {
  const faixa = FAIXAS_PRECO[categoria];
  if (!faixa) return null;
  const inteiroMin = Math.floor(faixa.min);
  const inteiroMax = Math.floor(faixa.max);
  const opcoes = inteiroMax - inteiroMin + 1;
  const deslocamento = hashTexto(String(id)) % opcoes;
  return Number((inteiroMin + deslocamento + 0.9).toFixed(2));
}

export function definirPreco(item) {
  return { ...item, preco: precoPara(item.id, item.categoria) };
}

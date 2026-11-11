// Cupons do carrinho (PRD FR-CART-03) e vouchers de resgate (FR-GAM-04).
// Cupom de teste: LIVRO10 = 10% de desconto no subtotal.
export const CUPONS = {
  LIVRO10: { tipo: 'percentual', valor: 10 },
};

export function aplicarCupom(codigo, subtotal) {
  const chave = String(codigo ?? '').trim().toUpperCase();
  if (!chave) return { ok: false, erro: 'Informe um cupom' };
  const cupom = CUPONS[chave];
  if (!cupom) return { ok: false, erro: 'Cupom inválido' };
  const desconto = Math.round(subtotal * (cupom.valor / 100) * 100) / 100;
  return { ok: true, codigo: chave, desconto };
}

// Desconto de um voucher resgatado: valor fixo em reais, ou frete grátis (sem custo de frete no app).
export function descontoDoVoucher(voucher, subtotal) {
  if (!voucher || voucher.usado) return 0;
  if (voucher.tipo === 'desconto') return Math.min(voucher.valor, subtotal);
  return 0;
}

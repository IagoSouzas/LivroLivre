// Favoritos, endereços, formas de pagamento e configurações (PRD FR-ACC-02 a FR-ACC-04 e FR-ACC-03).
import { lerJson, salvarJson, CHAVES } from './storage';
import {
  validarObrigatorio,
  validarCep,
  validarNumeroCartao,
  validarValidadeCartao,
  validarCvv,
  somenteDigitos,
} from '../validators';

// ---------- Favoritos ----------
export async function listarFavoritos() {
  return lerJson(CHAVES.favoritos, []);
}

export async function isFavorito(id) {
  return (await listarFavoritos()).some((f) => f.id === id);
}

export async function alternarFavorito(produto) {
  const atuais = await listarFavoritos();
  const existe = atuais.some((f) => f.id === produto.id);
  const novos = existe
    ? atuais.filter((f) => f.id !== produto.id)
    : [...atuais, { id: produto.id, nome: produto.nome, preco: produto.preco, imagem: produto.imagem, categoria: produto.categoria }];
  await salvarJson(CHAVES.favoritos, novos);
  return !existe;
}

// ---------- Endereços ----------
export function validarEndereco(e) {
  const resultados = {
    cep: validarCep(e.cep),
    rua: validarObrigatorio(e.rua, 'Rua'),
    numero: validarObrigatorio(e.numero, 'Número'),
    bairro: validarObrigatorio(e.bairro, 'Bairro'),
    cidade: validarObrigatorio(e.cidade, 'Cidade'),
  };
  return Object.fromEntries(Object.entries(resultados).map(([k, r]) => [k, r.erro]).filter(([, v]) => v));
}

export async function listarEnderecos() {
  return lerJson(CHAVES.enderecos, []);
}

export async function salvarEndereco(endereco) {
  const erros = validarEndereco(endereco);
  if (Object.keys(erros).length) return { ok: false, erros };
  const atuais = await listarEnderecos();
  const novo = { ...endereco, id: endereco.id ?? `end-${Date.now()}`, cep: somenteDigitos(endereco.cep) };
  const lista = atuais.some((e) => e.id === novo.id)
    ? atuais.map((e) => (e.id === novo.id ? novo : e))
    : [...atuais, novo];
  await salvarJson(CHAVES.enderecos, lista);
  return { ok: true, endereco: novo };
}

export async function removerEndereco(id) {
  const atuais = await listarEnderecos();
  await salvarJson(CHAVES.enderecos, atuais.filter((e) => e.id !== id));
}

// ---------- Formas de pagamento ----------
// Só guarda o final do cartão (nunca o número completo nem o CVV).
export function validarCartao({ numero, validade, cvv, nome }) {
  const erros = {};
  const checks = {
    numero: validarNumeroCartao(numero),
    validade: validarValidadeCartao(validade),
    cvv: validarCvv(cvv),
    nome: validarObrigatorio(nome, 'Nome no cartão'),
  };
  Object.entries(checks).forEach(([k, r]) => {
    if (!r.valido) erros[k] = r.erro;
  });
  return erros;
}

export async function listarFormasPagamento() {
  return lerJson(CHAVES.formasPagamento, []);
}

export async function salvarCartao(dados) {
  const erros = validarCartao(dados);
  if (Object.keys(erros).length) return { ok: false, erros };
  const digitos = somenteDigitos(dados.numero);
  const atuais = await listarFormasPagamento();
  const novo = {
    id: `card-${Date.now()}`,
    tipo: 'Cartão crédito',
    final: digitos.slice(-4),
    nome: dados.nome.trim(),
  };
  await salvarJson(CHAVES.formasPagamento, [...atuais, novo]);
  return { ok: true, cartao: novo };
}

export async function removerFormaPagamento(id) {
  const atuais = await listarFormasPagamento();
  await salvarJson(CHAVES.formasPagamento, atuais.filter((f) => f.id !== id));
}

// ---------- Configurações ----------
export const CONFIG_PADRAO = {
  autenticacaoDoisFatores: true,
  biometria: true,
  push: true,
  email: true,
  sms: false,
};

export async function carregarConfig() {
  return { ...CONFIG_PADRAO, ...(await lerJson(CHAVES.config, {})) };
}

export async function alternarConfig(chave) {
  const atual = await carregarConfig();
  const novo = { ...atual, [chave]: !atual[chave] };
  await salvarJson(CHAVES.config, novo);
  return novo;
}

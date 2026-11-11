// Cadastro local de usuários (PRD FR-AUTH-04 e FR-AUTH-05), salvo no AsyncStorage.
import { lerJson, salvarJson, CHAVES } from './storage';
import {
  validarObrigatorio,
  validarEmail,
  validarTelefone,
  validarCpf,
  validarDataNascimento,
  validarSenha,
  validarConfirmacaoSenha,
  primeiroErro,
  somenteDigitos,
} from '../validators';

export function validarCadastro(dados, hoje = new Date()) {
  const resultados = {
    nome: validarObrigatorio(dados.nome, 'Nome completo'),
    cpf: validarCpf(dados.cpf),
    email: validarEmail(dados.email),
    telefone: validarTelefone(dados.telefone),
    dataNascimento: validarDataNascimento(dados.dataNascimento, hoje),
    senha: validarSenha(dados.senha),
    confirmacaoSenha: validarConfirmacaoSenha(dados.senha, dados.confirmacaoSenha),
    termos: dados.termos
      ? { valido: true }
      : { valido: false, erro: 'Aceite os termos de uso e a política de privacidade' },
  };
  return { resultados, primeiroErro: primeiroErro(resultados) };
}

export async function listarUsuarios() {
  return lerJson(CHAVES.usuarios, []);
}

// Cria o cadastro. Recusa CPF ou e-mail já cadastrados.
export async function criarUsuario(dados, hoje = new Date()) {
  const { primeiroErro: erro } = validarCadastro(dados, hoje);
  if (erro) return { ok: false, campo: erro.campo, erro: erro.erro };

  const usuarios = await listarUsuarios();
  const cpf = somenteDigitos(dados.cpf);
  const email = dados.email.trim().toLowerCase();

  if (usuarios.some((u) => somenteDigitos(u.cpf) === cpf)) {
    return { ok: false, campo: 'cpf', erro: 'Já existe uma conta com este CPF' };
  }
  if (usuarios.some((u) => u.email === email)) {
    return { ok: false, campo: 'email', erro: 'Já existe uma conta com este e-mail' };
  }

  const novo = {
    id: `local-${Date.now()}`,
    nome: dados.nome.trim(),
    cpf,
    email,
    telefone: somenteDigitos(dados.telefone),
    dataNascimento: dados.dataNascimento.trim(),
    senha: dados.senha,
    criadoEm: new Date().toISOString(),
  };
  await salvarJson(CHAVES.usuarios, [...usuarios, novo]);
  return { ok: true, usuario: novo };
}

// Atualiza campos do cadastro (ex.: nome, telefone) pelo id.
export async function atualizarUsuario(id, alteracoes) {
  const usuarios = await listarUsuarios();
  const atualizados = usuarios.map((u) => (u.id === id ? { ...u, ...alteracoes } : u));
  await salvarJson(CHAVES.usuarios, atualizados);
  return atualizados.find((u) => u.id === id) ?? null;
}

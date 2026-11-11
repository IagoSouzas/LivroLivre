// Login com DummyJSON (PRD FR-AUTH-01).
// A API aceita só username. Se o campo tiver "@", o e-mail é convertido em username
// pelo endpoint /users/filter (validado em 2026-11-10).
import { lerJson, salvarJson, removerChave, CHAVES } from './storage';
import { listarUsuarios } from './usuarios';

const BASE = 'https://dummyjson.com';

export const MENSAGEM_LOGIN_INVALIDO = 'Usuário ou senha inválidos';

export const CONTA_TESTE = { usuario: 'emilys', senha: 'emilyspass' };

async function buscarUsernamePorEmail(email, fetchImpl) {
  const url = `${BASE}/users/filter?key=email&value=${encodeURIComponent(email)}&select=username`;
  const resposta = await fetchImpl(url);
  if (!resposta.ok) throw new Error('Falha ao consultar usuários');
  const json = await resposta.json();
  return json.users?.[0]?.username ?? null;
}

// Retorna { token, usuario } em caso de sucesso, ou lança Error com a mensagem para o usuário.
export async function login(usuarioOuEmail, senha, { fetchImpl = fetch } = {}) {
  let username = String(usuarioOuEmail).trim();

  // Cadastros criados pelo app (criar conta) entram com e-mail e a senha cadastrada.
  if (username.includes('@')) {
    const local = (await listarUsuarios()).find((u) => u.email === username.toLowerCase());
    if (local) {
      if (local.senha !== senha) throw new Error(MENSAGEM_LOGIN_INVALIDO);
      const sessaoLocal = {
        token: 'local',
        origem: 'local',
        usuario: { id: local.id, username: local.email, email: local.email, nome: local.nome, imagem: null },
      };
      await salvarJson(CHAVES.sessao, sessaoLocal);
      return sessaoLocal;
    }
  }

  if (username.includes('@')) {
    const encontrado = await buscarUsernamePorEmail(username, fetchImpl);
    if (!encontrado) throw new Error(MENSAGEM_LOGIN_INVALIDO);
    username = encontrado;
  }

  const resposta = await fetchImpl(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: senha }),
  });

  if (resposta.status === 400 || resposta.status === 401) {
    throw new Error(MENSAGEM_LOGIN_INVALIDO);
  }
  if (!resposta.ok) throw new Error('Não foi possível entrar agora. Tente novamente.');

  const json = await resposta.json();
  const sessao = {
    token: json.accessToken,
    origem: 'dummyjson',
    usuario: {
      id: json.id,
      username: json.username,
      email: json.email,
      nome: [json.firstName, json.lastName].filter(Boolean).join(' '),
      imagem: json.image,
    },
  };
  await salvarJson(CHAVES.sessao, sessao);
  return sessao;
}

export async function sessaoAtual() {
  return lerJson(CHAVES.sessao, null);
}

export async function sair() {
  await removerChave(CHAVES.sessao);
}

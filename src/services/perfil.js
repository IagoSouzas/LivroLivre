// Dados do perfil e alteração de senha (PRD FR-AUTH-05 e FR-ACC-03).
// Contas criadas no app são salvas em `usuarios`. Contas da DummyJSON só podem ter nome e telefone
// ajustados localmente (em `perfil`), porque a senha e os dados ficam na API.
import { lerJson, salvarJson, CHAVES } from './storage';
import { listarUsuarios, atualizarUsuario } from './usuarios';
import { validarObrigatorio, validarTelefone, validarSenha, validarConfirmacaoSenha, somenteDigitos } from '../validators';

export async function carregarPerfil(sessao) {
  const base = sessao?.usuario ?? {};
  if (sessao?.origem === 'local') {
    const local = (await listarUsuarios()).find((u) => u.id === base.id);
    return { nome: local?.nome ?? base.nome, email: base.email, telefone: local?.telefone ?? '', username: base.username };
  }
  const extra = await lerJson(CHAVES.perfil, {});
  return {
    nome: extra.nome ?? base.nome,
    email: base.email,
    telefone: extra.telefone ?? '',
    username: base.username,
  };
}

export async function salvarPerfil(sessao, { nome, telefone }) {
  const erros = {};
  const n = validarObrigatorio(nome, 'Nome');
  if (!n.valido) erros.nome = n.erro;
  const t = validarTelefone(telefone);
  if (!t.valido) erros.telefone = t.erro;
  if (Object.keys(erros).length) return { ok: false, erros };

  if (sessao?.origem === 'local') {
    await atualizarUsuario(sessao.usuario.id, { nome: nome.trim(), telefone: somenteDigitos(telefone) });
  } else {
    const extra = await lerJson(CHAVES.perfil, {});
    await salvarJson(CHAVES.perfil, { ...extra, nome: nome.trim(), telefone: somenteDigitos(telefone) });
  }
  return { ok: true };
}

export async function alterarSenha(sessao, { atual, nova, confirmacao }) {
  if (sessao?.origem !== 'local') {
    return { ok: false, erro: 'A senha da conta de teste não pode ser alterada.' };
  }
  const obrigatoria = validarObrigatorio(atual, 'Senha atual');
  if (!obrigatoria.valido) return { ok: false, erro: obrigatoria.erro };
  const forte = validarSenha(nova);
  if (!forte.valido) return { ok: false, erro: forte.erro };
  const confere = validarConfirmacaoSenha(nova, confirmacao);
  if (!confere.valido) return { ok: false, erro: confere.erro };

  const local = (await listarUsuarios()).find((u) => u.id === sessao.usuario.id);
  if (!local || local.senha !== atual) return { ok: false, erro: 'Senha atual incorreta.' };
  await atualizarUsuario(local.id, { senha: nova });
  return { ok: true };
}

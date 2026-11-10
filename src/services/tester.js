// Tester do app (PRD seção 13.2): checagens automáticas de cada funcionalidade.
// Cada checagem retorna { id, titulo, ok, detalhe }. Nenhuma altera dados do usuário.
import { validarEmail, validarCpf, validarSenha, validarQuantidade, validarCep } from '../validators';
import { calcularCarrinho } from './cart';
import { aplicarCupom } from './promocoes';
import { precoPara, FAIXAS_PRECO } from '../data/precos';
import { login, MENSAGEM_LOGIN_INVALIDO, CONTA_TESTE } from './auth';
import { carregarCatalogo } from './busca';
import { validarAvaliacao, resumoAvaliacoes } from './avaliacoes';
import { etapaAtual, statusAtual, ETAPAS } from './pedidos';
import { dentroDoPrazo, validarDevolucao } from './devolucoes';
import { nivelPara, RESGATES } from './gamificacao';
import { lerCache, gravarCache, chaveCache } from './cache';
import { salvarJson, lerJson } from './storage';
import { validarCadastro } from './usuarios';

const checagens = [
  {
    id: 'val-email',
    titulo: 'Validação de e-mail',
    executar: () => {
      const ok = validarEmail('iago@exemplo.com').valido && !validarEmail('iago@').valido;
      return { ok, detalhe: ok ? 'aceita válido, rejeita inválido' : 'falhou' };
    },
  },
  {
    id: 'val-cpf',
    titulo: 'Validação de CPF',
    executar: () => {
      const ok = validarCpf('529.982.247-25').valido && !validarCpf('529.982.247-26').valido;
      return { ok, detalhe: ok ? 'dígitos verificadores conferidos' : 'falhou' };
    },
  },
  {
    id: 'val-senha',
    titulo: 'Validação de senha',
    executar: () => {
      const ok = validarSenha('abcdef12').valido && !validarSenha('abcdefgh').valido;
      return { ok, detalhe: ok ? 'regras de tamanho, letra e número' : 'falhou' };
    },
  },
  {
    id: 'val-campos-vazios',
    titulo: 'Campos nulos ou vazios',
    executar: () => {
      const r = validarCadastro({ nome: '', cpf: '', email: '', telefone: '', dataNascimento: '', senha: '', confirmacaoSenha: '', termos: false });
      const ok = !!r.primeiroErro;
      return { ok, detalhe: ok ? `primeiro erro: ${r.primeiroErro.erro}` : 'formulário vazio foi aceito' };
    },
  },
  {
    id: 'val-quantidade',
    titulo: 'Quantidade inteira e positiva',
    executar: () => {
      const ok = validarQuantidade(1).valido && !validarQuantidade(0).valido && !validarQuantidade(1.5).valido;
      return { ok, detalhe: ok ? 'aceita 1, rejeita 0 e decimal' : 'falhou' };
    },
  },
  {
    id: 'val-cep',
    titulo: 'Validação de CEP',
    executar: () => {
      const ok = validarCep('01234-567').valido && !validarCep('0123').valido;
      return { ok, detalhe: ok ? 'aceita 8 dígitos' : 'falhou' };
    },
  },
  {
    id: 'carrinho-totais',
    titulo: 'Cálculo automático do carrinho',
    executar: () => {
      const t = calcularCarrinho([{ id: 'a', preco: 10, quantidade: 2 }, { id: 'b', preco: 5.5, quantidade: 1 }], 5);
      const ok = t.quantidadeTotal === 3 && t.subtotal === 25.5 && t.total === 20.5;
      return { ok, detalhe: `itens=${t.quantidadeTotal}, subtotal=${t.subtotal}, total=${t.total}` };
    },
  },
  {
    id: 'cupom',
    titulo: 'Cupom LIVRO10',
    executar: () => {
      const bom = aplicarCupom('livro10', 100);
      const ruim = aplicarCupom('NAOEXISTE', 100);
      const ok = bom.ok && bom.desconto === 10 && !ruim.ok;
      return { ok, detalhe: ok ? 'aplica 10% e rejeita inválido' : 'falhou' };
    },
  },
  {
    id: 'preco-faixa',
    titulo: 'Preço dos itens externos dentro da faixa',
    executar: () => {
      const ok = Object.keys(FAIXAS_PRECO).every((cat) => {
        const p = precoPara('amostra', cat);
        return p >= FAIXAS_PRECO[cat].min && p <= FAIXAS_PRECO[cat].max;
      });
      return { ok, detalhe: ok ? 'todas as categorias dentro da faixa' : 'fora da faixa' };
    },
  },
  {
    id: 'catalogo-20',
    titulo: 'Catálogo com no mínimo 20 produtos (APIs)',
    executar: async () => {
      const { itens } = await carregarCatalogo('', 'Todos');
      const ok = itens.length >= 20;
      return { ok, detalhe: `${itens.length} produtos carregados` };
    },
  },
  {
    id: 'cache',
    titulo: 'Cache de consultas (TTL)',
    executar: async () => {
      const chave = chaveCache('teste', 'checagem');
      await gravarCache(chave, [{ id: 1 }], 1000);
      const dentro = await lerCache(chave, 2000);
      const expirado = await lerCache(chave, 1000 + 25 * 60 * 60 * 1000);
      const ok = !!dentro && expirado === null;
      return { ok, detalhe: ok ? 'usa dentro de 24 h e expira depois' : 'falhou' };
    },
  },
  {
    id: 'storage',
    titulo: 'Persistência no AsyncStorage',
    executar: async () => {
      const chave = '@livrolivre/tester';
      await salvarJson(chave, { ok: true });
      const lido = await lerJson(chave, null);
      const ok = lido?.ok === true;
      return { ok, detalhe: ok ? 'gravou e leu de volta' : 'falhou' };
    },
  },
  {
    id: 'login-teste',
    titulo: 'Login com conta de teste (DummyJSON)',
    executar: async () => {
      const sessao = await login(CONTA_TESTE.usuario, CONTA_TESTE.senha);
      const ok = !!sessao.token;
      return { ok, detalhe: ok ? `entrou como ${sessao.usuario.username}` : 'sem token' };
    },
  },
  {
    id: 'login-invalido',
    titulo: 'Login rejeita senha errada',
    executar: async () => {
      try {
        await login(CONTA_TESTE.usuario, 'senha-errada-123');
        return { ok: false, detalhe: 'senha errada foi aceita' };
      } catch (erro) {
        const ok = erro.message === MENSAGEM_LOGIN_INVALIDO;
        return { ok, detalhe: ok ? 'mensagem de login inválido' : erro.message };
      }
    },
  },
  {
    id: 'avaliacao-valida',
    titulo: 'Validação de avaliação',
    executar: () => {
      const ok = validarAvaliacao({ nota: 4, titulo: 'Bom', comentario: 'Gostei bastante do livro.' }).valido
        && !validarAvaliacao({ nota: 0, titulo: 'x', comentario: 'curto' }).valido;
      return { ok, detalhe: ok ? 'nota 1 a 5 e comentário mínimo' : 'falhou' };
    },
  },
  {
    id: 'avaliacao-media',
    titulo: 'Média e distribuição de avaliações',
    executar: () => {
      const r = resumoAvaliacoes([{ nota: 5 }, { nota: 4 }]);
      const ok = r.media === 4.5 && r.distribuicao[5] === 1;
      return { ok, detalhe: `média ${r.media}` };
    },
  },
  {
    id: 'pedido-status',
    titulo: 'Status simulado do pedido',
    executar: () => {
      const inicio = new Date('2026-11-10T10:00:00');
      const pedido = { criadoEm: inicio.toISOString() };
      const agoraEntregue = new Date(inicio.getTime() + (ETAPAS.length - 1) * 60000);
      const ok = etapaAtual(pedido, inicio) === 0 && statusAtual(pedido, agoraEntregue) === 'Entregue';
      return { ok, detalhe: ok ? 'começa em pagamento aprovado e chega a entregue' : 'falhou' };
    },
  },
  {
    id: 'devolucao-prazo',
    titulo: 'Prazo de devolução de 7 dias',
    executar: () => {
      const antigo = { criadoEm: new Date('2020-01-01T10:00:00').toISOString() };
      const ok = !dentroDoPrazo(antigo) && Object.keys(validarDevolucao({ motivo: '', descricao: '', resolucao: '' })).length === 3;
      return { ok, detalhe: ok ? 'fora do prazo bloqueia; campos obrigatórios validados' : 'falhou' };
    },
  },
  {
    id: 'gamificacao-niveis',
    titulo: 'Níveis e resgates',
    executar: () => {
      const ok = nivelPara(0).nome === 'Bronze' && nivelPara(1000).nome === 'Ouro' && RESGATES.length === 3;
      return { ok, detalhe: ok ? 'níveis corretos e 3 resgates configurados' : 'falhou' };
    },
  },
];

export const TOTAL_CHECAGENS = checagens.length;

export async function rodarChecagens(onProgresso = () => {}) {
  const resultados = [];
  for (const c of checagens) {
    try {
      const r = await c.executar();
      resultados.push({ id: c.id, titulo: c.titulo, ok: !!r.ok, detalhe: r.detalhe });
    } catch (erro) {
      resultados.push({ id: c.id, titulo: c.titulo, ok: false, detalhe: `erro: ${erro.message}` });
    }
    onProgresso(resultados.length, TOTAL_CHECAGENS);
  }
  return resultados;
}

export function formatarRelatorio(resultados, agora = new Date()) {
  const linhas = resultados.map((r) => `${r.ok ? 'PASS' : 'FAIL'} | ${r.titulo} | ${r.detalhe}`);
  const aprovados = resultados.filter((r) => r.ok).length;
  return [
    `Relatório do Tester — LivroLivre — ${agora.toLocaleString('pt-BR')}`,
    `Resultado: ${aprovados}/${resultados.length} aprovadas`,
    '',
    ...linhas,
  ].join('\n');
}

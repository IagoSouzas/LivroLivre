import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { resumoAvaliacoes, validarAvaliacao, salvarAvaliacao, avaliacoesDoProduto } from '../src/services/avaliacoes';
import { etapaAtual, statusAtual, estaEntregue, dataEntrega, pedidosEntreguesComProduto, ETAPAS, criarPedido, listarPedidos } from '../src/services/pedidos';
import { dentroDoPrazo, validarDevolucao, prazoDevolucaoAte, solicitarDevolucao } from '../src/services/devolucoes';
import {
  carregarGamificacao,
  pontuarCompra,
  pontuarAvaliacao,
  registrarIndicacao,
  resgatar,
  saldoDisponivel,
  nivelPara,
  proximoNivel,
  desafios,
  conquistas,
  resumoGamificacao,
  marcarVoucherUsado,
} from '../src/services/gamificacao';
import { aplicarCupom, descontoDoVoucher } from '../src/services/promocoes';
import { alternarFavorito, listarFavoritos, salvarEndereco, validarEndereco, salvarCartao, validarCartao, alternarConfig, carregarConfig } from '../src/services/cadastros';
import { filtrarProdutos } from '../src/services/busca';
import { alterarSenha, salvarPerfil, carregarPerfil } from '../src/services/perfil';
import { criarUsuario, listarUsuarios } from '../src/services/usuarios';
import { formatarRelatorio } from '../src/services/tester';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

beforeEach(async () => {
  await AsyncStorage.clear();
});

const agora = new Date('2026-11-10T12:00:00');

describe('avaliações', () => {
  test('valida nota, título e comentário mínimo', () => {
    expect(validarAvaliacao({ nota: 5, titulo: 'Ótimo', comentario: 'Muito bom mesmo.' }).valido).toBe(true);
    expect(validarAvaliacao({ nota: 6, titulo: 'x', comentario: 'Muito bom mesmo.' }).valido).toBe(false);
    expect(validarAvaliacao({ nota: 3, titulo: '', comentario: 'Muito bom mesmo.' }).valido).toBe(false);
    expect(validarAvaliacao({ nota: 3, titulo: 'ok', comentario: 'curto' }).erro).toBe('Comentário deve ter pelo menos 10 caracteres');
  });

  test('salva e lista por produto', async () => {
    const r = await salvarAvaliacao({ produtoId: 'p1', nota: 4, titulo: 'Bom', comentario: 'Gostei do livro.' }, agora);
    expect(r.ok).toBe(true);
    expect((await avaliacoesDoProduto('p1')).length).toBe(1);
    expect((await avaliacoesDoProduto('outro')).length).toBe(0);
  });

  test('resumo calcula média e distribuição', () => {
    const r = resumoAvaliacoes([{ nota: 5 }, { nota: 4 }, { nota: 4 }]);
    expect(r.total).toBe(3);
    expect(r.media).toBe(4.3);
    expect(r.distribuicao).toEqual({ 5: 1, 4: 2, 3: 0, 2: 0, 1: 0 });
    expect(resumoAvaliacoes([]).media).toBe(0);
  });
});

describe('pedidos (status simulado)', () => {
  const criado = new Date('2026-11-10T10:00:00');
  const pedido = { criadoEm: criado.toISOString(), itens: [{ id: 'p1' }] };

  test('começa em pagamento aprovado e chega a entregue', () => {
    expect(statusAtual(pedido, criado)).toBe(ETAPAS[0]);
    const fim = new Date(criado.getTime() + (ETAPAS.length - 1) * 60000);
    expect(estaEntregue(pedido, fim)).toBe(true);
    expect(dataEntrega(pedido).getTime()).toBe(fim.getTime());
  });

  test('etapa nunca passa de entregue', () => {
    expect(etapaAtual(pedido, new Date(criado.getTime() + 999 * 60000))).toBe(ETAPAS.length - 1);
  });

  test('criar pedido salva número, rastreio e itens', async () => {
    const p = await criarPedido({ itens: [{ id: 'p1', nome: 'X', preco: 10, quantidade: 1 }], total: 10, desconto: 0, endereco: null, pagamento: 'Pix', parcelas: 1, voucher: null }, agora);
    expect(p.numero).toMatch(/^PED-20261110-0001$/);
    expect(p.codigoRastreio).toMatch(/^BR\d{9}SP$/);
    expect((await listarPedidos()).length).toBe(1);
  });

  test('avaliar exige pedido entregue com o produto', () => {
    const emAndamento = { itens: [{ id: 'p1' }], criadoEm: agora.toISOString() };
    const entregue = { ...pedido, criadoEm: new Date('2020-01-01T00:00:00').toISOString() };
    expect(pedidosEntreguesComProduto([emAndamento], 'p1', agora)).toHaveLength(0);
    expect(pedidosEntreguesComProduto([entregue], 'p1', agora)).toHaveLength(1);
  });
});

describe('devolução e troca', () => {
  test('prazo de 7 dias após a entrega', () => {
    const pedido = { criadoEm: new Date('2026-11-01T10:00:00').toISOString() };
    const limite = prazoDevolucaoAte(pedido);
    expect(limite > new Date('2026-11-01T10:00:00')).toBe(true);
    expect(dentroDoPrazo({ criadoEm: new Date().toISOString() })).toBe(true);
    expect(dentroDoPrazo({ criadoEm: new Date('2020-01-01').toISOString() })).toBe(false);
  });

  test('descrição precisa de no mínimo 10 caracteres', () => {
    const erros = validarDevolucao({ motivo: 'Chegou atrasado', descricao: 'curta', resolucao: 'Troca' });
    expect(erros.descricao).toMatch(/pelo menos 10/);
    expect(validarDevolucao({ motivo: 'Chegou atrasado', descricao: 'Chegou depois do prazo combinado', resolucao: 'Troca' })).toEqual({});
  });

  test('não aceita solicitação fora do prazo', async () => {
    const r = await solicitarDevolucao({ numero: 'X', criadoEm: new Date('2020-01-01').toISOString() }, { motivo: 'Chegou atrasado', descricao: 'Chegou depois do prazo combinado', resolucao: 'Troca' });
    expect(r.ok).toBe(false);
  });
});

describe('gamificação', () => {
  test('pontos por compra (1 por R$ 1) e avaliação (+50)', async () => {
    await pontuarCompra(89.9, 'PED-1');
    await pontuarAvaliacao('Bom');
    const estado = await carregarGamificacao();
    expect(estado.acumulado).toBe(89 + 50);
    expect(estado.historico[0].evento).toBe('avaliacao');
  });

  test('indicação conta uma vez só', async () => {
    expect((await registrarIndicacao()).ok).toBe(true);
    expect((await registrarIndicacao()).ok).toBe(false);
    expect((await carregarGamificacao()).acumulado).toBe(100);
  });

  test('resgate desconta saldo e gera voucher', async () => {
    await pontuarCompra(250, 'PED-2');
    const r = await resgatar('desc10');
    expect(r.ok).toBe(true);
    expect(saldoDisponivel(r.estado)).toBe(50);
    expect(r.estado.vouchers[0].titulo).toBe('Desconto R$ 10');
  });

  test('resgate sem saldo é bloqueado', async () => {
    const r = await resgatar('desc25');
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/Saldo insuficiente/);
  });

  test('voucher usado não gera desconto', async () => {
    await pontuarCompra(300, 'PED-3');
    const r = await resgatar('desc10');
    const uid = r.estado.vouchers[0].uid;
    const estado = await marcarVoucherUsado(uid);
    expect(estado.vouchers[0].usado).toBe(true);
    expect(descontoDoVoucher(estado.vouchers[0], 100)).toBe(0);
    expect(descontoDoVoucher({ tipo: 'desconto', valor: 10, usado: false }, 100)).toBe(10);
  });

  test('níveis: Bronze até 499, Prata a partir de 500', () => {
    expect(nivelPara(499).nome).toBe('Bronze');
    expect(nivelPara(500).nome).toBe('Prata');
    expect(proximoNivel(2500)).toBeNull();
  });

  test('desafios e conquistas refletem o resumo', () => {
    const resumo = { totalPedidos: 1, pedidosNoMes: 3, totalAvaliacoes: 0, indicacoes: 0, nivel: 'Bronze', acumulado: 1000 };
    const d = desafios(resumo);
    expect(d.find((x) => x.id === 'compra3').atual).toBe(3);
    const c = conquistas(resumo);
    expect(c.find((x) => x.id === 'primeira-compra').desbloqueada).toBe(true);
    expect(c.find((x) => x.id === 'nivel-ouro').desbloqueada).toBe(true);
    expect(c.find((x) => x.id === 'dez-pedidos').desbloqueada).toBe(false);
  });

  test('resumo calcula pedidos do mês', () => {
    const r = resumoGamificacao({
      estado: { acumulado: 0, indicacoes: 0 },
      pedidos: [{ criadoEm: agora.toISOString() }, { criadoEm: new Date('2020-01-01').toISOString() }],
      avaliacoes: [],
      agora,
    });
    expect(r.pedidosNoMes).toBe(1);
    expect(r.totalPedidos).toBe(2);
  });
});

describe('cupom', () => {
  test('cupom inválido e vazio são recusados', () => {
    expect(aplicarCupom('', 10).ok).toBe(false);
    expect(aplicarCupom('XYZ', 10).erro).toBe('Cupom inválido');
  });
});

describe('favoritos, endereços, cartão e configurações', () => {
  test('favorito alterna e persiste', async () => {
    expect(await alternarFavorito({ id: 'a', nome: 'A', preco: 1 })).toBe(true);
    expect((await listarFavoritos()).length).toBe(1);
    expect(await alternarFavorito({ id: 'a', nome: 'A', preco: 1 })).toBe(false);
    expect((await listarFavoritos()).length).toBe(0);
  });

  test('endereço exige CEP, rua, número, bairro e cidade', async () => {
    expect(Object.keys(validarEndereco({ cep: '', rua: '', numero: '', bairro: '', cidade: '' }))).toHaveLength(5);
    const r = await salvarEndereco({ cep: '01234-567', rua: 'Rua A', numero: '10', bairro: 'Centro', cidade: 'São Paulo' });
    expect(r.ok).toBe(true);
  });

  test('cartão guarda só os 4 últimos dígitos', async () => {
    const r = await salvarCartao({ numero: '4539 1488 0343 6467', validade: '12/30', cvv: '123', nome: 'Iago Souza' });
    expect(r.ok).toBe(true);
    expect(r.cartao.final).toBe('6467');
    expect(r.cartao.numero).toBeUndefined();
  });

  test('cartão inválido é recusado', () => {
    expect(Object.keys(validarCartao({ numero: '1234', validade: '01/20', cvv: '1', nome: '' })).length).toBe(4);
  });

  test('toggles de configuração persistem', async () => {
    const antes = (await carregarConfig()).sms;
    await alternarConfig('sms');
    expect((await carregarConfig()).sms).toBe(!antes);
  });
});

describe('busca e filtros', () => {
  const itens = [
    { id: '1', nome: 'Dom Casmurro', descricao: 'Machado de Assis', preco: 30 },
    { id: '2', nome: 'Naruto', descricao: 'Mangá', preco: 25 },
    { id: '3', nome: 'Guia RPG', descricao: 'Regras', preco: 80 },
  ];

  test('filtra por preço e ordena', () => {
    expect(filtrarProdutos(itens, { precoMin: 26, precoMax: 90 }).map((i) => i.id)).toEqual(['1', '3']);
    expect(filtrarProdutos(itens, { ordem: 'preco-desc' }).map((i) => i.id)).toEqual(['3', '1', '2']);
  });

  test('filtra por autor e por avaliação mínima', () => {
    expect(filtrarProdutos(itens, { autor: 'machado' }).map((i) => i.id)).toEqual(['1']);
    expect(filtrarProdutos(itens, { avaliacaoMin: 4 }, { 2: 4.5 }).map((i) => i.id)).toEqual(['2']);
  });
});

describe('perfil e senha', () => {
  test('alterar senha só vale para conta criada no app', async () => {
    const r = await alterarSenha({ origem: 'dummyjson', usuario: { id: 1 } }, { atual: 'a', nova: 'abcdef12', confirmacao: 'abcdef12' });
    expect(r.ok).toBe(false);
  });

  test('conta criada no app troca a senha com a atual correta', async () => {
    const cad = await criarUsuario({ nome: 'Iago Souza', cpf: '529.982.247-25', email: 'iago@exemplo.com', telefone: '11999999999', dataNascimento: '01/01/1995', senha: 'senha1234', confirmacaoSenha: 'senha1234', termos: true });
    expect(cad.ok).toBe(true);
    const sessao = { origem: 'local', usuario: { id: cad.usuario.id } };
    expect((await alterarSenha(sessao, { atual: 'errada1234', nova: 'nova12345', confirmacao: 'nova12345' })).ok).toBe(false);
    expect((await alterarSenha(sessao, { atual: 'senha1234', nova: 'nova12345', confirmacao: 'nova12345' })).ok).toBe(true);
    expect((await listarUsuarios())[0].senha).toBe('nova12345');
  });

  test('perfil da conta de teste salva nome localmente', async () => {
    const sessao = { origem: 'dummyjson', usuario: { username: 'emilys', email: 'e@x.com', nome: 'Emily' } };
    expect((await salvarPerfil(sessao, { nome: '', telefone: '' })).ok).toBe(false);
    expect((await salvarPerfil(sessao, { nome: 'Emily J', telefone: '(11) 99999-9999' })).ok).toBe(true);
    expect((await carregarPerfil(sessao)).nome).toBe('Emily J');
  });
});

describe('criar conta duplicada', () => {
  test('recusa CPF já cadastrado', async () => {
    const dados = { nome: 'A B', cpf: '529.982.247-25', email: 'a@b.com', telefone: '11999999999', dataNascimento: '01/01/1995', senha: 'senha1234', confirmacaoSenha: 'senha1234', termos: true };
    await criarUsuario(dados);
    const r = await criarUsuario({ ...dados, email: 'outro@b.com' });
    expect(r.ok).toBe(false);
    expect(r.campo).toBe('cpf');
  });
});

describe('relatório do tester', () => {
  test('formata PASS e FAIL com contagem', () => {
    const texto = formatarRelatorio([
      { titulo: 'A', ok: true, detalhe: 'ok' },
      { titulo: 'B', ok: false, detalhe: 'falhou' },
    ]);
    expect(texto).toContain('Resultado: 1/2 aprovadas');
    expect(texto).toContain('PASS | A | ok');
    expect(texto).toContain('FAIL | B | falhou');
  });
});

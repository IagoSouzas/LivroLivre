// Teste de fumaça: cada tela renderiza sem erro e mostra o elemento principal.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { SessaoContext } from '../src/context';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (cb) => {
      React.useEffect(cb, [cb]);
    },
  };
});

import LoginScreen from '../src/screens/LoginScreen';
import CriarContaScreen from '../src/screens/CriarContaScreen';
import RecuperarSenhaScreen from '../src/screens/RecuperarSenhaScreen';
import InicioScreen from '../src/screens/InicioScreen';
import BuscaScreen from '../src/screens/BuscaScreen';
import ProdutoScreen from '../src/screens/ProdutoScreen';
import AvaliacoesScreen from '../src/screens/AvaliacoesScreen';
import AvaliarProdutoScreen from '../src/screens/AvaliarProdutoScreen';
import CarrinhoScreen from '../src/screens/CarrinhoScreen';
import CheckoutScreen from '../src/screens/CheckoutScreen';
import PedidoConfirmadoScreen from '../src/screens/PedidoConfirmadoScreen';
import PedidosScreen from '../src/screens/PedidosScreen';
import RastreamentoScreen from '../src/screens/RastreamentoScreen';
import DevolucaoScreen from '../src/screens/DevolucaoScreen';
import PerfilScreen from '../src/screens/PerfilScreen';
import EditarPerfilScreen from '../src/screens/EditarPerfilScreen';
import FavoritosScreen from '../src/screens/FavoritosScreen';
import RecompensasScreen from '../src/screens/RecompensasScreen';
import ConquistasScreen from '../src/screens/ConquistasScreen';
import ConfiguracoesScreen from '../src/screens/ConfiguracoesScreen';
import AlterarSenhaScreen from '../src/screens/AlterarSenhaScreen';
import EnderecosScreen from '../src/screens/EnderecosScreen';
import FormasPagamentoScreen from '../src/screens/FormasPagamentoScreen';
import TesterScreen from '../src/screens/TesterScreen';

const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn(), setOptions: jest.fn() };
const produto = { id: 'openlibrary:/works/OL1', categoria: 'Livros', nome: 'Dom Casmurro', descricao: 'Romance', imagem: null, preco: 34.9 };
const sessao = { origem: 'dummyjson', token: 't', usuario: { id: 1, username: 'emilys', email: 'e@x.com', nome: 'Emily Johnson' } };

function comSessao(ui) {
  return (
    <SessaoContext.Provider value={{ sessao, encerrarSessao: jest.fn() }}>{ui}</SessaoContext.Provider>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ docs: [], results: [], data: [] }) }));
  jest.clearAllMocks();
});

const casos = [
  ['Login', () => <LoginScreen navigation={navigation} onLogin={jest.fn()} />, 'botao-entrar'],
  ['Criar conta', () => <CriarContaScreen navigation={navigation} />, 'botao-criar-conta'],
  ['Recuperar senha', () => <RecuperarSenhaScreen navigation={navigation} />, 'botao-enviar-link'],
  ['Início', () => comSessao(<InicioScreen navigation={navigation} />), 'ir-busca'],
  ['Busca', () => comSessao(<BuscaScreen navigation={navigation} />), 'botao-buscar'],
  ['Produto', () => comSessao(<ProdutoScreen navigation={navigation} route={{ params: { produto } }} />), 'botao-comprar'],
  ['Avaliações', () => comSessao(<AvaliacoesScreen navigation={navigation} route={{ params: { produto } }} />), 'botao-escrever-avaliacao'],
  ['Avaliar produto', () => comSessao(<AvaliarProdutoScreen navigation={navigation} route={{ params: { produto } }} />), 'botao-enviar-avaliacao'],
  ['Carrinho', () => comSessao(<CarrinhoScreen navigation={navigation} />), 'carrinho-vazio'],
  ['Checkout', () => comSessao(<CheckoutScreen navigation={navigation} />), 'botao-continuar-endereco'],
  ['Pedido confirmado', () => comSessao(<PedidoConfirmadoScreen navigation={navigation} route={{ params: { numero: 'PED-X' } }} />), 'botao-rastrear'],
  ['Pedidos', () => comSessao(<PedidosScreen navigation={navigation} />), 'pedidos-vazio'],
  ['Rastreamento', () => comSessao(<RastreamentoScreen navigation={navigation} route={{ params: { numero: 'PED-X' } }} />), 'voltar'],
  ['Devolução', () => comSessao(<DevolucaoScreen navigation={navigation} route={{ params: { numero: 'PED-X' } }} />), 'voltar'],
  ['Perfil', () => comSessao(<PerfilScreen navigation={navigation} />), 'botao-sair'],
  ['Editar perfil', () => comSessao(<EditarPerfilScreen navigation={navigation} />), 'botao-salvar-perfil'],
  ['Favoritos', () => comSessao(<FavoritosScreen navigation={navigation} />), 'favoritos-vazio'],
  ['Recompensas', () => comSessao(<RecompensasScreen navigation={navigation} />), 'nivel-atual'],
  ['Conquistas', () => comSessao(<ConquistasScreen navigation={navigation} />), 'conquista-primeira-compra'],
  ['Configurações', () => comSessao(<ConfiguracoesScreen navigation={navigation} />), 'toggle-push'],
  ['Alterar senha', () => comSessao(<AlterarSenhaScreen navigation={navigation} />), 'botao-salvar-senha'],
  ['Endereços', () => comSessao(<EnderecosScreen navigation={navigation} />), 'botao-novo-endereco'],
  ['Formas de pagamento', () => comSessao(<FormasPagamentoScreen navigation={navigation} />), 'botao-novo-cartao'],
  ['Tester', () => comSessao(<TesterScreen navigation={navigation} />), 'botao-rodar'],
];

describe.each(casos)('tela %s', (nome, montar, elementoPrincipal) => {
  test('renderiza o elemento principal', async () => {
    render(montar());
    expect(await screen.findByTestId(elementoPrincipal)).toBeTruthy();
  });
});

describe('fluxos de clique', () => {
  test('Carrinho: adicionar pelo produto e alterar quantidade', async () => {
    const { adicionarAoCarrinho } = require('../src/services/carrinho');
    await adicionarAoCarrinho(produto, 1);
    render(comSessao(<CarrinhoScreen navigation={navigation} />));
    fireEvent.press(await screen.findByTestId('mais-' + produto.id));
    await waitFor(async () => expect(await screen.findByTestId('qtd-' + produto.id)).toBeTruthy());
    expect(await screen.findByText('2')).toBeTruthy();
  });

  test('Carrinho: cupom inválido mostra erro', async () => {
    const { adicionarAoCarrinho } = require('../src/services/carrinho');
    await adicionarAoCarrinho(produto, 1);
    render(comSessao(<CarrinhoScreen navigation={navigation} />));
    fireEvent.changeText(await screen.findByTestId('campo-cupom'), 'FALSO');
    fireEvent.press(screen.getByTestId('botao-aplicar-cupom'));
    expect(await screen.findByText('Cupom inválido')).toBeTruthy();
  });

  test('Produto: favoritar grava nos favoritos', async () => {
    render(comSessao(<ProdutoScreen navigation={navigation} route={{ params: { produto } }} />));
    fireEvent.press(await screen.findByTestId('botao-favorito'));
    const { listarFavoritos } = require('../src/services/cadastros');
    await waitFor(async () => expect((await listarFavoritos()).length).toBe(1));
  });

  test('Checkout: cartão com número inválido mostra erro', async () => {
    const { adicionarAoCarrinho } = require('../src/services/carrinho');
    const { salvarEndereco } = require('../src/services/cadastros');
    await adicionarAoCarrinho(produto, 1);
    await salvarEndereco({ cep: '01234567', rua: 'R', numero: '1', bairro: 'B', cidade: 'C' });
    render(comSessao(<CheckoutScreen navigation={navigation} />));
    fireEvent.press(await screen.findByTestId('botao-continuar-endereco'));
    fireEvent.press(await screen.findByTestId('botao-continuar-entrega'));
    fireEvent.changeText(await screen.findByTestId('campo-cartao'), '1234');
    fireEvent.press(screen.getByTestId('botao-confirmar-pedido'));
    expect(await screen.findByText('Número do cartão deve ter de 13 a 19 dígitos')).toBeTruthy();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  test('Checkout: pagamento Pix cria pedido e troca para confirmação', async () => {
    const { adicionarAoCarrinho } = require('../src/services/carrinho');
    const { salvarEndereco } = require('../src/services/cadastros');
    await adicionarAoCarrinho(produto, 1);
    await salvarEndereco({ cep: '01234567', rua: 'R', numero: '1', bairro: 'B', cidade: 'C' });
    render(comSessao(<CheckoutScreen navigation={navigation} />));
    fireEvent.press(await screen.findByTestId('botao-continuar-endereco'));
    fireEvent.press(await screen.findByTestId('botao-continuar-entrega'));
    fireEvent.press(await screen.findByTestId('pagamento-Pix'));
    fireEvent.press(screen.getByTestId('botao-confirmar-pedido'));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('PedidoConfirmado', expect.objectContaining({ numero: expect.any(String) })));
  });

  test('Tester: rodar checagens mostra resultado', async () => {
    render(comSessao(<TesterScreen navigation={navigation} />));
    fireEvent.press(await screen.findByTestId('botao-rodar'));
    expect(await screen.findByTestId('check-val-email', {}, { timeout: 20000 })).toBeTruthy();
  }, 30000);
});

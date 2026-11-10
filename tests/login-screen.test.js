import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import LoginScreen from '../src/screens/LoginScreen';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const navigation = { navigate: jest.fn() };

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test('mostra erro de campo obrigatório ao entrar vazio', async () => {
  const onLogin = jest.fn();
  const tela = render(<LoginScreen navigation={navigation} onLogin={onLogin} />);

  fireEvent.press(screen.getByTestId('botao-entrar'));

  expect(await screen.findByText('Usuário ou e-mail é obrigatório')).toBeTruthy();
  expect(screen.getByText('Senha é obrigatório')).toBeTruthy();
  expect(onLogin).not.toHaveBeenCalled();
});

test('botão Criar conta navega para a tela de cadastro', () => {
  const tela = render(<LoginScreen navigation={navigation} onLogin={jest.fn()} />);
  fireEvent.press(screen.getByTestId('link-criar-conta'));
  expect(navigation.navigate).toHaveBeenCalledWith('CriarConta');
});

test('botão Esqueci minha senha navega para recuperação', () => {
  const tela = render(<LoginScreen navigation={navigation} onLogin={jest.fn()} />);
  fireEvent.press(screen.getByTestId('link-esqueci'));
  expect(navigation.navigate).toHaveBeenCalledWith('RecuperarSenha');
});

test('Login teste preenche a conta de teste e chama onLogin', async () => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ accessToken: 't', id: 1, username: 'emilys', email: 'e@x.com', firstName: 'Emily', lastName: 'Johnson' }),
  }));
  const onLogin = jest.fn();
  const tela = render(<LoginScreen navigation={navigation} onLogin={onLogin} />);

  fireEvent.press(screen.getByTestId('botao-login-teste'));

  await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
  expect(onLogin.mock.calls[0][0].usuario.username).toBe('emilys');
});

test('senha errada mostra mensagem de login inválido', async () => {
  global.fetch = jest.fn(async () => ({ ok: false, status: 400, json: async () => ({}) }));
  const tela = render(<LoginScreen navigation={navigation} onLogin={jest.fn()} />);

  fireEvent.changeText(screen.getByTestId('campo-usuario'), 'emilys');
  fireEvent.changeText(screen.getByTestId('campo-senha'), 'errada');
  fireEvent.press(screen.getByTestId('botao-entrar'));

  expect(await screen.findByText('Usuário ou senha inválidos')).toBeTruthy();
});

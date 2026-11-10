import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { login, sair, sessaoAtual, MENSAGEM_LOGIN_INVALIDO } from '../src/services/auth';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

function resposta(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  };
}

const usuarioLogado = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://dummyjson.com/icon/emilys/128',
  accessToken: 'token-teste',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('login com username', () => {
  test('envia username e senha e salva a sessão', async () => {
    const fetchImpl = jest.fn(async () => resposta(200, usuarioLogado));

    const sessao = await login('emilys', 'emilyspass', { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, opcoes] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://dummyjson.com/auth/login');
    expect(JSON.parse(opcoes.body)).toEqual({ username: 'emilys', password: 'emilyspass' });
    expect(sessao.token).toBe('token-teste');
    expect(sessao.usuario.nome).toBe('Emily Johnson');
    expect(await sessaoAtual()).toEqual(sessao);
  });

  test('senha errada mostra mensagem de login inválido', async () => {
    const fetchImpl = jest.fn(async () => resposta(400, { message: 'Invalid credentials' }));
    await expect(login('emilys', 'errada', { fetchImpl })).rejects.toThrow(MENSAGEM_LOGIN_INVALIDO);
    expect(await sessaoAtual()).toBeNull();
  });
});

describe('login com e-mail', () => {
  test('converte e-mail em username antes do login', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(resposta(200, { users: [{ id: 1, username: 'emilys' }], total: 1 }))
      .mockResolvedValueOnce(resposta(200, usuarioLogado));

    const sessao = await login('emily.johnson@x.dummyjson.com', 'emilyspass', { fetchImpl });

    const [urlBusca] = fetchImpl.mock.calls[0];
    expect(urlBusca).toContain('/users/filter?key=email&value=emily.johnson%40x.dummyjson.com');
    const [, opcoesLogin] = fetchImpl.mock.calls[1];
    expect(JSON.parse(opcoesLogin.body).username).toBe('emilys');
    expect(sessao.usuario.username).toBe('emilys');
  });

  test('e-mail não cadastrado não chega a tentar o login', async () => {
    const fetchImpl = jest.fn(async () => resposta(200, { users: [], total: 0 }));

    await expect(login('naoexiste@x.dummyjson.com', 'abcdef12', { fetchImpl })).rejects.toThrow(
      MENSAGEM_LOGIN_INVALIDO,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe('sair', () => {
  test('remove a sessão salva', async () => {
    const fetchImpl = jest.fn(async () => resposta(200, usuarioLogado));
    await login('emilys', 'emilyspass', { fetchImpl });

    await sair();

    expect(await sessaoAtual()).toBeNull();
  });
});

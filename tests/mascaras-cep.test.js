import { formatarEntrada, mascararCpf, mascararCep, mascararTelefone, mascararData, mascararCartao, mascararValidade, mascararCvv, apenasNumeros } from '../src/services/mascaras';
import { buscarCep } from '../src/services/cep';

describe('máscaras aplicadas enquanto digita', () => {
  test('CPF ganha pontos e traço', () => {
    expect(mascararCpf('52998224725')).toBe('529.982.247-25');
    expect(mascararCpf('529982')).toBe('529.982');
  });

  test('CEP ganha traço', () => {
    expect(mascararCep('01234567')).toBe('01234-567');
  });

  test('telefone usa 10 ou 11 dígitos', () => {
    expect(mascararTelefone('1134567890')).toBe('(11) 3456-7890');
    expect(mascararTelefone('11912345678')).toBe('(11) 91234-5678');
  });

  test('data DD/MM/AAAA', () => {
    expect(mascararData('10112026')).toBe('10/11/2026');
  });

  test('cartão em grupos de 4 e no máximo 19 dígitos', () => {
    expect(mascararCartao('4539148803436467')).toBe('4539 1488 0343 6467');
    expect(mascararCartao('1'.repeat(30)).replace(/ /g, '').length).toBe(19);
  });

  test('validade MM/AA e CVV com 3 dígitos', () => {
    expect(mascararValidade('1230')).toBe('12/30');
    expect(mascararCvv('12345')).toBe('123');
  });

  test('letras e caracteres especiais são removidos dos campos numéricos', () => {
    expect(apenasNumeros('12a-3!4')).toBe('1234');
    expect(formatarEntrada('abc1-2', 'cpf')).toBe('12');
    expect(formatarEntrada('abc', 'numero')).toBe('');
  });

  test('tipo sem máscara devolve o texto como veio', () => {
    expect(formatarEntrada('Rua das Flores, 123', 'texto')).toBe('Rua das Flores, 123');
  });
});

describe('buscarCep (ViaCEP)', () => {
  test('preenche rua, bairro e cidade', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      json: async () => ({ logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP' }),
    }));
    const dados = await buscarCep('01001-000', { fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://viacep.com.br/ws/01001000/json/');
    expect(dados).toEqual({ rua: 'Praça da Sé', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP' });
  });

  test('CEP inexistente lança erro', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: true, json: async () => ({ erro: true }) }));
    await expect(buscarCep('99999999', { fetchImpl })).rejects.toThrow('CEP não encontrado');
  });

  test('CEP com menos de 8 dígitos nem consulta', async () => {
    const fetchImpl = jest.fn();
    await expect(buscarCep('0123', { fetchImpl })).rejects.toThrow('CEP deve ter 8 dígitos');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

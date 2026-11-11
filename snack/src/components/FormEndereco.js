// Formulário de endereço (PRD seção 8.5 e checkout).
// - CEP: só números, com máscara 00000-000; ao completar 8 dígitos consulta o ViaCEP.
// - Rua, bairro e cidade vêm do CEP e ficam bloqueados para alteração.
// - Número: só números. Referência: texto livre.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Campo } from './ui';
import { buscarCep } from '../services/cep';
import { apenasDigitos } from '../services/mascaras';
import { COR_PRINCIPAL, COR_TEXTO_SUAVE } from '../theme';

export default function FormEndereco({ valor, onChange, erros = {} }) {
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState('');
  const ultimaConsulta = useRef('');

  const digitosCep = apenasDigitos(valor.cep);

  useEffect(() => {
    if (digitosCep.length < 8) {
      ultimaConsulta.current = '';
      setErroCep('');
      if (valor.rua || valor.bairro || valor.cidade) {
        onChange({ rua: '', bairro: '', cidade: '' });
      }
      return;
    }
    if (ultimaConsulta.current === digitosCep) return;
    ultimaConsulta.current = digitosCep;

    let ativo = true;
    setBuscando(true);
    setErroCep('');
    buscarCep(digitosCep)
      .then((dados) => {
        if (!ativo) return;
        onChange({ rua: dados.rua, bairro: dados.bairro, cidade: dados.cidade });
      })
      .catch((erro) => {
        if (!ativo) return;
        setErroCep(erro.message);
        onChange({ rua: '', bairro: '', cidade: '' });
      })
      .finally(() => {
        if (ativo) setBuscando(false);
      });
    return () => {
      ativo = false;
    };
  }, [digitosCep]); // eslint-disable-line react-hooks/exhaustive-deps

  const erroCepExibido = erros.cep || erroCep;

  return (
    <View>
      <Campo
        rotulo="CEP"
        tipo="cep"
        placeholder="00000-000"
        value={valor.cep}
        onChangeText={(cep) => onChange({ cep })}
        erro={erroCepExibido}
        testID="campo-cep"
      />
      {buscando ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ActivityIndicator color={COR_PRINCIPAL} size="small" />
          <Text style={{ color: COR_TEXTO_SUAVE }}>Buscando CEP...</Text>
        </View>
      ) : null}
      <Campo rotulo="Rua" value={valor.rua} editable={false} erro={erros.rua} testID="campo-rua" />
      <Campo rotulo="Número / Comp." tipo="numero" placeholder="Somente números" value={valor.numero} onChangeText={(numero) => onChange({ numero })} erro={erros.numero} testID="campo-numero" />
      <Campo rotulo="Bairro" value={valor.bairro} editable={false} erro={erros.bairro} testID="campo-bairro" />
      <Campo rotulo="Cidade" value={valor.cidade} editable={false} erro={erros.cidade} testID="campo-cidade" />
      <Campo rotulo="Referência" placeholder="Ponto de referência" value={valor.referencia} onChangeText={(referencia) => onChange({ referencia })} testID="campo-referencia" />
    </View>
  );
}

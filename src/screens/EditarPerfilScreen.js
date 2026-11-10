import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Botao, Campo, Tela } from '../components/ui';
import { Aviso } from '../components/extras';
import { useSessao } from '../context';
import { carregarPerfil, salvarPerfil } from '../services/perfil';
import { COR_PRINCIPAL } from '../theme';

// Editar cadastro (PRD FR-AUTH-05).
export default function EditarPerfilScreen({ navigation }) {
  const { sessao } = useSessao();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarPerfil(sessao).then((p) => {
      setNome(p.nome ?? '');
      setTelefone(p.telefone ?? '');
    });
  }, [sessao]);

  async function salvar() {
    const r = await salvarPerfil(sessao, { nome, telefone });
    if (!r.ok) {
      setErros(r.erros);
      setMensagem('');
      return;
    }
    setErros({});
    setMensagem('Dados salvos.');
  }

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', marginVertical: 8 }}>Editar perfil</Text>
      <Campo rotulo="Nome" value={nome} onChangeText={setNome} erro={erros.nome} testID="campo-nome-perfil" />
      <Campo rotulo="Telefone" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} erro={erros.telefone} testID="campo-telefone-perfil" />
      {mensagem ? <Aviso texto={mensagem} /> : null}
      <Botao titulo="Salvar" onPress={salvar} testID="botao-salvar-perfil" />
    </Tela>
  );
}

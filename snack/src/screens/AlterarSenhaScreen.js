import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Botao, Campo, Tela } from '../components/ui';
import { Aviso } from '../components/extras';
import { useSessao } from '../context';
import { alterarSenha } from '../services/perfil';
import { COR_PRINCIPAL } from '../theme';

export default function AlterarSenhaScreen({ navigation }) {
  const { sessao } = useSessao();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: 'info' });

  async function salvar() {
    const r = await alterarSenha(sessao, { atual, nova, confirmacao });
    if (!r.ok) {
      setMensagem({ texto: r.erro, tipo: 'erro' });
      return;
    }
    setAtual('');
    setNova('');
    setConfirmacao('');
    setMensagem({ texto: 'Senha alterada com sucesso.', tipo: 'info' });
  }

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', marginVertical: 8 }}>Alterar senha</Text>
      <Campo rotulo="Senha atual" secureTextEntry value={atual} onChangeText={setAtual} testID="campo-senha-atual" />
      <Campo rotulo="Nova senha" secureTextEntry placeholder="Mínimo 8, com letras e números" value={nova} onChangeText={setNova} testID="campo-senha-nova" />
      <Campo rotulo="Confirmar nova senha" secureTextEntry value={confirmacao} onChangeText={setConfirmacao} testID="campo-senha-confirmacao" />
      {mensagem.texto ? <Aviso texto={mensagem.texto} tipo={mensagem.tipo} /> : null}
      <Botao titulo="Salvar nova senha" onPress={salvar} testID="botao-salvar-senha" />
    </Tela>
  );
}

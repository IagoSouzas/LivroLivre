import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Botao, Campo, Tela } from '../components/ui';
import { Aviso, Card, Chip, Secao } from '../components/extras';
import { buscarPedido } from '../services/pedidos';
import { MOTIVOS, RESOLUCOES, solicitarDevolucao, prazoDevolucaoAte, dentroDoPrazo } from '../services/devolucoes';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Devolução / troca (PRD FR-ORD-04): motivo, descrição mínima, resolução e prazo de 7 dias.
export default function DevolucaoScreen({ route, navigation }) {
  const { numero } = route.params;
  const [pedido, setPedido] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [resolucao, setResolucao] = useState('Reembolso');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    buscarPedido(numero).then(setPedido);
  }, [numero]);

  async function enviar() {
    setMensagem('');
    const r = await solicitarDevolucao(pedido, { motivo, descricao, resolucao });
    if (!r.ok) {
      if (r.erro) {
        setMensagem(r.erro);
      } else {
        setErros(r.erros);
      }
      return;
    }
    setErros({});
    setSucesso(true);
    setMensagem('Solicitação enviada com sucesso.');
    setTimeout(() => navigation.goBack(), 900);
  }

  if (!pedido) {
    return (
      <Tela>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 12 }}>Pedido não encontrado.</Text>
      </Tela>
    );
  }

  const prazoAberto = dentroDoPrazo(pedido);
  const item = pedido.itens[0];

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Devolução / Troca</Text>

        <Card>
          <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{item ? item.nome : ''}</Text>
          <Text style={{ color: COR_TEXTO_SUAVE }}>Pedido #{pedido.numero}</Text>
        </Card>

        {!prazoAberto ? (
          <Aviso texto="O prazo de devolução deste pedido terminou." tipo="erro" />
        ) : (
          <Aviso texto={`Prazo: até ${prazoDevolucaoAte(pedido).toLocaleDateString('pt-BR')} (7 dias após a entrega).`} />
        )}

        <Secao titulo="Motivo da solicitação">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {MOTIVOS.map((m) => (
              <Chip key={m} titulo={m} ativo={motivo === m} onPress={() => setMotivo(m)} testID={`motivo-${m}`} />
            ))}
          </View>
          {erros.motivo ? <Text style={{ color: '#B91C1C' }}>{erros.motivo}</Text> : null}
        </Secao>

        <Campo rotulo="Descrição do problema" placeholder="Descreva o problema em detalhes..." multiline numberOfLines={4} value={descricao} onChangeText={setDescricao} erro={erros.descricao} testID="campo-descricao" />

        <Secao titulo="Tipo de resolução">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {RESOLUCOES.map((r) => (
              <Chip key={r} titulo={r} ativo={resolucao === r} onPress={() => setResolucao(r)} testID={`resolucao-${r}`} />
            ))}
          </View>
          {erros.resolucao ? <Text style={{ color: '#B91C1C' }}>{erros.resolucao}</Text> : null}
        </Secao>

        {mensagem ? <Aviso texto={mensagem} tipo={sucesso ? 'info' : 'erro'} /> : null}

        <Botao titulo="Confirmar solicitação" onPress={enviar} desabilitado={!prazoAberto || sucesso} testID="botao-confirmar-devolucao" />
      </ScrollView>
    </Tela>
  );
}

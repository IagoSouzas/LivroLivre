import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Card, Aviso } from '../components/extras';
import { Tela } from '../components/ui';
import { buscarPedido, ETAPAS, etapaAtual, MINUTOS_POR_ETAPA } from '../services/pedidos';
import { COR_BORDA, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_FUNDO, RAIO } from '../theme';

// Rastreamento (PRD FR-ORD-02). O status é simulado pelo tempo desde a compra.
export default function RastreamentoScreen({ route, navigation }) {
  const { numero } = route.params;
  const [pedido, setPedido] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    buscarPedido(numero).then(setPedido);
  }, [numero]);

  async function copiar() {
    await Clipboard.setStringAsync(pedido.codigoRastreio);
    setCopiado(true);
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

  const atual = etapaAtual(pedido);
  const entregue = atual === ETAPAS.length - 1;

  return (
    <Tela>
      <ScrollView>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Rastreamento</Text>

        <Card testID="resumo-rastreio">
          <Text style={{ fontWeight: '700', color: COR_TEXTO }}>#{pedido.numero}</Text>
          <Text style={{ color: COR_TEXTO_SUAVE }}>{pedido.itens.map((i) => i.nome).join(', ')}</Text>
          <Text style={{ color: COR_PRINCIPAL, fontWeight: '600', marginTop: 4 }} testID="status-atual">{ETAPAS[atual]}</Text>
          {!entregue ? (
            <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }}>Cada etapa é simulada e dura {MINUTOS_POR_ETAPA} min.</Text>
          ) : null}
        </Card>

        <Text style={{ fontWeight: '700', color: COR_TEXTO, marginTop: 12, marginBottom: 8 }}>Histórico de atualizações</Text>
        {[...ETAPAS].reverse().map((etapa, idx) => {
          const indice = ETAPAS.length - 1 - idx;
          const feita = indice <= atual;
          return (
            <View key={etapa} testID={`etapa-${indice}`} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, backgroundColor: feita ? COR_PRINCIPAL : COR_BORDA }} />
              <Text style={{ color: feita ? COR_TEXTO : COR_TEXTO_SUAVE, fontWeight: feita ? '600' : '400' }}>{etapa}</Text>
            </View>
          );
        })}

        <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 8 }}>Código de rastreio:</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Text testID="codigo-rastreio" style={{ flex: 1, borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 12, color: COR_TEXTO, backgroundColor: COR_FUNDO }}>{pedido.codigoRastreio}</Text>
          <Pressable onPress={copiar} accessibilityRole="button" accessibilityLabel="Copiar código de rastreio" testID="botao-copiar" style={{ backgroundColor: COR_PRINCIPAL, borderRadius: RAIO, paddingHorizontal: 16, justifyContent: 'center' }}>
            <Text style={{ color: COR_FUNDO, fontWeight: '700' }}>Copiar</Text>
          </Pressable>
        </View>
        {copiado ? <Aviso texto="Código copiado." /> : null}
      </ScrollView>
    </Tela>
  );
}

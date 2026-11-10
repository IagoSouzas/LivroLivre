import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Cabecalho, Tela } from '../components/ui';
import { Card, Chip, Vazio } from '../components/extras';
import { listarPedidos, estaEntregue, statusAtual } from '../services/pedidos';
import { dentroDoPrazo } from '../services/devolucoes';
import { formatarMoeda } from '../services/cart';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_BORDA, RAIO } from '../theme';

const FILTROS = [
  { id: 'todos', titulo: 'Todos' },
  { id: 'andamento', titulo: 'Em andamento' },
  { id: 'entregues', titulo: 'Entregues' },
];

function Botao2({ titulo, onPress, testID }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={titulo} testID={testID} style={{ flex: 1, borderRadius: RAIO, borderWidth: 1, borderColor: COR_BORDA, paddingVertical: 8, alignItems: 'center' }}>
      <Text style={{ color: COR_PRINCIPAL, fontWeight: '600' }}>{titulo}</Text>
    </Pressable>
  );
}

// Meus pedidos (PRD FR-ORD-01). Rastrear, avaliar e devolução a partir de cada pedido.
export default function PedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useFocusEffect(
    useCallback(() => {
      listarPedidos().then(setPedidos);
    }, []),
  );

  const exibidos = pedidos.filter((p) => {
    if (filtro === 'entregues') return estaEntregue(p);
    if (filtro === 'andamento') return !estaEntregue(p);
    return true;
  });

  return (
    <Tela>
      <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginBottom: 8 }}>Meus pedidos</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {FILTROS.map((f) => (
          <Chip key={f.id} titulo={f.titulo} ativo={filtro === f.id} onPress={() => setFiltro(f.id)} testID={`filtro-pedido-${f.id}`} />
        ))}
      </View>

      {exibidos.length === 0 ? (
        <Vazio texto="Você ainda não tem pedidos nesta lista." testID="pedidos-vazio" />
      ) : (
        <FlatList
          data={exibidos}
          keyExtractor={(p) => p.numero}
          renderItem={({ item }) => {
            const entregue = estaEntregue(item);
            const primeiro = item.itens[0];
            return (
              <Card testID={`pedido-${item.numero}`}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700', color: COR_TEXTO }}>#{item.numero}</Text>
                  <Text style={{ color: entregue ? COR_PRINCIPAL : COR_TEXTO_SUAVE, fontWeight: '600' }}>{statusAtual(item)}</Text>
                </View>
                <Text style={{ color: COR_TEXTO_SUAVE }}>{primeiro ? primeiro.nome : ''}{item.itens.length > 1 ? ` +${item.itens.length - 1}` : ''}</Text>
                <Text style={{ color: COR_PRINCIPAL, fontWeight: '700', marginVertical: 4 }}>{formatarMoeda(item.total)}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Botao2 titulo="Rastrear" onPress={() => navigation.navigate('Rastreamento', { numero: item.numero })} testID={`rastrear-${item.numero}`} />
                  {entregue && primeiro ? (
                    <Botao2 titulo="Avaliar" onPress={() => navigation.navigate('AvaliarProduto', { produto: { id: primeiro.id, nome: primeiro.nome } })} testID={`avaliar-${item.numero}`} />
                  ) : null}
                  {entregue && dentroDoPrazo(item) ? (
                    <Botao2 titulo="Devolução" onPress={() => navigation.navigate('Devolucao', { numero: item.numero })} testID={`devolucao-${item.numero}`} />
                  ) : null}
                </View>
              </Card>
            );
          }}
        />
      )}
    </Tela>
  );
}

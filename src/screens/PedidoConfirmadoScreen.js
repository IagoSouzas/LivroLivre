import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Botao, Tela } from '../components/ui';
import { Card, Linha } from '../components/extras';
import { buscarPedido } from '../services/pedidos';
import { formatarMoeda } from '../services/cart';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_FUNDO } from '../theme';

// Pedido confirmado (PRD FR-CART-06).
export default function PedidoConfirmadoScreen({ route, navigation }) {
  const { numero } = route.params;
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    buscarPedido(numero).then(setPedido);
  }, [numero]);

  return (
    <Tela>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F8F5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 40, color: COR_PRINCIPAL }}>✓</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: COR_TEXTO, marginTop: 12 }} testID="confirmado-titulo">Pedido confirmado!</Text>
        <Text style={{ color: COR_TEXTO_SUAVE }} testID="numero-pedido">#{numero}</Text>
      </View>

      {pedido ? (
        <Card>
          <Linha rotulo="Itens" valor={`${pedido.itens.reduce((s, i) => s + i.quantidade, 0)} itens`} />
          <Linha rotulo="Total pago" valor={formatarMoeda(pedido.total)} destaque testID="total-pago" />
          <Linha rotulo="Pagamento" valor={pedido.pagamento} />
          <Linha rotulo="Previsão" valor="5–7 dias úteis" />
        </Card>
      ) : null}

      <Card>
        <Text style={{ color: COR_PRINCIPAL, fontWeight: '700' }} testID="pontos-ganhos">
          +{pedido ? Math.floor(pedido.total) : 0} pontos de recompensa ganhos!
        </Text>
      </Card>

      <Botao titulo="Rastrear pedido" onPress={() => navigation.navigate('Rastreamento', { numero })} testID="botao-rastrear" />
      <Botao titulo="Continuar comprando" variante="secundario" onPress={() => navigation.navigate('Início')} testID="botao-continuar" />
      <View style={{ height: 1, backgroundColor: COR_FUNDO }} />
    </Tela>
  );
}

import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Botao, Cabecalho, Tela } from '../components/ui';
import { Aviso, Linha, estiloCampo } from '../components/extras';
import { carregarCarrinho, definirQuantidade, removerDoCarrinho } from '../services/carrinho';
import { calcularCarrinho, formatarMoeda } from '../services/cart';
import { aplicarCupom } from '../services/promocoes';
import { lerJson, salvarJson, CHAVES } from '../services/storage';
import { COR_BORDA, COR_CAMPO, COR_FUNDO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

function BotaoQuantidade({ rotulo, onPress, testID }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={rotulo} testID={testID} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: COR_CAMPO, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: COR_PRINCIPAL, fontWeight: '700' }}>{rotulo}</Text>
    </Pressable>
  );
}

// Carrinho (PRD FR-CART-01, FR-CART-02, FR-CART-03).
export default function CarrinhoScreen({ navigation }) {
  const [itens, setItens] = useState([]);
  const [cupomDigitado, setCupomDigitado] = useState('');
  const [cupom, setCupom] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: 'info' });

  useFocusEffect(
    useCallback(() => {
      carregarCarrinho().then(setItens);
      lerJson(CHAVES.cupom, null).then(setCupom);
    }, []),
  );

  async function alterar(id, quantidade) {
    setItens(await definirQuantidade(id, quantidade));
  }

  async function remover(id) {
    setItens(await removerDoCarrinho(id));
  }

  async function aplicar() {
    const subtotal = calcularCarrinho(itens).subtotal;
    const r = aplicarCupom(cupomDigitado, subtotal);
    if (!r.ok) {
      setMensagem({ texto: r.erro, tipo: 'erro' });
      return;
    }
    await salvarJson(CHAVES.cupom, { codigo: r.codigo, desconto: r.desconto });
    setCupom({ codigo: r.codigo, desconto: r.desconto });
    setMensagem({ texto: `Cupom ${r.codigo} aplicado.`, tipo: 'info' });
  }

  async function retirarCupom() {
    await salvarJson(CHAVES.cupom, null);
    setCupom(null);
    setCupomDigitado('');
  }

  const subtotal = calcularCarrinho(itens).subtotal;
  const descontoCupom = cupom ? aplicarCupom(cupom.codigo, subtotal).desconto ?? 0 : 0;
  const totais = calcularCarrinho(itens, descontoCupom);

  return (
    <Tela>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO }}>Carrinho</Text>
        <Text style={{ color: COR_TEXTO_SUAVE }} testID="quantidade-total">{totais.quantidadeTotal} itens</Text>
      </View>

      {itens.length === 0 ? (
        <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 24, textAlign: 'center' }} testID="carrinho-vazio">Seu carrinho está vazio.</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View testID={`item-${item.id}`} style={{ borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 12, marginBottom: 10, backgroundColor: COR_FUNDO }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: COR_TEXTO, flexShrink: 1 }} numberOfLines={2}>{item.nome}</Text>
                <Pressable onPress={() => remover(item.id)} accessibilityRole="button" accessibilityLabel={`Remover ${item.nome}`} testID={`remover-${item.id}`}>
                  <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 18 }}>×</Text>
                </Pressable>
              </View>
              <Text style={{ color: COR_PRINCIPAL, fontWeight: '700', marginTop: 4 }}>{formatarMoeda(item.preco)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <BotaoQuantidade rotulo="-" onPress={() => alterar(item.id, item.quantidade - 1)} testID={`menos-${item.id}`} />
                <Text style={{ minWidth: 24, textAlign: 'center', fontWeight: '700' }} testID={`qtd-${item.id}`}>{item.quantidade}</Text>
                <BotaoQuantidade rotulo="+" onPress={() => alterar(item.id, item.quantidade + 1)} testID={`mais-${item.id}`} />
              </View>
            </View>
          )}
        />
      )}

      {itens.length > 0 ? (
        <View style={{ borderTopWidth: 1, borderTopColor: COR_BORDA, paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder="Cupom de desconto" autoCapitalize="characters" value={cupomDigitado} onChangeText={setCupomDigitado} accessibilityLabel="Cupom de desconto" testID="campo-cupom" style={[estiloCampo, { flex: 1 }]} />
            <Pressable onPress={aplicar} accessibilityRole="button" accessibilityLabel="Aplicar cupom" testID="botao-aplicar-cupom" style={{ backgroundColor: COR_PRINCIPAL, borderRadius: RAIO, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: COR_FUNDO, fontWeight: '700' }}>Aplicar</Text>
            </Pressable>
          </View>
          {cupom ? (
            <Pressable onPress={retirarCupom} accessibilityRole="button" accessibilityLabel="Remover cupom" testID="remover-cupom">
              <Text style={{ color: COR_PRINCIPAL, marginTop: 6 }}>Remover cupom {cupom.codigo}</Text>
            </Pressable>
          ) : null}
          {mensagem.texto ? <Aviso texto={mensagem.texto} tipo={mensagem.tipo} /> : null}

          <Linha rotulo="Subtotal" valor={formatarMoeda(totais.subtotal)} testID="subtotal" />
          <Linha rotulo="Desconto" valor={`- ${formatarMoeda(totais.desconto)}`} testID="desconto" />
          <Linha rotulo="Total" valor={formatarMoeda(totais.total)} destaque testID="total" />

          <Botao titulo="Finalizar compra" onPress={() => navigation.navigate('Checkout')} testID="botao-finalizar" />
        </View>
      ) : null}
    </Tela>
  );
}

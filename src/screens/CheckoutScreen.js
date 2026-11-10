import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Botao, Campo, Tela } from '../components/ui';
import { Aviso, Chip, Linha, Secao, Card } from '../components/extras';
import { carregarCarrinho, esvaziarCarrinho } from '../services/carrinho';
import { calcularCarrinho, formatarMoeda } from '../services/cart';
import { listarEnderecos, salvarEndereco, validarEndereco, validarCartao } from '../services/cadastros';
import { criarPedido } from '../services/pedidos';
import { pontuarCompra, marcarVoucherUsado, carregarGamificacao } from '../services/gamificacao';
import { aplicarCupom, descontoDoVoucher } from '../services/promocoes';
import { lerJson, CHAVES } from '../services/storage';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, COR_FUNDO } from '../theme';

const ETAPAS = ['Endereço', 'Entrega', 'Pagamento'];
const PAGAMENTOS = ['Cartão', 'Pix', 'Boleto'];
const PARCELAS = [1, 2, 3, 6, 12];
const PRAZO_ENTREGA = '5–7 dias úteis';

const ENDERECO_VAZIO = { cep: '', rua: '', numero: '', bairro: '', cidade: '', referencia: '' };

// Checkout em 3 etapas (PRD FR-CART-04, FR-CART-05, FR-CART-06).
export default function CheckoutScreen({ navigation }) {
  const [etapa, setEtapa] = useState(0);
  const [itens, setItens] = useState([]);
  const [cupom, setCupom] = useState(null);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [novoEndereco, setNovoEndereco] = useState(ENDERECO_VAZIO);
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [errosEndereco, setErrosEndereco] = useState({});

  const [pagamento, setPagamento] = useState('Cartão');
  const [parcelas, setParcelas] = useState(1);
  const [cartao, setCartao] = useState({ numero: '', validade: '', cvv: '', nome: '' });
  const [errosCartao, setErrosCartao] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [voucherUid, setVoucherUid] = useState(null);
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarCarrinho().then(setItens);
    lerJson(CHAVES.cupom, null).then(setCupom);
    listarEnderecos().then((lista) => {
      setEnderecos(lista);
      if (lista.length) setEnderecoSelecionado(lista[0].id);
      else setMostrarNovo(true);
    });
    carregarGamificacao().then((g) => setVouchers(g.vouchers.filter((v) => !v.usado)));
  }, []);

  const subtotal = calcularCarrinho(itens).subtotal;
  const descontoCupom = cupom ? aplicarCupom(cupom.codigo, subtotal).desconto ?? 0 : 0;
  const voucher = vouchers.find((v) => v.uid === voucherUid) ?? null;
  const descontoVoucher = descontoDoVoucher(voucher, subtotal - descontoCupom);
  const total = Math.max(0, subtotal - descontoCupom - descontoVoucher);

  async function continuarEndereco() {
    setErroGeral('');
    if (mostrarNovo) {
      const erros = validarEndereco(novoEndereco);
      setErrosEndereco(erros);
      if (Object.keys(erros).length) return;
      const r = await salvarEndereco(novoEndereco);
      if (!r.ok) {
        setErrosEndereco(r.erros);
        return;
      }
      setEnderecos(await listarEnderecos());
      setEnderecoSelecionado(r.endereco.id);
      setMostrarNovo(false);
    } else if (!enderecoSelecionado) {
      setErroGeral('Escolha um endereço de entrega.');
      return;
    }
    setEtapa(1);
  }

  async function confirmarPedido() {
    setErroGeral('');
    if (pagamento === 'Cartão') {
      const erros = validarCartao(cartao);
      setErrosCartao(erros);
      if (Object.keys(erros).length) return;
    }
    if (itens.length === 0) {
      setErroGeral('Seu carrinho está vazio.');
      return;
    }
    setEnviando(true);
    const endereco = enderecos.find((e) => e.id === enderecoSelecionado) ?? null;
    const pedido = await criarPedido({
      itens: itens.map((i) => ({ id: i.id, nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
      total,
      desconto: descontoCupom + descontoVoucher,
      endereco,
      pagamento: pagamento === 'Cartão' ? `Cartão crédito em ${parcelas}x` : pagamento,
      parcelas: pagamento === 'Cartão' ? parcelas : 1,
      voucher: voucher ? voucher.titulo : null,
    });
    await pontuarCompra(total, pedido.numero);
    if (voucher) await marcarVoucherUsado(voucher.uid);
    await esvaziarCarrinho();
    navigation.replace('PedidoConfirmado', { numero: pedido.numero });
  }

  const enderecoAtual = enderecos.find((e) => e.id === enderecoSelecionado);

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => (etapa === 0 ? navigation.goBack() : setEtapa(etapa - 1))} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginTop: 8 }}>Checkout</Text>

        <View style={{ flexDirection: 'row', gap: 6, marginVertical: 12 }} testID="progresso">
          {ETAPAS.map((nome, i) => (
            <View key={nome} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: i <= etapa ? COR_PRINCIPAL : '#E5E7EB' }}>
              <Text style={{ color: i <= etapa ? COR_FUNDO : COR_TEXTO_SUAVE, fontSize: 12, fontWeight: '600' }}>{nome}</Text>
            </View>
          ))}
        </View>

        {erroGeral ? <Aviso texto={erroGeral} tipo="erro" /> : null}

        {etapa === 0 ? (
          <Secao titulo="Endereço de entrega">
            {enderecos.map((e) => (
              <Pressable key={e.id} onPress={() => { setEnderecoSelecionado(e.id); setMostrarNovo(false); }} accessibilityRole="radio" accessibilityState={{ selected: enderecoSelecionado === e.id }} accessibilityLabel={`Endereço ${e.rua}`} testID={`endereco-${e.id}`}>
                <Card>
                  <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{e.rua}, {e.numero}</Text>
                  <Text style={{ color: COR_TEXTO_SUAVE }}>CEP {e.cep} · {e.bairro} · {e.cidade}</Text>
                  {enderecoSelecionado === e.id && !mostrarNovo ? <Text style={{ color: COR_PRINCIPAL }}>✓ Selecionado</Text> : null}
                </Card>
              </Pressable>
            ))}
            {!mostrarNovo ? (
              <Pressable onPress={() => setMostrarNovo(true)} accessibilityRole="button" accessibilityLabel="Novo endereço" testID="novo-endereco">
                <Text style={{ color: COR_PRINCIPAL, fontWeight: '600' }}>+ Novo endereço</Text>
              </Pressable>
            ) : (
              <View>
                <Campo rotulo="CEP" keyboardType="numeric" value={novoEndereco.cep} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, cep: v })} erro={errosEndereco.cep} testID="campo-cep" />
                <Campo rotulo="Rua" value={novoEndereco.rua} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, rua: v })} erro={errosEndereco.rua} testID="campo-rua" />
                <Campo rotulo="Número / Comp." value={novoEndereco.numero} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, numero: v })} erro={errosEndereco.numero} testID="campo-numero" />
                <Campo rotulo="Bairro" value={novoEndereco.bairro} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, bairro: v })} erro={errosEndereco.bairro} testID="campo-bairro" />
                <Campo rotulo="Cidade" value={novoEndereco.cidade} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, cidade: v })} erro={errosEndereco.cidade} testID="campo-cidade" />
                <Campo rotulo="Referência" value={novoEndereco.referencia} onChangeText={(v) => setNovoEndereco({ ...novoEndereco, referencia: v })} testID="campo-referencia" />
              </View>
            )}
            <Botao titulo="Continuar" onPress={continuarEndereco} testID="botao-continuar-endereco" />
          </Secao>
        ) : null}

        {etapa === 1 ? (
          <Secao titulo="Entrega">
            <Card>
              <Text style={{ fontWeight: '700', color: COR_TEXTO }}>Entrega padrão</Text>
              <Text style={{ color: COR_TEXTO_SUAVE }}>Previsão: {PRAZO_ENTREGA}</Text>
              {enderecoAtual ? <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 4 }}>Para: {enderecoAtual.rua}, {enderecoAtual.numero} · {enderecoAtual.cidade}</Text> : null}
            </Card>
            <Botao titulo="Continuar" onPress={() => setEtapa(2)} testID="botao-continuar-entrega" />
          </Secao>
        ) : null}

        {etapa === 2 ? (
          <Secao titulo="Forma de pagamento">
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {PAGAMENTOS.map((p) => (
                <Chip key={p} titulo={p} ativo={pagamento === p} onPress={() => setPagamento(p)} testID={`pagamento-${p}`} />
              ))}
            </View>

            {pagamento === 'Cartão' ? (
              <View>
                <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 8 }}>Parcelas</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {PARCELAS.map((n) => (
                    <Chip key={n} titulo={`${n}x`} ativo={parcelas === n} onPress={() => setParcelas(n)} testID={`parcelas-${n}`} />
                  ))}
                </View>
                <Campo rotulo="Número do cartão" placeholder="0000 0000 0000 0000" keyboardType="numeric" value={cartao.numero} onChangeText={(v) => setCartao({ ...cartao, numero: v })} erro={errosCartao.numero} testID="campo-cartao" />
                <Campo rotulo="Validade" placeholder="MM/AA" value={cartao.validade} onChangeText={(v) => setCartao({ ...cartao, validade: v })} erro={errosCartao.validade} testID="campo-validade" />
                <Campo rotulo="CVV" keyboardType="numeric" secureTextEntry value={cartao.cvv} onChangeText={(v) => setCartao({ ...cartao, cvv: v })} erro={errosCartao.cvv} testID="campo-cvv" />
                <Campo rotulo="Nome no cartão" value={cartao.nome} onChangeText={(v) => setCartao({ ...cartao, nome: v })} erro={errosCartao.nome} testID="campo-nome-cartao" />
              </View>
            ) : (
              <Text style={{ color: COR_TEXTO_SUAVE, marginTop: 8 }}>
                {pagamento === 'Pix' ? 'O pagamento Pix é simulado e será aprovado na confirmação.' : 'O boleto é simulado e será gerado na confirmação.'}
              </Text>
            )}

            {vouchers.length > 0 ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: COR_TEXTO_SUAVE }}>Usar voucher de resgate</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  <Chip titulo="Nenhum" ativo={!voucherUid} onPress={() => setVoucherUid(null)} testID="voucher-nenhum" />
                  {vouchers.map((v) => (
                    <Chip key={v.uid} titulo={v.titulo} ativo={voucherUid === v.uid} onPress={() => setVoucherUid(v.uid)} testID={`voucher-${v.uid}`} />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: 12 }}>
              <Linha rotulo="Subtotal" valor={formatarMoeda(subtotal)} />
              <Linha rotulo="Desconto" valor={`- ${formatarMoeda(descontoCupom + descontoVoucher)}`} testID="checkout-desconto" />
              <Linha rotulo="Total" valor={formatarMoeda(total)} destaque testID="checkout-total" />
            </View>

            <Botao titulo={enviando ? 'Confirmando...' : 'Confirmar pedido'} onPress={confirmarPedido} desabilitado={enviando} testID="botao-confirmar-pedido" />
          </Secao>
        ) : null}
      </ScrollView>
    </Tela>
  );
}

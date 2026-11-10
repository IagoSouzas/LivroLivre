import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Botao, Campo, Tela } from '../components/ui';
import { Card, Aviso, Vazio } from '../components/extras';
import { listarFormasPagamento, salvarCartao, removerFormaPagamento } from '../services/cadastros';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Formas de pagamento (PRD FR-ACC-04). Guarda só os 4 últimos dígitos do cartão.
export default function FormasPagamentoScreen({ navigation }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');

  useFocusEffect(
    useCallback(() => {
      listarFormasPagamento().then(setLista);
    }, []),
  );

  async function salvar() {
    const r = await salvarCartao(form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setLista(await listarFormasPagamento());
    setForm(null);
    setErros({});
    setMensagem('Cartão salvo.');
  }

  async function remover(id) {
    await removerFormaPagamento(id);
    setLista(await listarFormasPagamento());
  }

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Formas de pagamento</Text>
        {mensagem ? <Aviso texto={mensagem} /> : null}

        {lista.length === 0 && !form ? <Vazio texto="Nenhuma forma de pagamento salva." testID="pagamentos-vazio" /> : null}

        {lista.map((f) => (
          <Card key={f.id} testID={`pag-${f.id}`}>
            <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{f.tipo} final {f.final}</Text>
            <Text style={{ color: COR_TEXTO_SUAVE }}>{f.nome}</Text>
            <Pressable onPress={() => remover(f.id)} accessibilityRole="button" accessibilityLabel={`Remover cartão final ${f.final}`} testID={`remover-pag-${f.id}`}>
              <Text style={{ color: '#B91C1C', marginTop: 6 }}>Remover</Text>
            </Pressable>
          </Card>
        ))}

        {form ? (
          <>
            <Campo rotulo="Número do cartão" tipo="cartao" value={form.numero} onChangeText={(v) => setForm({ ...form, numero: v })} erro={erros.numero} testID="pag-numero" />
            <Campo rotulo="Validade" tipo="validade" placeholder="MM/AA" value={form.validade} onChangeText={(v) => setForm({ ...form, validade: v })} erro={erros.validade} testID="pag-validade" />
            <Campo rotulo="CVV" tipo="cvv" secureTextEntry value={form.cvv} onChangeText={(v) => setForm({ ...form, cvv: v })} erro={erros.cvv} testID="pag-cvv" />
            <Campo rotulo="Nome no cartão" value={form.nome} onChangeText={(v) => setForm({ ...form, nome: v })} erro={erros.nome} testID="pag-nome" />
            <Botao titulo="Salvar cartão" onPress={salvar} testID="botao-salvar-cartao" />
            <Botao titulo="Cancelar" variante="secundario" onPress={() => setForm(null)} testID="botao-cancelar-cartao" />
          </>
        ) : (
          <Botao titulo="+ Novo cartão" onPress={() => setForm({ numero: '', validade: '', cvv: '', nome: '' })} testID="botao-novo-cartao" />
        )}
      </ScrollView>
    </Tela>
  );
}

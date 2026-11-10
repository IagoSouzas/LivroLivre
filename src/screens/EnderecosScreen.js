import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Botao, Campo, Tela } from '../components/ui';
import { Card, Aviso, Vazio } from '../components/extras';
import { listarEnderecos, salvarEndereco, removerEndereco } from '../services/cadastros';
import { COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

const VAZIO = { cep: '', rua: '', numero: '', bairro: '', cidade: '', referencia: '' };

// Endereços (PRD FR-ACC-04): cadastrar, editar e remover.
export default function EnderecosScreen({ navigation }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');

  useFocusEffect(
    useCallback(() => {
      listarEnderecos().then(setLista);
    }, []),
  );

  async function salvar() {
    const r = await salvarEndereco(form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setLista(await listarEnderecos());
    setForm(null);
    setErros({});
    setMensagem('Endereço salvo.');
  }

  async function remover(id) {
    await removerEndereco(id);
    setLista(await listarEnderecos());
  }

  return (
    <Tela>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Endereços</Text>
        {mensagem ? <Aviso texto={mensagem} /> : null}

        {lista.length === 0 && !form ? <Vazio texto="Nenhum endereço cadastrado." testID="enderecos-vazio" /> : null}

        {lista.map((e) => (
          <Card key={e.id} testID={`end-${e.id}`}>
            <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{e.rua}, {e.numero}</Text>
            <Text style={{ color: COR_TEXTO_SUAVE }}>CEP {e.cep} · {e.bairro} · {e.cidade}</Text>
            <Pressable onPress={() => remover(e.id)} accessibilityRole="button" accessibilityLabel={`Remover endereço ${e.rua}`} testID={`remover-end-${e.id}`}>
              <Text style={{ color: '#B91C1C', marginTop: 6 }}>Remover</Text>
            </Pressable>
          </Card>
        ))}

        {form ? (
          <View>
            <Campo rotulo="CEP" keyboardType="numeric" value={form.cep} onChangeText={(v) => setForm({ ...form, cep: v })} erro={erros.cep} testID="end-cep" />
            <Campo rotulo="Rua" value={form.rua} onChangeText={(v) => setForm({ ...form, rua: v })} erro={erros.rua} testID="end-rua" />
            <Campo rotulo="Número / Comp." value={form.numero} onChangeText={(v) => setForm({ ...form, numero: v })} erro={erros.numero} testID="end-numero" />
            <Campo rotulo="Bairro" value={form.bairro} onChangeText={(v) => setForm({ ...form, bairro: v })} erro={erros.bairro} testID="end-bairro" />
            <Campo rotulo="Cidade" value={form.cidade} onChangeText={(v) => setForm({ ...form, cidade: v })} erro={erros.cidade} testID="end-cidade" />
            <Campo rotulo="Referência" value={form.referencia} onChangeText={(v) => setForm({ ...form, referencia: v })} testID="end-referencia" />
            <Botao titulo="Salvar endereço" onPress={salvar} testID="botao-salvar-endereco" />
            <Botao titulo="Cancelar" variante="secundario" onPress={() => setForm(null)} testID="botao-cancelar-endereco" />
          </View>
        ) : (
          <Botao titulo="+ Novo endereço" onPress={() => setForm({ ...VAZIO })} testID="botao-novo-endereco" />
        )}
      </ScrollView>
    </Tela>
  );
}

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Botao, Tela } from '../components/ui';
import { Aviso, Card, Secao } from '../components/extras';
import { rodarChecagens, formatarRelatorio, TOTAL_CHECAGENS } from '../services/tester';
import { COR_BORDA, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

// Telas do app para conferência. "Abrir" só aparece nas telas que não exigem parâmetros.
const TELAS = [
  { nome: 'Login', rota: 'Login', abrivel: false },
  { nome: 'Criar conta', rota: 'CriarConta', abrivel: false },
  { nome: 'Recuperar senha', rota: 'RecuperarSenha', abrivel: false },
  { nome: 'Início', rota: 'Início', abrivel: true },
  { nome: 'Busca e lista', rota: 'Busca', abrivel: true },
  { nome: 'Detalhe do produto', rota: 'Produto', abrivel: false, via: 'Início → produto' },
  { nome: 'Avaliações do produto', rota: 'Avaliacoes', abrivel: false, via: 'Detalhe → Ver avaliações' },
  { nome: 'Carrinho', rota: 'Carrinho', abrivel: true },
  { nome: 'Checkout (endereço, entrega, pagamento)', rota: 'Checkout', abrivel: false, via: 'Carrinho → Finalizar compra' },
  { nome: 'Pedido confirmado', rota: 'PedidoConfirmado', abrivel: false, via: 'Checkout → Confirmar pedido' },
  { nome: 'Meus pedidos', rota: 'Pedidos', abrivel: true },
  { nome: 'Rastreamento', rota: 'Rastreamento', abrivel: false, via: 'Pedidos → Rastrear' },
  { nome: 'Avaliar produto', rota: 'AvaliarProduto', abrivel: false, via: 'Pedidos → Avaliar' },
  { nome: 'Devolução / troca', rota: 'Devolucao', abrivel: false, via: 'Pedidos → Devolução' },
  { nome: 'Perfil', rota: 'Perfil', abrivel: true },
  { nome: 'Favoritos', rota: 'Favoritos', abrivel: true },
  { nome: 'Recompensas', rota: 'Recompensas', abrivel: true },
  { nome: 'Conquistas', rota: 'Conquistas', abrivel: true },
  { nome: 'Configurações', rota: 'Configuracoes', abrivel: true },
  { nome: 'Endereços', rota: 'Enderecos', abrivel: true },
  { nome: 'Formas de pagamento', rota: 'FormasPagamento', abrivel: true },
  { nome: 'Tester', rota: 'Tester', abrivel: false, via: 'Perfil → Tester' },
];

export default function TesterScreen({ navigation }) {
  const [resultados, setResultados] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function rodar() {
    setRodando(true);
    setCopiado(false);
    setProgresso(0);
    const r = await rodarChecagens((feitas) => setProgresso(feitas));
    setResultados(r);
    setRodando(false);
  }

  async function exportar() {
    if (!resultados) return;
    await Clipboard.setStringAsync(formatarRelatorio(resultados));
    setCopiado(true);
  }

  const aprovadas = resultados ? resultados.filter((r) => r.ok).length : 0;

  return (
    <Tela>
      <ScrollView>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Tester</Text>
        <Text style={{ color: COR_TEXTO_SUAVE }}>Confere as funcionalidades do app. Não altera dados do usuário.</Text>

        <Botao
          titulo={rodando ? `Rodando... ${progresso}/${TOTAL_CHECAGENS}` : 'Rodar checagens'}
          onPress={rodar}
          desabilitado={rodando}
          testID="botao-rodar"
        />

        {resultados ? (
          <Secao titulo={`Resultado: ${aprovadas}/${resultados.length} aprovadas`}>
            {resultados.map((r) => (
              <View key={r.id} testID={`check-${r.id}`} style={{ flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COR_BORDA }}>
                <Text style={{ fontWeight: '700', color: r.ok ? '#059669' : '#B91C1C', width: 44 }}>{r.ok ? 'PASS' : 'FAIL'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COR_TEXTO, fontWeight: '600' }}>{r.titulo}</Text>
                  <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }}>{r.detalhe}</Text>
                </View>
              </View>
            ))}
            <Botao titulo="Copiar relatório" variante="secundario" onPress={exportar} testID="botao-exportar" />
            {copiado ? <Aviso texto="Relatório copiado para a área de transferência." /> : null}
          </Secao>
        ) : null}

        <Secao titulo="Telas do app">
          {TELAS.map((t) => (
            <Card key={t.rota} testID={`tela-${t.rota}`}>
              <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{t.nome}</Text>
              {t.abrivel ? (
                <Pressable onPress={() => navigation.navigate(t.rota)} accessibilityRole="button" accessibilityLabel={`Abrir ${t.nome}`} testID={`abrir-${t.rota}`}>
                  <Text style={{ color: COR_PRINCIPAL, fontWeight: '600', marginTop: 4 }}>Abrir</Text>
                </Pressable>
              ) : (
                <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12, marginTop: 4 }}>Acesso: {t.via ?? 'pela tela de login'}</Text>
              )}
            </Card>
          ))}
        </Secao>
      </ScrollView>
    </Tela>
  );
}

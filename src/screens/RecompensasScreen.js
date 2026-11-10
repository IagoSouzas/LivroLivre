import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Tela } from '../components/ui';
import { Aviso, Card, Secao } from '../components/extras';
import { listarPedidos } from '../services/pedidos';
import { listarAvaliacoes } from '../services/avaliacoes';
import {
  carregarGamificacao,
  nivelPara,
  proximoNivel,
  saldoDisponivel,
  resumoGamificacao,
  desafios,
  RESGATES,
  NIVEIS,
  resgatar,
  registrarIndicacao,
} from '../services/gamificacao';
import { COR_BORDA, COR_FUNDO, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE, RAIO } from '../theme';

// Recompensas (PRD FR-GAM-01 a FR-GAM-04).
export default function RecompensasScreen({ navigation }) {
  const [estado, setEstado] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: 'info' });

  const carregar = useCallback(async () => {
    const [g, pedidos, avaliacoes] = await Promise.all([carregarGamificacao(), listarPedidos(), listarAvaliacoes()]);
    setEstado(g);
    setResumo(resumoGamificacao({ estado: g, pedidos, avaliacoes }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function trocar(id) {
    const r = await resgatar(id);
    setMensagem(r.ok ? { texto: 'Resgate feito! Use o voucher no checkout.', tipo: 'info' } : { texto: r.erro, tipo: 'erro' });
    carregar();
  }

  async function indicar() {
    const r = await registrarIndicacao();
    setMensagem(
      r.ok
        ? { texto: 'Indicação registrada! +100 pontos.', tipo: 'info' }
        : { texto: 'Você já registrou uma indicação.', tipo: 'erro' },
    );
    carregar();
  }

  if (!estado || !resumo) return <Tela />;

  const nivel = nivelPara(estado.acumulado);
  const proximo = proximoNivel(estado.acumulado);
  const base = nivel.minimo;
  const alvo = proximo ? proximo.minimo : nivel.minimo;
  const progresso = proximo ? Math.min(1, (estado.acumulado - base) / (alvo - base)) : 1;
  const saldo = saldoDisponivel(estado);
  const listaDesafios = desafios(resumo);

  return (
    <Tela>
      <ScrollView>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
          <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Recompensas</Text>

        <View style={{ backgroundColor: COR_PRINCIPAL, borderRadius: RAIO, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: COR_FUNDO, fontSize: 20, fontWeight: '700' }} testID="nivel-atual">Nível {nivel.nome}</Text>
          <Text style={{ color: COR_FUNDO }} testID="pontos-acumulados">{estado.acumulado} pontos acumulados</Text>
          <View style={{ width: '100%', height: 8, backgroundColor: '#ffffff55', borderRadius: 4, marginTop: 12 }}>
            <View style={{ width: `${Math.round(progresso * 100)}%`, height: 8, backgroundColor: COR_FUNDO, borderRadius: 4 }} />
          </View>
          <Text style={{ color: COR_FUNDO, fontSize: 12, marginTop: 6 }}>
            {proximo ? `${proximo.minimo - estado.acumulado} pts para ${proximo.nome}` : 'Nível máximo'}
          </Text>
        </View>

        <Text style={{ color: COR_TEXTO, marginTop: 8 }} testID="saldo">Saldo disponível: {saldo} pontos</Text>
        <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12 }}>Níveis: {NIVEIS.map((n) => n.nome).join(' · ')}</Text>

        {mensagem.texto ? <Aviso texto={mensagem.texto} tipo={mensagem.tipo} /> : null}

        <Secao titulo="Desafios ativos">
          {listaDesafios.map((d) => (
            <Card key={d.id} testID={`desafio-${d.id}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{d.titulo}</Text>
                <Text style={{ color: '#059669', fontWeight: '700' }}>+{d.pontos} pts</Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginTop: 8 }}>
                <View style={{ width: `${(d.atual / d.meta) * 100}%`, height: 6, backgroundColor: COR_PRINCIPAL, borderRadius: 3 }} />
              </View>
              <Text style={{ color: COR_TEXTO_SUAVE, fontSize: 12, marginTop: 4 }}>{d.atual}/{d.meta}</Text>
              {d.id === 'indique1' && d.atual < d.meta ? (
                <Pressable onPress={indicar} accessibilityRole="button" accessibilityLabel="Indicar um amigo" testID="botao-indicar" style={{ marginTop: 6 }}>
                  <Text style={{ color: COR_PRINCIPAL, fontWeight: '600' }}>Indicar um amigo</Text>
                </Pressable>
              ) : null}
            </Card>
          ))}
        </Secao>

        <Secao titulo="Resgatar pontos">
          {RESGATES.map((r) => (
            <View key={r.id} testID={`resgate-${r.id}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COR_BORDA, borderRadius: RAIO, padding: 12, marginBottom: 10, backgroundColor: COR_FUNDO }}>
              <View>
                <Text style={{ fontWeight: '700', color: COR_TEXTO }}>{r.titulo}</Text>
                <Text style={{ color: COR_TEXTO_SUAVE }}>{r.custo} pts</Text>
              </View>
              <Pressable onPress={() => trocar(r.id)} accessibilityRole="button" accessibilityLabel={`Resgatar ${r.titulo}`} testID={`botao-resgatar-${r.id}`} style={{ backgroundColor: COR_PRINCIPAL, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ color: COR_FUNDO, fontWeight: '700' }}>Resgatar</Text>
              </Pressable>
            </View>
          ))}
        </Secao>

        <Secao titulo="Meus vouchers">
          {estado.vouchers.filter((v) => !v.usado).length === 0 ? (
            <Text style={{ color: COR_TEXTO_SUAVE }} testID="vouchers-vazio">Nenhum voucher disponível.</Text>
          ) : (
            estado.vouchers.filter((v) => !v.usado).map((v) => (
              <Text key={v.uid} style={{ color: COR_TEXTO }} testID={`voucher-item-${v.uid}`}>• {v.titulo}</Text>
            ))
          )}
        </Secao>

        <Secao titulo="Histórico de pontos">
          {estado.historico.length === 0 ? (
            <Text style={{ color: COR_TEXTO_SUAVE }}>Nenhum ponto ganho ainda.</Text>
          ) : (
            estado.historico.slice(0, 10).map((h, i) => (
              <Text key={`${h.data}-${i}`} style={{ color: COR_TEXTO }}>+{h.pontos} · {h.descricao}</Text>
            ))
          )}
        </Secao>
      </ScrollView>
    </Tela>
  );
}

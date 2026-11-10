import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Tela } from '../components/ui';
import { Secao } from '../components/extras';
import { carregarConfig, alternarConfig } from '../services/cadastros';
import { COR_BORDA, COR_PRINCIPAL, COR_TEXTO, COR_TEXTO_SUAVE } from '../theme';

const GRUPOS = [
  { titulo: 'Segurança', itens: [{ id: 'autenticacaoDoisFatores', rotulo: 'Autenticação 2 fatores' }, { id: 'biometria', rotulo: 'Biometria' }] },
  { titulo: 'Notificações', itens: [{ id: 'push', rotulo: 'Push' }, { id: 'email', rotulo: 'E-mail' }, { id: 'sms', rotulo: 'SMS' }] },
];

// Configurações (PRD FR-ACC-03): alterar senha e toggles salvos.
export default function ConfiguracoesScreen({ navigation }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    carregarConfig().then(setConfig);
  }, []);

  async function alternar(id) {
    setConfig(await alternarConfig(id));
  }

  return (
    <Tela>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" testID="voltar">
        <Text style={{ color: COR_PRINCIPAL, fontSize: 16 }}>← Voltar</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '700', color: COR_TEXTO, marginVertical: 8 }}>Configurações</Text>

      <Secao titulo="Dados pessoais">
        <Pressable onPress={() => navigation.navigate('EditarPerfil')} accessibilityRole="button" accessibilityLabel="Editar dados pessoais" testID="config-dados">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COR_BORDA }}>
            <Text style={{ color: COR_TEXTO }}>Nome, telefone</Text>
            <Text style={{ color: COR_TEXTO_SUAVE }}>→</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('AlterarSenha')} accessibilityRole="button" accessibilityLabel="Alterar senha" testID="config-senha">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COR_BORDA }}>
            <Text style={{ color: COR_TEXTO }}>Alterar senha</Text>
            <Text style={{ color: COR_TEXTO_SUAVE }}>→</Text>
          </View>
        </Pressable>
      </Secao>

      {GRUPOS.map((grupo) => (
        <Secao key={grupo.titulo} titulo={grupo.titulo}>
          {grupo.itens.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COR_BORDA }}>
              <Text style={{ color: COR_TEXTO }}>{item.rotulo}</Text>
              <Switch
                value={config ? !!config[item.id] : false}
                onValueChange={() => alternar(item.id)}
                trackColor={{ true: COR_PRINCIPAL }}
                accessibilityLabel={item.rotulo}
                testID={`toggle-${item.id}`}
              />
            </View>
          ))}
        </Secao>
      ))}
    </Tela>
  );
}

import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Shield } from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      // Redirection selon rôle (via root _layout)
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <BlurView intensity={80} tint="dark" className="rounded-3xl p-8 border border-amber-500/30">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center mb-4">
              <Shield size={40} color="#020617" />
            </View>
            <Text className="text-4xl font-bold text-amber-400">ZAPHIR</Text>
            <Text className="text-slate-400 mt-2">Command Center Access</Text>
          </View>

          {error && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          )}

          <View className="space-y-4">
            <View>
              <Text className="text-slate-300 text-sm mb-2">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="user@zaphir.com"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100"
              />
            </View>

            <View>
              <Text className="text-slate-300 text-sm mb-2">Mot de passe</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100"
              />
            </View>

            <Button title="Se connecter" onPress={handleLogin} loading={isLoading} fullWidth size="lg" />
          </View>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

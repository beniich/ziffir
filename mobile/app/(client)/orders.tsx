import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../lib/auth';
import { api } from '../../lib/api';

export default function ClientOrdersScreen() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['client-orders'],
    queryFn: () => api.client.myOrders(),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PREPARATION: 'bg-amber-500/20 text-amber-300',
      QUALITY_CHECK: 'bg-cyan-500/20 text-cyan-300',
      OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-300',
      DELIVERED: 'bg-emerald-500/20 text-emerald-300',
    };
    return colors[status] || 'bg-slate-700 text-slate-300';
  };

  return (
    <View className="flex-1 bg-slate-950 p-4">
      <Text className="text-2xl font-bold text-slate-100 mb-4">Mes Commandes</Text>
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#d49619" />}
        renderItem={({ item }) => (
          <BlurView intensity={40} tint="dark" className="rounded-xl p-4 mb-3 border border-amber-500/10">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="font-bold text-slate-100">{item.roomNumber}</Text>
                <Text className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <View className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                <Text className="text-xs font-semibold">{item.status.replace('_', ' ')}</Text>
              </View>
            </View>
            
            <View className="border-t border-slate-700/50 pt-2 mt-2">
              {item.items?.map((i: any, idx: number) => (
                <Text key={idx} className="text-sm text-slate-300">
                  {i.quantity}× {i.name}
                </Text>
              ))}
            </View>
            
            <Text className="text-right font-bold text-amber-400 mt-2">
              {item.total?.toFixed(2)}€
            </Text>
          </BlurView>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-slate-500">📭 Aucune commande</Text>
          </View>
        }
      />
    </View>
  );
}

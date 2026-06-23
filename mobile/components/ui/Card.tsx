import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface Props extends ViewProps {
  variant?: 'glass' | 'glass-strong' | 'default';
  glow?: boolean;
}

export function Card({ variant = 'default', glow, children, className, ...props }: Props) {
  if (variant === 'glass' || variant === 'glass-strong') {
    return (
      <BlurView
        intensity={variant === 'glass-strong' ? 80 : 40}
        tint="dark"
        className={`rounded-2xl overflow-hidden ${glow ? 'border border-amber-500/40' : 'border border-amber-500/10'} ${className}`}
      >
        <View className="p-4" {...props}>
          {children}
        </View>
      </BlurView>
    );
  }

  return (
    <View
      className={`bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

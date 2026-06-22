import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onPress?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({ onPress, title, variant = 'primary', size = 'md', loading, disabled, icon, style, fullWidth }: Props) {
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const variants = {
    primary: 'bg-amber-500',
    secondary: 'bg-slate-800 border border-slate-700',
    ghost: 'bg-transparent',
    danger: 'bg-red-500/20 border border-red-500/40',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl flex-row items-center justify-center gap-2
        ${disabled || loading ? 'opacity-40' : ''}
        ${fullWidth ? 'w-full' : ''}
      `}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color="#020617" />
      ) : (
        <>
          {icon}
          <Text className={`font-bold ${variant === 'primary' ? 'text-slate-950' : 'text-slate-100'}`}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

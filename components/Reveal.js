import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Subtle entrance: fade + rise once per key (e.g. trip status change).
export default function Reveal({ children, changeKey, className }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fade.setValue(0);
    rise.setValue(10);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [changeKey]);

  return (
    <Animated.View
      className={className}
      style={{ opacity: fade, transform: [{ translateY: rise }] }}
    >
      {children}
    </Animated.View>
  );
}

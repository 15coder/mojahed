import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: 'غير موجود', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={72} color={colors.muted} />
        <Text style={[styles.title, { color: colors.foreground }]}>
          الصفحة غير موجودة
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          المسار الذي طلبته غير متوفر
        </Text>
        <Link href="/" style={[styles.link, { backgroundColor: colors.primary }]}>
          <Text style={[styles.linkText, { color: colors.primaryForeground }]}>
            العودة للرئيسية
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Qomra',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Qomra',
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'Qomra',
  },
});

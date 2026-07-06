import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACTIVATION_CODE } from '@/constants/activation';

interface Props {
  onActivate: () => void;
}

export default function ActivateScreen({ onActivate }: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  function handleActivate() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('أدخل كود التفعيل');
      return;
    }
    setLoading(true);
    setError('');

    // Short delay so it feels intentional
    setTimeout(() => {
      if (trimmed === ACTIVATION_CODE) {
        onActivate();
      } else {
        setLoading(false);
        setError('كود التفعيل غير صحيح، تواصل مع المطوّر');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    }, 600);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo area */}
      <View style={styles.logoArea}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.appName}>كاشيرك</Text>
        <Text style={styles.appSub}>إدارة المخزون</Text>
      </View>

      {/* Card */}
      <View style={[styles.card, shake && styles.cardShake]}>
        <Text style={styles.title}>تفعيل التطبيق</Text>
        <Text style={styles.subtitle}>
          أدخل كود التفعيل الذي حصلت عليه للمتابعة
        </Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="CASH-0000"
          placeholderTextColor="#9CA3AF"
          value={code}
          onChangeText={(t) => { setCode(t); setError(''); }}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleActivate}
          textAlign="center"
          editable={!loading}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleActivate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.btnText}>تفعيل</Text>
          }
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        للحصول على كود التفعيل، تواصل مع المطوّر
      </Text>
    </KeyboardAvoidingView>
  );
}

const TEAL = '#1ABCB0';
const TEAL_DARK = '#0D9E96';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  logoArea: {
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Tajawal_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appSub: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardShake: {
    // Visual feedback — border flash
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Tajawal_700Bold',
    color: '#0D1B3E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    color: '#6B7A99',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#D0D9EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: 'Tajawal_500Medium',
    color: '#0D1B3E',
    backgroundColor: '#F4F6FA',
    letterSpacing: 2,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    color: '#EF4444',
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: TEAL_DARK,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: 17,
    fontFamily: 'Tajawal_700Bold',
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});

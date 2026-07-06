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
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

const TEAL = '#1ABCB0';
const TEAL_DARK = '#0D9E96';
const TEAL_BG = '#0F7A74';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: 'كود التفعيل غير صحيح',
  device_mismatch: 'هذا الكود مخصص لجهاز آخر',
  revoked: 'تم إلغاء هذا الترخيص — تواصل مع المطوّر',
  expired: 'انتهت صلاحية الترخيص — تواصل مع المطوّر للتجديد',
  network_error: 'تعذّر الاتصال بالسيرفر — تحقق من الإنترنت',
  no_device_id: 'تعذّر قراءة رمز الجهاز',
  missing_fields: 'بيانات ناقصة — حاول مجدداً',
  server_error: 'خطأ في السيرفر — حاول لاحقاً',
  unknown: 'حدث خطأ غير متوقع — حاول مجدداً',
};

interface Props {
  deviceId: string | null;
  onActivate: (key: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ActivateScreen({ deviceId, onActivate }: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayId = deviceId ?? '...';

  async function handleCopy() {
    if (!deviceId) return;
    await Clipboard.setStringAsync(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleActivate() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError(ERROR_MESSAGES.missing_fields);
      return;
    }
    setLoading(true);
    setError('');
    const result = await onActivate(trimmed);
    setLoading(false);
    if (!result.success) {
      setError(ERROR_MESSAGES[result.error ?? 'unknown'] ?? ERROR_MESSAGES.unknown);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo */}
      <View style={styles.logoArea}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.appName}>كاشيرك</Text>
        <Text style={styles.appSub}>إدارة المخزون</Text>
      </View>

      {/* Device ID card */}
      <View style={styles.deviceCard}>
        <Text style={styles.deviceLabel}>رمز جهازك</Text>
        <Text style={styles.deviceIdText} selectable>{displayId}</Text>
        <Pressable style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyBtnText}>{copied ? '✓ تم النسخ' : 'نسخ الرمز'}</Text>
        </Pressable>
        <Text style={styles.deviceHint}>
          أرسل هذا الرمز للمطوّر للحصول على كود التفعيل
        </Text>
      </View>

      {/* Activation form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>كود التفعيل</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="XXXX-XXXX-XXXX"
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
            : <Text style={styles.btnText}>تفعيل التطبيق</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  logoArea: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 2,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Tajawal_700Bold',
    color: '#FFFFFF',
  },
  appSub: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.75)',
  },
  deviceCard: {
    width: '100%',
    backgroundColor: TEAL_BG,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  deviceLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deviceIdText: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyBtnText: {
    fontSize: 13,
    fontFamily: 'Tajawal_500Medium',
    color: '#FFFFFF',
  },
  deviceHint: {
    fontSize: 12,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: '#0D1B3E',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#D0D9EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    color: '#0D1B3E',
    backgroundColor: '#F4F6FA',
    letterSpacing: 3,
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
    height: 50,
    backgroundColor: TEAL_DARK,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#FFFFFF',
  },
});

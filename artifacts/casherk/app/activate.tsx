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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

const TEAL = '#1ABCB0';
const TEAL_DARK = '#0D9E96';
const TEAL_BG = '#0F7A74';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: 'كود التفعيل غير صحيح — تأكد من نسخه كاملاً',
  no_device_id: 'تعذّر قراءة رمز الجهاز — أعد تشغيل التطبيق',
  missing_fields: 'الرجاء إدخال كود التفعيل',
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
  const [pasted, setPasted] = useState(false);

  const displayId = deviceId ?? '...';

  async function handleCopyId() {
    if (!deviceId) return;
    await Clipboard.setStringAsync(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePasteKey() {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setCode(text.replace(/[\s\n\r]/g, ''));
      setError('');
      setPasted(true);
      setTimeout(() => setPasted(false), 1500);
    }
  }

  async function handleActivate() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError(ERROR_MESSAGES.missing_fields);
      return;
    }
    setLoading(true);
    setError('');
    const result = await onActivate(trimmed);
    setLoading(false);
    if (!result.success) {
      setError(
        ERROR_MESSAGES[result.error ?? 'unknown'] ?? ERROR_MESSAGES.unknown,
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: TEAL_BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
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

        {/* Step 1: Device ID */}
        <View style={styles.card}>
          <Text style={styles.stepNum}>١</Text>
          <Text style={styles.stepTitle}>رمز جهازك</Text>
          <Text style={styles.deviceIdText} selectable>{displayId}</Text>
          <Pressable style={styles.copyBtn} onPress={handleCopyId}>
            <Text style={styles.copyBtnText}>
              {copied ? '✓ تم النسخ' : '📋 انسخ الرمز'}
            </Text>
          </Pressable>
          <Text style={styles.hint}>
            أرسل هذا الرمز للمطوّر عبر واتساب أو رسالة
          </Text>
        </View>

        {/* Step 2: Activation key */}
        <View style={styles.card}>
          <Text style={styles.stepNum}>٢</Text>
          <Text style={styles.stepTitle}>كود التفعيل</Text>
          <Text style={styles.hint}>
            بعد إرسال رمز جهازك، ستحصل على كود طويل — الصقه هنا
          </Text>

          {/* Key input */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="الصق كود التفعيل هنا..."
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={(t) => { setCode(t); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              numberOfLines={4}
              editable={!loading}
              textAlign="left"
            />
          </View>

          {/* Paste button */}
          <Pressable style={styles.pasteBtn} onPress={handlePasteKey}>
            <Text style={styles.pasteBtnText}>
              {pasted ? '✓ تم اللصق' : '📋 لصق من الحافظة'}
            </Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleActivate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>تفعيل التطبيق</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  logoArea: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Qomra',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  appSub: {
    fontSize: 14,
    fontFamily: 'Qomra',
    color: 'rgba(255,255,255,0.7)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  stepNum: {
    fontSize: 13,
    fontFamily: 'Qomra',
    color: TEAL,
    textAlign: 'right',
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: 'Qomra',
    color: '#0D1B3E',
    textAlign: 'right',
  },
  deviceIdText: {
    fontSize: 15,
    fontFamily: 'Qomra',
    color: '#374151',
    backgroundColor: '#F4F6FA',
    borderRadius: 10,
    padding: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  copyBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  copyBtnText: {
    fontSize: 15,
    fontFamily: 'Qomra',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 13,
    fontFamily: 'Qomra',
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },
  inputRow: {
    width: '100%',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0D9EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'Qomra',
    color: '#0D1B3E',
    backgroundColor: '#F4F6FA',
    textAlignVertical: 'top',
    minHeight: 90,
    textAlign: 'left',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  pasteBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pasteBtnText: {
    fontSize: 14,
    fontFamily: 'Qomra',
    color: TEAL_DARK,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Qomra',
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
    fontFamily: 'Qomra',
    color: '#FFFFFF',
  },
});

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { useLicense } from '@/context/LicenseContext';
import {
  getHWID,
  getRequestCode,
  verifyLicense,
  saveLicense,
} from '@/utils/licenseManager';

export default function ActivateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { recheck } = useLicense();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const [requestCode, setRequestCode] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const hwid = getHWID();
    setRequestCode(getRequestCode(hwid));
  }, []);

  async function handleCopyCode() {
    if (Platform.OS !== 'web') {
      await Clipboard.setStringAsync(requestCode);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast({ message: 'تم نسخ كود الطلب', type: 'success' });
  }

  async function handleActivate() {
    const trimmed = licenseInput.trim();
    if (!trimmed) {
      showToast({ message: 'يرجى إدخال كود التفعيل', type: 'warning' });
      return;
    }
    setIsVerifying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const hwid = getHWID();
      const valid = verifyLicense(hwid, trimmed);
      if (valid) {
        await saveLicense(trimmed);
        await recheck();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast({ message: '✅ تم تفعيل التطبيق بنجاح!', type: 'success' });
        router.replace('/');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast({ message: '❌ كود التفعيل غير صحيح أو لا يطابق هذا الجهاز', type: 'error' });
      }
    } catch {
      showToast({ message: 'حدث خطأ أثناء التحقق', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ width: 38 }} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>تفعيل التطبيق</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconBlock, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>هذا التطبيق مرخّص</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          يرجى التواصل مع المطور للحصول على كود التفعيل
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="finger-print" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>كود طلب التفعيل</Text>
          </View>
          <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>
            أرسل هذا الكود إلى المطور للحصول على كود التفعيل:
          </Text>
          <TouchableOpacity
            style={[styles.codeBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={[styles.codeText, { color: colors.foreground }]}>
              {requestCode || '...'}
            </Text>
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.copyHint, { color: colors.mutedForeground }]}>
            اضغط على الكود لنسخه
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="key-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>إدخال كود التفعيل</Text>
          </View>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.input ?? colors.secondary }]}
            value={licenseInput}
            onChangeText={setLicenseInput}
            placeholder="أدخل كود التفعيل هنا..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlign="right"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.activateBtn, { backgroundColor: isVerifying ? colors.muted : colors.primary }]}
            onPress={handleActivate}
            disabled={isVerifying}
            activeOpacity={0.85}
          >
            <Ionicons name={isVerifying ? 'hourglass-outline' : 'checkmark-circle-outline'} size={20} color={colors.primaryForeground} />
            <Text style={[styles.activateBtnText, { color: colors.primaryForeground }]}>
              {isVerifying ? 'جارٍ التحقق...' : 'تفعيل'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            كود التفعيل مرتبط بهذا الجهاز فقط ولا يعمل على أجهزة أخرى
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    alignItems: 'stretch',
  },
  iconBlock: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
  },
  codeLabel: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'right',
    lineHeight: 20,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  codeText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
  },
  copyHint: {
    fontSize: 11,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  activateBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activateBtnText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'right',
    flex: 1,
    lineHeight: 22,
  },
});

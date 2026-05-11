import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppButton from '../../components/ui/AppButton';
import { updatePreferences } from '../../services/api';

export default function PreferencesScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, setProfileComplete } = useAuth();

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updatePreferences(user.uid, {
        emailNotif,
        pushNotif,
        darkMode: isDark,
        language,
      });
      setProfileComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.step, { color: theme.muted }]}>Step 4 of 4</Text>
        <Text style={[styles.title, { color: theme.text }]}>Preferences</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Customise your experience
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notifications
          </Text>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              Email Notifications
            </Text>
            <Switch
              value={emailNotif}
              onValueChange={setEmailNotif}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              Push Notifications
            </Text>
            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Display
          </Text>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Language
          </Text>
          <Text style={[styles.languageValue, { color: theme.primary }]}>
            🌐 {language}
          </Text>
          <Text style={[styles.languageNote, { color: theme.muted }]}>
            More languages coming soon
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Finish Setup ✓" onPress={handleFinish} loading={loading} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  step: { fontSize: 13, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 25 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: { fontSize: 15 },
  languageValue: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  languageNote: { fontSize: 12 },
  error: { color: 'red', marginBottom: 10, fontSize: 13 },
});
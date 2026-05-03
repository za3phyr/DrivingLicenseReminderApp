import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';

export default function LicenseDetailsScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [licenseType, setLicenseType] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuingState, setIssuingState] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    return formatted;
  };

  const handleNext = async () => {
    if (!licenseType.trim() || !issueDate.trim() || !expiryDate.trim() || !issuingState.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (issueDate.length !== 10 || expiryDate.length !== 10) {
      setError('Please enter valid dates (DD/MM/YYYY).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        license: {
          licenseType,
          issueDate,
          expiryDate,
          issuingState,
          isInternational,
        },
      }, { merge: true });
      navigation.navigate('Preferences');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.step, { color: theme.muted }]}>Step 3 of 4</Text>
        <Text style={[styles.title, { color: theme.text }]}>Driving License</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Enter your driving license details
        </Text>

        <TextInput
          placeholder="License Type (e.g. A, B, C)"
          placeholderTextColor={theme.muted}
          value={licenseType}
          onChangeText={setLicenseType}
          autoCapitalize="characters"
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Issue Date (DD/MM/YYYY)"
          placeholderTextColor={theme.muted}
          value={issueDate}
          onChangeText={(text) => setIssueDate(formatDate(text))}
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Expiry Date (DD/MM/YYYY)"
          placeholderTextColor={theme.muted}
          value={expiryDate}
          onChangeText={(text) => setExpiryDate(formatDate(text))}
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Issuing State / Country (e.g. Cyprus)"
          placeholderTextColor={theme.muted}
          value={issuingState}
          onChangeText={setIssuingState}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            International Driving License
          </Text>
          <Switch
            value={isInternational}
            onValueChange={setIsInternational}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Next →" onPress={handleNext} loading={loading} />

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
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 15,
  },
  error: { color: 'red', marginBottom: 10, fontSize: 13 },
});
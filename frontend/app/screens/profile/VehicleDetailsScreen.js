import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { addVehicle } from '../../services/api';

export default function VehicleDetailsScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [series, setSeries] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [roadTaxExpiry, setRoadTaxExpiry] = useState('');
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
    if (!model.trim() || !plate.trim() || !series.trim() || !insuranceProvider.trim() || !insuranceExpiry.trim() || !roadTaxExpiry.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (model.trim().length < 2) {
      setError('Vehicle model must be at least 2 characters long.');
      return;
    }
    if (plate.trim().length < 2 || plate.trim().length > 10) {
      setError('Plate number must be between 2 and 10 characters.');
      return;
    }
    if (series.trim().length < 5) {
      setError('Series/Chassis number must be at least 5 characters.');
      return;
    }
    if (insuranceExpiry.length !== 10) {
      setError('Please enter a valid insurance expiry date (DD/MM/YYYY).');
      return;
    }
    if (roadTaxExpiry.length !== 10) {
      setError('Please enter a valid road tax expiry date (DD/MM/YYYY).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addVehicle(user.uid, {
        model,
        plate,
        series,
        insuranceProvider,
        insuranceExpiry,
        roadTaxExpiry,
      });
      navigation.navigate('LicenseDetails');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.step, { color: theme.muted }]}>Step 2 of 4</Text>
        <Text style={[styles.title, { color: theme.text }]}>Vehicle Details</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Enter your vehicle information
        </Text>

        <TextInput
          placeholder="Vehicle Model (e.g. Toyota Corolla)"
          placeholderTextColor={theme.muted}
          value={model}
          onChangeText={setModel}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Plate Number"
          placeholderTextColor={theme.muted}
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Series / Chassis Number"
          placeholderTextColor={theme.muted}
          value={series}
          onChangeText={setSeries}
          autoCapitalize="characters"
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Insurance Provider (e.g. AXA Insurance)"
          placeholderTextColor={theme.muted}
          value={insuranceProvider}
          onChangeText={setInsuranceProvider}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Insurance Expiry (DD/MM/YYYY)"
          placeholderTextColor={theme.muted}
          value={insuranceExpiry}
          onChangeText={(text) => setInsuranceExpiry(formatDate(text))}
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Road Tax Expiry (DD/MM/YYYY)"
          placeholderTextColor={theme.muted}
          value={roadTaxExpiry}
          onChangeText={(text) => setRoadTaxExpiry(formatDate(text))}
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

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
  error: { color: 'red', marginBottom: 10, fontSize: 13 },
});
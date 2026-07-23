import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AppButton from '../../components/ui/AppButton';

export default function PersonalDetailsScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.step, { color: theme.muted }]}>Step 1 of 4</Text>
        <Text style={[styles.title, { color: theme.text }]}>Profile Picture</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Add a profile picture so we can personalise your experience
        </Text>
        <Text style={[styles.placeholder, { color: theme.muted }]}>
          📷 Photo upload coming soon
        </Text>
        <AppButton title="Next →" onPress={() => navigation.navigate('VehicleDetails')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  step: { fontSize: 13, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 25 },
  placeholder: { fontSize: 40, textAlign: 'center', marginBottom: 32 },
});
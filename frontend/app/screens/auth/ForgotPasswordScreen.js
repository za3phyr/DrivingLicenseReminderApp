import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import AppButton from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>

        <Text style={[styles.title, { color: theme.text }]}>
          Reset Password
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Enter your email and we'll send you a reset link
        </Text>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✅ Reset email sent! Check your inbox.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              }]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton title="Send Reset Email" onPress={handleReset} loading={loading} />
          </>
        )}

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.primary }]}>
            Back to Login
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 25 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  error: { color: 'red', marginBottom: 10, fontSize: 13 },
  successBox: {
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A',
    fontSize: 14,
    textAlign: 'center',
  },
  link: { marginTop: 16, textAlign: 'center', fontSize: 14 },
});
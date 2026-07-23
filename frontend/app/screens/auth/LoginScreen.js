import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import AppButton from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!emailPattern.test(identifier)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
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
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Login to continue
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.muted}
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.muted}
          secureTextEntry={secure}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <Pressable onPress={() => setSecure(!secure)}>
          <Text style={[styles.toggle, { color: theme.primary }]}>
            {secure ? 'Show password' : 'Hide password'}
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Login" onPress={handleLogin} loading={loading} />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={[styles.link, { color: theme.primary }]}>
            Forgot Password?
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: theme.primary }]}>
            Don't have an account? Register
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
  toggle: { fontSize: 13, marginBottom: 12, alignSelf: 'flex-end' },
  error: { color: 'red', marginBottom: 10, fontSize: 13 },
  link: { marginTop: 16, textAlign: 'center', fontSize: 14 },
});
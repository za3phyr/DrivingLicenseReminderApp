import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import AppButton from '../../components/ui/AppButton';
import { registerUser } from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !surname.trim() || !dob.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!name.replace(' ', '').match(/^[a-zA-Z]+$/)) {
      setError('Name must contain only letters.');
      return;
    }
    if (!surname.replace(' ', '').match(/^[a-zA-Z]+$/)) {
      setError('Surname must contain only letters.');
      return;
    }
    if (dob.length !== 10) {
      setError('Please enter a valid date of birth (DD/MM/YYYY).');
      return;
    }
    const parts = dob.split('/');
    const dobDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old to register.');
      return;
    }
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerUser(email, password, name, surname, dob);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.title, { color: theme.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Fill in your details to get started
        </Text>

        <TextInput
          placeholder="First Name"
          placeholderTextColor={theme.muted}
          value={name}
          onChangeText={setName}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Surname"
          placeholderTextColor={theme.muted}
          value={surname}
          onChangeText={setSurname}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

        <TextInput
          placeholder="Date of Birth (DD/MM/YYYY)"
          placeholderTextColor={theme.muted}
          value={dob}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 3 && cleaned.length <= 4) {
              formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
            } else if (cleaned.length > 4) {
              formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
            }
            setDob(formatted);
          }}
          keyboardType="numeric"
          maxLength={10}
          style={[styles.input, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          }]}
        />

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

        <AppButton title="Register" onPress={handleRegister} loading={loading} />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.primary }]}>
            Already have an account? Login
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
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
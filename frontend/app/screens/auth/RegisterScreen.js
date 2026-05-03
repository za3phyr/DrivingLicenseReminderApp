import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import AppButton from '../../components/ui/AppButton';
import { Colors } from '../../constants/theme';

export default function RegisterScreen({ navigation }) {
  const theme = Colors[useColorScheme() ?? 'light'];

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
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Add slashes automatically
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
  safe: {
    flex: 1,
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  toggle: {
    fontSize: 13,
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 13,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});
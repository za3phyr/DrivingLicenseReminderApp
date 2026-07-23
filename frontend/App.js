import React from 'react';
import { View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from './app/firebase';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';
import AppButton from './app/components/ui/AppButton';

// Auth Screens
import LoginScreen from './app/screens/auth/LoginScreen';
import RegisterScreen from './app/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './app/screens/auth/ForgotPasswordScreen';

// Profile Screens
import PersonalDetailsScreen from './app/screens/profile/PersonalDetailsScreen';
import VehicleDetailsScreen from './app/screens/profile/VehicleDetailsScreen';
import LicenseDetailsScreen from './app/screens/profile/LicenseDetailsScreen';
import PreferencesScreen from './app/screens/profile/PreferencesScreen';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text }}>Dashboard (Coming Soon)</Text>
        <AppButton title="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

function AppNavigator() {
  const { user, profileComplete, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {!profileComplete ? (
            <>
              <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
              <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
              <Stack.Screen name="LicenseDetails" component={LicenseDetailsScreen} />
              <Stack.Screen name="Preferences" component={PreferencesScreen} />
            </>
          ) : (
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
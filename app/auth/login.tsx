import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    console.log('Attempting to login with:', { email });
    
    if (!email || !password) {
      Alert.alert('Σφάλμα', 'Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling supabase.auth.signInWithPassword');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Σφάλμα σύνδεσης', error.message);
        return;
      }

      console.log('Login successful, redirecting to home');
      router.replace('/');
    } catch (error) {
      console.error('Exception during login:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά τη σύνδεση');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Σύνδεση',
        headerShown: true,
      }} />
      <StatusBar style="auto" />
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>Restaurant Reservations</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Κωδικός"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Σύνδεση</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Δεν έχετε λογαριασμό; </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Εγγραφή</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 
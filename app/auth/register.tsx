import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    console.log('Attempting to register with:', { name, email });
    
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Σφάλμα', 'Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Σφάλμα', 'Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Σφάλμα', 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling supabase.auth.signUp');
      
      // Εγγραφή χρήστη
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      console.log('SignUp response:', JSON.stringify(data, null, 2));

      // Έλεγχος αν ο χρήστης υπάρχει ήδη
      if (data?.user?.identities?.length === 0) {
        console.error('User already exists');
        Alert.alert('Σφάλμα εγγραφής', 'Ο χρήστης με αυτό το email υπάρχει ήδη');
        return;
      }

      if (error) {
        console.error('SignUp error:', error);
        Alert.alert('Σφάλμα εγγραφής', error.message);
        return;
      }

      if (data && data.user) {
        console.log('User created, trying to create profile for ID:', data.user.id);
        
        try {
          // Συνδεόμαστε πρώτα με τον νέο λογαριασμό
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            console.error('Error signing in after registration:', signInError);
          }
          
          // Δημιουργία προφίλ χρήστη
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name,
              email,
              created_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            console.log('Profile error details:', JSON.stringify(profileError, null, 2));
            // Συνεχίζουμε ακόμα κι αν υπάρχει σφάλμα στη δημιουργία προφίλ
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileException) {
          console.error('Exception creating profile:', profileException);
        }

        Alert.alert(
          'Επιτυχία', 
          'Επιτυχής εγγραφή! Μπορείτε να συνδεθείτε.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        console.log('No user data returned');
        Alert.alert('Σφάλμα', 'Δεν ήταν δυνατή η δημιουργία λογαριασμού');
      }
    } catch (error) {
      console.error('Exception during registration:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την εγγραφή');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Εγγραφή',
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
          placeholder="Όνομα"
          value={name}
          onChangeText={setName}
        />
        
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
        
        <TextInput
          style={styles.input}
          placeholder="Επιβεβαίωση κωδικού"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Εγγραφή</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Έχετε ήδη λογαριασμό; </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Σύνδεση</Text>
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
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
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
  registerButton: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 
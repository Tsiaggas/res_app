import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';

export default function TestDBScreen() {
  const [status, setStatus] = useState<string>('Αναμονή...');
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('Έλεγχος σύνδεσης...');
      
      // Έλεγχος αν μπορούμε να διαβάσουμε τη βάση
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        setStatus('Σφάλμα σύνδεσης');
        setResult(JSON.stringify(error, null, 2));
        return;
      }

      setStatus('Επιτυχής σύνδεση!');
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Exception:', error);
      setStatus('Σφάλμα σύνδεσης');
      setResult(JSON.stringify(error, null, 2));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Έλεγχος Βάσης Δεδομένων',
        headerShown: true,
      }} />
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Κατάσταση: {status}</Text>
        
        <ScrollView style={styles.resultContainer}>
          <Text>{result}</Text>
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={testConnection}
        >
          <Text style={styles.buttonText}>Δοκιμή ξανά</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
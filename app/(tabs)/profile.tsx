import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        Alert.alert(
          'Δεν είστε συνδεδεμένοι', 
          'Πρέπει να συνδεθείτε για να δείτε το προφίλ σας', 
          [{ text: 'Σύνδεση', onPress: () => router.push('/auth/login') }]
        );
        return;
      }
      
      fetchProfile(data.session.user.id);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Αν δεν υπάρχει προφίλ, δημιουργούμε ένα
        if (error.code === 'PGRST116') {
          createProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        setUser(data);
        setName(data.name || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(userId: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        return;
      }

      const newProfile = {
        id: userId,
        email: userData.user.email,
        name: userData.user.email?.split('@')[0] || 'Χρήστης',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .insert(newProfile);

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      // Ανανέωση προφίλ μετά τη δημιουργία
      fetchProfile(userId);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }

  async function handleUpdateProfile() {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Σφάλμα', error.message);
        return;
      }

      // Ενημέρωση τοπικού state
      setUser({ ...user, name });
      setEditing(false);
      Alert.alert('Επιτυχία', 'Το προφίλ σας ενημερώθηκε επιτυχώς');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την ενημέρωση του προφίλ');
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      
      // Άμεση αποσύνδεση χωρίς επιβεβαίωση
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την αποσύνδεση');
        return;
      }
      
      console.log('User signed out successfully');
      setUser(null);
      // Ανακατεύθυνση στην αρχική σελίδα
      router.replace('/');
    } catch (error) {
      console.error('Exception during logout:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την αποσύνδεση');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Φόρτωση...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Το Προφίλ μου', headerShown: true }} />
      <StatusBar style="auto" />
      
      {user ? (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            {editing ? (
              <View style={styles.editForm}>
                <Text style={styles.label}>Όνομα</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Εισάγετε το όνομά σας"
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setEditing(false);
                      setName(user.name || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Άκυρο</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdateProfile}
                  >
                    <Text style={styles.saveButtonText}>Αποθήκευση</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Όνομα:</Text>
                  <Text style={styles.infoValue}>{user.name || 'Δεν έχει οριστεί'}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.button, styles.editButton]}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.editButtonText}>Επεξεργασία Προφίλ</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Αποσύνδεση</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>Πρέπει να συνδεθείτε για να δείτε το προφίλ σας</Text>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Σύνδεση</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.loginButtonText}>Εγγραφή</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editForm: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    flex: 1,
    marginRight: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#9C27B0',
    width: '100%',
  },
}); 
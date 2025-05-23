import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';
import { Reservation } from '@/types';

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchReservations();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      Alert.alert(
        'Δεν είστε συνδεδεμένοι', 
        'Πρέπει να συνδεθείτε για να δείτε τις κρατήσεις σας', 
        [{ text: 'Σύνδεση', onPress: () => router.push('/auth/login') }]
      );
    }
  }

  async function fetchReservations() {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*, restaurant:restaurants(*)')
        .eq('user_id', sessionData.session.user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }

      if (data) {
        console.log('Fetched reservations:', data.length);
        setReservations(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    console.log(`Attempting to cancel reservation: ${reservationId}`);
    
    try {
      // Έλεγχος για παλιές κρατήσεις
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) {
        console.error('Reservation not found in state');
        Alert.alert('Σφάλμα', 'Η κράτηση δεν βρέθηκε');
        return;
      }
      
      const reservationDate = new Date(reservation.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log(`Reservation date: ${reservationDate}, Today: ${today}`);
      
      if (reservationDate < today) {
        Alert.alert('Δεν επιτρέπεται', 'Δεν μπορείτε να ακυρώσετε παλιές κρατήσεις');
        return;
      }
      
      // Άμεση διαγραφή χωρίς διάλογο επιβεβαίωσης για να αποφύγουμε πιθανά προβλήματα
      setLoading(true);
      console.log('Deleting reservation from database...');
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);
        
      if (error) {
        console.error('Error deleting reservation:', error);
        Alert.alert('Σφάλμα', error.message);
        setLoading(false);
        return;
      }
      
      console.log('Reservation deleted successfully');
      // Ανανέωση λίστας κρατήσεων
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      setLoading(false);
      Alert.alert('Επιτυχία', 'Η κράτηση ακυρώθηκε επιτυχώς');
      
    } catch (error) {
      console.error('Error canceling reservation:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την ακύρωση της κράτησης');
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('el-GR');
  };

  const isOldReservation = (dateStr: string) => {
    const reservationDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservationDate < today;
  };

  const renderItem = ({ item }: { item: Reservation }) => (
    <View style={[
      styles.reservationCard, 
      isOldReservation(item.date) ? styles.oldReservation : null
    ]}>
      <View style={styles.reservationInfo}>
        <Text style={styles.restaurantName}>{item.restaurant?.name}</Text>
        <Text style={styles.reservationDate}>Ημερομηνία: {formatDate(item.date)}</Text>
        <Text style={styles.reservationTime}>Ώρα: {item.time}</Text>
        <Text style={styles.peopleCount}>Άτομα: {item.people_count}</Text>
      </View>
      
      {!isOldReservation(item.date) && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(item.id)}
        >
          <Text style={styles.cancelButtonText}>Ακύρωση</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Οι Κρατήσεις μου', headerShown: true }} />
      <StatusBar style="auto" />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Δεν έχετε καμία κράτηση</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.emptyButtonText}>Βρείτε εστιατόρια</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  reservationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  oldReservation: {
    opacity: 0.6,
  },
  reservationInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reservationDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  reservationTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  peopleCount: {
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    padding: 8,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 
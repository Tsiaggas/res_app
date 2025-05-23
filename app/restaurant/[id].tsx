import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';
import { Restaurant, Reservation } from '@/types';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [peopleCount, setPeopleCount] = useState('2');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Προσθήκη μεταβλητών για τα HTML inputs
  const [dateString, setDateString] = useState(new Date().toISOString().split('T')[0]);
  const [timeString, setTimeString] = useState('12:00');
  
  // Καθορισμός αν βρισκόμαστε σε web περιβάλλον
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (id) {
      fetchRestaurant(id as string);
    }
  }, [id]);

  async function fetchRestaurant(restaurantId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  // Χειρισμός αλλαγών για τα HTML inputs
  const handleWebDateChange = (event: any) => {
    const newDate = new Date(event.target.value);
    setDateString(event.target.value);
    setDate(newDate);
  };
  
  const handleWebTimeChange = (event: any) => {
    const timeArr = event.target.value.split(':');
    const newTime = new Date();
    newTime.setHours(parseInt(timeArr[0], 10), parseInt(timeArr[1], 10), 0);
    
    setTimeString(event.target.value);
    setTime(newTime);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('el-GR');
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        Alert.alert('Σφάλμα', 'Πρέπει να συνδεθείτε για να κάνετε κράτηση');
        router.push('/auth/login');
        return;
      }
      
      const newReservation = {
        user_id: session.session.user.id,
        restaurant_id: id,
        date: isWeb ? dateString : date.toISOString().split('T')[0],
        time: isWeb ? timeString : formatTime(time),
        people_count: parseInt(peopleCount),
      };
      
      const { error } = await supabase
        .from('reservations')
        .insert(newReservation);
        
      if (error) {
        Alert.alert('Σφάλμα', error.message);
        return;
      }
      
      Alert.alert('Επιτυχία', 'Η κράτησή σας καταχωρήθηκε επιτυχώς');
      router.push('/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά κατά την κράτηση');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Φόρτωση...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text>Το εστιατόριο δεν βρέθηκε</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: restaurant.name,
        headerShown: true,
      }} />
      <StatusBar style="auto" />
      
      <ScrollView>
        <Image
          source={{ uri: restaurant.image_url || 'https://via.placeholder.com/400x200' }}
          style={styles.restaurantImage}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantLocation}>{restaurant.location}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
        </View>
        
        <View style={styles.reservationContainer}>
          <Text style={styles.reservationTitle}>Κάντε κράτηση</Text>
          
          {isWeb ? (
            // Web περιβάλλον - χρήση native HTML inputs
            <>
              <View style={styles.datePickerContainer}>
                <Text style={styles.pickerLabel}>Ημερομηνία:</Text>
                <input 
                  type="date"
                  value={dateString}
                  onChange={handleWebDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.webInput}
                />
              </View>
              
              <View style={styles.datePickerContainer}>
                <Text style={styles.pickerLabel}>Ώρα:</Text>
                <input 
                  type="time"
                  value={timeString}
                  onChange={handleWebTimeChange}
                  style={styles.webInput}
                />
              </View>
            </>
          ) : (
            // Native περιβάλλον - χρήση DateTimePicker
            <>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text>Ημερομηνία: {formatDate(date)}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <Text>Ώρα: {formatTime(time)}</Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  is24Hour={true}
                />
              )}
            </>
          )}
          
          <View style={styles.peopleCountContainer}>
            <Text>Αριθμός ατόμων:</Text>
            <TextInput
              style={styles.peopleCountInput}
              value={peopleCount}
              onChangeText={setPeopleCount}
              keyboardType="number-pad"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Ολοκλήρωση Κράτησης</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  restaurantDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  reservationContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    margin: 10,
    borderRadius: 8,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  webInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
  },
  peopleCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  peopleCountInput: {
    marginLeft: 10,
    padding: 8,
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 
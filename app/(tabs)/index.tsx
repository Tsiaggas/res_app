import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5C5A0', dark: '#3A2E28' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          <IconSymbol 
            name="fork.knife.circle.fill" 
            size={120} 
            color="#F8D8B9" 
            style={styles.headerIcon} 
          />
        </View>
      }>
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="title">Καλωσήρθατε!</ThemedText>
        <ThemedText style={styles.subtitle}>
          Ανακαλύψτε τα καλύτερα εστιατόρια και κάντε κράτηση με ένα κλικ
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featuredSection}>
        <ThemedText type="subtitle">Προτεινόμενα εστιατόρια</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <ThemedView style={styles.restaurantCard}>
            <View style={styles.restaurantImagePlaceholder}>
              <IconSymbol name="fish" size={40} color="#F5C5A0" />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.restaurantName}>Θαλασσινό</ThemedText>
            <ThemedText style={styles.restaurantInfo}>Θαλασσινά • ⭐ 4.8</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.restaurantCard}>
            <View style={styles.restaurantImagePlaceholder}>
              <IconSymbol name="fork.knife" size={40} color="#F5C5A0" />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.restaurantName}>Ιταλικό</ThemedText>
            <ThemedText style={styles.restaurantInfo}>Ιταλική κουζίνα • ⭐ 4.6</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.restaurantCard}>
            <View style={styles.restaurantImagePlaceholder}>
              <IconSymbol name="bag" size={40} color="#F5C5A0" />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.restaurantName}>Ελληνικό</ThemedText>
            <ThemedText style={styles.restaurantInfo}>Παραδοσιακό • ⭐ 4.9</ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.quickActions}>
        <ThemedText type="subtitle">Γρήγορες Ενέργειες</ThemedText>
        <ThemedView style={styles.actionsContainer}>
          <Pressable onPress={() => router.push('/restaurants')} style={styles.actionButton}>
            <ThemedView style={styles.actionIconContainer}>
              <IconSymbol name="fork.knife" size={24} color="#F5C5A0" />
            </ThemedView>
            <ThemedText>Όλα τα εστιατόρια</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.push('/reservations')} style={styles.actionButton}>
            <ThemedView style={styles.actionIconContainer}>
              <IconSymbol name="calendar" size={24} color="#F5C5A0" />
            </ThemedView>
            <ThemedText>Οι κρατήσεις μου</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.infoSection}>
        <ThemedText type="subtitle">Σχετικά με την εφαρμογή</ThemedText>
        <ThemedText>
          Η εφαρμογή μας προσφέρει μια απλή και γρήγορη λύση για κρατήσεις σε εστιατόρια. 
          Επιλέξτε το αγαπημένο σας εστιατόριο, την ημερομηνία και ώρα, και είστε έτοιμοι!
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: 220,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    position: 'absolute',
    bottom: 40,
  },
  welcomeContainer: {
    gap: 8,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  featuredSection: {
    marginBottom: 20,
    gap: 12,
  },
  horizontalScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  restaurantCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restaurantImagePlaceholder: {
    width: 180,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 197, 160, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    marginTop: 8,
    fontSize: 16,
  },
  restaurantInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  quickActions: {
    marginBottom: 20,
    gap: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '48%',
    padding: 12,
    backgroundColor: 'rgba(245, 197, 160, 0.1)',
    borderRadius: 12,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#423127',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    gap: 8,
    marginBottom: 20,
  },
});

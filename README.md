Εφαρμογή Κράτησης Εστιατορίων

CN6035 - Mobile & Distributed Systems  
Θέμα: Ανάπτυξη Mobile εφαρμογής για κρατήσεις σε εστιατόρια

Μια εφαρμογή για κινητά που επιτρέπει στους χρήστες να κάνουν κρατήσεις σε εστιατόρια. Περιλαμβάνει εγγραφή/σύνδεση χρηστών, αναζήτηση εστιατορίων και διαχείριση κρατήσεων.

## ΕΠΙΛΟΓΗ 1: Γρήγορη εγκατάσταση (μόνο το APK)

Αν θέλετε απλά να δοκιμάσετε την εφαρμογή:

1. Πηγαίνετε στο: https://expo.dev/accounts/theodotsis19/projects/res_app/builds
2. Κάντε κλικ στο πιο πρόσφατο Android build (Status: finished)
3. Κατεβάστε το APK από το "Artifact" link
4. Επιτρέψτε την εγκατάσταση από άγνωστες πηγές στο Android
5. Εγκαταστήστε το APK
6. Συνδεθείτε με: user@gmail.com / 123456

Εναλλακτικά, δοκιμάστε αυτό το direct link (αν λειτουργεί): https://expo.dev/artifacts/eas/8NyhW1NGMNv9BqjNu6sgDo.apk

## ΕΠΙΛΟΓΗ 2: Πλήρης εγκατάσταση για development

Αν θέλετε να δείτε τον κώδικα και να τρέξετε την εφαρμογή από την αρχή:

Τι χρειάζεστε:
- Node.js (version 14+)
- npm ή yarn  
- Expo CLI (npm install -g expo-cli)
- Git

### 1. Frontend (React Native)

Κατεβάστε τον κώδικα:
```bash
git clone https://github.com/Tsiaggas/reserve_app
cd reserve_app
```

Εγκαταστήστε τα packages:
```bash
npm install
```

Ξεκινήστε την εφαρμογή:
```bash
npx expo start
```

### 2. Backend (Node.js/Express)

Πηγαίνετε στον φάκελο backend:
```bash
cd backend
```

Εγκαταστήστε τα dependencies:
```bash
npm install
```

Τρέξτε τον server:
```bash
npm run dev
```

### 3. Βάση δεδομένων

Το project χρησιμοποιεί Supabase. Αν θέλετε να το τρέξετε με τη δική σας βάση:
1. Δημιουργήστε λογαριασμό στο Supabase ή στην βάση PostgreSQL της αρεσκείας σας
2. Τρέξτε το schema.sql που υπάρχει στον φάκελο supabase/
3. Ενημερώστε τα environment variables

SQL Schema

```sql
-- Πίνακας χρηστών
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Πίνακας εστιατορίων
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Πίνακας κρατήσεων
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  people_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes για ταχύτητα
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_restaurant_name ON restaurants(name);
CREATE INDEX idx_restaurant_location ON restaurants(location);
```

Λογαριασμός για δοκιμή:
- Email: user@gmail.com
- Password: 123456

Ο λογαριασμός δημιουργείται αυτόματα όταν τρέξετε το schema.sql

---

Τι κάνει η εφαρμογή

Αρχιτεκτονική

Η εφαρμογή χτίστηκε με 3 κομμάτια:

1. Frontend (το app στο κινητό)
- React Native με Expo για Android και iOS
- React Navigation για την πλοήγηση
- Hooks για τη διαχείριση των δεδομένων

2. Backend (ο server)  
- Node.js με Express για το API
- JWT για ασφαλή σύνδεση χρηστών
- Middleware για έλεγχο δικαιωμάτων

3. Βάση δεδομένων
- PostgreSQL μέσω Supabase
- Κανόνες ασφαλείας σε επίπεδο γραμμών
- Indexes για γρήγορες αναζητήσεις

Λειτουργίες

Χρήστες:
- Εγγραφή και σύνδεση με email/password
- Προβολή και επεξεργασία προφίλ
- Ασφαλής αποθήκευση κωδικών

Εστιατόρια:
- Προβολή λίστας εστιατορίων
- Αναζήτηση με όνομα ή τοποθεσία
- Λεπτομέρειες για κάθε εστιατόριο

Κρατήσεις:
- Νέα κράτηση με ημερομηνία, ώρα, άτομα
- Προβολή του ιστορικού κρατήσεων
- Ακύρωση κρατήσεων

API Routes

Χρήστες:
- POST /api/auth/register - Εγγραφή
- POST /api/auth/login - Σύνδεση  
- GET /api/users/profile - Προφίλ χρήστη

Εστιατόρια:
- GET /api/restaurants - Λίστα εστιατορίων
- GET /api/restaurants/:id - Λεπτομέρειες εστιατορίου

Κρατήσεις:
- POST /api/reservations - Νέα κράτηση
- GET /api/reservations - Οι κρατήσεις μου
- DELETE /api/reservations/:id - Ακύρωση

Σχήμα Βάσης

Πίνακας profiles:
- id, name, email, created_at

Πίνακας restaurants:  
- id, name, location, description, image_url, created_at

Πίνακας reservations:
- id, user_id, restaurant_id, date, time, people_count, created_at

Τεχνολογίες που χρησιμοποιήθηκαν

Frontend: React Native, Expo, TypeScript, React Navigation
Backend: Node.js, Express, JWT, Supabase
Database: PostgreSQL (μέσω Supabase)
Mobile: Expo EAS για Android builds

Deployment

Mobile App: Χτίστηκε με Expo EAS για Android συσκευές
Database: Hosted στο Supabase
Backend: Τοπικά για development (δεν είναι deployed)

Σημείωση: Το backend τρέχει τοπικά για την παρουσίαση

Επιπλέον χαρακτηριστικά

- TypeScript για καλύτερη ποιότητα κώδικα
- Responsive design για όλα τα μεγέθη οθόνης  
- Επαναχρησιμοποιήσιμα components
- Διαχείριση σφαλμάτων
- Ασφαλής διαχείριση environment variables

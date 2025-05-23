-- Δημιουργία πίνακα προφίλ χρηστών
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Δημιουργία πίνακα εστιατορίων
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Δημιουργία πίνακα κρατήσεων
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  people_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Δημιουργία δεικτών για γρήγορη αναζήτηση
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_restaurant_name ON restaurants(name);
CREATE INDEX idx_restaurant_location ON restaurants(location);

-- Δημιουργία παραδειγμάτων εστιατορίων
INSERT INTO restaurants (name, location, description, image_url) VALUES 
('Ελληνικό Παραδοσιακό', 'Αθήνα, Πλάκα', 'Παραδοσιακή ελληνική κουζίνα σε ένα γραφικό περιβάλλον', 'https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=600'),
('Ιταλικό Τρατορία', 'Θεσσαλονίκη, Κέντρο', 'Αυθεντική ιταλική κουζίνα με χειροποίητα ζυμαρικά', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'),
('Θαλασσινά & Ψάρια', 'Πειραιάς, Μικρολίμανο', 'Φρέσκα ψάρια και θαλασσινά με θέα τη θάλασσα', 'https://images.unsplash.com/photo-1579631542720-3a87824835cd?w=600'),
('Steakhouse', 'Αθήνα, Κολωνάκι', 'Εκλεκτές κοπές κρεάτων σε ένα μοντέρνο περιβάλλον', 'https://images.unsplash.com/photo-1558030006-450675393462?w=600'),
('Sushi Bar', 'Αθήνα, Γλυφάδα', 'Αυθεντική ιαπωνική κουζίνα και φρέσκο sushi', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600');

-- Ρυθμίσεις ασφαλείας για Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Πολιτικές ασφαλείας για profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Πολιτικές ασφαλείας για κρατήσεις
CREATE POLICY "Users can view their own reservations" 
  ON reservations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reservations" 
  ON reservations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
  ON reservations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" 
  ON reservations FOR DELETE 
  USING (auth.uid() = user_id); 

  -- 1. Δημιουργία χρήστη στον πίνακα auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  uuid_generate_v4(), -- δημιουργία νέου UUID
  'test@example.com', -- email χρήστη
  crypt('password123', gen_salt('bf')), -- κρυπτογραφημένος κωδικός
  now(), -- επιβεβαίωση email
  now(), -- ημερομηνία δημιουργίας
  now(), -- ημερομηνία ενημέρωσης
  '{"provider":"email","providers":["email"]}', -- app metadata
  '{"name":"Δοκιμαστικός Χρήστης"}' -- user metadata
)
RETURNING id;

 
INSERT INTO profiles (id, name, email, created_at)
VALUES (
  '0e2f0ec1-e93a-40db-b03b-f03a6723c45b',  
  'Δοκιμαστικός Χρήστης',
  'test@example.com',
  now()
);

-- Δημιουργία δοκιμαστικού χρήστη για τον καθηγητή
-- Username: user@gmail.com, Password: 123456
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '12345678-1234-1234-1234-123456789012', -- συγκεκριμένο UUID για τον test χρήστη
  'user@gmail.com', -- email χρήστη για δοκιμή
  crypt('123456', gen_salt('bf')), -- κρυπτογραφημένος κωδικός 123456
  now(), -- επιβεβαίωση email
  now(), -- ημερομηνία δημιουργίας
  now(), -- ημερομηνία ενημέρωσης
  '{"provider":"email","providers":["email"]}', -- app metadata
  '{"name":"Δοκιμαστικός Χρήστης Καθηγητή"}' -- user metadata
)
ON CONFLICT (email) DO NOTHING;

-- Δημιουργία προφίλ για τον δοκιμαστικό χρήστη
INSERT INTO profiles (id, name, email, created_at)
VALUES (
  '12345678-1234-1234-1234-123456789012',  
  'Δοκιμαστικός Χρήστης Καθηγητή',
  'user@gmail.com',
  now()
)
ON CONFLICT (id) DO NOTHING;
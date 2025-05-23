const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Φόρτωση μεταβλητών περιβάλλοντος
dotenv.config();

// Δημιουργία Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Σύνδεση με το Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware για έλεγχο authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Ενδεικτικό route για εστιατόρια
app.get('/api/restaurants', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route για κρατήσεις χρήστη
app.get('/api/user/reservations', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, restaurant:restaurants(*)')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route για δημιουργία κράτησης
app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const { restaurant_id, date, time, people_count } = req.body;
    
    const newReservation = {
      user_id: req.user.id,
      restaurant_id,
      date,
      time,
      people_count,
    };
    
    const { data, error } = await supabase
      .from('reservations')
      .insert(newReservation)
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route για ακύρωση κράτησης
app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Έλεγχος ότι η κράτηση ανήκει στον χρήστη
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Δεν έχετε άδεια να ακυρώσετε αυτή την κράτηση' });
    }
    
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
      
    if (deleteError) throw deleteError;
    
    res.status(200).json({ message: 'Η κράτηση ακυρώθηκε επιτυχώς' });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Εκκίνηση server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
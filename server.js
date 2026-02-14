const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const path = require('path');

// Connect to Database
const db = new sqlite3.Database('./pharma.db');

app.use(express.static('public'));
app.use(express.json());

// --- IMPROVED API 1: Smart Search ---
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    
    // This SQL query searches the Name, Usage, OR Symptoms columns
    const sql = `SELECT * FROM medicines 
                 WHERE name LIKE ? 
                 OR usage LIKE ? 
                 OR symptoms_treated LIKE ?`;
                 
    const searchParam = `%${query}%`;
    
    db.all(sql, [searchParam, searchParam, searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- IMPROVED API 2: AI Chatbot ---
app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    
    db.all("SELECT * FROM medicines", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Smarter Matching Logic:
        // Check if any symptom keyword from the database exists in the user's message
        let recommendations = rows.filter(med => {
            const symptomsList = med.symptoms_treated.split(', ');
            return symptomsList.some(symptom => userMessage.includes(symptom));
        });

        if (recommendations.length > 0) {
            // Pick the first match (or you could return multiple)
            const med = recommendations[0]; 
            res.json({ 
                reply: `Based on your symptoms, I recommend **${med.name}**. <br>It treats: ${med.usage}. <br>(Dosage: ${med.dosage})` 
            });
        } else {
            // Default response if no keyword matches
            res.json({ 
                reply: "I'm not sure. Please consult a doctor. <br>Try describing your symptom simply, like 'headache', 'fever', or 'stomach pain'." 
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Pharma Quest Server running on http://localhost:3000');
});
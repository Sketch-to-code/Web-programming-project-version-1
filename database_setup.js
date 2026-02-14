const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pharma.db');

db.serialize(() => {
  // 1. Create Table (same as before)
  db.run(`CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    dosage TEXT,
    expiry_months INTEGER,
    min_age INTEGER,
    usage TEXT,
    symptoms_treated TEXT
  )`);

  // 2. Clear old data to prevent duplicates
  db.run("DELETE FROM medicines");

  // 3. Insert Expanded Data (25+ Medicines)
  const stmt = db.prepare("INSERT INTO medicines (name, dosage, expiry_months, min_age, usage, symptoms_treated) VALUES (?,?,?,?,?,?)");
  
  // Pain & Fever
  stmt.run("Paracetamol", "500mg every 6 hours", 24, 6, "Reduces fever and mild pain", "fever, headache, body pain, temperature");
  stmt.run("Ibuprofen", "400mg after food", 24, 12, "Anti-inflammatory and pain relief", "swelling, joint pain, toothache, muscle pain");
  stmt.run("Aspirin", "75mg once a day", 24, 18, "Blood thinner and pain relief", "chest pain, heart health, headache");
  
  // Cough, Cold & Allergies
  stmt.run("Dextromethorphan", "10ml every 8 hours", 18, 12, "Cough suppressant syrup", "dry cough, throat irritation, hacking cough");
  stmt.run("Cetirizine", "10mg once a day", 36, 6, "Relieves allergy symptoms", "allergy, sneezing, runny nose, watery eyes, itching");
  stmt.run("Benadryl", "5ml every 6 hours", 24, 12, "Antihistamine for allergies/cold", "cold, cough, allergy, sneezing");
  stmt.run("Salbutamol", "2 puffs as needed", 18, 4, "Bronchodilator for asthma", "asthma, breathing difficulty, wheezing, bronchitis, breathlessness");
  
  // Antibiotics (Prescription)
  stmt.run("Amoxicillin", "500mg every 8 hours", 12, 10, "Antibiotic for bacterial infections", "bacterial infection, throat infection, ear infection");
  stmt.run("Azithromycin", "500mg once daily (3 days)", 24, 12, "Strong antibiotic for respiratory issues", "respiratory infection, bronchitis, pneumonia, throat pain");
  
  // Stomach & Digestion
  stmt.run("Omeprazole", "20mg before breakfast", 24, 18, "Reduces stomach acid", "acidity, heartburn, stomach pain, acid reflux, gastritis");
  stmt.run("Pantoprazole", "40mg on empty stomach", 36, 18, "Treats GERD and acid reflux", "gerd, acidity, burning sensation, stomach ulcer");
  stmt.run("Domperidone", "10mg before food", 24, 12, "Anti-nausea and vomiting", "nausea, vomiting, motion sickness, upset stomach");
  stmt.run("Loperamide", "2mg after loose stool", 36, 12, "Anti-diarrheal medication", "diarrhea, loose motion, stomach upset");
  
  // Vitamins & Supplements
  stmt.run("Vitamin C (Ascorbic Acid)", "500mg daily", 24, 4, "Immunity booster", "scurvy, immunity, weak gum, cold prevention");
  stmt.run("Calcium + Vitamin D3", "1 tablet daily after meal", 36, 12, "Bone health supplement", "bone pain, weak bones, calcium deficiency");
  stmt.run("B-Complex", "1 capsule daily", 24, 10, "Energy and nerve health", "mouth ulcer, weakness, fatigue, nerve pain");
  
  // Skin & Topical
  stmt.run("Betadine Ointment", "Apply twice daily", 24, 2, "Antiseptic for wounds", "cuts, wounds, burns, infection prevention");
  stmt.run("Volini Spray", "Spray on affected area", 36, 12, "Pain relief spray", "back pain, sprain, muscle catch, joint pain");
  stmt.run("Calamine Lotion", "Apply gently on skin", 36, 2, "Soothing lotion for skin irritation", "itching, rash, chickenpox, insect bite");

  // Chronic Conditions
  stmt.run("Metformin", "500mg with meals", 24, 18, "Type 2 Diabetes management", "diabetes, high blood sugar");
  stmt.run("Amlodipine", "5mg once daily", 36, 18, "High blood pressure control", "hypertension, high bp, blood pressure");
  stmt.run("Atorvastatin", "10mg at night", 24, 18, "Cholesterol lowering", "high cholesterol, heart risk");

  stmt.finalize();
  console.log("Database updated with 22+ medicines!");
});

db.close();
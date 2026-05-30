const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs');
const distPath = path.resolve(__dirname, '../frontend/dist');
const rawPath = path.resolve(__dirname, '../frontend');
app.use(express.static(fs.existsSync(distPath) ? distPath : rawPath));

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash) return false;
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(passwordHash, 'hex'), Buffer.from(hash, 'hex'));
}

app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !email || !password) {
        return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const hashedPassword = hashPassword(password);
    db.run('INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, hashedPassword],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, firstName, lastName, email, phone });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row || !verifyPassword(password, row.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({ id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone });
    });
});

app.put('/api/profile/:id', (req, res) => {
    const { firstName, lastName, email, phone } = req.body;
    const stmt = db.prepare('UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?');
    stmt.run([firstName, lastName, email, phone, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/appointments', (req, res) => {
    const { userId, docName, date, time } = req.body;
    const stmt = db.prepare('INSERT INTO appointments (userId, docName, date, time) VALUES (?, ?, ?, ?)');
    stmt.run([userId, docName, date, time], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, docName, date, time });
    });
});

app.get('/api/appointments/:userId', (req, res) => {
    db.all('SELECT * FROM appointments WHERE userId = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/all-appointments', (req, res) => {
    db.all('SELECT * FROM appointments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/doctors', (req, res) => {
    const doctors = [
        { 
            name: 'Dr. Naresh Trehan', 
            specialty: 'Cardiology', 
            exp: 40, 
            rating: 5.0, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
            days: ['Monday', 'Wednesday', 'Friday'],
            slots: ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
            education: 'MBBS (K.G.M.C), MD (Cardiology) - NYU Medical Center, USA',
            hospital: 'Medanta - The Medicity, Gurugram',
            about: 'Pioneer of cardiothoracic surgery in India. Performed over 48,000 successful open-heart surgeries.'
        },
        { 
            name: 'Dr. Sandeep Vaishya', 
            specialty: 'Neurology', 
            exp: 25, 
            rating: 4.9, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
            days: ['Tuesday', 'Thursday'],
            slots: ['10:00 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
            education: 'MBBS, MS, M.Ch (Neurosurgery) - AIIMS, Delhi',
            hospital: 'Fortis Memorial Research Institute, Gurugram',
            about: 'Renowned neurosurgeon specializing in Gamma Knife surgery and minimally invasive brain tumor procedures.'
        },
        { 
            name: 'Dr. Priya Bansal', 
            specialty: 'Pediatrics', 
            exp: 14, 
            rating: 4.7, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM', '05:30 PM'],
            education: 'MBBS, MD (Pediatrics) - Maulana Azad Medical College, Delhi',
            hospital: 'Max Super Speciality Hospital, Delhi',
            about: 'Expert in pediatric intensive care and neonatal developmental assessments with 14+ years of compassionate care.'
        },
        { 
            name: 'Dr. Sunita Deshmukh', 
            specialty: 'Dermatology', 
            exp: 12, 
            rating: 4.8, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
            days: ['Wednesday', 'Thursday', 'Saturday'],
            slots: ['11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
            education: 'MBBS, MD (Dermatology) - Grant Medical College, Mumbai',
            hospital: 'Apollo Hospitals, Mumbai',
            about: 'Specializes in clinical dermatology, advanced laser therapies, and anti-aging treatments.'
        },
        { 
            name: 'Dr. Devi Shetty', 
            specialty: 'Cardiology', 
            exp: 34, 
            rating: 4.9, 
            online: false, 
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
            days: ['Monday', 'Thursday'],
            slots: ['08:30 AM', '10:00 AM', '12:00 PM', '04:00 PM'],
            education: 'MBBS, FRCS (England) - Guy\'s Hospital, London',
            hospital: 'Narayana Health, Bengaluru',
            about: 'Awarded Padma Bhushan. Pioneer of low-cost, high-quality cardiac procedures in India.'
        },
        { 
            name: 'Dr. Abhinav Gupta', 
            specialty: 'Orthopedics', 
            exp: 15, 
            rating: 4.6, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
            days: ['Tuesday', 'Friday'],
            slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'],
            education: 'MBBS, MS (Orthopedics) - KGMU, Fellowship in Joint Replacement (Germany)',
            hospital: 'Max Super Speciality Hospital, Delhi',
            about: 'Expert in robotic knee/hip replacements, complex trauma surgeries, and sports injury recovery.'
        },
        { 
            name: 'Dr. Arvinder Singh Soin', 
            specialty: 'Gastroenterology', 
            exp: 32, 
            rating: 4.9, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
            days: ['Wednesday', 'Thursday', 'Friday'],
            slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
            education: 'MBBS, MS (AIIMS), FRCS (Edinburgh), FRCS (Glasgow)',
            hospital: 'Medanta - The Medicity, Gurugram',
            about: 'Pioneered liver transplantation in India. Led over 3,500 liver transplant operations.'
        },
        { 
            name: 'Dr. Surbhi Anand', 
            specialty: 'Dentistry', 
            exp: 11, 
            rating: 4.7, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
            days: ['Monday', 'Tuesday', 'Wednesday'],
            slots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:30 PM'],
            education: 'BDS, MDS (Orthodontics) - King George\'s Medical University',
            hospital: 'Dental Essence, New Delhi',
            about: 'Specialist in dental implants, aesthetic smile design, and complex orthodontic treatments.'
        },
        { 
            name: 'Dr. Vikram Mathews', 
            specialty: 'Hematology', 
            exp: 20, 
            rating: 4.8, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
            days: ['Monday', 'Thursday'],
            slots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM'],
            education: 'MBBS, MD (Medicine), DM (Clinical Hematology) - CMC Vellore',
            hospital: 'Christian Medical College, Vellore',
            about: 'Pioneering researcher and clinician in acute leukemia therapies and bone marrow transplantation.'
        },
        { 
            name: 'Dr. Mohamed Rela', 
            specialty: 'Gastroenterology', 
            exp: 28, 
            rating: 5.0, 
            online: true, 
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
            days: ['Tuesday', 'Friday'],
            slots: ['11:00 AM', '12:30 PM', '03:00 PM', '04:30 PM'],
            education: 'MBBS, MS, FRCS (London) - King\'s College Hospital',
            hospital: 'Dr. Rela Institute & Medical Centre, Chennai',
            about: 'Guinness World Record holder for performing liver transplant on a 5-day-old infant.'
        }
    ];
    res.json(doctors);
});

app.get('/api/hospitals', (req, res) => {
    const hospitals = [
        { name: 'AIIMS - Delhi', lat: 28.5672, lng: 77.2100, beds: 124, waitTime: '45 mins', phone: '+91-11-26588500', emergency: true },
        { name: 'Indraprastha Apollo Hospital', lat: 28.5359, lng: 77.2872, beds: 42, waitTime: '15 mins', phone: '+91-11-26925858', emergency: true },
        { name: 'Fortis Memorial Research Institute', lat: 28.4489, lng: 77.0725, beds: 18, waitTime: '10 mins', phone: '+91-124-4962200', emergency: true },
        { name: 'Max Super Speciality Hospital Saket', lat: 28.5284, lng: 77.2114, beds: 67, waitTime: '30 mins', phone: '+91-11-26515050', emergency: false },
        { name: 'Medanta - The Medicity', lat: 28.4358, lng: 77.0401, beds: 153, waitTime: '20 mins', phone: '+91-124-4141414', emergency: true },
        { name: 'Sir Ganga Ram Hospital', lat: 28.6385, lng: 77.1895, beds: 29, waitTime: '5 mins', phone: '+91-11-25750000', emergency: false }
    ];
    res.json(hospitals);
});

app.post('/api/predict-disease', (req, res) => {
    const { symptoms, age, systolic, diastolic, sugar } = req.body;
    
    const ageNum = parseInt(age) || 30;
    const sysNum = parseInt(systolic) || 120;
    const diaNum = parseInt(diastolic) || 80;
    const sugNum = parseInt(sugar) || 90;
    const symsLower = (symptoms || '').toLowerCase();
    
    let disease = "General Health Clearance";
    let confidence = 95;
    let riskLevel = "Low";
    let analysis = "All evaluated biomarkers (Systolic/Diastolic blood pressure, glucose levels) fall within optimal clinical limits. No distinct pathological patterns were detected from the reported symptoms list.";
    let recommendations = [
        "Maintain current healthy dietary habits with high fiber and low sodium.",
        "Ensure at least 150 minutes of moderate aerobic exercise weekly.",
        "Schedule standard annual diagnostic health checks."
    ];
    let recommendedSpecialist = "Dr. Priya Bansal";
    
    if (sugNum >= 126 || (sugNum >= 100 && (symsLower.includes('urination') || symsLower.includes('thirst') || symsLower.includes('fatigue')))) {
        if (sugNum >= 140) {
            disease = "Type 2 Diabetes Mellitus (Hyperglycemia)";
            confidence = Math.min(85 + Math.floor((sugNum - 140) / 4), 98);
            riskLevel = sugNum >= 200 ? "Critical" : "High";
            analysis = `Patient displays persistent elevated blood glucose levels (${sugNum} mg/dL) combined with signature diabetic markers (e.g. fatigue, excessive thirst, polyuria). Age ${ageNum} presents a classic high risk profile for metabolic resistance.`;
            recommendations = [
                "Consult an endocrinologist for a comprehensive HbA1c screening.",
                "Limit glycemic index carbs and refine insulin sensitivity with structured training.",
                "Closely monitor daily blood glucose levels using home telemetry."
            ];
            recommendedSpecialist = "Dr. Priya Bansal";
        } else {
            disease = "Impaired Fasting Glucose (Prediabetes)";
            confidence = 78;
            riskLevel = "Moderate";
            analysis = `Mild glucose intolerance observed (${sugNum} mg/dL). Baseline is elevated but hasn't fully crossed the threshold for clinical diabetes. Reported symptoms indicate early stage metabolic strain.`;
            recommendations = [
                "Adopt strict low glycemic diets and reduce refined sugar intake.",
                "Engage in daily brisk walking or resistance exercise to improve insulin uptake.",
                "Re-evaluate fasting blood glucose in 3 months."
            ];
            recommendedSpecialist = "Dr. Priya Bansal";
        }
    }
    else if (sysNum >= 140 || diaNum >= 90 || (sysNum >= 130 && symsLower.includes('headache') && symsLower.includes('dizzy'))) {
        if (sysNum >= 160 || diaNum >= 100) {
            disease = "Stage 2 Hypertension (Hypertensive Urgency)";
            confidence = Math.min(90 + Math.floor((sysNum - 160) / 3), 98);
            riskLevel = sysNum >= 180 || diaNum >= 120 ? "Critical" : "High";
            analysis = `Severely elevated arterial blood pressure recorded (${sysNum}/${diaNum} mmHg). Reported clinical headaches or dizziness present elevated cardiovascular risk. Prompt medical attention is highly recommended.`;
            recommendations = [
                "Seek immediate clinical evaluation by a cardiologist.",
                "Strictly eliminate sodium (salt) and begin physician-prescribed antihypertensive therapy.",
                "Establish a quiet environment, rest, and log blood pressure every 2 hours."
            ];
            recommendedSpecialist = "Dr. Naresh Trehan";
        } else {
            disease = "Stage 1 Hypertension (Borderline)";
            confidence = 82;
            riskLevel = "Moderate";
            analysis = `Blood pressure values (${sysNum}/${diaNum} mmHg) fall inside Stage 1 high pressure boundaries. Combined with age factors, this indicates vascular thickening and early arterial stiffness.`;
            recommendations = [
                "Minimize high sodium foods and processed fats.",
                "Incorporate cardiovascular exercises such as swimming or running.",
                "Practice regular stress reducing breathing techniques or meditation."
            ];
            recommendedSpecialist = "Dr. Naresh Trehan";
        }
    }
    else if (symsLower.includes('chest pain') || symsLower.includes('chest tightness') || symsLower.includes('shortness of breath')) {
        disease = "Ischemic Heart Disease Risk (Angina)";
        confidence = 80;
        riskLevel = symsLower.includes('pain') ? "Critical" : "High";
        analysis = `Reported chest tightness/shortness of breath indicates potential myocardial oxygen demand mismatch. Blood pressure of ${sysNum}/${diaNum} mmHg adds moderate load. Highly critical to rule out active cardiac ischemia.`;
        recommendations = [
            "Consult a cardiologist immediately and perform a clinical ECG/Stress test.",
            "Avoid strenuous physical labor until cleared by a physician.",
            "Carry sublingual nitrates if previously prescribed; call emergency grid if pain radiates to the jaw or arm."
        ];
        recommendedSpecialist = "Dr. Naresh Trehan";
    }
    else if (symsLower.includes('headache') || symsLower.includes('migraine') || symsLower.includes('sensitive to light')) {
        disease = "Migraine & Vascular Headache Syndrome";
        confidence = 85;
        riskLevel = "Moderate";
        analysis = `Vascular neural flares suggested by severe headaches or light sensitivity. Normal glycemic and cardiovascular profiles suggest trigger-activated migraines rather than systemic disease.`;
        recommendations = [
            "Keep a diary to pinpoint food or environmental headache triggers.",
            "Rest in dark, quiet, climate controlled spaces during flare-ups.",
            "Consult a neurologist for active preventative or rescue therapies."
        ];
        recommendedSpecialist = "Dr. Sandeep Vaishya";
    }
    else if (symsLower.includes('rash') || symsLower.includes('itch') || symsLower.includes('skin')) {
        disease = "Allergic Dermatitis or Skin Infection";
        confidence = 82;
        riskLevel = "Low";
        analysis = `Isolated cutaneous inflammation suggested by skin rashes or itching. Vital signs are normal, ruling out systemic anaphylactic response.`;
        recommendations = [
            "Apply mild over-the-counter hydrocortisone creams or calamine lotion.",
            "Avoid using scented soaps or abrasive synthetic fibers.",
            "Consult a dermatologist if spreading or associated with high fever."
        ];
        recommendedSpecialist = "Dr. Sunita Deshmukh";
    }
    else if (symsLower.includes('fever') || symsLower.includes('cough') || symsLower.includes('flu')) {
        if (ageNum < 15) {
            disease = "Pediatric Acute Viral Infection";
            confidence = 88;
            riskLevel = "Moderate";
            analysis = `Classic childhood viral syndrome displaying localized cough and elevated body temperature. Recommended for pediatric triage monitoring.`;
            recommendations = [
                "Consult a pediatrician for safe weight-appropriate antipyretic dosing.",
                "Ensure steady oral rehydration fluids and warm broths.",
                "Monitor body temperature trends and log fever peaks."
            ];
            recommendedSpecialist = "Dr. Priya Bansal";
        } else {
            disease = "Acute Respiratory Viral Fever (Flu)";
            confidence = 86;
            riskLevel = "Low";
            analysis = `Standard adult viral progression. Normal metabolic and cardiac indicators signify localized upper respiratory infection.`;
            recommendations = [
                "Engage in strict absolute bed rest and drink hot fluids.",
                "Manage mild fever symptoms with standard over-the-counter paracetamol.",
                "Consult a physician if temperature spikes exceed 103°F or persist beyond 3 days."
            ];
            recommendedSpecialist = "Dr. Priya Bansal";
        }
    }
    
    res.json({
        disease,
        confidence,
        riskLevel,
        analysis,
        recommendations,
        recommendedSpecialist
    });
});

app.post('/api/health-score', (req, res) => {
    const { sleep, steps, bpm, diet, stress, systolic, diastolic } = req.body;
    
    const sleepHrs = parseFloat(sleep) || 7;
    const stepCount = parseInt(steps) || 5000;
    const heartRate = parseInt(bpm) || 72;
    const sys = parseInt(systolic) || 120;
    const dia = parseInt(diastolic) || 80;
    
    // 1. Calculate Sleep Score (Optimal 7-9 hours, lower if high stress)
    let sleepScore = 100;
    if (sleepHrs < 6) sleepScore -= (6 - sleepHrs) * 15;
    if (sleepHrs > 9) sleepScore -= (sleepHrs - 9) * 10;
    if (stress === 'High') sleepScore -= 15;
    if (stress === 'Medium') sleepScore -= 5;
    sleepScore = Math.max(Math.min(Math.round(sleepScore), 100), 20);
    
    // 2. Calculate Fitness Score (Optimal >= 10,000 steps, diet factor)
    let fitnessScore = 50;
    fitnessScore += Math.min(Math.round((stepCount / 10000) * 40), 40);
    if (diet === 'Balanced' || diet === 'High Fiber') fitnessScore += 10;
    else fitnessScore -= 10;
    fitnessScore = Math.max(Math.min(fitnessScore, 100), 20);
    
    // 3. Calculate Heart Score (Optimal BPM 60-80, BP normal 120/80)
    let heartScore = 100;
    if (heartRate < 60) heartScore -= (60 - heartRate) * 1.5;
    if (heartRate > 80) heartScore -= (heartRate - 80) * 1.5;
    
    if (sys > 120) heartScore -= (sys - 120) * 0.5;
    if (dia > 80) heartScore -= (dia - 80) * 0.5;
    heartScore = Math.max(Math.min(Math.round(heartScore), 100), 20);
    
    // 4. Calculate Overall Health Score
    const overallScore = Math.round((sleepScore + fitnessScore + heartScore) / 3);
    
    let riskCategory = "Optimal";
    let suggestions = [];
    
    if (overallScore >= 85) {
        riskCategory = "Optimal";
        suggestions.push("Excellent work! Maintain your consistent physical steps and optimal sleep hygiene.");
        suggestions.push("Continue incorporating rich antioxidant, high-fiber dietary elements.");
    } else if (overallScore >= 70) {
        riskCategory = "Good";
        suggestions.push("Focus on getting a consistent 7.5 hours of restful sleep to optimize vascular repair.");
        suggestions.push("Incorporate structured muscle recovery periods on high stress days.");
    } else if (overallScore >= 50) {
        riskCategory = "Moderate";
        if (sleepScore < 60) suggestions.push("Prioritize a screen-free sleep wind-down routine 1 hour before bed.");
        if (fitnessScore < 60) suggestions.push("Aim for a baseline of 7,500 daily steps to elevate your fitness score.");
        suggestions.push("Review clinical nutrition guidelines; reduce sodium intake.");
    } else {
        riskCategory = "High Risk";
        suggestions.push("Consult your primary care physician to run systemic endocrine screening panels.");
        suggestions.push("Immediately start recording daily resting BP and heart telemetry.");
        suggestions.push("Establish structural low-stress recovery habits and transition to a whole-food diet.");
    }
    
    res.json({
        overallScore,
        riskCategory,
        sleepScore,
        fitnessScore,
        heartScore,
        suggestions
    });
});

// ==========================================
// NEW ECOSYSTEM ENDPOINTS
// ==========================================

// AI Report Scanner Engine
app.post('/api/ai/scan-report', (req, res) => {
    const { fileName, fileContent } = req.body;
    
    // Simulate high-end clinical AI extraction model
    let extractedData = {
        medicines: ["Telmisartan (40mg)", "Metformin (500mg)"],
        abnormalValues: [
            { marker: "Fasting Glucose", value: "142 mg/dL", standard: "70-100 mg/dL", status: "Critical High" },
            { marker: "Systolic Blood Pressure", value: "145 mmHg", standard: "90-120 mmHg", status: "Moderate High" }
        ],
        suggestions: [
            "Initiate immediate daily glucose telemetry tracking.",
            "Discuss medication adjustment with Dr. Naresh Trehan (Cardiology).",
            "Transition to high-fiber, low-sodium dietary profiles."
        ],
        confidenceScore: 94
    };

    if (fileName && fileName.toLowerCase().includes('blood')) {
        extractedData.medicines = ["Atorvastatin (10mg)", "Metformin (500mg)"];
        extractedData.abnormalValues = [
            { marker: "Total Cholesterol", value: "245 mg/dL", standard: "< 200 mg/dL", status: "High Risk" },
            { marker: "Triglycerides", value: "185 mg/dL", standard: "< 150 mg/dL", status: "High Risk" }
        ];
        extractedData.suggestions = [
            "Limit high cholesterol saturated fats and processed foods.",
            "Schedule a standard liver function panel.",
            "Follow-up with Dr. Priya Bansal (Pediatrics)."
        ];
    }
    
    res.json(extractedData);
});

// AI Medicine Interaction Checker
app.post('/api/ai/check-interactions', (req, res) => {
    const { medicines } = req.body;
    if (!medicines || medicines.length < 2) {
        return res.json({ conflict: false, warnings: [], severity: "None" });
    }

    const medsLower = medicines.map(m => m.toLowerCase().trim());
    let conflict = false;
    let severity = "None";
    let warnings = [];

    // Heuristics collision check
    const hasTelmisartan = medsLower.some(m => m.includes('telmisartan') || m.includes('telma'));
    const hasMetformin = medsLower.some(m => m.includes('metformin') || m.includes('glycomet'));
    const hasNsaid = medsLower.some(m => m.includes('ibuprofen') || m.includes('aspirin') || m.includes('diclofenac') || m.includes('combiflam'));
    const hasAlcohol = medsLower.some(m => m.includes('alcohol') || m.includes('wine') || m.includes('beer'));

    if (hasTelmisartan && hasNsaid) {
        conflict = true;
        severity = "High Risk";
        warnings.push("WARNING: Combining Telmisartan with NSAIDs (e.g. Ibuprofen/Aspirin) significantly increases arterial strain and potential acute kidney injury. It reduces the hypertensive efficacy of Telmisartan.");
    }
    if (hasMetformin && hasAlcohol) {
        conflict = true;
        severity = "Critical";
        warnings.push("CRITICAL: Combining Metformin with high alcohol intake poses an extreme risk of Lactic Acidosis, a life-threatening clinical metabolic disorder. Seek immediate emergency consultation.");
    }
    if (hasTelmisartan && hasMetformin) {
        conflict = true;
        severity = "Moderate";
        warnings.push("Caution: Co-administering antihypertensive and antidiabetic agents requires close blood sugar and pressure profiling to avoid unexpected hypoglycemic drops.");
    }

    if (!conflict) {
        warnings.push("No severe active clinical interactions detected. Standard clinical profiles indicate safe concurrent dosing. Always consult your assigned physician.");
    }

    res.json({ conflict, warnings, severity });
});

// Emergency SOS Trigger Logger
app.post('/api/emergency/sos', (req, res) => {
    const { userId, lat, lng, bloodGroup, contacts } = req.body;
    
    // Simulate real-time SMS/Email dispatching
    console.log(`[SOS DISPATCH] User ID ${userId} triggered SOS at [${lat}, ${lng}]. Emergency details logged.`);
    
    // Store in activity logs
    const stmt = db.prepare('INSERT INTO activity_logs (userId, deviceType, location, ipAddress, actionType, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([userId || 1, 'Mobile Browser', `${lat}, ${lng}`, '127.0.0.1', 'SOS EMERGENCY TRIGGER', new Date().toISOString()], function(err) {
        if (err) console.error('SOS Log error', err);
        res.json({
            success: true,
            dispatchMessage: "SOS Alert Dispatched. Nearest clinical ambulance has been routed to your exact coordinates.",
            eta: "7 mins",
            ambulanceId: "AMB-DL-023-A"
        });
    });
});

// Blood Donor Network
app.get('/api/blood-network', (req, res) => {
    const { city, group } = req.query;
    let query = 'SELECT * FROM blood_donors WHERE 1=1';
    let params = [];
    
    if (city) {
        query += ' AND city = ?';
        params.push(city);
    }
    if (group) {
        query += ' AND bloodGroup = ?';
        params.push(group);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/blood-network/register', (req, res) => {
    const { userId, name, bloodGroup, city, phone } = req.body;
    const stmt = db.prepare('INSERT INTO blood_donors (userId, name, bloodGroup, city, phone, available) VALUES (?, ?, ?, ?, ?, 1)');
    stmt.run([userId, name, bloodGroup, city, phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

// Lab Test Booking
app.post('/api/lab-test/book', (req, res) => {
    const { userId, testName, scheduleDate, address } = req.body;
    const stmt = db.prepare('INSERT INTO lab_bookings (userId, testName, scheduleDate, address, status) VALUES (?, ?, ?, ?, "Pending")');
    stmt.run([userId, testName, scheduleDate, address], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true, testName, scheduleDate });
    });
});

app.get('/api/lab-test/bookings/:userId', (req, res) => {
    db.all('SELECT * FROM lab_bookings WHERE userId = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Secure Medical Vault
app.post('/api/vault/upload', (req, res) => {
    const { userId, fileName, fileType, fileData } = req.body;
    const stmt = db.prepare('INSERT INTO medical_vault (userId, fileName, fileType, fileData, uploadedAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run([userId, fileName, fileType, fileData, new Date().toISOString()], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true, fileName, fileType });
    });
});

app.get('/api/vault/files/:userId', (req, res) => {
    db.all('SELECT id, fileName, fileType, uploadedAt FROM medical_vault WHERE userId = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Digital Prescription Engine
app.post('/api/doctors/prescription', (req, res) => {
    const { userId, docName, docSpecialty, drugs, signature, qrText } = req.body;
    const stmt = db.prepare('INSERT INTO prescriptions (userId, docName, docSpecialty, drugs, signature, qrText, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run([userId, docName, docSpecialty, JSON.stringify(drugs), signature, qrText, new Date().toLocaleDateString('en-IN')], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/doctors/prescriptions/:userId', (req, res) => {
    db.all('SELECT * FROM prescriptions WHERE userId = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse the drugs JSON string back to objects
        const parsedRows = rows.map(r => ({
            ...r,
            drugs: JSON.parse(r.drugs || '[]')
        }));
        res.json(parsedRows);
    });
});

// Security Activity Audit Logs
app.post('/api/activity-logs', (req, res) => {
    const { userId, deviceType, location, ipAddress, actionType } = req.body;
    const stmt = db.prepare('INSERT INTO activity_logs (userId, deviceType, location, ipAddress, actionType, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([userId, deviceType, location, ipAddress, actionType, new Date().toISOString()], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/activity-logs/:userId', (req, res) => {
    db.all('SELECT * FROM activity_logs WHERE userId = ? ORDER BY id DESC LIMIT 10', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Family Profile Manager
app.post('/api/family-profiles', (req, res) => {
    const { userId, relationship, name, age, bloodGroup, allergies } = req.body;
    const stmt = db.prepare('INSERT INTO family_profiles (userId, relationship, name, age, bloodGroup, allergies) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([userId, relationship, name, age, bloodGroup, allergies], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/family-profiles/:userId', (req, res) => {
    db.all('SELECT * FROM family_profiles WHERE userId = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

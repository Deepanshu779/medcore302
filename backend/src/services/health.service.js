/**
 * Rules-based clinical triage, symptom analysis, and health metric evaluators.
 * Note: These provide prototype decision-support simulation for demonstration.
 */

function predictDisease({ symptoms, age, systolic, diastolic, sugar }) {
    const ageNum = parseInt(age, 10) || 30;
    const sysNum = parseInt(systolic, 10) || 120;
    const diaNum = parseInt(diastolic, 10) || 80;
    const sugNum = parseInt(sugar, 10) || 90;
    const symsLower = (symptoms || '').toLowerCase();

    // Default baseline: normal clearance
    let result = {
        disease: "General Health Clearance",
        confidence: 95,
        riskLevel: "Low",
        analysis: "All evaluated biomarkers (blood pressure, glucose levels) fall within optimal clinical limits. No acute pathological patterns were detected from the reported symptoms.",
        recommendations: [
            "Maintain current healthy dietary habits with high fiber and low sodium.",
            "Ensure at least 150 minutes of moderate aerobic exercise weekly.",
            "Schedule standard annual diagnostic health checks."
        ],
        recommendedSpecialist: "Dr. Priya Bansal"
    };

    if (sugNum >= 126 || (sugNum >= 100 && (symsLower.includes('urination') || symsLower.includes('thirst') || symsLower.includes('fatigue')))) {
        if (sugNum >= 140) {
            result = {
                disease: "Type 2 Diabetes Mellitus (Hyperglycemia)",
                confidence: Math.min(85 + Math.floor((sugNum - 140) / 4), 98),
                riskLevel: sugNum >= 200 ? "Critical" : "High",
                analysis: `Persistent elevated blood glucose levels (${sugNum} mg/dL) combined with signature diabetic markers (fatigue, polydipsia, polyuria). Age ${ageNum} presents elevated risk for metabolic resistance.`,
                recommendations: [
                    "Consult an endocrinologist for a comprehensive HbA1c screening.",
                    "Limit high-glycemic carbohydrates and incorporate structured physical activity.",
                    "Regularly monitor daily blood glucose levels."
                ],
                recommendedSpecialist: "Dr. Priya Bansal"
            };
        } else {
            result = {
                disease: "Impaired Fasting Glucose (Prediabetes)",
                confidence: 78,
                riskLevel: "Moderate",
                analysis: `Mild glucose intolerance observed (${sugNum} mg/dL). Baseline is elevated above standard fasting limits.`,
                recommendations: [
                    "Adopt a low-glycemic dietary plan and reduce refined sugars.",
                    "Engage in daily brisk walking or resistance training to improve insulin sensitivity.",
                    "Re-evaluate fasting blood glucose in 3 months."
                ],
                recommendedSpecialist: "Dr. Priya Bansal"
            };
        }
    } else if (sysNum >= 140 || diaNum >= 90 || (sysNum >= 130 && symsLower.includes('headache') && symsLower.includes('dizzy'))) {
        if (sysNum >= 160 || diaNum >= 100) {
            result = {
                disease: "Stage 2 Hypertension (Urgent)",
                confidence: Math.min(90 + Math.floor((sysNum - 160) / 3), 98),
                riskLevel: sysNum >= 180 || diaNum >= 120 ? "Critical" : "High",
                analysis: `Markedly elevated arterial blood pressure (${sysNum}/${diaNum} mmHg). Associated headaches or dizziness indicate significant cardiovascular strain.`,
                recommendations: [
                    "Seek clinical evaluation by a cardiologist promptly.",
                    "Strictly reduce sodium intake and begin prescribed antihypertensive therapy.",
                    "Rest in a calm environment and record blood pressure every 2-4 hours."
                ],
                recommendedSpecialist: "Dr. Naresh Trehan"
            };
        } else {
            result = {
                disease: "Stage 1 Hypertension (Borderline)",
                confidence: 82,
                riskLevel: "Moderate",
                analysis: `Blood pressure readings (${sysNum}/${diaNum} mmHg) fall inside Stage 1 hypertension ranges.`,
                recommendations: [
                    "Minimize high-sodium foods and processed fats.",
                    "Incorporate regular cardiovascular exercise such as swimming, cycling, or brisk walking.",
                    "Practice stress-reduction techniques."
                ],
                recommendedSpecialist: "Dr. Naresh Trehan"
            };
        }
    } else if (symsLower.includes('chest pain') || symsLower.includes('chest tightness') || symsLower.includes('shortness of breath')) {
        result = {
            disease: "Ischemic Heart Disease Risk (Angina Suspicion)",
            confidence: 80,
            riskLevel: symsLower.includes('pain') ? "Critical" : "High",
            analysis: `Reported chest tightness/shortness of breath indicates potential myocardial oxygen demand mismatch. Vital pressure of ${sysNum}/${diaNum} mmHg adds hemodynamic load.`,
            recommendations: [
                "Consult a cardiologist immediately and schedule an ECG/stress test.",
                "Avoid strenuous physical exertion until cleared by a physician.",
                "Seek immediate emergency care if pain radiates to the arm, neck, or jaw."
            ],
            recommendedSpecialist: "Dr. Naresh Trehan"
        };
    } else if (symsLower.includes('headache') || symsLower.includes('migraine') || symsLower.includes('sensitive to light')) {
        result = {
            disease: "Migraine & Tension Headache Syndrome",
            confidence: 85,
            riskLevel: "Moderate",
            analysis: "Symptoms suggest neurovascular headache or migraine pattern. Normal glycemic and cardiovascular profiles indicate episodic trigger rather than acute systemic disease.",
            recommendations: [
                "Maintain a headache diary to identify dietary or sleep triggers.",
                "Rest in a quiet, darkened space during acute episodes.",
                "Consult a neurologist for preventative or rescue therapy if episodes recur."
            ],
            recommendedSpecialist: "Dr. Sandeep Vaishya"
        };
    } else if (symsLower.includes('rash') || symsLower.includes('itch') || symsLower.includes('skin')) {
        result = {
            disease: "Allergic Contact Dermatitis",
            confidence: 82,
            riskLevel: "Low",
            analysis: "Cutaneous presentation suggests localized contact inflammation or allergic dermatitis. Vital signs are normal, ruling out systemic anaphylaxis.",
            recommendations: [
                "Apply gentle over-the-counter moisturizers or calamine lotion.",
                "Avoid harsh synthetic soaps and suspected contact allergens.",
                "Consult a dermatologist if rashes spread or are accompanied by fever."
            ],
            recommendedSpecialist: "Dr. Sunita Deshmukh"
        };
    } else if (symsLower.includes('fever') || symsLower.includes('cough') || symsLower.includes('flu')) {
        if (ageNum < 15) {
            result = {
                disease: "Pediatric Acute Viral Syndrome",
                confidence: 88,
                riskLevel: "Moderate",
                analysis: "Classic pediatric upper respiratory viral pattern with fever and cough.",
                recommendations: [
                    "Consult a pediatrician for weight-appropriate antipyretic dosing.",
                    "Maintain continuous oral hydration with warm fluids and electrolyte solution.",
                    "Monitor and record temperature trends every 4 hours."
                ],
                recommendedSpecialist: "Dr. Priya Bansal"
            };
        } else {
            result = {
                disease: "Acute Upper Respiratory Viral Infection",
                confidence: 86,
                riskLevel: "Low",
                analysis: "Standard adult viral progression. Normal metabolic and cardiac indicators signify localized viral infection.",
                recommendations: [
                    "Ensure adequate hydration and restful recovery.",
                    "Manage mild fever symptoms with standard over-the-counter antipyretics as appropriate.",
                    "Consult a physician if fever exceeds 103°F or persists beyond 3 days."
                ],
                recommendedSpecialist: "Dr. Priya Bansal"
            };
        }
    }

    return result;
}

function calculateHealthScore({ sleep, steps, bpm, diet, stress, systolic, diastolic }) {
    const sleepHrs = parseFloat(sleep) || 7;
    const stepCount = parseInt(steps, 10) || 5000;
    const heartRate = parseInt(bpm, 10) || 72;
    const sys = parseInt(systolic, 10) || 120;
    const dia = parseInt(diastolic, 10) || 80;

    // 1. Sleep score (optimal 7-9 hours)
    let sleepScore = 100;
    if (sleepHrs < 6) sleepScore -= (6 - sleepHrs) * 15;
    if (sleepHrs > 9) sleepScore -= (sleepHrs - 9) * 10;
    if (stress === 'High') sleepScore -= 15;
    if (stress === 'Medium') sleepScore -= 5;
    sleepScore = Math.max(Math.min(Math.round(sleepScore), 100), 20);

    // 2. Fitness score (baseline 10k steps)
    let fitnessScore = 50;
    fitnessScore += Math.min(Math.round((stepCount / 10000) * 40), 40);
    if (diet === 'Balanced' || diet === 'High Fiber') fitnessScore += 10;
    else fitnessScore -= 10;
    fitnessScore = Math.max(Math.min(fitnessScore, 100), 20);

    // 3. Heart score (optimal 60-80 bpm, 120/80 BP)
    let heartScore = 100;
    if (heartRate < 60) heartScore -= (60 - heartRate) * 1.5;
    if (heartRate > 80) heartScore -= (heartRate - 80) * 1.5;
    if (sys > 120) heartScore -= (sys - 120) * 0.5;
    if (dia > 80) heartScore -= (dia - 80) * 0.5;
    heartScore = Math.max(Math.min(Math.round(heartScore), 100), 20);

    // 4. Overall composite score
    const overallScore = Math.round((sleepScore + fitnessScore + heartScore) / 3);

    let riskCategory = "Optimal";
    const suggestions = [];

    if (overallScore >= 85) {
        riskCategory = "Optimal";
        suggestions.push("Excellent routine. Maintain consistent physical activity and restful sleep hygiene.");
        suggestions.push("Continue balanced high-fiber, nutrient-dense meal planning.");
    } else if (overallScore >= 70) {
        riskCategory = "Good";
        suggestions.push("Focus on getting consistent 7-8 hours of restful sleep to optimize recovery.");
        suggestions.push("Incorporate structured light stretches on high-stress workdays.");
    } else if (overallScore >= 50) {
        riskCategory = "Moderate";
        if (sleepScore < 60) suggestions.push("Prioritize a screen-free wind-down routine 1 hour before bed.");
        if (fitnessScore < 60) suggestions.push("Aim for a daily baseline of 7,500 steps to elevate cardiovascular fitness.");
        suggestions.push("Moderate dietary sodium and refined sugars.");
    } else {
        riskCategory = "High Risk";
        suggestions.push("Consult your primary care physician to run standard baseline metabolic screenings.");
        suggestions.push("Regularly log resting blood pressure and heart rate.");
        suggestions.push("Establish low-stress recovery habits and transition towards a whole-food diet.");
    }

    return {
        overallScore,
        riskCategory,
        sleepScore,
        fitnessScore,
        heartScore,
        suggestions
    };
}

function scanReport({ fileName }) {
    const isBloodReport = fileName && fileName.toLowerCase().includes('blood');

    if (isBloodReport) {
        return {
            medicines: ["Atorvastatin (10mg)", "Metformin (500mg)"],
            abnormalValues: [
                { marker: "Total Cholesterol", value: "245 mg/dL", standard: "< 200 mg/dL", status: "High Risk" },
                { marker: "Triglycerides", value: "185 mg/dL", standard: "< 150 mg/dL", status: "High Risk" }
            ],
            suggestions: [
                "Reduce dietary saturated fats and ultra-processed foods.",
                "Schedule a follow-up lipid and liver panel with your clinician.",
                "Consult Dr. Priya Bansal or your general physician."
            ],
            confidenceScore: 94
        };
    }

    return {
        medicines: ["Telmisartan (40mg)", "Metformin (500mg)"],
        abnormalValues: [
            { marker: "Fasting Glucose", value: "142 mg/dL", standard: "70-100 mg/dL", status: "Critical High" },
            { marker: "Systolic Blood Pressure", value: "145 mmHg", standard: "90-120 mmHg", status: "Moderate High" }
        ],
        suggestions: [
            "Initiate regular fasting and postprandial glucose tracking.",
            "Discuss medication titration with Dr. Naresh Trehan (Cardiology).",
            "Adopt a DASH or Mediterranean dietary approach."
        ],
        confidenceScore: 94
    };
}

function checkDrugInteractions(medicines) {
    if (!medicines || medicines.length < 2) {
        return { conflict: false, warnings: [], severity: "None" };
    }

    const medsLower = medicines.map(m => m.toLowerCase().trim());
    let conflict = false;
    let severity = "None";
    const warnings = [];

    const hasTelmisartan = medsLower.some(m => m.includes('telmisartan') || m.includes('telma'));
    const hasMetformin = medsLower.some(m => m.includes('metformin') || m.includes('glycomet'));
    const hasNsaid = medsLower.some(m => m.includes('ibuprofen') || m.includes('aspirin') || m.includes('diclofenac') || m.includes('combiflam'));
    const hasAlcohol = medsLower.some(m => m.includes('alcohol') || m.includes('wine') || m.includes('beer'));

    if (hasTelmisartan && hasNsaid) {
        conflict = true;
        severity = "High Risk";
        warnings.push("WARNING: Combining Telmisartan with NSAIDs (e.g. Ibuprofen/Aspirin) can increase renal strain and attenuate the antihypertensive effect of Telmisartan.");
    }
    if (hasMetformin && hasAlcohol) {
        conflict = true;
        severity = "Critical";
        warnings.push("CRITICAL: Combining Metformin with significant alcohol intake elevates the risk of Lactic Acidosis. Seek immediate medical advice.");
    }
    if (hasTelmisartan && hasMetformin) {
        conflict = true;
        severity = "Moderate";
        warnings.push("Caution: Co-administering antihypertensive and antidiabetic agents warrants routine glucose and blood pressure monitoring to prevent symptomatic hypotension or hypoglycemia.");
    }

    if (!conflict) {
        warnings.push("No major documented contraindications detected among the entered medications. Standard dosing schedules apply; verify with your prescribing physician.");
    }

    return { conflict, warnings, severity };
}

module.exports = {
    predictDisease,
    calculateHealthScore,
    scanReport,
    checkDrugInteractions
};


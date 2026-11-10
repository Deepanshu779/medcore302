const { describe, it } = require('node:test');
const assert = require('node:assert');
const healthService = require('../src/services/health.service');
const passwordService = require('../src/services/password.service');

describe('Health Analytics Service', () => {
    it('should classify normal vitals as low risk', () => {
        const result = healthService.predictDisease({
            symptoms: 'feeling fine',
            age: 28,
            systolic: 118,
            diastolic: 78,
            sugar: 88
        });
        assert.strictEqual(result.riskLevel, 'Low');
        assert.ok(result.disease.includes('Clearance'));
    });

    it('should flag hyperglycemia when sugar exceeds 140 mg/dL', () => {
        const result = healthService.predictDisease({
            symptoms: 'excessive thirst and fatigue',
            age: 50,
            systolic: 120,
            diastolic: 80,
            sugar: 180
        });
        assert.ok(result.disease.includes('Diabetes'));
        assert.ok(result.riskLevel === 'High' || result.riskLevel === 'Critical');
    });

    it('should identify hypertensive urgency when systolic >= 160', () => {
        const result = healthService.predictDisease({
            symptoms: 'headache and dizziness',
            age: 55,
            systolic: 165,
            diastolic: 105,
            sugar: 90
        });
        assert.ok(result.disease.includes('Hypertension'));
        assert.strictEqual(result.riskLevel, 'High');
    });

    it('should flag known drug interactions (Telmisartan + NSAIDs)', () => {
        const result = healthService.checkDrugInteractions(['Telmisartan (40mg)', 'Ibuprofen (400mg)']);
        assert.strictEqual(result.conflict, true);
        assert.strictEqual(result.severity, 'High Risk');
        assert.ok(result.warnings.length > 0);
    });

    it('should report no conflict for single or safe medications', () => {
        const single = healthService.checkDrugInteractions(['Paracetamol']);
        assert.strictEqual(single.conflict, false);

        const safe = healthService.checkDrugInteractions(['Amoxicillin', 'Pantoprazole']);
        assert.strictEqual(safe.conflict, false);
    });

    it('should compute valid composite health score', () => {
        const result = healthService.calculateHealthScore({
            sleep: 8,
            steps: 10000,
            bpm: 70,
            diet: 'Balanced',
            stress: 'Low',
            systolic: 120,
            diastolic: 80
        });
        assert.ok(result.overallScore >= 80);
        assert.strictEqual(result.riskCategory, 'Optimal');
        assert.ok(Array.isArray(result.suggestions));
    });
});

describe('Password Cryptographic Service', () => {
    it('should hash and verify passwords asynchronously', async () => {
        const plain = 'SafePassword#2026';
        const hash = await passwordService.hashPassword(plain);
        assert.ok(hash.includes(':'), 'Hash must contain salt delimiter');

        const isMatch = await passwordService.verifyPassword(plain, hash);
        assert.strictEqual(isMatch, true);

        const isWrong = await passwordService.verifyPassword('WrongPass', hash);
        assert.strictEqual(isWrong, false);
    });

    it('should reject invalid or empty password inputs', async () => {
        await assert.rejects(async () => {
            await passwordService.hashPassword('');
        });

        const invalidVerification = await passwordService.verifyPassword('', 'invalid:hash');
        assert.strictEqual(invalidVerification, false);
    });
});

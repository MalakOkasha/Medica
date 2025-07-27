# data_generator.py
import numpy as np
import pandas as pd

# Step 1: Generate synthetic dataset with realistic medical values
def generate_dataset(n_samples=15000, file_path='synthetic_medical_dataset.csv'):
    print(f"Generating synthetic dataset with {n_samples} samples...")
    np.random.seed(42)

    # Define realistic medical categories
    diagnoses = [
        'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Heart Failure',
        'GERD', 'Hypothyroidism'
    ]
    allergy_types = ['None', 'Penicillin', 'Sulfa', 'Statins', 'NSAIDs']
    chronic_condition_types = ['None', 'CKD', 'COPD', 'CAD', 'Obesity', 'Liver Disease']

    # Medicines by diagnosis mapping
    medicines_by_diagnosis = {
        'Hypertension': ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide'],
        'Type 2 Diabetes': ['Metformin', 'Insulin'],
        'Hyperlipidemia': ['Atorvastatin', 'Simvastatin'],
        'Heart Failure': ['Furosemide', 'Carvedilol'],
        'GERD': ['Omeprazole', 'Pantoprazole'],
        'Hypothyroidism': ['Levothyroxine']
    }

    # Generate base features
    age = np.random.randint(0, 101, size=n_samples)
    gender = np.random.choice(['Male', 'Female'], size=n_samples)
    diagnosis = np.random.choice(diagnoses, size=n_samples)
    allergies = np.random.choice(allergy_types, size=n_samples, p=[0.4, 0.2, 0.15, 0.15, 0.1])
    chronic_conditions = np.random.choice(
        chronic_condition_types, size=n_samples,
        p=[0.3, 0.15, 0.15, 0.15, 0.15, 0.1]
    )

    medicines = [np.random.choice(medicines_by_diagnosis[d]) for d in diagnosis]
    severity = np.random.choice([0, 1, 2], size=n_samples, p=[0.5, 0.3, 0.2])
    smoking = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])

    # Numeric encodings
    gender_numeric = np.where(gender == 'Male', 1, 0)
    diagnosis_impact = {
        'Hypertension': 0.5, 'Type 2 Diabetes': 0.3, 'Hyperlipidemia': 0.4,
        'Heart Failure': -0.2, 'GERD': 0.7, 'Hypothyroidism': 0.5
    }
    diagnosis_numeric = np.array([diagnosis_impact[d] for d in diagnosis])
    allergy_impact = {
        'None': 0, 'Penicillin': -0.3, 'Sulfa': -0.2, 'Statins': -0.4, 'NSAIDs': -0.3
    }
    allergies_numeric = np.array([allergy_impact[a] for a in allergies])
    chronic_impact = {
        'None': 0, 'CKD': -0.8, 'COPD': -0.7, 'CAD': -0.6,
        'Obesity': -0.4, 'Liver Disease': -0.9
    }
    chronic_numeric = np.array([chronic_impact[c] for c in chronic_conditions])

    # Compute improvement score
    print("Computing improvement score for binary outcome...")
    improvement_score = (
        -0.015 * np.abs(age - 40) +
        0.3 * (1 - gender_numeric) +
        2.0 * diagnosis_numeric +
        3.0 * chronic_numeric +
        1.5 * allergies_numeric +
        -1.8 * severity +
        -2.2 * smoking +
        0.25 * np.random.randn(n_samples)
    )

    # Set threshold at the 55th percentile to make the ratio approximately 45% to 55%
    threshold = np.percentile(improvement_score, 55)
    improved = (improvement_score > threshold).astype(int)

    # Disease-Specific Test Columns
    hypertension_test = np.where(diagnosis == 'Hypertension', np.random.normal(140, 15, size=n_samples), np.nan)  # Systolic BP
    diabetes_test = np.where(diagnosis == 'Type 2 Diabetes', np.random.normal(7.0, 1.5, size=n_samples), np.nan)  # HbA1c
    hyperlipidemia_test = np.where(diagnosis == 'Hyperlipidemia', np.random.normal(100, 25, size=n_samples), np.nan)  # LDL
    heart_failure_test = np.where(diagnosis == 'Heart Failure', np.random.normal(450, 50, size=n_samples), np.nan)  # BNP
    gerd_test = np.where(diagnosis == 'GERD', np.random.choice([0, 1, 2, 3], size=n_samples), np.nan)  # Endoscopy result
    hypothyroidism_test = np.where(diagnosis == 'Hypothyroidism', np.random.normal(5.0, 2.0, size=n_samples), np.nan)  # TSH

    # Create DataFrame
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'diagnosis': diagnosis,
        'medicine': medicines,
        'allergies': allergies,
        'chronic_conditions': chronic_conditions,
        'severity': severity,
        'smoking': smoking,
        'hypertension_test': hypertension_test,
        'diabetes_test': diabetes_test,
        'hyperlipidemia_test': hyperlipidemia_test,
        'heart_failure_test': heart_failure_test,
        'gerd_test': gerd_test,
        'hypothyroidism_test': hypothyroidism_test,
        'Improved': improved
    })

    df.to_csv(file_path, index=False)
    print(f"✅ Dataset saved as {file_path}")
    print(f"Generated dataset shape: {df.shape} with target distribution: {df['Improved'].value_counts().to_dict()}")
    return df

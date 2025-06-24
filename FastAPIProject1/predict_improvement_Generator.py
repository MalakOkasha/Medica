import pandas as pd
import numpy as np

# 1. Base diagnoses and medicines
base_mapping = {
    'Hypertension': ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide'],
    'Type 2 Diabetes': ['Metformin', 'Insulin'],
    'Bacterial Infection': ['Amoxicillin', 'Azithromycin'],
    'Asthma': ['Albuterol', 'Fluticasone'],
    'Hyperlipidemia': ['Atorvastatin', 'Simvastatin'],
    'Heart Failure': ['Furosemide', 'Carvedilol'],
    'GERD': ['Omeprazole', 'Pantoprazole'],
    'Hypothyroidism': ['Levothyroxine']
}
base_diags = list(base_mapping.keys())

# 2. Composite diagnosis: embed severity into base diagnoses
def composite_diagnosis(orig_diag, age, hba1c, bac_sev, asthma_sev, ldl, ef, episodes):
    if orig_diag == 'Hypertension':
        if age <= 50:
            return 'Hypertension_<=50'
        if age <= 70:
            return 'Hypertension_51-70'
        return 'Hypertension_>70'
    if orig_diag == 'Type 2 Diabetes':
        return 'Type 2 Diabetes_controlled' if hba1c < 8 else 'Type 2 Diabetes_uncontrolled'
    if orig_diag == 'Bacterial Infection':
        return 'Bacterial Infection'
    if orig_diag == 'Asthma':
        return 'Asthma_mild' if asthma_sev == 0 else 'Asthma_severe'
    if orig_diag == 'Hyperlipidemia':
        return 'Hyperlipidemia_LDL<130' if ldl < 130 else 'Hyperlipidemia_LDL>=130'
    if orig_diag == 'Heart Failure':
        return 'Heart Failure_EF<40' if ef < 40 else 'Heart Failure_EF>=40'
    if orig_diag == 'GERD':
        return 'GERD_<=3wk' if episodes <= 3 else 'GERD_>3wk'
    if orig_diag == 'Hypothyroidism':
        return 'Hypothyroidism'
    return orig_diag

# 3. Assign medicine based on composite diagnosis and allergy
def assign_medicine(comp_diag, allergy):
    if comp_diag.startswith('Hypertension_<=50'):
        return 'Lisinopril'
    if comp_diag.startswith('Hypertension_51-70'):
        return 'Amlodipine'
    if comp_diag.startswith('Hypertension_>70'):
        return 'Hydrochlorothiazide'
    if comp_diag == 'Type 2 Diabetes_controlled':
        return 'Metformin'
    if comp_diag == 'Type 2 Diabetes_uncontrolled':
        return 'Insulin'
    if comp_diag == 'Bacterial Infection':
        return 'Azithromycin' if allergy == 'Penicillin' else 'Amoxicillin'
    if comp_diag == 'Asthma_mild':
        return 'Albuterol'
    if comp_diag == 'Asthma_severe':
        return 'Fluticasone'
    if comp_diag == 'Hyperlipidemia_LDL<130':
        return 'Simvastatin'
    if comp_diag == 'Hyperlipidemia_LDL>=130':
        return 'Atorvastatin'
    if comp_diag == 'Heart Failure_EF<40':
        return 'Carvedilol'
    if comp_diag == 'Heart Failure_EF>=40':
        return 'Furosemide'
    if comp_diag == 'GERD_<=3wk':
        return 'Omeprazole'
    if comp_diag == 'GERD_>3wk':
        return 'Pantoprazole'
    if comp_diag == 'Hypothyroidism':
        return 'Levothyroxine'
    return None

# 4. Diagnosis prevalence (approx. epidemiologic rates)
diag_prevalence = {
    'Hypertension': 0.25,
    'Type 2 Diabetes': 0.15,
    'Bacterial Infection': 0.10,
    'Asthma': 0.10,
    'Hyperlipidemia': 0.15,
    'Heart Failure': 0.05,
    'GERD': 0.10,
    'Hypothyroidism': 0.10
}
diag_probs = [diag_prevalence[d] for d in base_diags]

# 5. Epidemiologic age/gender parameters
epi_params = {
    'Hypertension':         (60, 10, 0.9),
    'Type 2 Diabetes':      (55, 12, 0.8),
    'Bacterial Infection':  (30, 20, 1.0),
    'Asthma':               (25, 15, 0.9),
    'Hyperlipidemia':       (50, 15, 1.0),
    'Heart Failure':        (70, 8,  1.1),
    'GERD':                 (50, 12, 0.8),
    'Hypothyroidism':       (45, 12, 0.3)
}

# 6. Comorbidity prevalence per diagnosis
chronic_pool = ['None', 'CKD', 'COPD', 'CAD', 'Obesity', 'Liver Disease']
chronic_by_diag = {
    'Hypertension':       [0.40, 0.10, 0.10, 0.15, 0.20, 0.05],
    'Type 2 Diabetes':    [0.30, 0.10, 0.05, 0.10, 0.35, 0.10],
    'Bacterial Infection':[0.70, 0.05, 0.05, 0.05, 0.10, 0.05],
    'Asthma':             [0.65, 0.05, 0.10, 0.05, 0.10, 0.05],
    'Hyperlipidemia':     [0.40, 0.10, 0.10, 0.10, 0.25, 0.05],
    'Heart Failure':      [0.50, 0.15, 0.10, 0.15, 0.05, 0.05],
    'GERD':               [0.60, 0.05, 0.05, 0.05, 0.20, 0.05],
    'Hypothyroidism':     [0.50, 0.10, 0.05, 0.05, 0.20, 0.10]
}

# 7. Allergy distribution and drug efficacy
allergy_types = ['None', 'Penicillin', 'Sulfa', 'Statins', 'NSAIDs']
allergy_prevalence = [0.80, 0.08, 0.04, 0.04, 0.04]
efficacy_rates = {
    'Lisinopril':           0.75, 'Amlodipine': 0.70, 'Hydrochlorothiazide': 0.65,
    'Metformin':            0.70, 'Insulin': 0.85,
    'Amoxicillin':          0.90, 'Azithromycin': 0.85,
    'Albuterol':            0.80, 'Fluticasone': 0.75,
    'Atorvastatin':         0.70, 'Simvastatin': 0.65,
    'Furosemide':           0.60, 'Carvedilol': 0.65,
    'Omeprazole':           0.85, 'Pantoprazole': 0.80,
    'Levothyroxine':        0.90
}

# Helper sampling functions

def sample_age_gender(orig):
    mu, sigma, ratio = epi_params[orig]
    age = int(np.clip(np.random.normal(mu, sigma), 0, 90))
    male_prob = ratio / (1 + ratio)
    gender = np.random.choice(['Male', 'Female'], p=[male_prob, 1 - male_prob])
    return age, gender


def sample_chronic(orig):
    return np.random.choice(chronic_pool, p=chronic_by_diag[orig])


def calibrate_probability(p0, age, allergy, chronic, correct_med):
    decade_diff = (age - 50) // 10
    age_offset = 1 - 0.05 * decade_diff
    allergy_pen = 0.9 if allergy != 'None' else 1.0
    chronic_pen = 0.9 if chronic != 'None' else 1.0
    med_mult = 1.2 if correct_med else 0.6
    return np.clip(p0 * age_offset * allergy_pen * chronic_pen * med_mult, 0.1, 0.95)

# 8. Dataset generation
def generate_dataset(n=15000,
                     med_error_rate=0.05,
                     missing_rate=0.02,
                     outcome_noise=0.02):
    np.random.seed(42)
    rows = []
    for _ in range(n):
        orig = np.random.choice(base_diags, p=diag_probs)
        age, gender = sample_age_gender(orig)
        chronic = sample_chronic(orig)
        allergy = np.random.choice(allergy_types, p=allergy_prevalence)

        # Severity features
        hba1c    = np.round(np.random.uniform(6.5, 10), 1) if orig == 'Type 2 Diabetes' else 0
        bac_sev  = np.random.choice([0, 1]) if orig == 'Bacterial Infection' else 0
        asthma_sev = np.random.choice([0, 1]) if orig == 'Asthma' else 0
        ldl      = int(np.random.uniform(70, 200)) if orig == 'Hyperlipidemia' else 0
        ef       = np.round(np.random.uniform(20, 65), 1) if orig == 'Heart Failure' else 0
        episodes = np.random.randint(1, 8) if orig == 'GERD' else 0

        comp = composite_diagnosis(orig, age, hba1c, bac_sev, asthma_sev, ldl, ef, episodes)

        # Medicine assignment with error
        rec = assign_medicine(comp, allergy)
        if np.random.rand() < med_error_rate:
            alts = [m for m in base_mapping[orig] if m != rec]
            med = np.random.choice(alts) if alts else rec
            correct_med = False
        else:
            med = rec
            correct_med = True

        # Outcome determination
        p0 = efficacy_rates.get(med, 0.7)
        p  = calibrate_probability(p0, age, allergy, chronic, correct_med)
        improved = 'yes' if np.random.rand() < p else 'no'

        rows.append({
            'age': age,
            'gender': gender,
            'diagnosis': comp,
            'medicine': med,
            'allergies': allergy,
            'chronic conditions': chronic,
            'improved': improved
        })

    df = pd.DataFrame(rows)
    # Inject missingness and label noise
    df.loc[df.sample(frac=missing_rate, random_state=42).index, 'chronic conditions'] = np.nan
    flip_idx = df.sample(frac=outcome_noise, random_state=24).index
    df.loc[flip_idx, 'improved'] = df.loc[flip_idx, 'improved'].map({'yes': 'no', 'no': 'yes'})

    df.to_csv('FinalAlldataset2.csv', index=False,
              columns=['age','gender','diagnosis','medicine','allergies','chronic conditions','improved'])
    return df

# Example usage
df = generate_dataset()
print(f"▶ Generated dataset shape: {df.shape}")
import pandas as pd
import numpy as np

# 1. Base diagnoses
base_mapping = {
    'Hypertension'       : ['Lisinopril','Amlodipine','Hydrochlorothiazide'],
    'Type 2 Diabetes'    : ['Metformin','Insulin'],
    'Bacterial Infection': ['Amoxicillin','Azithromycin'],
    'Asthma'             : ['Albuterol','Fluticasone'],
    'Hyperlipidemia'     : ['Atorvastatin','Simvastatin'],
    'Heart Failure'      : ['Furosemide','Carvedilol'],
    'GERD'               : ['Omeprazole','Pantoprazole'],
    'Hypothyroidism'     : ['Levothyroxine']
}

def composite_diagnosis(orig_diag, age, hba1c, bac_sev, asthma_sev, ldl, ef, episodes):
    """Embed severity thresholds into the diagnosis string."""
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

def assign_medicine(comp_diag, allergy):
    """
    Pick the correct medicine based only on the composite diagnosis string
    and the allergy field.
    """
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

# 2. Generate 5,000 records
np.random.seed(42)
n = 15000
base_diags    = list(base_mapping.keys())
genders       = ['Male', 'Female']
allergy_types = ['None','Penicillin','Sulfa','Statins','NSAIDs']
chronic_pool  = ['None','CKD','COPD','CAD','Obesity','Liver Disease']

rows = []
for _ in range(n):
    orig = np.random.choice(base_diags)
    age  = int(np.clip(np.random.normal(50,20),0,90))

    # hidden features for composite
    hba1c     = np.round(np.random.uniform(6.5,10),1) if orig=='Type 2 Diabetes'    else 0
    bac_sev   = np.random.choice([0,1])               if orig=='Bacterial Infection' else 0
    asthma_sev= np.random.choice([0,1])               if orig=='Asthma'             else 0
    ldl       = int(np.random.uniform(70,200))        if orig=='Hyperlipidemia'     else 0
    ef        = np.round(np.random.uniform(20,65),1)  if orig=='Heart Failure'      else 0
    episodes  = np.random.randint(1,8)                if orig=='GERD'               else 0

    allergy            = np.random.choice(allergy_types, p=[0.80,0.08,0.04,0.04,0.04])
    chronic_condition  = np.random.choice(chronic_pool,  p=[0.50,0.10,0.10,0.10,0.10,0.10])

    comp_diag = composite_diagnosis(orig, age, hba1c, bac_sev, asthma_sev, ldl, ef, episodes)
    medicine  = assign_medicine(comp_diag, allergy)

    rows.append({
        'age'               : age,
        'gender'            : np.random.choice(genders),
        'diagnosis'         : comp_diag,
        'medicine'          : medicine,
        'allergies'         : allergy,
        'chronic conditions': chronic_condition
    })

df = pd.DataFrame(rows)

# 3. Inject minimal label noise – reduced to 5%
noise_rate = 0.05
flip_idx   = df.sample(frac=noise_rate, random_state=42).index
for i in flip_idx:
    diag = df.at[i,'diagnosis'].split('_')[0]  # base diag
    alts = [m for m in base_mapping[diag] if m != df.at[i,'medicine']]
    if alts:
        df.at[i,'medicine'] = np.random.choice(alts)

# 4. Write out ONLY the six columns
df.to_csv('FinalAlldataset.csv', index=False, columns=[
    'age','gender','diagnosis','medicine','allergies','chronic conditions'
])
print("▶ FinalAlldataset.csv written with columns:", [
    'age','gender','diagnosis','medicine','allergies','chronic conditions'
])

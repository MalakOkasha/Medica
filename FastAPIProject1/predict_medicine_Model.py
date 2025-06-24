import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# 1. Load the 6-column CSV
df = pd.read_csv('FinalAlldataset.csv')
df = df[df['medicine'] != 'Azithromycin'].reset_index(drop=True)

df['allergies'] = df['allergies'].fillna('None')
df['chronic conditions'] = df['chronic conditions'].fillna('None')

# 2. Encode categorical inputs
le_gender   = LabelEncoder().fit(df['gender'])
le_diag     = LabelEncoder().fit(df['diagnosis'])
le_allergy  = LabelEncoder().fit(df['allergies'])
le_chronic  = LabelEncoder().fit(df['chronic conditions'])
le_med      = LabelEncoder().fit(df['medicine'])


# Re-fit the medicine encoder on the **filtered** data
le_med = LabelEncoder().fit(df['medicine'])

# Now build X, y
X = pd.DataFrame({
    'age'         : df['age'],
    'gender_enc'  : le_gender.transform(df['gender']),
    'diag_enc'    : le_diag.transform(df['diagnosis']),
    'allergy_enc' : le_allergy.transform(df['allergies']),
    'chronic_enc' : le_chronic.transform(df['chronic conditions'])
})
y = le_med.transform(df['medicine'])  # now yields 0…n_classes-1 contiguously


# 3. Train/test split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Train XGBoost
model = XGBClassifier(
    eval_metric='mlogloss',
    n_estimators=20,
    max_depth=2,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)
import joblib

# … after model.fit(X_train, y_train):

# 5a. Serialize model + encoders
joblib.dump(model, 'predict_medicine_model.pkl')
joblib.dump({
    'le_gender':   le_gender,
    'le_diag':     le_diag,
    'le_allergy':  le_allergy,
    'le_chronic':  le_chronic,
    'le_med':      le_med
}, 'predict_medicine_encoders.pkl')

print("✅ Saved model to predict_medicine_model.pkl and encoders to predict_medicine_encoders.pkl")


# 5. Evaluate
y_pred = model.predict(X_test)
print(f"Overall Accuracy: {accuracy_score(y_test, y_pred):.2f}\n")
print("Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_med.classes_))

# 6. Confusion Matrix Heatmap
cm = confusion_matrix(y_test, y_pred)
classes = le_med.classes_

plt.figure(figsize=(10,8))
plt.imshow(cm, interpolation='nearest')
plt.title('Confusion Matrix Heatmap')
plt.colorbar()
ticks = np.arange(len(classes))
plt.xticks(ticks, classes, rotation=90)
plt.yticks(ticks, classes)
plt.xlabel('Predicted')
plt.ylabel('True')

th = cm.max()/2
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, cm[i, j],
                 ha='center', va='center',
                 color='white' if cm[i, j] > th else 'black')

plt.tight_layout()
plt.show()

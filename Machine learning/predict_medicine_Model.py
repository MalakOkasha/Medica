# import pandas as pd
# import numpy as np
# import matplotlib.pyplot as plt
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import LabelEncoder
# from xgboost import XGBClassifier
# from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
#
# # 1. Load the 6-column CSV
# df = pd.read_csv('FinalAlldataset.csv')
# df = df[df['medicine'] != 'Azithromycin'].reset_index(drop=True)
#
# df['allergies'] = df['allergies'].fillna('None')
# df['chronic conditions'] = df['chronic conditions'].fillna('None')
#
# # 2. Encode categorical inputs
# le_gender   = LabelEncoder().fit(df['gender'])
# le_diag     = LabelEncoder().fit(df['diagnosis'])
# le_allergy  = LabelEncoder().fit(df['allergies'])
# le_chronic  = LabelEncoder().fit(df['chronic conditions'])
# le_med      = LabelEncoder().fit(df['medicine'])
#
#
# # Re-fit the medicine encoder on the **filtered** data
# le_med = LabelEncoder().fit(df['medicine'])
#
# # Now build X, y
# X = pd.DataFrame({
#     'age'         : df['age'],
#     'gender_enc'  : le_gender.transform(df['gender']),
#     'diag_enc'    : le_diag.transform(df['diagnosis']),
#     'allergy_enc' : le_allergy.transform(df['allergies']),
#     'chronic_enc' : le_chronic.transform(df['chronic conditions'])
# })
# y = le_med.transform(df['medicine'])  # now yields 0…n_classes-1 contiguously
#
#
# # 3. Train/test split (80/20)
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.2, random_state=42, stratify=y
# )
#
# # 4. Train XGBoost
# model = XGBClassifier(
#     eval_metric='mlogloss',
#     n_estimators=20,
#     max_depth=2,
#     learning_rate=0.1,
#     random_state=42
# )
# model.fit(X_train, y_train)
# import joblib
#
# # … after model.fit(X_train, y_train):
#
# # 5a. Serialize model + encoders
# joblib.dump(model, 'predict_medicine_model.pkl')
# joblib.dump({
#     'le_gender':   le_gender,
#     'le_diag':     le_diag,
#     'le_allergy':  le_allergy,
#     'le_chronic':  le_chronic,
#     'le_med':      le_med
# }, 'predict_medicine_encoders.pkl')
#
# print("✅ Saved model to predict_medicine_model.pkl and encoders to predict_medicine_encoders.pkl")
#
#
# # 5. Evaluate
# y_pred = model.predict(X_test)
# print(f"Overall Accuracy: {accuracy_score(y_test, y_pred):.2f}\n")
# print("Classification Report:")
# print(classification_report(y_test, y_pred, target_names=le_med.classes_))
#
# # 6. Confusion Matrix Heatmap
# cm = confusion_matrix(y_test, y_pred)
# classes = le_med.classes_
#
# plt.figure(figsize=(10,8))
# plt.imshow(cm, interpolation='nearest')
# plt.title('Confusion Matrix Heatmap')
# plt.colorbar()
# ticks = np.arange(len(classes))
# plt.xticks(ticks, classes, rotation=90)
# plt.yticks(ticks, classes)
# plt.xlabel('Predicted')
# plt.ylabel('True')
#
# th = cm.max()/2
# for i in range(cm.shape[0]):
#     for j in range(cm.shape[1]):
#         plt.text(j, i, cm[i, j],
#                  ha='center', va='center',
#                  color='white' if cm[i, j] > th else 'black')
#
# plt.tight_layout()
# plt.show()
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from sklearn.metrics import accuracy_score, classification_report, precision_score, recall_score, confusion_matrix

# 1. Load the 6-column CSV
df = pd.read_csv('predict_medicine_Dataset.csv')
df = df[df['medicine'] != 'Azithromycin'].reset_index(drop=True)

df['allergies'] = df['allergies'].fillna('None')
df['chronic conditions'] = df['chronic conditions'].fillna('None')

# 2. Encode categorical inputs
le_gender = LabelEncoder().fit(df['gender'])
le_diag = LabelEncoder().fit(df['diagnosis'])
le_allergy = LabelEncoder().fit(df['allergies'])
le_chronic = LabelEncoder().fit(df['chronic conditions'])
le_med = LabelEncoder().fit(df['medicine'])

# Now build X, y
X = pd.DataFrame({
    'age': df['age'],
    'gender_enc': le_gender.transform(df['gender']),
    'diag_enc': le_diag.transform(df['diagnosis']),
    'allergy_enc': le_allergy.transform(df['allergies']),
    'chronic_enc': le_chronic.transform(df['chronic conditions'])
})
y = le_med.transform(df['medicine'])  # now yields 0…n_classes-1 contiguously

# 3. Train/test split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Train models and evaluate accuracy
models = {
    'XGBoost': XGBClassifier(eval_metric='mlogloss', n_estimators=20, max_depth=2, learning_rate=0.1, random_state=42),
    'LightGBM': LGBMClassifier(n_estimators=20, max_depth=2, learning_rate=0.1, random_state=42),
    'CatBoost': CatBoostClassifier(iterations=20, depth=2, learning_rate=0.1, random_state=42, verbose=0)
}

# Dictionary to store accuracy of each model
model_accuracies = {}

# Train and evaluate each model
for model_name, model in models.items():
    model.fit(X_train, y_train)

    # Make predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Calculate training and testing accuracy
    train_accuracy = accuracy_score(y_train, y_train_pred)
    test_accuracy = accuracy_score(y_test, y_test_pred)

    # Calculate precision and recall for the test set
    precision = precision_score(y_test, y_test_pred, average='weighted', zero_division=1)
    recall = recall_score(y_test, y_test_pred, average='weighted', zero_division=1)

    # Save the model's accuracy to the dictionary
    model_accuracies[model_name] = {
        'train_accuracy': round(train_accuracy, 3),
        'test_accuracy': round(test_accuracy, 3),
        'precision': round(precision, 3),
        'recall': round(recall, 3)
    }

    # Print detailed results
    print(f"--- {model_name} ---")
    print(f"Training Accuracy: {round(train_accuracy, 3)}")
    print(f"Testing Accuracy: {round(test_accuracy, 3)}")
    print(f"Precision (Weighted): {round(precision, 3)}")
    print(f"Recall (Weighted): {round(recall, 3)}")
    print("\nClassification Report (Test):")
    print(classification_report(y_test, y_test_pred, target_names=le_med.classes_))

# Find the model with the highest testing accuracy
best_model_name = max(model_accuracies, key=lambda x: model_accuracies[x]['test_accuracy'])
best_model_accuracy = model_accuracies[best_model_name]['test_accuracy']
print(f"\nThe model with the highest accuracy is: {best_model_name} with accuracy {best_model_accuracy:.3f}")

# 5. Confusion Matrix Heatmap for the best model
best_model_instance = models[best_model_name]
y_pred_best = best_model_instance.predict(X_test)
cm = confusion_matrix(y_test, y_pred_best)
classes = le_med.classes_

plt.figure(figsize=(10, 8))
plt.imshow(cm, interpolation='nearest')
plt.title(f'Confusion Matrix Heatmap for {best_model_name}')
plt.colorbar()
ticks = np.arange(len(classes))
plt.xticks(ticks, classes, rotation=90)
plt.yticks(ticks, classes)
plt.xlabel('Predicted')
plt.ylabel('True')

th = cm.max() / 2
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, cm[i, j],
                 ha='center', va='center',
                 color='white' if cm[i, j] > th else 'black')

plt.tight_layout()
plt.show()

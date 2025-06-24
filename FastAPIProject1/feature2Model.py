import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score, f1_score, \
    precision_score, recall_score
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, auc
import warnings


warnings.filterwarnings('ignore')

# Load the dataset
print("Loading dataset...")
df = pd.read_csv('')
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print("\nFirst few rows:")
print(df.head())

print(f"\nTarget distribution:")
print(df['improved'].value_counts(normalize=True))

# Preprocessing
print("\nPreprocessing data...")

# Separate features and target
X = df.drop('improved', axis=1)
y = df['improved']

# Encode categorical variables
label_encoders = {}
categorical_columns = ['gender', 'diagnosis', 'medicine', 'allergies', 'chronic conditions']

X_encoded = X.copy()
for col in categorical_columns:
    le = LabelEncoder()
    X_encoded[col] = le.fit_transform(X[col])
    label_encoders[col] = le

# Encode target variable
y_encoded = LabelEncoder().fit_transform(y)

print(f"Features after encoding: {list(X_encoded.columns)}")
print(f"Feature shapes: {X_encoded.shape}")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Scale features for SVM
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Training set size: {X_train.shape}")
print(f"Test set size: {X_test.shape}")

# Define models
models = {
    'XGBoost': xgb.XGBClassifier(random_state=42, eval_metric='logloss'),
    'Random Forest': RandomForestClassifier(random_state=42),
    'SVM': SVC(random_state=42, probability=True)
}

# Train and evaluate models
results = {}
trained_models = {}

print("\n" + "=" * 50)
print("TRAINING AND EVALUATING MODELS")
print("=" * 50)

for name, model in models.items():
    print(f"\n🔹 Training {name}...")

    # Use scaled data for SVM, original for tree-based models
    if name == 'SVM':
        X_train_use = X_train_scaled
        X_test_use = X_test_scaled
    else:
        X_train_use = X_train
        X_test_use = X_test

    # Train the model
    model.fit(X_train_use, y_train)
    trained_models[name] = model

    # Make predictions on test set
    y_pred = model.predict(X_test_use)
    y_pred_proba = model.predict_proba(X_test_use)[:, 1]

    # Make predictions on training set
    y_train_pred = model.predict(X_train_use)

    # Calculate test metrics
    accuracy_test = accuracy_score(y_test, y_pred)
    accuracy_train = accuracy_score(y_train, y_train_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    f1 = f1_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    # Cross-validation
    cv_scores = cross_val_score(model, X_train_use, y_train, cv=5, scoring='accuracy')

    results[name] = {
        'accuracy_test': accuracy_test,
        'accuracy_train': accuracy_train,
        'roc_auc': roc_auc,
        'f1_score': f1,
        'precision': precision,
        'recall': recall,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std(),
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

    print(f"✅ {name} Results:")
    print(f"   Training Accuracy: {accuracy_train:.4f}")
    print(f"   Test Accuracy: {accuracy_test:.4f}")
    print(f"   F1-Score: {f1:.4f}")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall: {recall:.4f}")
    print(f"   ROC-AUC: {roc_auc:.4f}")
    print(f"   CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# Detailed evaluation for each model
print("\n" + "=" * 50)
print("DETAILED MODEL EVALUATION")
print("=" * 50)

for name in models.keys():
    print(f"\n🔸 {name} Detailed Results:")
    print("-" * 30)
    print("Classification Report:")
    print(classification_report(y_test, results[name]['y_pred'],
                                target_names=['no improvement', 'improvement']))

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, results[name]['y_pred'])
    print(cm)

    # Create and display heatmap for confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['No Improvement', 'Improvement'],
                yticklabels=['No Improvement', 'Improvement'])
    plt.title(f'{name} - Confusion Matrix Heatmap')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()

    print(f"\n📊 {name} Summary Metrics:")
    print(f"   Training Accuracy: {results[name]['accuracy_train']:.4f}")
    print(f"   Test Accuracy: {results[name]['accuracy_test']:.4f}")
    print(f"   F1-Score: {results[name]['f1_score']:.4f}")
    print(f"   Precision: {results[name]['precision']:.4f}")
    print(f"   Recall: {results[name]['recall']:.4f}")
    print(f"   ROC-AUC: {results[name]['roc_auc']:.4f}")

# Feature importance for tree-based models
print("\n" + "=" * 50)
print("FEATURE IMPORTANCE")
print("=" * 50)

feature_names = list(X_encoded.columns)

for name in ['XGBoost', 'Random Forest']:
    print(f"\n🔸 {name} Feature Importance:")
    model = trained_models[name]
    if hasattr(model, 'feature_importances_'):
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)

        print(importance_df)

# Hyperparameter tuning for best model
print("\n" + "=" * 50)
print("HYPERPARAMETER TUNING")
print("=" * 50)

# Find best performing model
best_model_name = max(results.keys(), key=lambda x: results[x]['roc_auc'])
print(f"Best performing model: {best_model_name} (ROC-AUC: {results[best_model_name]['roc_auc']:.4f})")

# Hyperparameter tuning based on best model
if best_model_name == 'XGBoost':
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.01, 0.1, 0.2]
    }
    base_model = xgb.XGBClassifier(random_state=42, eval_metric='logloss')
    X_tune = X_train

elif best_model_name == 'Random Forest':
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    }
    base_model = RandomForestClassifier(random_state=42)
    X_tune = X_train

else:  # SVM
    param_grid = {
        'C': [0.1, 1, 10],
        'gamma': ['scale', 'auto'],
        'kernel': ['rbf', 'linear']
    }
    base_model = SVC(random_state=42, probability=True)
    X_tune = X_train_scaled

print(f"\nTuning hyperparameters for {best_model_name}...")
grid_search = GridSearchCV(base_model, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)

if best_model_name == 'SVM':
    grid_search.fit(X_train_scaled, y_train)
    X_test_final = X_test_scaled
else:
    grid_search.fit(X_train, y_train)
    X_test_final = X_test

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV ROC-AUC: {grid_search.best_score_:.4f}")

# Final model evaluation
final_model = grid_search.best_estimator_
y_pred_final = final_model.predict(X_test_final)
y_pred_proba_final = final_model.predict_proba(X_test_final)[:, 1]

# Training predictions for final model
if best_model_name == 'SVM':
    y_train_pred_final = final_model.predict(X_train_scaled)
else:
    y_train_pred_final = final_model.predict(X_train)

final_accuracy_test = accuracy_score(y_test, y_pred_final)
final_accuracy_train = accuracy_score(y_train, y_train_pred_final)
final_roc_auc = roc_auc_score(y_test, y_pred_proba_final)
final_f1 = f1_score(y_test, y_pred_final)
final_precision = precision_score(y_test, y_pred_final)
final_recall = recall_score(y_test, y_pred_final)

print(f"\nFinal tuned {best_model_name} Results:")
print(f"Training Accuracy: {final_accuracy_train:.4f}")
print(f"Test Accuracy: {final_accuracy_test:.4f}")
print(f"F1-Score: {final_f1:.4f}")
print(f"Precision: {final_precision:.4f}")
print(f"Recall: {final_recall:.4f}")
print(f"ROC-AUC: {final_roc_auc:.4f}")

# Final model confusion matrix heatmap
final_cm = confusion_matrix(y_test, y_pred_final)
plt.figure(figsize=(10, 8))
sns.heatmap(final_cm, annot=True, fmt='d', cmap='Greens',
            xticklabels=['No Improvement', 'Improvement'],
            yticklabels=['No Improvement', 'Improvement'])
plt.title(f'Final Tuned {best_model_name} - Confusion Matrix Heatmap')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.show()

# Summary comparison
print("\n" + "=" * 50)
print("FINAL MODEL COMPARISON SUMMARY")
print("=" * 50)

summary_df = pd.DataFrame({
    'Model': list(results.keys()),
    'Accuracy': [results[name]['accuracy'] for name in results.keys()],
    'ROC-AUC': [results[name]['roc_auc'] for name in results.keys()],
    'CV Accuracy': [results[name]['cv_mean'] for name in results.keys()],
    'CV Std': [results[name]['cv_std'] for name in results.keys()]
})

print(summary_df.round(4))

# Add tuned model results
print(f"\nTuned {best_model_name}:")
# print(f"Accuracy: {final_accuracy:.4f}")
print(f"ROC-AUC: {final_roc_auc:.4f}")

print("\n🎯 RECOMMENDATIONS:")
print(f"• Best base model: {best_model_name}")
print(f"• After tuning, {best_model_name} achieved {final_roc_auc:.4f} ROC-AUC")
if final_roc_auc > results[best_model_name]['roc_auc']:
    improvement = final_roc_auc - results[best_model_name]['roc_auc']
    print(f"• Hyperparameter tuning improved performance by {improvement:.4f}")
else:
    print("• Hyperparameter tuning did not significantly improve performance")

# Sample predictions
print("\n" + "=" * 50)
print("SAMPLE PREDICTIONS")
print("=" * 50)

sample_indices = np.random.choice(len(X_test), 5, replace=False)
for i in sample_indices:
    actual = 'improvement' if y_test[i] == 1 else 'no improvement'
    predicted = 'improvement' if y_pred_final[i] == 1 else 'no improvement'
    probability = y_pred_proba_final[i]

    print(f"\nSample {i + 1}:")
    print(f"  Actual: {actual}")
    print(f"  Predicted: {predicted}")
    print(f"  Probability of improvement: {probability:.3f}")

# Save the best model and preprocessing components
print("\n" + "=" * 50)
print("SAVING BEST MODEL")
print("=" * 50)

import joblib
import pickle
from datetime import datetime

# Create timestamp for unique filenames
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# Save the best tuned model
model_filename = f'best_model_{best_model_name.lower().replace(" ", "_")}_{timestamp}.pkl'
joblib.dump(final_model, model_filename)
print(f"✅ Best model saved as: {model_filename}")

# Save label encoders for categorical variables
encoders_filename = f'label_encoders_{timestamp}.pkl'
with open(encoders_filename, 'wb') as f:
    pickle.dump(label_encoders, f)
print(f"✅ Label encoders saved as: {encoders_filename}")

# Save scaler (important for SVM)
scaler_filename = f'scaler_{timestamp}.pkl'
joblib.dump(scaler, scaler_filename)
print(f"✅ Scaler saved as: {scaler_filename}")

# Save target encoder
target_encoder = LabelEncoder()
target_encoder.fit(y)
target_encoder_filename = f'target_encoder_{timestamp}.pkl'
joblib.dump(target_encoder, target_encoder_filename)
print(f"✅ Target encoder saved as: {target_encoder_filename}")

# Save model metadata
metadata = {
    'model_name': best_model_name,
    'model_type': type(final_model).__name__,
    'best_parameters': grid_search.best_params_,
    #'final_accuracy': final_accuracy,
    'final_roc_auc': final_roc_auc,
    'feature_names': list(X_encoded.columns),
    'categorical_columns': categorical_columns,
    'training_date': timestamp,
    'dataset_shape': df.shape,
    'uses_scaling': best_model_name == 'SVM'
}

metadata_filename = f'model_metadata_{timestamp}.pkl'
with open(metadata_filename, 'wb') as f:
    pickle.dump(metadata, f)
print(f"✅ Model metadata saved as: {metadata_filename}")

print(f"\n📦 SAVED FILES:")
print(f"   🔹 Model: {model_filename}")
print(f"   🔹 Label Encoders: {encoders_filename}")
print(f"   🔹 Scaler: {scaler_filename}")
print(f"   🔹 Target Encoder: {target_encoder_filename}")
print(f"   🔹 Metadata: {metadata_filename}")

# Create a prediction function example
print("\n" + "=" * 50)
print("PREDICTION FUNCTION EXAMPLE")
print("=" * 50)

prediction_code = f'''
# Example code to load and use the saved model for predictions

import joblib
import pickle
import pandas as pd
import numpy as np

# Load all components
model = joblib.load('{model_filename}')
with open('{encoders_filename}', 'rb') as f:
    label_encoders = pickle.load(f)
scaler = joblib.load('{scaler_filename}')
target_encoder = joblib.load('{target_encoder_filename}')
with open('{metadata_filename}', 'rb') as f:
    metadata = pickle.load(f)

def predict_improvement(age, gender, diagnosis, medicine, allergies, chronic_conditions):
    """
    Predict improvement probability for a patient

    Parameters:
    - age: int (patient age)
    - gender: str ('Male' or 'Female')
    - diagnosis: str (diagnosis category)
    - medicine: str (prescribed medicine)
    - allergies: str (allergy type)
    - chronic_conditions: str (chronic condition)

    Returns:
    - improvement_probability: float (0-1)
    - prediction: str ('yes' or 'no')
    """

    # Create input dataframe
    input_data = pd.DataFrame({{
        'age': [age],
        'gender': [gender],
        'diagnosis': [diagnosis],
        'medicine': [medicine],
        'allergies': [allergies],
        'chronic conditions': [chronic_conditions]
    }})

    # Encode categorical variables
    input_encoded = input_data.copy()
    for col in metadata['categorical_columns']:
        if col in label_encoders:
            input_encoded[col] = label_encoders[col].transform(input_data[col])

    # Scale if needed (for SVM)
    if metadata['uses_scaling']:
        input_scaled = scaler.transform(input_encoded)
        prediction_proba = model.predict_proba(input_scaled)[0, 1]
        prediction_class = model.predict(input_scaled)[0]
    else:
        prediction_proba = model.predict_proba(input_encoded)[0, 1]
        prediction_class = model.predict(input_encoded)[0]

    # Convert back to original labels
    prediction_label = target_encoder.inverse_transform([prediction_class])[0]

    return prediction_proba, prediction_label

# Example usage:
# prob, pred = predict_improvement(45, 'Female', 'Hypertension_51-70', 'Amlodipine', 'None', 'None')
# print(f"Improvement probability: {{prob:.3f}}")
# print(f"Prediction: {{pred}}")
'''

print("Code to use the saved model:")
print(prediction_code)

print("\n🎉 MODEL TRAINING AND SAVING COMPLETE!")
print(f"Best model: {best_model_name} with ROC-AUC: {final_roc_auc:.4f}")
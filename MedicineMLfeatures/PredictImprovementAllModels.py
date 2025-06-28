import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb
import lightgbm as lgb
import catboost as cb
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
import seaborn as sns
import matplotlib.pyplot as plt
import pickle  # Import pickle for saving/loading the model

# Step 1: Load the existing dataset
def load_existing_dataset(file_path):
    print(f"Loading dataset from {file_path}...")
    df = pd.read_csv(file_path)
    print(f"Loaded dataset shape: {df.shape}")
    return df


# Step 2: Data preprocessing
def preprocess_data(df, encoders=None, scaler=None):
    print("Starting data preprocessing...")
    df_processed = df.copy()

    # Fill 'None' for missing values in specific columns (except 'age', 'gender', 'diagnosis', 'medicine', 'smoking', 'severity')
    cols_to_fillna = list(set(df_processed.columns) - {"age", "gender", "diagnosis", "medicine", "smoking", "severity"})
    df_processed[cols_to_fillna] = df_processed[cols_to_fillna].fillna("None")

    # Dropping unwanted features
    print("Dropping unwanted features...")
    df_processed.drop(
        columns=['exercise_frequency', 'medication_adherence', 'risk_score', 'health_score',
                 'age_severity_interaction'],
        errors='ignore', inplace=True
    )

    print("One-hot encoding categorical variables...")
    # Initialize encoders dictionary
    if encoders is None:
        encoders = {}

    # For each categorical column, apply LabelEncoder
    categorical_cols = ['gender', 'diagnosis', 'allergies', 'chronic_conditions', 'medicine']
    for col in categorical_cols:
        le = encoders.get(col, None)
        if le is None:
            le = LabelEncoder()
            df_processed[col] = df_processed[col].fillna('None')  # Handle missing values here if necessary
            df_processed[col] = le.fit_transform(df_processed[col])
            encoders[col] = le  # Store the encoder for later use

    print("Binning continuous variable (age)...")
    df_processed['age_group'] = pd.cut(df_processed['age'], bins=[0, 30, 50, 70, 100], labels=[0, 1, 2, 3],
                                       include_lowest=True).astype(int)

    # Convert all numeric columns to numeric types
    numeric_cols = [
        "Blood_Pressure_Systolic_BP", "HbA1c", "LDL_Cholesterol", "BNP", "Endoscopy_Result", "TSH"
    ]

    for col in numeric_cols:
        df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')  # Convert to numeric, coerce errors to NaN

    # Handle missing values for numeric columns by filling with the mean
    df_processed[numeric_cols] = df_processed[numeric_cols].fillna(df_processed[numeric_cols].mean())

    X = df_processed.drop('Improved', axis=1)
    y = df_processed['Improved']

    print("Scaling numerical feature (age)...")
    if scaler is None:
        scaler = StandardScaler()
        X['age'] = scaler.fit_transform(X[['age']])  # Scale only 'age' feature if it's present
    else:
        X['age'] = scaler.transform(X[['age']])  # Use the existing scaler for predictions

    print(f"Preprocessed data shape: {X.shape} with target distribution: {np.bincount(y)}")

    return X, y, encoders, scaler


# Step 3: Train and evaluate multiple models (XGBoost, CatBoost, LightGBM, RandomForest)
def train_and_evaluate_models(X_train, y_train, X_test, y_test):
    models = {
        'XGBoost': xgb.XGBClassifier(objective='binary:logistic', eval_metric='logloss', random_state=42,
                                     tree_method='hist'),
        'CatBoost': cb.CatBoostClassifier(learning_rate=0.1, iterations=1000, depth=6, random_state=42, verbose=0),
        'LightGBM': lgb.LGBMClassifier(learning_rate=0.1, num_leaves=31, objective='binary', random_state=42),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42)
    }

    best_model = None
    best_accuracy = 0
    best_model_name = ""

    for model_name, model in models.items():
        print(f"\nTraining {model_name} model...")
        model.fit(X_train, y_train)

        print(f"Evaluating {model_name} model...")
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"{model_name} Test set accuracy: {acc * 100:.2f}%")

        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_model_name = model_name

    print(f"\nBest model: {best_model_name} with accuracy: {best_accuracy * 100:.2f}%")
    return best_model, best_accuracy


# Feature importance visualization
def plot_feature_importance(model, X_train):
    # Depending on the model, we can retrieve feature importances
    if isinstance(model, (xgb.XGBClassifier, lgb.LGBMClassifier, cb.CatBoostClassifier)):
        importances = model.feature_importances_
    else:
        raise ValueError("Unsupported model type for feature importance")

    # Plot feature importance
    plt.figure(figsize=(10, 6))
    plt.barh(range(len(importances)), importances)
    plt.yticks(range(len(importances)), X_train.columns)  # X_train.columns gives feature names
    plt.xlabel('Importance')
    plt.title('Feature Importance')
    plt.show()


# Heatmap visualization for confusion matrix
def plot_confusion_matrix_heatmap(cm):
    plt.figure(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["Not Improved (0)", "Improved (1)"],
                yticklabels=["Not Improved (0)", "Improved (1)"])
    plt.title("Confusion Matrix Heatmap")
    plt.xlabel("Predicted Labels")
    plt.ylabel("True Labels")
    plt.show()


# Save model as Feature2Model using pickle
def save_model(model, encoders, scaler, filename='PredictImprovementBestModel.pkl'):
    print(f"Saving the model to {filename}...")
    with open(filename, 'wb') as file:
        pickle.dump(model, file)
    # Save encoders and scaler as well
    with open('PredictImprovementEncoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    with open('PredictImprovementScaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    print(f"Model saved to {filename}")


# Main execution
def main():
    file_path = 'PredictImprovementDataset.csv'  # Specify the path to the dataset generated by the generator
    df = load_existing_dataset(file_path)

    # Preprocess data
    print("Preprocessing dataset...")
    X, y, encoders, scaler = preprocess_data(df)

    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    print(f"Train set: {X_train.shape}, Test set: {X_test.shape}")

    # Train and evaluate models
    print("\nTraining and evaluating models...")
    best_model, best_accuracy = train_and_evaluate_models(X_train, y_train, X_test, y_test)

    # Confusion matrix for the best model
    print("\nGenerating confusion matrix for the best model...")
    y_pred = best_model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion matrix:")
    print(cm)

    # Plotting confusion matrix heatmap
    print("\nPlotting confusion matrix heatmap...")
    plot_confusion_matrix_heatmap(cm)

    # Feature importance visualization
    print("\nPlotting feature importance...")
    plot_feature_importance(best_model, X_train)

    # Save the best model
    save_model(best_model, encoders, scaler, 'PredictImprovementBestModel.pkl')

    # Accuracy of the best model
    print(f"\nFinal best model accuracy: {best_accuracy * 100:.2f}%")


if __name__ == "__main__":
    main()

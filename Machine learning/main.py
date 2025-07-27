from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
from typing import Optional
from sklearn.preprocessing import LabelEncoder, StandardScaler
from contextlib import asynccontextmanager

# Globals for medication predictor
med_model: any
med_encoders: dict[str, LabelEncoder]
le_gender: LabelEncoder
le_diag: LabelEncoder
le_allergy: LabelEncoder
le_chronic: LabelEncoder
le_med: LabelEncoder

# Globals for improvement model
impr_model: any
impr_encoders: dict[str, LabelEncoder]
impr_scaler: StandardScaler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load all models and encoders at application startup.
    """
    global med_model, med_encoders, le_gender, le_diag, le_allergy, le_chronic, le_med
    global impr_model, impr_encoders, impr_scaler

    # Medication artifacts
    med_model = joblib.load("predict_medicine_model.pkl")
    med_encoders = joblib.load("predict_medicine_encoders.pkl")
    le_gender = med_encoders.get("le_gender")
    le_diag = med_encoders.get("le_diag")
    le_allergy = med_encoders.get("le_allergy")
    le_chronic = med_encoders.get("le_chronic")
    le_med = med_encoders.get("le_med")

    # Improvement artifacts
    impr_model = joblib.load("PredictImprovementBestModel.pkl")
    impr_encoders = joblib.load("PredictImprovementEncoders.pkl")
    impr_scaler = joblib.load("PredictImprovementScaler.pkl")

    yield

def preprocess_data(df, encoders, scaler):
    categorical_cols = ['gender', 'diagnosis', 'allergies', 'chronic_conditions', 'medicine']
    for col in categorical_cols:
        le = encoders.get(col, None)
        if le is not None:
            df[col] = df[col].fillna('None')
            df[col] = le.transform(df[col])

    numeric_cols = ["Blood_Pressure_Systolic_BP", "HbA1c", "LDL_Cholesterol", "BNP", "Endoscopy_Result", "TSH"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].mean())

    df['age_group'] = pd.cut(df['age'], bins=[0, 30, 50, 70, 100], labels=[0, 1, 2, 3], include_lowest=True).astype(int)
    if 'age' in df.columns:
        df['age'] = scaler.transform(df[['age']])

    return df

class MedicationRequest(BaseModel):
    age: Optional[int] = Field(None, example=55)
    gender: Optional[str] = Field(None, example="Male")
    diagnosis: Optional[str] = Field(None, example="asthma")
    allergies: Optional[str] = Field(None, example="none")
    chronic_conditions: Optional[str] = Field(None, example="COPD")

def _handle_none_values(patient: MedicationRequest):
    """
    Fill missing fields with default values.
    """
    age = patient.age if patient.age is not None else 0
    gender = patient.gender if patient.gender is not None else "Unknown"
    diagnosis = patient.diagnosis if patient.diagnosis is not None else "Unknown"
    allergies = patient.allergies if patient.allergies is not None else "None"
    chronic = patient.chronic_conditions if patient.chronic_conditions is not None else "None"
    return age, gender, diagnosis, allergies, chronic

# FastAPI instance
app = FastAPI(
    title="Medica Prediction APIs",
    version="1.0.0",
    description="Endpoints for improvement prediction and medication recommendation.",
    lifespan=lifespan
)

# Medication prediction endpoint
@app.post("/predict", summary="Predict medication", response_model=dict)
def predict_medication(req: MedicationRequest):
    age, gender, diagnosis, allergies, chronic = _handle_none_values(req)
    try:
        g = le_gender.transform([gender])[0]
        d = le_diag.transform([diagnosis])[0]
        a = le_allergy.transform([allergies])[0]
        c = le_chronic.transform([chronic])[0]
        x = np.array([[age, g, d, a, c]])
        idx = med_model.predict(x)[0]
        med = le_med.inverse_transform([idx])[0]
        return {"medicine": med}
    except ValueError as e:
        raise HTTPException(400, detail=f"Encoding error: {e}")
    except Exception as e:
        raise HTTPException(500, detail=f"Prediction error: {e}")

# Improvement prediction endpoint
@app.post("/predictImprovement", summary="Predict improvement", response_model=dict)
async def predict_improvement(data: dict):
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame([data])

        # Preprocess the dataset using the saved encoders and scaler
        df_processed = preprocess_data(df, impr_encoders, impr_scaler)

        # Prepare the features for prediction (drop target variable 'Improved' if present)
        X = df_processed.drop('Improved', axis=1, errors='ignore')

        # Perform model prediction (get the class label)
        y_pred = impr_model.predict(X)  # This will give the predicted class (0 or 1)

        # Get the probability of class 1 (Improved) from the model
        prob = impr_model.predict_proba(X)[:, 1]  # Probability of class 1 (Improved)

        # Map the predictions (1 -> "Improved", 0 -> "Not Improved")
        prediction = "Improved" if y_pred[0] == 1 else "Not Improved"

        return JSONResponse(content={
            "prediction": prediction,  # Return the model's predicted label ("Improved" or "Not Improved")
            "improvement_probability": prob[0],  # Return the probability of improvement (class 1)
            "message": "Prediction completed successfully"
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# API status endpoint
@app.get("/", summary="API status")
def status():
    return {"status": "ok", "improvement_model_loaded": True, "medication_model_loaded": True}

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Note the reference to 'main:app' now that the file is named 'main.py'
        host="127.0.0.1",
        port=8083,
        reload=True
    )

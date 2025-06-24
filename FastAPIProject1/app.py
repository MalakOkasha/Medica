from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
from typing import Literal, Optional
from catboost import CatBoostClassifier
from sklearn.preprocessing import LabelEncoder
from contextlib import asynccontextmanager


# Globals for improvement model
model: any
impr_encoders: dict[str, LabelEncoder]
target_encoder: LabelEncoder
feature_columns: list[str]
categorical_cols: list[str]

# Globals for medication predictor
med_model: any
med_encoders: dict[str, LabelEncoder]
le_gender: LabelEncoder
le_diag: LabelEncoder
le_allergy: LabelEncoder
le_chronic: LabelEncoder
le_med: LabelEncoder

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load all models and encoders at application startup.
    """
    global model, impr_encoders, target_encoder, feature_columns, categorical_cols
    global med_model, med_encoders, le_gender, le_diag, le_allergy, le_chronic, le_med

    # Improvement artifacts
    model = joblib.load("predict_improvement_model.pkl")
    impr_encoders = joblib.load("predict_improvement_encoders.pkl")
    target_encoder = joblib.load("predict_improvement_target.pkl")
    feature_columns = [
        "age",
        "gender",
        "diagnosis",
        "medicine",
        "allergies",
        "chronic conditions",
        "severity_score"
    ]
    categorical_cols = [
        "gender",
        "diagnosis",
        "medicine",
        "allergies",
        "chronic conditions"
    ]
    # Medication artifacts
    med_model = joblib.load("predict_medicine_model.pkl")
    med_encoders = joblib.load("predict_medicine_encoders.pkl")
    le_gender = med_encoders.get("le_gender")
    le_diag = med_encoders.get("le_diag")
    le_allergy = med_encoders.get("le_allergy")
    le_chronic = med_encoders.get("le_chronic")
    le_med = med_encoders.get("le_med")

    yield

app = FastAPI(
    title="Medica Prediction APIs",
    version="1.0.0",
    description="Endpoints for improvement prediction and medication recommendation.",
    lifespan=lifespan
)

class ImprovementRequest(BaseModel):
    age: int = Field(..., example=55)
    gender: Literal["Male", "Female"] = Field(..., example="Female")
    diagnosis: str = Field(..., example="diabetes")
    medicine: str = Field(..., example="metformin")
    allergies: str = Field(..., example="none")
    chronic_conditions: str = Field(..., example="hypertension")
    severity_score: float = Field(..., example=4.67)

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

@app.post("/predict_improvement", summary="Predict improvement", response_model=dict)
def predict_improvement(req: ImprovementRequest):
    # Prepare DataFrame
    data = pd.DataFrame([req.dict()])
    data = data.rename(columns={"chronic_conditions": "chronic conditions"})

    missing = set(feature_columns) - set(data.columns)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing features: {missing}")

    for col in categorical_cols:
        le = impr_encoders.get(col)
        if not le:
            raise HTTPException(500, detail=f"No encoder for column '{col}'")
        try:
            data[col] = le.transform(data[col])
        except ValueError as e:
            allowed = list(le.classes_)
            val = data.at[0, col]
            raise HTTPException(400, detail=f"Invalid category for '{col}': '{val}'. Allowed: {allowed}")

    X = data[feature_columns].to_numpy()
    proba = model.predict_proba(X)[0, 1]
    enc = model.predict(X)[0]
    pred = target_encoder.inverse_transform([enc])[0]
    return {"predicted_class": pred, "probability_improved": float(proba)}

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

@app.get("/", summary="API status")
def status():
    return {"status": "ok", "improvement_model_loaded": True, "medication_model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8080,
        reload=True
    )
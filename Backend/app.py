from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib


# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="Used Car Price Prediction API",
    description="ML API for predicting used car prices",
    version="1.0"
)


# ==========================================
# ENABLE CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# LOAD NEW FINAL ML MODEL
# ==========================================

model = joblib.load(
    "../Model/final_model.pkl"
)

feature_columns = joblib.load(
    "../Model/feature_columns.pkl"
)


# ==========================================
# INPUT DATA MODEL
# ==========================================

class CarDetails(BaseModel):

    Brand: str
    Model: str
    Year: int
    KM_Driven: float
    Fuel: str
    Seller_Type: str
    Transmission: str
    Owner: str


# ==========================================
# HOME API
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Used Car Price Prediction API is running!"
    }


# ==========================================
# PREDICTION API
# ==========================================

@app.post("/predict")
def predict_price(car: CarDetails):

    # ==========================================
    # CREATE INPUT DATAFRAME
    # ==========================================

    input_data = pd.DataFrame({

        "Brand": [car.Brand],

        "Model": [car.Model],

        "Year": [car.Year],

        "KM_Driven": [car.KM_Driven],

        "Fuel": [car.Fuel],

        "Seller_Type": [car.Seller_Type],

        "Transmission": [car.Transmission],

        "Owner": [car.Owner]
    })


    # ==========================================
    # ONE-HOT ENCODING
    # ==========================================

    categorical_features = [
        "Brand",
        "Model",
        "Fuel",
        "Seller_Type",
        "Transmission",
        "Owner"
    ]

    input_encoded = pd.get_dummies(
        input_data,
        columns=categorical_features,
        drop_first=True
    )


    # ==========================================
    # MATCH TRAINING FEATURES
    # ==========================================

    input_encoded = input_encoded.reindex(
        columns=feature_columns,
        fill_value=0
    )


    # Convert True/False to 0/1 if required
    input_encoded = input_encoded.astype(int)


    # ==========================================
    # PREDICT PRICE
    # ==========================================

    prediction = model.predict(input_encoded)[0]


    # ==========================================
    # RETURN RESULT
    # ==========================================

    return {

        "predicted_price": round(float(prediction), 2),

        "currency": "INR"
    }
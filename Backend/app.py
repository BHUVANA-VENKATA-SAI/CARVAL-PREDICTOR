from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from datetime import datetime


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
# LOAD ML MODEL
# ==========================================

model = joblib.load(
    "../Model/used_car_price_model.pkl"
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

    # Current year
    current_year = datetime.now().year

    # Feature engineering
    car_age = current_year - car.Year

    if car_age <= 0:
        car_age = 1

    km_per_year = car.KM_Driven / car_age

    # Create DataFrame
    input_data = pd.DataFrame({

        "Brand": [car.Brand],

        "Model": [car.Model],

        "Year": [car.Year],

        "KM_Driven": [car.KM_Driven],

        "Fuel": [car.Fuel],

        "Seller_Type": [car.Seller_Type],

        "Transmission": [car.Transmission],

        "Owner": [car.Owner],

        "Car_Age": [car_age],

        "KM_per_Year": [km_per_year]
    })


    # Predict
    prediction = model.predict(input_data)[0]


    return {

        "predicted_price": round(float(prediction), 2),

        "currency": "INR",

        "car_age": car_age,

        "km_per_year": round(km_per_year, 2)
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os


# =========================================================
# BASE DIRECTORY
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# =========================================================
# PROJECT PATHS
# =========================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "Model",
    "final_model.pkl"
)

FEATURE_COLUMNS_PATH = os.path.join(
    BASE_DIR,
    "..",
    "Model",
    "feature_columns.pkl"
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "Dataset",
    "Car Price.csv"
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Used Car Price Prediction API",
    description="ML API for predicting used car prices",
    version="1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# LOAD TRAINED MODEL
# =========================================================

model = joblib.load(
    MODEL_PATH
)


# =========================================================
# LOAD FEATURE COLUMNS
# =========================================================

feature_columns = joblib.load(
    FEATURE_COLUMNS_PATH
)


# =========================================================
# INPUT DATA MODEL
# =========================================================

class CarDetails(BaseModel):

    Brand: str

    Model: str

    Year: int

    KM_Driven: float

    Fuel: str

    Seller_Type: str

    Transmission: str

    Owner: str


# =========================================================
# HOME API
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Used Car Price Prediction API is running!",
        "status": "success"
    }


# =========================================================
# COMPANY + MODEL API
# =========================================================

@app.get("/cars")
def get_cars():

    try:

        # -------------------------------------------------
        # CHECK DATASET
        # -------------------------------------------------

        if not os.path.exists(DATASET_PATH):

            return {
                "error": "Car Price.csv not found",
                "dataset_path": DATASET_PATH
            }


        # -------------------------------------------------
        # LOAD DATASET
        # -------------------------------------------------

        df = pd.read_csv(
            DATASET_PATH
        )


        # -------------------------------------------------
        # CHECK REQUIRED COLUMNS
        # -------------------------------------------------

        if "Brand" not in df.columns:

            return {
                "error": "Brand column not found in dataset"
            }


        if "Model" not in df.columns:

            return {
                "error": "Model column not found in dataset"
            }


        # -------------------------------------------------
        # GET BRAND + MODEL
        # -------------------------------------------------

        cars = df[
            [
                "Brand",
                "Model"
            ]
        ].dropna()


        # -------------------------------------------------
        # REMOVE DUPLICATES
        # -------------------------------------------------

        cars = cars.drop_duplicates()


        # -------------------------------------------------
        # SORT DATA
        # -------------------------------------------------

        cars = cars.sort_values(
            by=[
                "Brand",
                "Model"
            ]
        )


        # -------------------------------------------------
        # CONVERT TO JSON
        # -------------------------------------------------

        result = cars.to_dict(
            orient="records"
        )


        return result


    except Exception as e:

        return {
            "error": str(e)
        }


# =========================================================
# PREDICTION API
# =========================================================

@app.post("/predict")
def predict_price(
    car: CarDetails
):

    try:

        # -------------------------------------------------
        # CREATE INPUT DATAFRAME
        # -------------------------------------------------

        input_data = pd.DataFrame({

            "Brand": [
                car.Brand
            ],

            "Model": [
                car.Model
            ],

            "Year": [
                car.Year
            ],

            "KM_Driven": [
                car.KM_Driven
            ],

            "Fuel": [
                car.Fuel
            ],

            "Seller_Type": [
                car.Seller_Type
            ],

            "Transmission": [
                car.Transmission
            ],

            "Owner": [
                car.Owner
            ]

        })


        # -------------------------------------------------
        # CATEGORICAL FEATURES
        # -------------------------------------------------

        categorical_features = [

            "Brand",

            "Model",

            "Fuel",

            "Seller_Type",

            "Transmission",

            "Owner"

        ]


        # -------------------------------------------------
        # ONE-HOT ENCODING
        # -------------------------------------------------

        input_encoded = pd.get_dummies(

            input_data,

            columns=categorical_features,

            drop_first=True

        )


        # -------------------------------------------------
        # MATCH TRAINING FEATURES
        # -------------------------------------------------

        input_encoded = input_encoded.reindex(

            columns=feature_columns,

            fill_value=0

        )


        # -------------------------------------------------
        # CONVERT DATA TYPE
        # -------------------------------------------------

        input_encoded = input_encoded.astype(
            int
        )


        # -------------------------------------------------
        # PREDICT
        # -------------------------------------------------

        prediction = model.predict(
            input_encoded
        )[0]


        # -------------------------------------------------
        # RETURN PREDICTION
        # -------------------------------------------------

        return {

            "predicted_price":
                round(
                    float(prediction),
                    2
                ),

            "currency":
                "INR"

        }


    except Exception as e:

        return {

            "error":
                str(e)

        }
import pandas as pd
import joblib
from datetime import datetime


# ==========================================
# LOAD FINAL MODEL
# ==========================================

model = joblib.load("../Model/used_car_price_model.pkl")

print("Final model loaded successfully!")


# ==========================================
# FUNCTION FOR PRICE PREDICTION
# ==========================================

def predict_car_price(
    brand,
    model_name,
    year,
    km_driven,
    fuel,
    seller_type,
    transmission,
    owner
):

    # Current year automatically
    current_year = datetime.now().year

    # Feature engineering
    car_age = current_year - year

    if car_age <= 0:
        car_age = 1

    km_per_year = km_driven / car_age

    # Create input DataFrame
    input_data = pd.DataFrame({
        "Brand": [brand],
        "Model": [model_name],
        "Year": [year],
        "KM_Driven": [km_driven],
        "Fuel": [fuel],
        "Seller_Type": [seller_type],
        "Transmission": [transmission],
        "Owner": [owner],
        "Car_Age": [car_age],
        "KM_per_Year": [km_per_year]
    })

    # Prediction
    prediction = model.predict(input_data)

    return prediction[0]


# ==========================================
# TEST PREDICTION
# ==========================================

price = predict_car_price(
    brand="Toyota",
    model_name="Toyota Corolla",
    year=2019,
    km_driven=45000,
    fuel="Diesel",
    seller_type="Individual",
    transmission="Manual",
    owner="First Owner"
)

print("\n====================================")
print("USED CAR PRICE PREDICTION")
print("====================================")

print("Predicted Price: ₹", round(price, 2))
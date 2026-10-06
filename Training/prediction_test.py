import pandas as pd
import joblib
from datetime import datetime


# Load model
model = joblib.load("../Model/used_car_price_model.pkl")

print("Model loaded successfully!")


# Current year
current_year = datetime.now().year


# New car details
car = {
    "Brand": "Maruti",
    "Model": "Maruti Swift",
    "Year": 2018,
    "KM_Driven": 45000,
    "Fuel": "Petrol",
    "Seller_Type": "Individual",
    "Transmission": "Manual",
    "Owner": "First Owner"
}


# Feature engineering
car_age = current_year - car["Year"]

if car_age <= 0:
    car_age = 1

km_per_year = car["KM_Driven"] / car_age


# Create input DataFrame
input_data = pd.DataFrame({
    "Brand": [car["Brand"]],
    "Model": [car["Model"]],
    "Year": [car["Year"]],
    "KM_Driven": [car["KM_Driven"]],
    "Fuel": [car["Fuel"]],
    "Seller_Type": [car["Seller_Type"]],
    "Transmission": [car["Transmission"]],
    "Owner": [car["Owner"]],
    "Car_Age": [car_age],
    "KM_per_Year": [km_per_year]
})


# Predict
predicted_price = model.predict(input_data)[0]


print("\n================================")
print("NEW CAR PRICE PREDICTION")
print("================================")

print("Brand:", car["Brand"])
print("Model:", car["Model"])
print("Year:", car["Year"])
print("KM Driven:", car["KM_Driven"])
print("Fuel:", car["Fuel"])
print("Transmission:", car["Transmission"])

print("\nPredicted Price: ₹", round(predicted_price, 2))
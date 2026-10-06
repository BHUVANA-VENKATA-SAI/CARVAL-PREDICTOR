import joblib

model = joblib.load("../Model/used_car_price_model.pkl")

print("Model loaded successfully!")
print("Model type:", type(model))
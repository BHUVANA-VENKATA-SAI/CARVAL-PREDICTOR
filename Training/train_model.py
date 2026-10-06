import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# ==========================================
# 1. LOAD DATASET
# ==========================================

data = pd.read_csv("../Dataset/Car Price.csv")

print("Dataset loaded successfully!")
print("Original shape:", data.shape)


# ==========================================
# 2. REMOVE MISSING VALUES
# ==========================================

data = data.dropna()

print("After cleaning:", data.shape)


# ==========================================
# 3. FEATURE ENGINEERING
# ==========================================

CURRENT_YEAR = 2026

data["Car_Age"] = CURRENT_YEAR - data["Year"]

# Avoid division by zero
data["KM_per_Year"] = data["KM_Driven"] / data["Car_Age"].replace(0, 1)


# ==========================================
# 4. FEATURES AND TARGET
# ==========================================

features = [
    "Brand",
    "Model",
    "Year",
    "KM_Driven",
    "Fuel",
    "Seller_Type",
    "Transmission",
    "Owner",
    "Car_Age",
    "KM_per_Year"
]

X = data[features]
y = data["Selling_Price"]


# ==========================================
# 5. CATEGORICAL FEATURES
# ==========================================

categorical_features = [
    "Brand",
    "Model",
    "Fuel",
    "Seller_Type",
    "Transmission",
    "Owner"
]

numerical_features = [
    "Year",
    "KM_Driven",
    "Car_Age",
    "KM_per_Year"
]


# ==========================================
# 6. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ==========================================
# 7. TRAIN-TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 8. DEFINE MODELS
# ==========================================

models = {

    "Linear Regression": LinearRegression(),

    "Decision Tree": DecisionTreeRegressor(
        random_state=42,
        max_depth=20
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )
}


# ==========================================
# 9. TRAIN & EVALUATE MODELS
# ==========================================

results = {}

trained_pipelines = {}

print("\n==========================================")
print("MODEL TRAINING")
print("==========================================")

for name, model in models.items():

    print(f"\nTraining {name}...")

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)

    mse = mean_squared_error(y_test, y_pred)

    rmse = np.sqrt(mse)

    r2 = r2_score(y_test, y_pred)

    results[name] = {
        "MAE": mae,
        "MSE": mse,
        "RMSE": rmse,
        "R2": r2
    }

    trained_pipelines[name] = pipeline

    print("Training completed!")


# ==========================================
# 10. DISPLAY RESULTS
# ==========================================

print("\n==========================================")
print("MODEL COMPARISON")
print("==========================================")

results_df = pd.DataFrame(results).T

print(
    results_df.round(2)
)


# ==========================================
# 11. FIND BEST MODEL
# ==========================================

best_model_name = results_df["R2"].idxmax()

best_model = trained_pipelines[best_model_name]

print("\n==========================================")
print("BEST MODEL")
print("==========================================")

print("Best Model:", best_model_name)

print(
    "Best R2 Score:",
    round(results_df.loc[best_model_name, "R2"], 4)
)


# ==========================================
# 12. SAVE BEST MODEL
# ==========================================

joblib.dump(
    best_model,
    "../Model/used_car_price_model.pkl"
)

print("\nBest model saved successfully!")

print(
    "Location: Model/used_car_price_model.pkl"
)


# ==========================================
# 13. SAVE MODEL RESULTS
# ==========================================

results_df.to_csv(
    "../Model/model_comparison.csv"
)

print(
    "Model comparison saved: Model/model_comparison.csv"
)


print("\n==========================================")
print("TRAINING COMPLETED SUCCESSFULLY!")
print("==========================================")
import numpy as np
import pandas as pd
import random

samples_per_class = 1000

low_data = []

for _ in range(samples_per_class):
    hr_dev = round(np.random.uniform(0.95, 1.07), 3)
    sleep = round(np.random.uniform(7, 9), 2)
    activity = round(np.random.uniform(20, 60), 1)

    low_data.append([hr_dev, sleep, activity, "LOW"])

moderate_data = []

for _ in range(samples_per_class):
    hr_dev = round(np.random.uniform(1.03, 1.12), 3)
    sleep = round(np.random.uniform(6, 7.5), 2)
    activity = round(np.random.uniform(30, 75), 1)

    moderate_data.append([hr_dev, sleep, activity, "MODERATE"])

high_data = []

for _ in range(samples_per_class):
    hr_dev = round(np.random.uniform(1.08, 1.25), 3)
    sleep = round(np.random.uniform(4, 6.5), 2)
    activity = round(np.random.uniform(40, 90), 1)

    high_data.append([hr_dev, sleep, activity, "HIGH"])

# Combine all data
all_data = low_data + moderate_data + high_data

random.shuffle(all_data)

# Create a DataFrame
columns = ["hr_deviation", "sleep_hours", "activity_minutes", "label"]

df = pd.DataFrame(all_data, columns=columns)

print(df.head())
print(df["label"].value_counts())

df.to_csv("stress_dataset.csv", index=False)

# training ML model
X = df[["hr_deviation", "sleep_hours", "activity_minutes"]]
y = df["label"]

from sklearn.preprocessing import LabelEncoder

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42
)

from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=6,
    random_state=42
)

model.fit(X_train, y_train)

from sklearn.metrics import accuracy_score, classification_report

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

print(classification_report(y_test, y_pred))

import matplotlib.pyplot as plt

importances = model.feature_importances_
features = X.columns

for feature, importance in zip(features, importances):
    print(f"{feature}: {importance:.3f}")

import joblib

joblib.dump(model, "stress_model.pkl")
joblib.dump(encoder, "label_encoder.pkl")
joblib.dump(X.columns.tolist(), "feature_names.pkl")

print("Model saved successfully.")

sample = [[1.18, 5.2, 60]]
prediction = model.predict(sample)
print("Encoded Prediction:", prediction)

decoded = encoder.inverse_transform(prediction)
print("Stress Level:", decoded)
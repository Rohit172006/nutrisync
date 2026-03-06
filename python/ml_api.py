from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained model and encoder
model = joblib.load("stress_model.pkl")
encoder = joblib.load("label_encoder.pkl")
feature_names = joblib.load("feature_names.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Extract values
        hr_deviation = float(data["hr_deviation"])
        sleep_hours = float(data["sleep_hours"])
        activity_minutes = float(data["activity_minutes"])

        # Create feature array
        features = np.array([[hr_deviation, sleep_hours, activity_minutes]])

        # Prediction
        prediction_encoded = model.predict(features)
        prediction_label = encoder.inverse_transform(prediction_encoded)[0]

        # Confidence
        probabilities = model.predict_proba(features)
        confidence = float(np.max(probabilities))

        return jsonify({
            "stress_level": prediction_label,
            "confidence": round(confidence, 3)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0",port=6000, debug=False)
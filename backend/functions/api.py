import os
from flask import Flask, jsonify, request
import logging
import requests

from backend.script.Backend import get_transportation_details, load_locations

app = Flask(__name__)

GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"  # Set your API Key


@app.route('/get-transportation', methods=['POST'])
def get_transportation():
    """
    API endpoint to fetch transportation details between two locations.
    """
    try:
        # Parse request data
        data = request.json
        location1 = data.get("location1")  # Expected: {"Latitude": ..., "Longitude": ...}
        location2 = data.get("location2")  # Expected: {"Latitude": ..., "Longitude": ...}

        if not location1 or not location2:
            return jsonify({"error": "Both location1 and location2 are required"}), 400

        # Fetch transportation details
        result = get_transportation_details(location1, location2)

        # Return the result
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error in /get-transportation: {str(e)}")
        return jsonify({"error": "Error fetching transportation details"}), 500



# Define the path to the images folder
images_folder = os.path.join("data", "attraction_details", "attraction_images")



# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.json
#         description = data.get("description", "")

#         if not description:
#             return jsonify({"error": "Description is required"}), 400

#         # Vectorize the input description
#         description_vector = tfidf_vectorizer.transform([description])
#         print(f"Vectorized Description: {description_vector}")

#         # Predict the category
#         predicted_category = decision_tree_model.predict(description_vector)
#         print(f"Predicted Category: {predicted_category}")

#         return jsonify({"category": predicted_category[0]})
#     except Exception as e:
#         error_message = f"Error during prediction: {str(e)}"
#         logging.error(error_message)
#         return jsonify({"error": error_message}), 500

if __name__ == '__main__':
    app.run(debug=True)

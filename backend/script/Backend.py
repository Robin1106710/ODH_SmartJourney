from flask import Flask, jsonify, request
import requests
import logging
import os
import pickle
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Allow requests from your frontend port

# Load model and vectorizer
model_path = os.path.join(".", "models", "decision_tree_model.pkl")
vectorizer_path = os.path.join(".", "models", "tfidf_vectorizer.pkl")

try:
    with open(model_path, "rb") as model_file:
        decision_tree_model = pickle.load(model_file)
    with open(vectorizer_path, "rb") as vectorizer_file:
        tfidf_vectorizer = pickle.load(vectorizer_file)
    print("Model and vectorizer loaded successfully!")
except Exception as e:
    logging.error(f"Error loading model or vectorizer: {e}")
    decision_tree_model = None
    tfidf_vectorizer = None

# Google API Key (replace with your actual API key)
GOOGLE_API_KEY = "AIzaSyBzt20CrO0kw1_pULcAVONkxt-JPH7x6XE"

# Path to locations CSV
locations_csv_path = os.path.join(".", "data", "locations.csv")

# Load the locations from the CSV file
def load_locations():
    try:
        locations_df = pd.read_csv(locations_csv_path)
        # Ensure boolean columns are properly parsed
        locations_df["historial"] = locations_df["historial"].astype(bool)
        locations_df["shopping"] = locations_df["shopping"].astype(bool)
        locations_df["literature_art"] = locations_df["literature_art"].astype(bool)
        locations_df["family"] = locations_df["family"].astype(bool)
        locations_df["educational"] = locations_df["educational"].astype(bool)
        return locations_df
    except FileNotFoundError:
        print(f"Error: File not found at {locations_csv_path}")
        return None

# Haversine formula for distance calculation
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Fetch real-time travel details using Google Directions API
def fetch_google_directions(origin, destination):
    """
    Fetch real-time travel time and recommended transportation mode using Google Directions API.
    Restricts to public transport (transit) and walking.
    """
    try:
        # Transit request
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": origin,  # Latitude,Longitude
            "destination": destination,  # Latitude,Longitude
            "mode": "transit",  # Only public transport
            "departure_time": "now",  # For real-time travel time
            "key": GOOGLE_API_KEY
        }
        response = requests.get(url, params=params)
        data = response.json()

        # Validate the response for public transport
        if data.get("status") == "OK" and "routes" in data and len(data["routes"]) > 0:
            route = data["routes"][0]
            leg = route["legs"][0]
            travel_time = leg["duration"]["text"]
            steps = leg.get("steps", [])

            # Extract transport modes (filter only transit and walking)
            modes = []
            for step in steps:
                if "transit_details" in step:  # Public transport details
                    modes.append(step["transit_details"]["line"]["vehicle"]["type"])
                elif step.get("travel_mode") == "WALKING":  # Walking
                    modes.append("WALKING")

            transport_modes = ", ".join(set(modes)) if modes else "Unknown transport mode"
            return travel_time, transport_modes

        # If no valid transit route is available, fallback to walking
        logging.warning("No transit routes available, falling back to walking.")
        params["mode"] = "walking"  # Change mode to walking
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("status") == "OK" and "routes" in data and len(data["routes"]) > 0:
            route = data["routes"][0]
            leg = route["legs"][0]
            travel_time = leg["duration"]["text"]
            return travel_time, "WALKING"

        # If no routes are found even for walking
        return "Unknown travel time", "Unknown transport mode"

    except Exception as e:
        logging.error(f"Error fetching directions: {str(e)}")
        return "Error fetching travel time", "Error fetching transport mode"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        description = data.get("description", "")

        if not description:
            return jsonify({"error": "Description is required"}), 400

        # Vectorize the input description
        description_vector = tfidf_vectorizer.transform([description])
        print(f"Vectorized Description: {description_vector}")

        # Predict the category
        predicted_category = decision_tree_model.predict(description_vector)
        print(f"Predicted Category: {predicted_category}")

        return jsonify({"category": predicted_category[0]})
    except Exception as e:
        error_message = f"Error during prediction: {str(e)}"
        logging.error(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    """
    Generate an itinerary based on user preferences.
    """
    try:
    
        # Load locations from CSV
        locations_df = load_locations()
        if locations_df is None:
            return jsonify({"error": "Locations data could not be loaded."}), 500

        data = request.json
        preferences = {
            "historial": data.get("historial", False),
            "shopping": data.get("shopping", False),
            "literature_art": data.get("literature_art", False),
            "family": data.get("family", False),
            "educational": data.get("educational", False)
        }
        start_point_id = data.get("start_point_ID")
        time_limit = data.get("time_limit")

        if start_point_id is None or time_limit is None:
            return jsonify({"error": "Start point and time limit are required"}), 400

        # Filter locations by preferences
        filtered_locations = locations_df[
            (locations_df["historial"] == preferences["historial"]) |
            (locations_df["shopping"] == preferences["shopping"]) |
            (locations_df["literature_art"] == preferences["literature_art"]) |
            (locations_df["family"] == preferences["family"]) |
            (locations_df["educational"] == preferences["educational"])
        ]

        if filtered_locations.empty:
            return jsonify({"error": "No locations match your preferences."})

        # Get the start point
        start_point = locations_df[locations_df["ID"] == start_point_id]
        if start_point.empty:
            return jsonify({"error": "Invalid start point ID."})

        start_point = start_point.iloc[0]
        start_lat, start_lon = start_point["Latitude"], start_point["Longitude"]

        # Calculate distances and sort by proximity
        filtered_locations["distance"] = filtered_locations.apply(
            lambda row: calculate_distance(start_lat, start_lon, row["Latitude"], row["Longitude"]),
            axis=1
        )
        filtered_locations = filtered_locations.sort_values(by="distance")

        # Initialize itinerary
        itinerary = []
        total_time = 0
        current_location = start_point

        for _, location in filtered_locations.iterrows():
            # Skip the starting point as the destination
            if location["ID"] == start_point_id:
                continue

            # Fetch travel details
            travel_time, transport_mode = fetch_google_directions(
                f"{current_location['Latitude']},{current_location['Longitude']}",
                f"{location['Latitude']},{location['Longitude']}"
            )

            # Check if adding this location exceeds the time limit
            if total_time + location["estimated_time"] + 15 > time_limit:
                break

            # Add the location to the itinerary
            itinerary.append({
                "from": current_location["en_name"],
                "to": location["en_name"],
                "from_latlng": f"{current_location['Latitude']},{current_location['Longitude']}",
                "to_latlng": f"{location['Latitude']},{location['Longitude']}",
                "travel_time": travel_time,
                "transport_mode": transport_mode,
                "time_at_location": location["estimated_time"],
            })

            # Update total time used and current location
            total_time += location["estimated_time"] + 15
            current_location = location

        if not itinerary:
            return jsonify({"error": "Could not generate a valid itinerary within the time limit."}), 400

        return jsonify({"itinerary": itinerary})
    except Exception as e:
        error_message = f"Error generating itinerary: {str(e)}"
        logging.error(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get-directions', methods=['POST'])
def get_directions():
    try:
        data = request.json
        # Ensure both origin and destination are provided
        if 'origin' not in data or 'destination' not in data:
            return jsonify({'error': 'Missing origin or destination'}), 400

        origin = data['origin']
        destination = data['destination']

        # The rest of your logic...
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": origin,
            "destination": destination,
            "mode": "transit",  # or 'walking' for walking directions
            "departure_time": "now",
            "key": GOOGLE_API_KEY
        }

        # Your logic to fetch directions using Google API
        response = requests.get(url, params=params)
        response_data = response.json()

        # Further processing...
        if response_data['status'] == 'OK' and response_data.get('routes'):
            route = response_data['routes'][0]
            leg = route['legs'][0]
            travel_time = leg['duration']['text']
            transport_modes = []

            for step in leg['steps']:
                if 'transit_details' in step:
                    transport_modes.append(step['transit_details']['line']['vehicle']['type'])
                elif step['travel_mode'] == 'WALKING':
                    transport_modes.append('WALKING')

            transport_mode = ', '.join(transport_modes) if transport_modes else 'Unknown transport mode'

            return jsonify({
                'travel_time': travel_time,
                'transport_mode': transport_mode
            })

        return jsonify({'error': 'Unable to fetch directions'}), 500

    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)

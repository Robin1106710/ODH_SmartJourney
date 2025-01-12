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
model_path = os.path.join("backend", "models", "logistic_regression_model.pkl")
vectorizer_path = os.path.join("backend", "models", "tfidf_vectorizer.pkl")

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
locations_csv_path = os.path.join("backend", "data", "locations.csv")
# Absolute path to locations.csv
locations_csv_path = os.path.join(os.getcwd(), "data", "locations.csv")
print("Looking for file at:", locations_csv_path)

# Load the locations from the CSV file
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
        locations_df["nature"] = locations_df["nature"].astype(bool) 
        locations_df["entertainment"] = locations_df["entertainment"].astype(bool)  
        locations_df["romantic"] = locations_df["romantic"].astype(bool)  
        locations_df["relaxation"] = locations_df["relaxation"].astype(bool)  
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
# Fetch real-time travel details using Google Directions API
def fetch_google_directions(origin, destination):
    """
    Fetch real-time travel time and recommended transportation mode using Google Directions API.
    Restricts to all public transport (transit) and walking with a walking time limit of 30 minutes.
    """
    try:
        # Google Directions API endpoint
        url = "https://maps.googleapis.com/maps/api/directions/json"

        # Transit request parameters
        params = {
            "origin": origin,  # Latitude,Longitude
            "destination": destination,  # Latitude,Longitude
            "mode": "transit",  # Public transport mode
            "departure_time": "now",  # Use real-time departure times
            "key": GOOGLE_API_KEY
        }

        # Fetch transit data
        response = requests.get(url, params=params)
        data = response.json()

        # Validate the response for public transport
        if data.get("status") == "OK" and "routes" in data and len(data["routes"]) > 0:
            route = data["routes"][0]  # Get the best route
            leg = route["legs"][0]  # Get the first leg of the route
            travel_time = leg["duration"]["text"]  # Travel time for the leg
            steps = leg.get("steps", [])  # Steps in the route

            # Extract transport modes (e.g., BUS, SUBWAY, FERRY, WALKING)
            modes = []
            for step in steps:
                if "transit_details" in step:  # If it's a public transport step
                    transit_type = step["transit_details"]["line"]["vehicle"]["type"]
                    modes.append(transit_type)
                elif step.get("travel_mode") == "WALKING":  # If it's a walking step
                    walking_duration = step["duration"]["value"] / 60  # Convert seconds to minutes
                    if walking_duration > 30:
                        return "Path exceeds walking limit", "Cannot generate path"
                    modes.append("WALKING")

            transport_modes = ", ".join(set(modes)) if modes else "Unknown transport mode"
            return travel_time, transport_modes

        # If no valid transit route is available, fallback to walking
        logging.warning("No transit routes available, attempting walking.")
        params["mode"] = "walking"  # Change mode to walking
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("status") == "OK" and "routes" in data and len(data["routes"]) > 0:
            route = data["routes"][0]
            leg = route["legs"][0]
            walking_duration = leg["duration"]["value"] / 60  # Convert seconds to minutes
            if walking_duration > 30:
                return "Walking time exceeds limit", "Cannot generate path"
            travel_time = leg["duration"]["text"]
            return travel_time, "WALKING"

        # If no routes are found even for walking
        return "No valid routes", "Cannot generate path"

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
            "educational": data.get("educational", False),
            "nature": data.get("nature", False), 
            "entertainment": data.get("entertainment", False), 
            "romantic": data.get("romantic", False), 
            "relaxation": data.get("relaxation", False)  
        }
        start_point_id = data.get("start_point_ID")
        time_limit = data.get("time_limit")

        if start_point_id is None or time_limit is None:
            return jsonify({"error": "Start point and time limit are required"}), 400

        # Filter locations by preferences
        # Filter locations by preferences
        filtered_locations = locations_df[
            (locations_df["historial"] == preferences["historial"]) |
            (locations_df["shopping"] == preferences["shopping"]) |
            (locations_df["literature_art"] == preferences["literature_art"]) |
            (locations_df["family"] == preferences["family"]) |
            (locations_df["educational"] == preferences["educational"]) |
            (locations_df["nature"] == preferences["nature"]) |  
            (locations_df["entertainment"] == preferences["entertainment"]) | 
            (locations_df["romantic"] == preferences["romantic"]) | 
            (locations_df["relaxation"] == preferences["relaxation"]) 
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
                "id": int(current_location["ID"]),
                "from": {
                    "name": current_location["en_name"],
                    "latitude": current_location["Latitude"],
                    "longitude": current_location["Longitude"]
                },
                "to": {
                    "name": location["en_name"],
                    "latitude": location["Latitude"],
                    "longitude": location["Longitude"]
                },
                "travel_time": travel_time,
                "transport_mode": transport_mode,
                "time_at_location": location["estimated_time"]
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


def get_transportation_details(location1, location2):
    try:
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{location1['Latitude']},{location1['Longitude']}",
            "destination": f"{location2['Latitude']},{location2['Longitude']}",
            "mode": "transit",
            "departure_time": "now",
            "key": GOOGLE_API_KEY
        }
        response = requests.get(url, params=params)
        data = response.json()

        # Log the full API response for debugging
        logging.info(f"Google Directions API Response: {data}")

        if data.get("status") != "OK":
            logging.error(f"Google API error: {data.get('status')} - {data.get('error_message', 'No error message')}")
            return {
                "transport_time": "Unknown travel time",
                "transport_method": "Unknown transport mode",
                "route_details": []
            }

        # Process valid response
        route = data["routes"][0]
        leg = route["legs"][0]
        travel_time = leg["duration"]["text"]
        steps = leg.get("steps", [])
        modes = []
        route_details = []
        for step in steps:
            if "transit_details" in step:
                transit_type = step["transit_details"]["line"]["vehicle"]["type"]
                transit_name = step["transit_details"]["line"].get("short_name", "Unnamed Line")
                transit_stop = step["transit_details"]["departure_stop"]["name"]
                route_details.append(f"Take {transit_type} {transit_name} from {transit_stop}.")
                modes.append(transit_type)
            elif step.get("travel_mode") == "WALKING":
                walking_distance = step["distance"]["text"]
                walking_duration = step["duration"]["text"]
                route_details.append(f"Walk for {walking_distance} ({walking_duration}).")
                modes.append("WALKING")

        transport_modes = ", ".join(set(modes)) if modes else "Unknown transport mode"
        return {
            "transport_time": travel_time,
            "transport_method": transport_modes,
            "route_details": route_details
        }

    except Exception as e:
        logging.error(f"Error fetching transportation details: {str(e)}")
        return {
            "transport_time": "Error fetching travel time",
            "transport_method": "Error fetching transport mode",
            "route_details": []
        }


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



@app.route('/location-details/<int:location_id>', methods=['GET'])
def location_details(location_id):
    try:
        # Load locations from CSV
        locations_df = load_locations()
        if locations_df is None:
            return jsonify({"error": "Locations data could not be loaded."}), 500

        # Ensure ID column is treated as integers
        locations_df["ID"] = locations_df["ID"].astype(int)

        # Debug: Print the requested ID and DataFrame for debugging
        print(f"Requested Location ID: {location_id}")
        print(locations_df.head())  # Print the first few rows for debugging

        location = locations_df[locations_df["ID"] == location_id]
        if location.empty:
            logging.error(f"Location with ID {location_id} not found.")
            return jsonify({"error": "Location not found."}), 404

        location = location.iloc[0]

        # Load descriptions from the attraction_description.csv
        description_csv_path = os.path.join("backend", "data", "attraction_details", "attraction_description.csv")
        description_df = pd.read_csv(description_csv_path)

        # Ensure IDs in the description file are integers
        description_df["ID"] = description_df["ID"].astype(int)

        # Fetch the corresponding description and opening hours
        description_data = description_df[description_df["ID"] == location_id]
        if description_data.empty:
            logging.error(f"Description for location ID {location_id} not found.")
            return jsonify({"error": "Description not found for this location."}), 404

        description_data = description_data.iloc[0]
        description = description_data["Description"]
        opening_hour = description_data["Opening Hour"]

        # Construct the image path
        image_path = os.path.join("backend", "data", "attraction_details", "attraction_images", f"{location_id}.jpg")
        if not os.path.exists(image_path):
            logging.warning(f"Image for location ID {location_id} not found.")
            image_url = None  # Set to None if the image doesn't exist
        else:
            image_url = f"/backend/data/attraction_details/attraction_images/{location_id}.jpg"  # Frontend-relative path

        # Build response
        response = {
            "ID": int(location["ID"]),  # Convert to Python int
            "Name": location["en_name"],
            "Latitude": float(location["Latitude"]),  # Convert to Python float
            "Longitude": float(location["Longitude"]),  # Convert to Python float
            "Description": description,
            "Opening Hour": opening_hour,
            "Image": image_url,
        }
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error in /location-details: {str(e)}")
        return jsonify({"error": f"Error fetching location details: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
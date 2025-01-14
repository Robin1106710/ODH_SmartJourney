from flask import Flask, app, jsonify, request
import logging
import os
import pickle
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS

from backend.script.Backend import load_locations

@app.route('/location-details/<int:location_id>', methods=['GET'])
def location_details(location_id):
    try:
        print(f"Requested Location ID: {location_id}")

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
        description_csv_path = os.path.join("data", "attraction_details", "attraction_images.csv")
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
        image_path = os.path.join( "data", "attraction_details", "attraction_images", f"{location_id}.jpg")
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
        print(jsonify(response))
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error in /location-details: {str(e)}")
        return jsonify({"error": f"Error fetching location details: {str(e)}"}), 500
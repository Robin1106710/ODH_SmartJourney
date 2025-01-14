from flask import Flask, app, jsonify, request
import logging
import os
import pickle
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS

from backend.script.Backend import calculate_distance, fetch_google_directions, load_locations

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
                "id": int(location["ID"]),
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
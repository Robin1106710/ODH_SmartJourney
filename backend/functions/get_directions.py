

from flask import Flask, app, jsonify, request
import logging
import os
import pickle
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS
import requests

from backend.script.Backend import GOOGLE_API_KEY, calculate_distance, fetch_google_directions, load_locations

@app.route('/get-directions', methods=['POST'])
def get_directions():
    try:
        data = request.json
        # Ensure both origin and destination are provided
        if 'origin' not in data or 'destination' not in data:
            return jsonify({'error': 'Missing origin or destination'}), 400
        origin = data['origin']
        destination = data['destination']

        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": origin,
            "destination": destination,
            "mode": "transit",  # or 'walking' for walking directions
            "departure_time": "now",
            "key": GOOGLE_API_KEY
        }

        # Fetch directions using Google API
        response = requests.get(url, params=params)
        response_data = response.json()

        if response_data['status'] == 'OK' and response_data.get('routes'):
            route = response_data['routes'][0]
            leg = route['legs'][0]

            # Basic info
            travel_time = leg['duration']['text']
            distance = leg['distance']['text']
            start_address = leg['start_address']
            end_address = leg['end_address']
            steps = []

            # Details for each step
            for step in leg['steps']:
                step_details = {
                    'instruction': step['html_instructions'],
                    'distance': step['distance']['text'],
                    'duration': step['duration']['text'],
                    'travel_mode': step['travel_mode']
                }

                if 'transit_details' in step:
                    step_details['transit_info'] = {
                        'line': step['transit_details']['line']['name'],
                        'vehicle_type': step['transit_details']['line']['vehicle']['type']
                    }

                steps.append(step_details)

            # Additional details
            transport_modes = []
            for step in leg['steps']:
                if 'transit_details' in step:
                    transport_modes.append(step['transit_details']['line']['vehicle']['type'])
                elif step['travel_mode'] == 'WALKING':
                    transport_modes.append('WALKING')

            transport_mode = ', '.join(transport_modes) if transport_modes else 'Unknown transport mode'

            return jsonify({
                'travel_time': travel_time,
                'distance': distance,
                'start_address': start_address,
                'end_address': end_address,
                'steps': steps,
                'transport_mode': transport_mode
            })
        
        return jsonify({'error': 'Unable to fetch directions'}), 500
    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import individual route files
from location_details import location_details
from generate_itinerary import generate_itinerary
from get_directions import get_directions

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# Register routes
app.add_url_rule('/location-details/<int:location_id>', view_func=location_details)
app.add_url_rule('/generate-itinerary', view_func=generate_itinerary, methods=['POST'])
app.add_url_rule('/get-directions', view_func=get_directions, methods=['POST'])

# Cloud Function entry point
def main(request):
    return app(request)

# app.py

from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
import json, os

app = Flask(__name__)
ROUTE = 5000

# MongoDB connection
client = MongoClient("mongodb://mongo:27017/")
db = client["SoundSyncDB"]


# Collections 
users = db["users"]
artists = db["artists"]


# APP
@app.route('/')
def home():
    return jsonify({"message": "SoundSync API"})




#* ------------Helpers------------
def import_from_file(file_path, collection):
            print(f"No data found in {file_path}")

def serialize_doc(doc):
    return doc_copy

def collection_exists(collection_name):
    """Check if a collection exists in the database."""
    return collection_name in db.list_collection_names()

def get_collection_fields(collection_name):
        return []  # Return empty list on error


#TODO:

#*-----------Init DB & Show------------
@app.route('/api/initDB/<string:collection>', methods=['GET'])
def populate_collections(collection):
    file_map = {
        "games": "data/games.json",
        "clients": "data/clients.json"
    }
    try:
        match collection:
            case "games":
                import_from_file(file_map["games"], games)
                print("populated games collection.")
                return jsonify({"message": "populated games collection."})
            case "clients":
                import_from_file(file_map["clients"], clients)
                print("populated clients collection.")
                return jsonify({"message": "populated clients collection."})

            case "all": 
                import_from_file(file_map["games"], games)
                import_from_file(file_map["clients"], clients)
                print("populated all collection.")
                return jsonify({"message": "populated all collections."})
            case _:
                print("Error [populate_collections]: Unknown collection.")
                return jsonify({"error": "Unknown collection."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#*------------CRUD-----------
# 1. CRUD (Create, Read, Update, Delete) operations

#?----- Create: Add a new video game OR client.
@app.route('/api/add/<string:collection>', methods=['POST'])
def add_instance(collection):
        return jsonify({"error": str(e)}), 500



#?----- Read: 
# Retrieve a list of all games in the inventory. 
@app.route('/api/showDB/<string:collection>', methods=['GET'])
def show_collection(collection):
        return jsonify({"error": str(e)}), 500


# — Find by unique identifier (ID) _ or ANY other field
@app.route('/api/get/<string:collection>/<path:lookup_value>', methods=['GET'])
def get_instance(collection, lookup_value):
        return jsonify({"error": str(e)}), 500



#?---- Update: Modify the details of an existing game (C.g., cliange the or quantity). 
# update single
@app.route('/api/update/<string:collection>/<string:identifier>', methods=['PUT'])
def update_instance_by_field(collection, identifier):
        return jsonify({"error": str(e)}), 500

# Update by 


#?---- Delete: 
# Remove a game from the inventory. 
@app.route('/api/delete/<string:collection>/<string:identifier>', methods=['DELETE'])
def delete_instance(collection, identifier):
        return jsonify({"error": str(e)}), 500





# Remove ALL data from a collection, or all collections if "all" specified
@app.route('/api/cleanDB/<string:collection>', methods=['GET'])
def cleanup(collection):
        return jsonify({"error": str(e)}), 500





#------------------------- Run the app----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=ROUTE, debug=True)
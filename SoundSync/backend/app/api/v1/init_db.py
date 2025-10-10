
import db.crud 




app.route("/init_db")
def init_db():
    db.crud.init_database("ALL")
    return {"message": "Database initialized with sample data."}


# TODO: fix crud function first
# app.route("/create_instance")
# def read_instance():
#     collection = "artists"
#     sample = "artist2"
#     db.crud.read_instance(collection, sample)


# init collections


# import json to db





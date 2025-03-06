import requests
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
BASE_URL = "https://api.carrismetropolitana.pt/v1/stops"
GTFS_URL = "https://api.carrismetropolitana.pt/gtfs"
DATABESE_URL = 'postgresql://smartway_8fno_user:jXdPD7yVOPuEwaAX9374R4YvxH65OqNw@dpg-cusjab5umphs73c8cmeg-a.frankfurt-postgres.render.com/smartway'
username = "postgres"
password = "postgres"
host = "localhost"
port = "5432"
database_name = "smartway"
# DATABESE_URL = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database_name}"


app = FastAPI()

engine = create_engine(DATABESE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Example endpoint to fetch nearby stops
@app.get("/stops/nearby")
def get_nearby_stops(lat: float, lon: float):
    query = """
    SELECT  stop_name, stop_lat, stop_lon, 
           ST_Distance(geom, ST_SetSRID(ST_Point(:lon, :lat), 4326)) AS distance
    FROM stops
    WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(:lon, :lat), 4326), 1000) 
    ORDER BY distance
    LIMIT 5;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {'lat': lat, 'lon': lon}).fetchall()
    
    stops = [{ "stop_name": row[0], "stop_lat": row[1], "stop_lon": row[2], "distance": row[3]} for row in result]
    return stops

@app.get("/stops")
def all_stops():
    query = """
    SELECT  stop_id, stop_name, stop_lat, stop_lon
    FROM stops
    WHERE operational_status = 'ACTIVE';
    """
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchall()
    
    stops = [{"stop_id": row[0], "stop_name": row[1], "stop_lat": row[2], "stop_lon": row[3]} for row in result]
    return stops
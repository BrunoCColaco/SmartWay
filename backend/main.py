import requests
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

BASE_URL = "https://api.carrismetropolitana.pt/v1/stops"
GTFS_URL = "https://api.carrismetropolitana.pt/gtfs"
DATABESE_URL = 'postgresql://postgres:Bruno123@localhost/smartway'

app = FastAPI()

engine = create_engine(DATABESE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Example endpoint to fetch nearby stops
@app.get("/stops/nearby")
def get_nearby_stops(lat: float, lon: float):
    query = """
    SELECT stop_name, stop_lat, stop_lon, 
           ST_Distance(geom, ST_SetSRID(ST_Point(:lon, :lat), 4326)) AS distance
    FROM stops
    WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(:lon, :lat), 4326), 1000) 
    ORDER BY distance
    LIMIT 5;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {'lat': lat, 'lon': lon}).fetchall()
    
    stops = [{"stop_name": row[0], "stop_lat": row[1], "stop_lon": row[2], "distance": row[3]} for row in result]
    return {"closest_stops": stops}
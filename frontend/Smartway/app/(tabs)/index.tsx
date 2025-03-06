import { Text, View, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getStops, Stop } from "../services/api";


export default function Index() {
  // Default region (e.g., Lisbon coordinates)
  const DEFAULT_REGION: Region = {
    latitude: 38.724974,
    longitude: -9.149614,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const [visibleMarkers, setVisibleMarkers] = useState<Stop[]>([]);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION); // Start with the default region
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]); // Nearby stops
  const mapRef = useRef<MapView>(null);

  // Fetch stops for the current region
  const fetchStops = async () => {
    try {
      const stopsData = await getStops();
      setStops(stopsData);
      
    } catch (error) {
      console.error('Error fetching stops:', error);
      setErrorMsg('Failed to fetch nearby stops');
    }
  };

  const handleRegionChangeComplete = (region:Region) => {
    const visible = stops.filter(
      (stop) =>
        stop.stop_lat >= region.latitude - region.latitudeDelta / 2 &&
        stop.stop_lat <= region.latitude + region.latitudeDelta / 2 &&
        stop.stop_lon >= region.longitude - region.longitudeDelta / 2 &&
        stop.stop_lon <= region.longitude + region.longitudeDelta / 2
    );
    setVisibleMarkers(visible);
  };
  // Fetch stops for the default region when the component mounts
  useEffect(() =>{
    fetchStops();
  }, []);
  
  

  // Ask for user location and update the region
  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(userRegion); // Update the region to the user's location
      
    };

    getCurrentLocation();
  }, []);

  // Animate the map to the new region when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000); // Smoothly animate to the new region
    }
  }, [region]);

  return (
    <View style={styles.map}>

      <MapView style={styles.map} initialRegion={DEFAULT_REGION} ref={mapRef} >
        {/* <TextInput></TextInput> */}
        {stops.map((stop,index) => (
          <Marker 
            
            image={require('../../assets/images/pixil-frame-0.png')}
            key={stop.stop_id}
            coordinate={{ latitude: stop.stop_lat, longitude: stop.stop_lon }}
            title={stop.stop_name}
            tracksViewChanges={false}
            
          >
            {/* <Image source={require('../../assets/images/pixil-frame-0.png')} style={{height: 35, width:35 }} /> */}
            
          </Marker>
        ))}
      </MapView>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  marker: {
    borderRadius: 25,

  }
});


import { useRef } from "react"
import { MapContainer, TileLayer, Circle, Popup, FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map({driverMapping}){
    const mapRef = useRef(null)
    const mapColors = ["red", "orange", "yellow", "green", "blue", "purple", "indigo", "violet", "magenta", "grey", "black", "teal"]
    let mapCounter = 0

    console.log(driverMapping)

    return(
        <>
            <MapContainer center={[39.99964164738838, -83.01488289828252]} zoom={13} ref={mapRef} style={{height: "100vh", width: "100%"}}>
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {driverMapping &&
                    Object.entries(driverMapping).map(([driver, driversPassengers]) => {
                    console.log(driversPassengers);
                    const color = mapColors[mapCounter % mapColors.length];
                    mapCounter++;

                    return driversPassengers.map((passenger, index) => (
                        <FeatureGroup key={`${driver}-${index}`}>
                            <Popup>{driver}'s Carpool</Popup>    
                            <Circle
                                center={passenger}
                                radius={10}
                                pathOptions={{ color, fillColor: color }}
                            />
                        </FeatureGroup>
                    ));
                })}
            </MapContainer>
        </>
    )
}
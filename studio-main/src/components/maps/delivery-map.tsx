
'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


type Location = {
    name: string;
    position: [number, number];
};

type DeliveryMapProps = {
    donor: Location;
    ngo: Location;
    driver: Location;
}

const customIcon = (color: string) => new L.DivIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
           </svg>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
});

const truckIcon = new L.DivIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 4px; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
           </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});


const DeliveryMap = ({ donor, ngo, driver }: DeliveryMapProps) => {
    const routeCoordinates: [number, number][] = [
        donor.position,
        driver.position,
        ngo.position
    ];

    return (
        <MapContainer
            center={driver.position}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={routeCoordinates} color="hsl(var(--primary))" weight={3} dashArray="5, 10" />

            <Marker position={donor.position} icon={customIcon('hsl(var(--destructive))')}>
                <Popup>{donor.name} (Donor)</Popup>
            </Marker>

            <Marker position={ngo.position} icon={customIcon('hsl(var(--primary))')}>
                <Popup>{ngo.name} (Recipient)</Popup>
            </Marker>

            <Marker position={driver.position} icon={truckIcon} zIndexOffset={1000}>
                <Popup>{driver.name} (Driver)</Popup>
            </Marker>
        </MapContainer>
    );
};

export default DeliveryMap;

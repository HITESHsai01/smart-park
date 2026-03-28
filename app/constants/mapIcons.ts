import { divIcon } from "leaflet";

export const parkingIcon = divIcon({
  className: "custom-parking-icon",
  html: `
    <div style="background-color: #3b82f6; color: white; border: 2px solid white; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
      P
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export const parkingRouteIcon = divIcon({
  className: "custom-parking-icon-route",
  html: `
    <div style="background-color: #eab308; color: white; border: 3px solid white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 4px 12px rgba(234,179,8,0.5);">
      P
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const parkingBookedIcon = divIcon({
  className: "custom-parking-icon-booked",
  html: `
    <div style="background-color: #10b981; color: white; border: 3px solid white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 0 15px rgba(16,185,129,0.8); animation: blink 1s infinite;">
      P
    </div>
    <style>
      @keyframes blink {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 25px rgba(16,185,129,1); }
      }
    </style>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const destinationIcon = divIcon({
  className: "custom-dest-icon",
  html: `
    <div style="background-color: #ef4444; color: white; border: 3px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(239,68,68,0.5);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const cameraIcon = divIcon({
  className: "custom-camera-icon",
  html: `
    <div style="background-color: #ef4444; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
      C
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export const liveLocationIcon = divIcon({
  className: "custom-live-location",
  html: `
    <div style="position: relative;">
      <div style="background-color: #10b981; color: white; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border: 2px solid rgba(16,185,129,0.4); border-radius: 50%; animation: pulse 2s infinite;"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});
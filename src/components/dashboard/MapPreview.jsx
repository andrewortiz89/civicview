// src/components/dashboard/MapPreview.jsx
import InteractiveMap from "../map/InteractiveMap";

// onExpandClick viene de Home.jsx como: () => navigate('/mapa')
function MapPreview({ onExpandClick }) {
  return <InteractiveMap isWidget={true} onExpandClick={onExpandClick} />;
}

export default MapPreview;

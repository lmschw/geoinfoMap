import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import Point from 'ol/geom/Point.js';
import TileJSON from 'ol/source/TileJSON.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import {Icon, Style} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import OSM from 'ol/source/OSM';
import { getHeight } from 'ol/extent';


// --------------------CONSTANTS-----------------------------------
// Coordinates
const SACHSELN_COORDS = [917600, 5921700];
const STGALLEN_COORDS = [917600, 5991700];

// Styles
const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'arrow_down.png',
    scale: 0.25,
  }),
});


// ------------------MAP-----------------------------------------
// Tile Layer
const tileLayer = new TileLayer({
  source: new OSM()
})

// Vector Layer
const vectorSource = new VectorSource({
  features: getHardcodedFeatures(),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// Map
const map = new Map({
  layers: [tileLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: SACHSELN_COORDS,
    zoom: 9,
  }),
});

// ------------------POPUP----------------------------------------
const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

let popover;
function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}
// display popup on click
map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  disposePopover();
  if (!feature) {
    return;
  }
  popup.setPosition(evt.coordinate);
  popover = new bootstrap.Popover(element, {
    placement: 'top',
    html: true,
    content: feature.get('name'),
  });
  popover.show();
});

// change mouse cursor when over marker
map.on('pointermove', function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});
// Close the popup when the map is moved
map.on('movestart', disposePopover);


// -------------------------FUNCTIONS--------------------------------

function getHardcodedFeatures(){
  let features = [];
  features.push(createFeature(SACHSELN_COORDS, 'Sachseln'));
  features.push(createFeature(STGALLEN_COORDS, 'St. Gallen'));

  return features;
}

function createFeature(coords, label){
  const iconFeature = new Feature({
    geometry: new Point(coords),
    name: label,
  });
  iconFeature.setStyle(iconStyle);
  return iconFeature;
}
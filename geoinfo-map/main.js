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
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import {get as getProjection} from 'ol/proj.js';


// --------------------PROJECTION--------------------------------
proj4.defs('EPSG:21781',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
  '+x_0=600000 +y_0=200000 +ellps=bessel ' +
  '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
register(proj4);
const swissProjection = getProjection('EPSG:21781');


// --------------------CONSTANTS-----------------------------------
// Coordinates: https://epsg.io/map#srs=21781-1766&x=747505.313171&y=255431.833775&z=15&layer=streets
const BERN_COORDS = [599299.710370, 200399.391909];
const BRUNNEN_COORDS = [688678.726078, 205633.585652];
const DUBAI_COORDS = [5376789.141211, -774702.628050];
const EFFI_COORDS = [694319.330100, 253963.396810];
const ESSEX_COORDS = [151518.924144, 767411.966168];
const LAUSANNE_COORDS = [536043.006032, 152971.192322];
const SACHSELN_COORDS = [661553.500243, 191685.035751];
const SARNEN_COORDS = [661468.366911, 193920.112919];
const STGALLEN_COORDS = [747505.313171, 255431.833775];

// Start constants
const START_COORDS = SACHSELN_COORDS; // center of Switzerland
const START_ZOOM = 8;

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
const tileSource = new OSM({
  projection: swissProjection,
})

const tileLayer = new TileLayer({
  source: tileSource
})

// Vector Layer
const vectorSource = new VectorSource({
  projection: swissProjection,
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
    projection: swissProjection,
    center: START_COORDS,
    zoom: START_ZOOM,
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
  features.push(createFeature(BERN_COORDS, 'Bern'));
  features.push(createFeature(BRUNNEN_COORDS, 'Brunnen'));
  features.push(createFeature(DUBAI_COORDS, 'Dubai'));
  features.push(createFeature(EFFI_COORDS, 'Effi'));
  features.push(createFeature(ESSEX_COORDS, 'Essex'));
  features.push(createFeature(LAUSANNE_COORDS, 'Lausanne'));
  features.push(createFeature(SACHSELN_COORDS, 'Sachseln'));
  features.push(createFeature(SARNEN_COORDS, 'Sarnen'));
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
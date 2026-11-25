// Zona de estudio: Muthurajawela-Negombo
var roi = ee.Geometry.Rectangle([79.80, 6.98, 79.94, 7.22]);
Map.centerObject(roi, 11);

// Máscara de nubes Cloud Score+
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');
var QA_BAND = 'cs_cdf';
var CLEAR_THRESHOLD = 0.60;

// Función que crea la composición de mediana sin nubes de un periodo
function composite(start, end) {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(roi)
    .filterDate(start, end)
    .linkCollection(csPlus, [QA_BAND])
    .map(function(img) {
      return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD))
      .select(['B2', 'B3', 'B4', 'B8']);
    })
    .median()
    .divide(10000)   // reflectancia de 0 a 1
    .clip(roi);
}

var img2019 = composite('2019-01-01', '2019-03-31');
var img2025 = composite('2025-01-01', '2025-03-31');

var vis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3};

Map.addLayer(img2019, vis, 'Mediana 2019 sin nubes');
Map.addLayer(img2025, vis, 'Mediana 2025 sin nubes');

// Índices: NDVI (vegetación) y NDWI (agua)
function addIndices(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI');
  return img.addBands([ndvi, ndwi]);
}

var idx2019 = addIndices(img2019);
var idx2025 = addIndices(img2025);

var ndviVis = {min: -0.2, max: 0.9,
  palette: ['#d73027', '#fee08b', '#d9ef8b', '#66bd63', '#1a9850', '#006837']};

Map.addLayer(idx2019.select('NDVI'), ndviVis, 'NDVI 2019', false);
Map.addLayer(idx2025.select('NDVI'), ndviVis, 'NDVI 2025', false);

// Cambio de NDVI (2025 menos 2019)
var dNDVI = idx2025.select('NDVI').subtract(idx2019.select('NDVI'));

Map.addLayer(dNDVI,
  {min: -0.4, max: 0.4, palette: ['#b2182b', '#ffffff', '#1a9850']},
  'Cambio NDVI 2019-2025');
  
  // Máscara de tierra: sin agua en ninguno de los dos años
var land = idx2019.select('NDWI').lt(0)
  .and(idx2025.select('NDWI').lt(0));
  
  // Vegetación en 2019 que deja de serlo en 2025 (solo tierra)
var vegLossRaw = idx2019.select('NDVI').gt(0.5)
  .and(idx2025.select('NDVI').lt(0.3))
  .and(land)
  .rename('loss')
  .selfMask();

// Quitar parches pequeños: mínimo 5 píxeles conectados (0,05 ha)
var patchSize = vegLossRaw.connectedPixelCount(25, true);
var vegLoss = vegLossRaw.updateMask(patchSize.gte(5));

Map.addLayer(vegLoss, {palette: ['red']}, 'Pérdida de vegetación (filtrada)');

// Superficie en hectáreas
var lossArea = vegLoss.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: roi,
  scale: 10,
  maxPixels: 1e9
});
print('Pérdida de vegetación (ha):', ee.Number(lossArea.get('loss')).divide(1e4));

// Sensibilidad al tamaño mínimo de parche
[1, 3, 5, 10].forEach(function(minPx) {
  var filtered = vegLossRaw.updateMask(vegLossRaw.connectedPixelCount(25, true).gte(minPx));
  var area = filtered.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: roi,
    scale: 10,
    maxPixels: 1e9
  }).get('loss');
  print('Mín. ' + minPx + ' píxeles (ha):', ee.Number(area).divide(1e4));
});

// Descarga directa de la pérdida de vegetación (GeoTIFF, 1 = pérdida)
var lossUrl = vegLoss.unmask(0).toByte().getDownloadURL({
  name: 'perdida_vegetacion_2019_2025',
  region: roi,
  scale: 10,
  crs: 'EPSG:32644',
  format: 'GEO_TIFF'
});
print('Descargar pérdida:', lossUrl);

// Descarga del fondo: composición RGB 2025
var rgbUrl = img2025.visualize({bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3})
  .getDownloadURL({
    name: 'rgb_2025',
    region: roi,
    scale: 10,
    crs: 'EPSG:32644',
    format: 'GEO_TIFF'
  });
print('Descargar RGB 2025:', rgbUrl);
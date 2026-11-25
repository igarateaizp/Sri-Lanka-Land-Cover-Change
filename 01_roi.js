print('Área (km²):', geometry.area(1).divide(1e6));
var roi = ee.Geometry.Rectangle([79.80, 6.98, 79.94, 7.22]);

print('Área (km²):', roi.area(1).divide(1e6));

Map.centerObject(roi, 11);
Map.addLayer(roi, {color: 'red'}, 'Zona de estudio');
Export.table.toDrive({
  collection: ee.FeatureCollection([ee.Feature(roi)]),
  description: 'roi_muthurajawela',
  fileFormat: 'SHP'
});
var roiFc = ee.FeatureCollection([ee.Feature(roi)]);

var url = roiFc.getDownloadURL({
  format: 'SHP',
  filename: 'roi_muthurajawela'
});
print('Descarga el polígono:', url);
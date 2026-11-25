# Vegetation loss in Muthurajawela-Negombo, Sri Lanka (2019-2025)



![Vegetation loss map](maps/mapa_muthurajawela_2019_2025.png)



## Objective

Detect and quantify vegetation loss between 2019 and 2025 in the Muthurajawela wetland and the surrounding Negombo-Wattala urban fringe, north of Colombo, using open satellite data.



## Study area

Rectangle of about 412 km² (79.80-79.94°E, 6.98-7.22°N) covering the Negombo lagoon, the Muthurajawela wetland, Bandaranaike International Airport and the industrial and urban areas to the east and south.



## Data

- Sentinel-2 Level-2A surface reflectance (`COPERNICUS/S2_SR_HARMONIZED`), Google Earth Engine

- Cloud masking with Cloud Score+ (threshold 0.60)

- Median composites for January-March 2019 and January-March 2025 (dry season)



## Methods

1. Cloud-masked median composites for each year.

2. NDVI (vegetation) and NDWI (water) for both years.

3. Water masked out: pixels with NDWI ≥ 0 in either year were excluded.

4. Vegetation loss: NDVI > 0.5 in 2019 and NDVI < 0.3 in 2025.

5. Noise filtering: patches smaller than 5 connected pixels (0.05 ha) removed.

6. Area calculated in Earth Engine; result exported to QGIS for mapping and cross-checked.



## Results

- **Vegetation loss: 116 ha (0.28% of the study area).**

- Sensitivity to minimum patch size:



| Minimum patch size | Loss (ha) |

|---|---|

| 1 pixel (no filter) | 180 |

| 3 pixels | 138 |

| **5 pixels (used)** | **116** |

| 10 pixels | 93 |



- Cross-check: the vectorised layer in QGIS sums to 115.9 ha, matching the Earth Engine result (116.2 ha).

- Visually, the loss appears as many small patches along the urban fringe, with clusters near the airport and the industrial areas, and little loss in the core of the wetland.

- [Add 2-3 before/after examples here, with location and what changed.]



## Limitations

- No field data or reference sample: accuracy has not been assessed.

- NDVI thresholds (0.5 and 0.3) are starting values and were not calibrated.

- NDVI also changes with crop cycles, harvest and dry vegetation, so part of the detected loss may not be permanent land-cover change.

- 10 m resolution cannot reliably separate very small changes from noise.

- Only two single-season composites were compared; no time series.

- The map shows a slightly cropped portion of the study area; the figures cover the full area.



## Tools

Google Earth Engine (JavaScript API), QGIS.



## Code

- [`01_roi.js`](01_roi.js): definition of the study area

- [`02_cambio_vegetacion.js`](02_cambio_vegetacion.js): composites, indices, change detection and area calculation



## Author

[Iñigo Garate]. [www.linkedin.com/in/inigogaratee]


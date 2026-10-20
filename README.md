# Sichtbarkeitsanalyse Randersacker (3D-GIS) – Interaktives Web-Dashboard

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?logo=github)](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/3D-Three.js-000000?logo=three.js)](https://threejs.org/)
[![Open Data Bayern](https://img.shields.io/badge/Data-Open%20Data%20Bayern%20(dl--de%2Fby--2--0)-blue)](https://geodatenonline.bayern.de/)

[English](#english-version) | [Deutsch](#deutsche-version)

---

## English Version

An interactive 3D web portal and dashboard for geospatial **Viewshed & Line-of-Sight visibility analysis** evaluating a hypothetical telecommunication antenna location in **Randersacker near Würzburg**, Germany. Developed within the **3D-GIS** module at the **Technical University of Applied Sciences Würzburg-Schweinfurt (THWS)**.

**Live Website:** [https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)

---

### Project Context

For the planning and visual impact assessment of a proposed wireless communication mast situated on the vineyard slopes above the Main River valley, a high-resolution 3D viewshed and line-of-sight analysis was executed.

Objectives of the investigation:
- Evaluate the wireless propagation and visual contact of **Antenna 3** toward the historic town center of Randersacker and adjacent residential zones.
- Account for realistic physical shadowing caused by terrain topography as well as official **CityGML LoD2 3D building geometries** (ridge lines, roof slopes, and eave heights).

---

### Methodology & Geoprocessing (ArcGIS Pro / ArcPy)

1. **Digital Surface Model (DSM / DOM):**
   - Fusion of the high-resolution **DGM1 (1m Digital Terrain Model)** with rasterized official **CityGML LoD2 3D building envelopes**.
   - Resulting DSM accurately portrays both valley slope geomorphology and authentic structural roof heights.
2. **Observer & Target Locations:**
   - 20,263 evaluation observation points distributed across the valley floor and town center, adjusted to a standard 1.50 m pedestrian eye height (`OFFSETB = 1.5 m`).
   - Generation of 20,263 3D sight rays (`ConstructSightLines`) originating from the Antenna 3 transmitter mast.
3. **Line-of-Sight & Viewshed Computation:**
   - Determination of sightline obstructions (`LineOfSight`) across the surface model.
   - Raster visibility calculation (`Viewshed`) delineating shaded and illuminated terrain zones.
   - Findings: **484,954 visible raster cells** in the overall bounding scene; 2,370 investigated sample points within the municipality maintain direct line-of-sight, while 17,893 points are obscured by building facades or valley contours.

---

### Interactive 3D Web Application Features

- **Interactive 3D Viewer (Three.js):**
  - Full orbit rotation, panning, and zooming of the Randersacker terrain relief.
  - Authentic 3D LoD2 structures rendered with distinct roof pitches and facade walls.
  - Interactive antenna transmitter towers with an animated radio wave propagation ring.
- **Dynamic Layer Controls:**
  - *Satellite Imagery (DOP20):* Aerial orthophoto draped directly over the 3D elevation mesh.
  - *Viewshed Mask:* Toggleable visibility raster overlay (Green = Visible).
  - *3D Sight Rays:* Green visible rays versus red obstructed rays.
  - *3D LoD2 Buildings:* Terracotta tile roofs and sandstone masonry wall meshes.
- **Camera Presets:** Isometric perspective, Antenna close-up, Valley panorama, and Top-down nadir view.
- **Results Gallery:** High-resolution GIS evaluation maps, cross-sections, and analytical renders.

---

### Geospatial Data Credits & Licensing

All geospatial datasets utilized in this project are licensed under the Open Data Bavaria initiative:

| Dataset | Data Provider | License |
|---|---|---|
| **DGM1 (Digital Elevation Model, 1m)** | Bavarian Agency for Digitisation, High-Speed Internet and Surveying ([LDBV](https://geodatenonline.bayern.de/)) | [Data licence Germany – attribution – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **LoD2 3D Building Models (CityGML)** | Bavarian Agency for Digitisation, High-Speed Internet and Surveying ([LDBV](https://geodatenonline.bayern.de/)) | [Data licence Germany – attribution – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **DOP20 (Digital Orthophoto, 0.2m)** | Bavarian Agency for Digitisation, High-Speed Internet and Surveying ([LDBV](https://geodatenonline.bayern.de/)) | [Data licence Germany – attribution – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |

> **Official Attribution Notice:**  
> *"Datenquelle: Bayerische Vermessungsverwaltung – www.geodaten.bayern.de"*

---

### Legal Notice (§ 5 DDG) & Contact

- **Developer / Operator:** Ralf Oppel
- **Degree Program:** Geodata Management & Surveying
- **Academic Institution:** Technische Hochschule Würzburg-Schweinfurt (THWS)
- **Contact:** [ralf.oppel@study.thws.de](mailto:ralf.oppel@study.thws.de)
- **License:** [MIT License](LICENSE)

---

## Deutsche Version

Ein interaktives 3D-Webportal und Dashboard zur geospatialen **Sichtbarkeitsanalyse (Viewshed & Line-of-Sight)** für einen fiktiven Antennenstandort im Markt **Randersacker bei Würzburg**. Entwickelt im Rahmen des Moduls **3D-GIS** an der **Technischen Hochschule Würzburg-Schweinfurt (THWS)**.

**Live-Webseite:** [https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)

---

### Hintergrund des Projekts

Für die Planung eines neuen Funk-/Antennenstandorts in hügeligem Weinberggelände (Maintal bei Würzburg) wurde eine 3D-Sichtbarkeits- und Verschattungsanalyse durchgeführt. 

Ziel der Untersuchung:
- Analyse des fiktiven Mobilfunk- bzw. Richtfunkstandorts (**Antenne 3**) im Hinblick auf Sichtkontakt zum Ortskern von Randersacker und den umliegenden Wohngebieten.
- Berücksichtigung der realen Abschattung durch die Topografie (Geländerelief) sowie durch das **LoD2-Gebäudeensemble** (Firste, Dachformen und Traufkanten).

---

### Methodik & Geoverarbeitung (ArcGIS Pro / ArcPy)

1. **Digitales Oberflächenmodell (DOM):**
   - Verschneidung des hochauflösenden **DGM1 (Digitales Geländemodell)** mit rasterisierten amtlichen **CityGML LoD2-3D-Gebäuden**.
   - Resultierendes DOM bildet sowohl das Maintal als auch reale Gebäudehöhen ab.
2. **Beobachter- & Zielpunkte:**
   - 20.263 Beobachtungspunkte im Maintal und Ortskern Randersacker auf 1,50 m Fußgängerhöhe angehoben (`OFFSETB = 1.5 m`).
   - Konstruktion von 20.263 3D-Sichtstrahlen (`ConstructSightLines`) von Antenne 3.
3. **Line-of-Sight & Viewshed:**
   - Berechnung der Sichtlinienunterbrechungen (`LineOfSight`) entlang des DOM.
   - Raster-Sichtfeldanalyse (`Viewshed`) zur Identifizierung verschatteter Talabschnitte.
   - Ergebnis: **484.954 sichtbare Rasterzellen** im Gesamtraum; 2.370 der untersuchten Messpunkte im Ortskern weisen direkten Sichtkontakt auf, während 17.893 Punkte durch Gebäudezeilen oder Talflanken abgeschirmt werden.

---

### Features der interaktiven 3D-Webanwendung

- **Interaktiver 3D-Viewer (Three.js):**
  - Freies Drehen, Schwenken und Zoomen des 3D-Geländereliefs von Randersacker
  - 3D-Gebäude mit Firsten und Dachgeometrien
  - Interaktive Antennenmasten mit animierter Funkwellen-Aura
- **Ebenen-Umschaltung:**
  - *Satellitenbild (DOP20):* Hochauflösendes Orthofoto texturiert auf das 3D-Relief
  - *Viewshed-Raster:* Ein-/Ausblenden der berechneten Sichtbarkeitsmaske (Grün = Sichtbar)
  - *3D-Sichtstrahlenfächer (Rays):* Grüne Sichtstrahlen vs. rote blockierte Strahlen
  - *3D-Gebäude (LoD2):* Realistische Dach- und Wandgeometrien der Ortschaft
- **Kamera-Presets:** Isometrie, Antennen-Nahblick, Maintal-Panorama, Vogelperspektive
- **Ergebnis-Galerie:** Hochauflösende GIS-Auswertungskarten und 3D-Renderschnitte aus der Analyse

---

### Geodatenbasis & Quellenangaben (Credits)

Alle zugrundeliegenden Geobasisdaten stammen aus dem Open-Data-Angebot des Freistaates Bayern:

| Datensatz | Geodatenquelle | Lizenz |
|---|---|---|
| **DGM1 (Digitales Geländemodell)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **LoD2 3D-Gebäudedaten (CityGML)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **DOP20 (Digitale Orthofotos)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |

> **Offizieller Quellennachweis:**  
> *„Datenquelle: Bayerische Vermessungsverwaltung – www.geodaten.bayern.de“*

---

### Impressum (§ 5 DDG) & Kontakt

- **Entwickler / Betreiber:** Ralf Oppel
- **Studiengang:** Geodatenmanagement / Vermessung
- **Akademische Einrichtung:** Technische Hochschule Würzburg-Schweinfurt (THWS)
- **Kontakt:** [ralf.oppel@study.thws.de](mailto:ralf.oppel@study.thws.de)
- **Lizenz:** [MIT License](LICENSE)

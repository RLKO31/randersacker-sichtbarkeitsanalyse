# Sichtbarkeitsanalyse Randersacker (3D-GIS) – Interaktives Web-Dashboard

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?logo=github)](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/3D-Three.js-000000?logo=three.js)](https://threejs.org/)
[![Open Data Bayern](https://img.shields.io/badge/Data-Open%20Data%20Bayern%20(dl--de%2Fby--2--0)-blue)](https://geodatenonline.bayern.de/)

Ein interaktives 3D-Webportal und Dashboard zur geospatialen **Sichtbarkeitsanalyse (Viewshed & Line-of-Sight)** für einen fiktiven Antennenstandort im Markt **Randersacker bei Würzburg**. Entwickelt im Rahmen des Moduls **3D-GIS** an der Technischen Hochschule Würzburg-Schweinfurt (THWS).

👉 **Live-Webseite:** [https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)

---

## 📡 Hintergrund des Projekts

Für die Planung eines neuen Funk-/Antennenstandorts in hügeligem Weinberggelände (Maintal bei Würzburg) wurde eine 3D-Sichtbarkeits- und Verschattungsanalyse durchgeführt. 

Ziel der Untersuchung:
- Analyse des fiktiven Mobilfunk- bzw. Richtfunkstandorts (**Antenne 3**) im Hinblick auf Sichtkontakt zum Ortskern von Randersacker und den umliegenden Wohngebieten.
- Berücksichtigung der realen Abschattung durch die Topografie (Geländerelief) sowie durch das **LoD2-Gebäudeensemble** (Firste, Dachformen und Traufkanten).

---

## 🔬 Methodik & Geoverarbeitung (ArcGIS Pro / ArcPy)

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

## ⚙️ Features der interaktiven 3D-Webanwendung

- 🕹️ **Interaktiver 3D-Viewer (Three.js):**
  - Freies Drehen, Schwenken und Zoomen des 3D-Geländereliefs von Randersacker
  - 3D-Gebäude mit Firsten und Dachgeometrien
  - Interaktive Antennenmasten mit animierter Funkwellen-Aura
- 📊 **Ebenen-Umschaltung:**
  - *Satellitenbild (DOP20):* Hochauflösendes Orthofoto texturiert auf das 3D-Relief
  - *Viewshed-Raster:* Ein-/Ausblenden der berechneten Sichtbarkeitsmaske (Grün = Sichtbar)
  - *3D-Sichtstrahlenfächer (Rays):* Grüne Sichtstrahlen vs. rote blockierte Strahlen
  - *3D-Gebäude (LoD2):* Realistische Dach- und Wandgeometrien der Ortschaft
- 📷 **Kamera-Presets:** Isometrie, Antennen-Nahblick, Maintal-Panorama, Vogelperspektive
- 🖼️ **Ergebnis-Galerie:** Hochauflösende GIS-Auswertungskarten und 3D-Renderschnitte aus der Analyse

---

## 📊 Geodatenbasis & Quellenangaben (Credits)

Alle zugrundeliegenden Geobasisdaten stammen aus dem Open-Data-Angebot des Freistaates Bayern:

| Datensatz | Geodatenquelle | Lizenz |
|---|---|---|
| **DGM1 (Digitales Geländemodell)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **LoD2 3D-Gebäudedaten (CityGML)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |
| **DOP20 (Digitale Orthofotos)** | Bayerische Vermessungsverwaltung ([LDBV](https://geodatenonline.bayern.de/)) | [Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)](https://www.govdata.de/dl-de/by-2-0) |

> **Offizieller Quellennachweis:**  
> *„Datenquelle: Bayerische Vermessungsverwaltung – www.geodaten.bayern.de“*

---

## 📜 Impressum (§ 5 DDG) & Kontakt

- **Entwickler / Betreiber:** Ralf Oppel
- **Studiengang:** Geodatenmanagement / Vermessung
- **Akademische Einrichtung:** Technische Hochschule Würzburg-Schweinfurt (THWS)
- **Kontakt:** [ralf.oppel@study.thws.de](mailto:ralf.oppel@study.thws.de)
- **Lizenz:** [MIT License](LICENSE)


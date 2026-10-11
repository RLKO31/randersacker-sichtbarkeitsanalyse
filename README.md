# Sichtbarkeitsanalyse Randersacker (3D-GIS) – Interaktives Web-Dashboard

Ein interaktives 3D-Webportal und Dashboard zur geospatialen **Sichtbarkeitsanalyse (Viewshed & Line-of-Sight)** für einen fiktiven Antennenstandort im Markt **Randersacker bei Würzburg**. Entwickelt im Rahmen des Moduls **3D-GIS** an der Technischen Hochschule Würzburg-Schweinfurt (THWS).

🌐 **Live-Webseite:** [https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/](https://RLKO31.github.io/randersacker-sichtbarkeitsanalyse/)

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
   - Konstruktion von $20.263$ 3D-Sichtstrahlen (`ConstructSightLines`) von Antenne 3.
3. **Line-of-Sight & Viewshed:**
   - Berechnung der Sichtlinienunterbrechungen (`LineOfSight`) entlang des DOM.
   - Raster-Sichtfeldanalyse (`Viewshed`) zur Identifizierung verschatteter Talabschnitte.
   - Ergebnis: **484.954 sichtbare Rasterzellen** im Gesamtraum; $2.370$ der untersuchten Messpunkte im Ortskern weisen direkten Sichtkontakt auf, während $17.893$ Punkte durch Gebäudezeilen oder Talflanken abgeschirmt werden.

---

## ⚙️ Features der interaktiven 3D-Webanwendung

- 🕹️ **Interaktiver 3D-Viewer (Three.js):**
  - Freies Drehen, Schwenken und Zoomen des 3D-Geländereliefs von Randersacker
  - 3D-Gebäude mit Firsten und Dachgeometrien
  - Interaktive Antennenmasten mit animierter Funkwellen-Aura
- 📊 **Ebenen-Umschaltung:**
  - *Viewshed-Raster:* Ein-/Ausblenden der berechneten Sichtbarkeitsmaske (Grün = Sichtbar)
  - *3D-Sichtstrahlenfächer (Rays):* Grüne Sichtstrahlen vs. rote blockierte Strahlen
  - *3D-Gebäude (LoD2):* Realistische Gebäudekörper der Ortschaft
- 📷 **Kamera-Presets:** Isometrie, Antennen-Nahblick, Maintal-Panorama, Vogelperspektive
- 🖼️ **Ergebnis-Galerie:** Hochauflösende GIS-Auswertungskarten und 3D-Renderschnitte aus der Analyse
- ⚖️ **Rechtssicherheit & Impressum:** Integriertes Impressum (§ 5 DDG) und Lizenzhinweise nach Open Data Bayern (dl-de/by-2-0)

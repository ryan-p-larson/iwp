# Instructions & Documentation


### Table of Contents
1. Files
  - [File Directory](#FDT)
  - [Map Dependencies](#MDP)
2. [Map Functionality](#MF)
  - Outreach Programs Map
  - Youth Participants Map
  - MOOC Map
3. Updating Maps


### Files

There's a lot of files in this repository, some are more important than others. This documentation will serve as a guide while updating the web maps in the future.

**<a name="FDT"></a>File Directory Tree.** Below is an overview of the repository's files and folders, commented to describe their purpose.
```
.
├── data/                     # Contains all data
│   ├── canonical/            # Data used in the live web maps
│   ├── ga/                   # Data from Google Analytics
│   ├── maps/                 # Map data used in creating maps
│   └── original/             # Original data received from IWP
│
├── notebooks/                # Folder to store data manipulation and work
│
├── src/                      # Folder holding the source files to render maps
│   └── instructions/         # Images used in the instructions file
│
├── index.html
├── INSTRUCTIONS.md           # This file
├── moocs-dark.html           # MOOC Map (Dark version)
├── moocs.html                # MOOC Map (Light version)
├── outreach.html             # Outreach Programs Map
├── participants.html         # Youth Participants Map
└── README.md                 # Github 'homepage' file
```

**<a name="MDP"></a>Map - File Dependencies.** Each map renders from a specific data file, to

| Map | File | File Description |
|---|---|---|
| Overseas Outreach Map | `data/canonical/outreach-programs.csv` | A `.csv` file of Outreach programs by year |
| Overseas Outreach Map | `data/canonical/web-map.topojson` | Base web map used to generate countries and locate capitals if necessary. |
| Youth Programs Map | `data/canonical/participant-data.csv` | A `.csv` file with program participants and their attributes. |
| Youth Programs Map | `data/canonical/web-map.topojson` | Base web map used to generate countries and locate capitals if necessary. |
| MOOC Map | `data/canonical/capital-classes.geojson` | Formatted file from Google Analytics, containing the # of new users, total page views, and unique page views for each of the six IWP MOOC's. |


### <a name=MF"></a> Maps Functionality

**Outreach Programs Map:**
<img src="src/instructions/outreach-map-overview.png"></img>

**Youth Participants Map:**
<img src="src/instructions/youth-map-overview.png"></img>

**MOOC Map:**
<img src="src/instructions/mooc-map-overview.png"></img>

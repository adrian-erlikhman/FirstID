# CA-37 Congressional App Challenge 2026: District Research and App Ideas

Prepared 2026-10-18 for a 3-person LACES team (5931 W 18th St, LA 90035). The deadline is **Mon Oct 26, 2026, 12:00 pm EDT**.

Research limits: the shared WebSearch budget ran out partway through. Later facts came from WebFetch on official pages and pages already found. The gaps are listed in section 7. Every fact below has a URL. Lines marked "(estimate)" or "(verify)" are our own inference or were not confirmed.

---

## 0. CAC rules that matter (2026 rulebook)

Source: https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf

- **Creation window:** the app must be created after Oct 30, 2025. For a 2.0 version, only the new code is judged.
- **Team:** up to 4 students, with at least half eligible for the district (https://www.congressionalappchallenge.us/students/rules/).
- **Video:** 1–3 minutes.
- **Judging criteria:** (1) quality of the idea, including creativity and originality; (2) implementation, including UX and design; (3) demonstrated coding excellence.
- **AI:** allowed only for "specific aspects" and must be fully disclosed. Students must show significant individual contribution.
- **Open-source libraries:** allowed but must be documented.
- **Content:** "The app must not adversely affect the reputation of Congressional districts". No IP or privacy violations. The 2025 rules also bar content that would "depict hatred, defame, or threaten any specific community" (https://morgangriffith.house.gov/UploadedFiles/2025-CAC-Rules.pdf).
- **Overlap warning (from team context, not web):** the team already has **Safe Routes LA**, a safety-scored school route planner. A school-route or traffic-safety idea would overlap it. It would have to be clearly new code, or entered as a 2.0 with only the new work highlighted.

---

## 1. District profile (CA-37)

- **Population:** 744,775 (ACS 2024). Median household income $69,595. Per-capita income $38,382. Poverty 20.1%. Median owner-occupied home value $878,300. Foreign-born 35.1%. 57.9% speak a language other than English at home (5-yr). https://censusreporter.org/profiles/50000US0637-congressional-district-37-ca/
  - Home value to income is about **12.6×** (our computation from the two figures above).
- **Race/ethnicity:** 54.0% Hispanic, 22.3% Black, 13.2% White, 6.3% Asian. Cook PVI D+33. Includes Culver City, Ladera Heights, View Park-Windsor Hills, Jefferson Park, Hyde Park, Mid-City, West Adams, Crenshaw, Leimert Park, Baldwin Hills, and parts of DTLA. https://en.wikipedia.org/wiki/California%27s_37th_congressional_district
- **SPA 6 (South LA) neighborhoods:** include Baldwin Hills, Crenshaw, Exposition Park, Hyde Park, Jefferson Park, Leimert Park, University Park, and West Adams. https://homeless.lacounty.gov/spa-6-south-los-angeles/

---

## 2. District needs, 2024–2026

### 2.1 Housing and homelessness
- **2025 count:** LA County 72,308 (down from 75,312 in 2024). City about 43,669 (down from 45,252). https://www.foxla.com/news/los-angeles-homeless-count-2025
  - Unsheltered fell 9.4% in the county and 7.9% in the city. https://lafh.org/homeless-count-2025
- **2026 count (released Jul 24, 2026):** county 73,040 (+1.2% from 72,195), city 45,194 (+3.4%). LAHSA says neither change is statistically significant. Family homelessness fell 14%. https://lasentinel.net/?p=304823
  - Countywide unsheltered rose 3.3%. https://www.foxla.com/news/los-angeles-homeless-count-2026-increase-lahsa-report
- **2026 count is disputed in South LA.** Council District 8 rose **128%**. One West Park Terrace tract went from fewer than 20 people to **277**. On Aug 26, 2026, City Council unanimously asked LAHSA to review the count, and LAHSA opened an internal investigation. https://laist.com/news/lahsa-to-review-2026-homeless-count-numbers
- **Count accuracy:** RAND found the 2025 count captured only about 68% of unsheltered people in Skid Row, Venice, and Hollywood, a 32% undercount (up from 26% in 2024). https://kfiam640.iheart.com/content/2025-10-15-study-finds-la-homeless-count-undercounts-32-in-key-areas/
- **SPA 6 data:** an LAHSA SPA 6 summary exists (https://www.lahsa.org/documents?id=8158-spa-6-hc2024-data-summary), but the PDF blocks automated fetch. **SPA 6 headcounts were not retrieved.**
  - Tract-level 2024 and 2025 street counts are available as xlsx. https://economicrt.org/publication/los-angeles-county-homeless-count-data-library/
- **Housing pressure:** Baldwin Hills Crenshaw Plaza is a $1B, 3M sq ft redevelopment with 961 apartments and condos, a 400-room hotel, and an office tower. Phase 1 broke ground Mar 5, 2026 with 92 townhomes. The article gives no affordable-unit count. https://lasentinel.net/redevelopment-of-baldwin-hills-crenshaw-plaza-begins.html

### 2.2 Heat, shade, and trees
- **Canopy:** South LA averages about **13%**, versus **21%** citywide, and is as low as 5% in places (USC + South LA Tree Coalition, 2024). https://publicexchange.usc.edu/wp-content/uploads/2024/09/USC-SLATC-Project-One-Pager.pdf
- **LABarometer survey** (Feb–Apr 2025, published Nov 2025). https://dornsife.usc.edu/cesr/wp-content/uploads/sites/54/2025/11/LABarometer_ShadeReport_FINAL.pdf
  - 84% of county residents live in low-canopy tracts (under 15%). That share is 91.7% for Black residents and 91.6% for Latino residents.
  - Only **23.3%** agree there is enough shade at their nearest bus or Metro stop.
  - 43% reported heat-illness symptoms in the past year, rising to 58% of outdoor workers.
- **Bus stops:** only **26%** of 10,526 LA Metro bus stops have shade-providing shelters (UCLA Lewis Center / MoveLA, 2023). https://www.sustainablela.ucla.edu/news/ucla-study-finds-only-quarter-la-metro-bus-stops-offer-shade
  - Shelter and lighting are unevenly distributed. Narrow sidewalks block shelters at many high-priority stops. https://www.lewis.ucla.edu/research/progress-priorities-and-obstacles-to-providing-adequate-shade-lighting-at-la-bus-stops
- **UCLA heat maps** (Mar 2026): heat ER visits cluster in South LA and similar areas. Tracts with the least walkable access to air-conditioned public space saw **38% more heat deaths per °C**. Canopy plus cool surfaces could prevent 25–50% of heat ER visits. https://www.smdp.com/ucla-heat-maps-reveal-stark-disparities-in-who-suffers-most-during-extreme-heat.md
- **Street-tree spacing rules (Aug 2026):** Councilmember John Lee's motion starts a 90-day review of the rules, which may be blocking plantings. Urbanized LA County averages about 21% noon shade, versus 27% nationally. https://hoodline.com/2026/08/john-lee-moves-to-axe-l-a-s-strict-street-tree-rules-cool-hotter-neighborhoods/

### 2.3 Air quality and oil drilling
- **Inglewood Oil Field basics:** about 1,000 acres, mostly unincorporated Baldwin Hills. 835 unplugged wells, 655 active, 400+ producing under 15 barrels/day. https://www.aol.com/news/newsom-signs-bills-close-inglewood-225501648.html
- **AB 2716 (Bryan, signed Sept 2024)**, same source:
  - Low-producing wells must be plugged starting in 2026.
  - **All wells must be plugged by end of 2030.**
  - Penalty is $10,000 per noncompliant well per month, paid into a community fund for neighborhoods **within 2.5 miles**.
- **Sentinel Peak lawsuit:** the field's sole operator sued California (reported Nov 28, 2024). The LA Times report describes low-producer shutdown by Mar 2027 and calls the bill "AB 2617". Other sources call it AB 2716; the bill-number confusion is in the press. https://consumerwatchdog.org/in-the-news/los-angeles-times-inglewood-oil-field-owner-sues-california
- **LA County lawsuit (Dec 10, 2025):** filed against Sentinel Peak, Freeport-McMoRan, Plains, and Chevron for failing to plug wells.
  - **157 of 581** unplugged wells are idle, and 70+ more are exhausted.
  - **More than 1 million people live within 5 miles.**
  - Sources: https://lacounty.gov/2025/12/10/la-county-sues-oil-companies-for-failing-to-plug-idle-oil-and-gas-wells-in-inglewood/ and https://laist.com/brief/news/climate-environment/la-county-sues-oil-companies-unplugged-wells-inglewood-oil-field
- **County phase-out status:** https://www.swlaw.com/publication/la-countys-revised-oil-well-ordinance-what-real-estate-investors-and-developers-need-to-know/ (May 2026) and https://planning.lacounty.gov/?p=42414
  - The Jan 2023 ordinance drew operator lawsuits. The County **repealed it in May 2025**.
  - The County is now advancing a **Revised Oil Well Ordinance (ROWO)** under AB 3233, effective Jan 1, 2025. It bans new wells, sets 20-year amortization for nonconforming wells, and requires Baldwin Hills Conservancy-area wells to be plugged by **Dec 31, 2030**.
  - It was expected before the Board in 2026 and was not yet adopted as of May 2026.
- **LA City:** the 2022 ban was struck down Sept 6, 2024 (*Warren E&P v. City of LA*) and then rescinded.
  - A new ordinance under AB 3233 was released for review Sept 2025. https://planning.lacity.gov/oil-and-gas-drilling-ordinance
  - In June 2026 the Council directed a draft with a 20-year phase-out. https://hoodline.com/2026/06/la-pols-plot-20-year-shutdown-of-hidden-city-oil-wells/
- **Neighborhood wells:** at the Murphy drill site in **West Adams**, the city added 30+ conditions, including enclosures, vapor recovery, and more monitoring. https://hoodline.com/2026/03/south-la-neighbors-win-crackdown-on-murphy-oil-drill-site/
- **Culver City:** 38 wells inside city limits must be plugged by 2030. https://culvercitycrossroads.com/?p=69605
- **Statewide:** about 32,000 California wells are classified idle, meaning unused for 2+ years and not plugged. https://www.conservation.ca.gov/calgem/idle_well/Pages/IW-Homepage.aspx
- **LACES distance (estimate):** LACES is roughly 2–3 miles north of the field, so it falls inside the "1M people within 5 miles" zone. This is our own map estimate; verify it.

### 2.4 Transit: K Line, bus stops, World Cup, LA28
- **LAX/Metro Transit Center** opened Jun 6, 2025. K Line ridership rose 139.5% on weekdays, 198.9% on Saturdays, and 214.9% on Sundays (June 2025 vs. June 2024). https://www.metro.net/about/media-relations/lax-metro-transit-center-opening-drives-dramatic-increase-in-ridership-on-k-line/
- **K Line 2025 ridership:** 2,413,581 annual rides (+94%). Weekday ridership was 8,866 in Mar 2026. https://en.wikipedia.org/wiki/K_Line_(Los_Angeles_Metro)
- **K Line Northern Extension:** the San Vicente–Fairfax locally preferred alternative was picked Mar 26, 2026. Service is expected 2047–2049. https://www.metro.net/projects/kline-northern-extension
- **World Cup:** Metro borrowed about 200 buses and says it needs **3,000** for the Olympics. LA28 is planned as a "no car" Games with no venue parking. About 50k rail rides plus 30k shuttle rides were taken for one SoFi match. https://wtop.com/national/2026/07/la-uses-world-cup-to-show-off-upgraded-public-transit-and-test-plans-to-hold-car-free-olympics/
- **FIFA Fan Festival** was held at the **LA Memorial Coliseum (Exposition Park, in CA-37)** starting Jun 11, 2026, at $10 general admission. https://thelalocal.org/los-angeles-city/las-world-cup-fan-festival-opens-heres-a-look-inside-the-official-celebration/
- **Member's FY26 CPF:** $2.6M for the "LA County Metro Regional Stop Enhancement Project", covering **bus shelters and stop upgrades in disadvantaged communities**. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-secures-115-million-strengthen-housing-transportation-and-health

### 2.5 Food access
- **Food insecurity:** 1 in 4 LA County households were food insecure in 2025 (USC Dornsife). Nearly half of CalFresh participants reported food insecurity. https://www.lafoodbank.org/our-work/food-insecurity-and-nutrition-insecurity-in-los-angeles-county/
- **National comparison:** that is more than double the national rate of 13.7%. 29% of LA residents lack consistent access to nutritious food. In Watts, one reopened store is "the only store within about a five-block radius". https://spectrumnews1.com/ca/la/business/2026/03/20/food-insecurity-health-food-desert-
- **SNAP/CalFresh changes:** stricter eligibility and benefit changes took effect **Oct 1, 2026**. 1.5M LA County residents receive CalFresh, and 320k more are eligible but not enrolled. https://laist.com/brief/news/food/community-groups-step-in-as-snap-benefit-cuts-take-hold
- **Member's FY26 CPF:** $250k for the South LA Community Food Hall on the Vermont Corridor. Same CPF source as 2.4.

### 2.6 Traffic safety around schools
- **2024 LA city deaths:** 302 traffic deaths, of which 169 were pedestrians. Pedestrian deaths rose 92% over a decade. https://xtown.la/2025/04/28/walking-in-l-a-sidewalks-are-increasingly-unsafe-for-pedestrians
- **Near schools:** **56% of all fatal and injury collisions occurred within ¼ mile of a school** (LADOT). Traffic collisions are the leading cause of death for ages 2–14. A 15 mph limit was advanced for 201 more schools (Apr 2025). https://abc7.com/post/la-city-council-committee-advances-proposed-15-mph-zones-around-hundreds-schools/16240623/
- **Vision Zero:** LA's Vision Zero missed its 2025 goal. A KPMG audit found it failing. https://www.yahoo.com/news/los-angeles-tried-eliminate-traffic-163054892.html
- **Member's FY27 requests:**
  - $1.5M for Ladera Heights/Windsor Hills Vision Zero pedestrian crossings.
  - $4.5M for "Western Our Way" (5 miles of Western Ave from Century to King) with crosswalks, medians, and **trees**.
  - Source: https://kamlager-dove.house.gov/services/fiscal-year-2027-community-project-funding-selections

### 2.7 Immigration raids, 2025–2026
- **Summer 2025 raids:** began Jun 6, 2025. A federal TRO came Jul 10. Of 330 detainees interviewed by the Mexican consulate, 31% had US-born children. https://centerforhealthjournalism.org/our-work/reporting/first-it-was-covid-19-now-ice-raids-keep-students-risk-missing-school
- **Enrollment losses:** LAUSD lost **13,000+ immigrant students** in 2025–26. English learners fell from about 75k to about 62k. Total enrollment was 392,654, down 4%. https://www.laschoolreport.com/?p=68485
  - Ed-Data lists 497,105 for 2025–26, which likely uses a different scope (verify). https://www.ed-data.org/district/Los-Angeles/Los-Angeles-Unified
- **Attendance:** on the first day of 2025–26, **Region South had the lowest attendance**, which the superintendent attributed to ICE activity. Staff made 11,000 calls and 1,000 home visits, and 300+ families got transportation accommodations. https://edsource.org/2025/lausd-attendance-immigration-enforcement
- **Children detained:** ICE detained 666 children in California during Trump's second term through Mar 2026, and 61% were deported. https://edsource.org/2026/trump-california-child-detentions/762148

### 2.8 Youth jobs
- **Disconnection:** LA County youth disconnection is **11.9%**, or 133,900 people aged 16–24 not working or in school (*A Portrait of LA County 2026*, Mar 2026). https://measureofamerica.org/los-angeles-2026/ It was 13.2% (156,200) in 2020. https://measureofamerica.org/building-bright-futures-for-youth-in-los-angeles/
- **Member's FY27 request:** $2.5M for "Future Force", apprenticeships plus emergency housing vouchers for foster and homeless youth (West LA College / Better Youth). FY27 CPF page above.
- Hire LA's Youth program numbers were not retrieved because the site blocked fetch.

### 2.9 Gentrification and displacement (Crenshaw, Leimert)
- **Leimert Park:** a Jan 2024 LA Times story covered investor pressure on historically Black Leimert Park ("the question triggers fear and anger"). https://en.wikipedia.org/wiki/Leimert_Park,_Los_Angeles (citing https://www.latimes.com/california/story/2024-01-30/investors-leimert-park)
- **Crenshaw Mall:** community fights from 2020–21 over Black ownership of the mall, then the Mar 2026 groundbreaking. https://en.wikipedia.org/wiki/Baldwin_Hills_Crenshaw_Plaza
- **Displacement typologies:** the Urban Displacement Project map is based on 2018 ACS, with CSV/GPKG downloads on GitHub. https://www.urbandisplacement.org/maps/los-angeles-gentrification-and-displacement/
- **Affordability:** home value to income is about 12.6× (section 1).
- **Gap:** no 2025–26 displacement statistic specific to Crenshaw or Leimert was found before the search budget ran out.

### 2.10 Digital divide
- **Price disparities:** Digital Equity LA / CCF (Oct 2022) studied 165 LA County addresses. Spectrum offered lower prices and better terms in wealthier neighborhoods. A UC Santa Barbara study of 35k LA addresses found low-income areas are "advertised higher prices for slower service". https://www.digitalequityla.org/price-disparities
- **Gap:** a tract-level broadband statistic for CA-37 was not retrieved. Census Reporter and the Census API were blocked or required a key.

### 2.11 LAUSD attendance and mental health
- **Chronic absenteeism:** **21.3%**, down 0.6 points (CA School Dashboard, reported Oct 16, 2026). Graduation rate is 87.6%, an all-time high. https://edsource.org/updates/lausd-celebrates-progress-in-student-test-scores-dashboard-markers
- **Mental-health access:** students are about 6× more likely to access mental-health care during the school year than in summer. https://edsource.org/2025/immigration-ice-raids-mental-health-services/735098
- **Measurement problems:** a national study found absence definitions vary. Only 17% of parents completed an attendance-upload task, and many parents of chronically absent teens don't think their child misses too much. https://www.laschoolreport.com/my-absenteeism-study-failed-the-reasons-are-more-interesting-than-any-data/
- **Gap:** LAUSD school-climate or mental-health survey statistics were not retrieved.

---

## 3. Rep. Sydney Kamlager-Dove: priorities, 2025–2026

**Committees (119th Congress).** House **Foreign Affairs**, where she is **Ranking Member of the South & Central Asia Subcommittee**, and House **Judiciary**, a new assignment. https://kamlager-dove.house.gov/about and https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-serve-house-judiciary-foreign-affairs-committees-119th-congress (Jan 14, 2025). She sat on Natural Resources in the 118th Congress. https://kamlager-dove.house.gov/media/press-releases/rep-kamlager-dove-appointed-serve-house-committee-natural-resources-118th

**Caucuses.**
- **Congressional Black Caucus Whip**, Democratic Women's Caucus Policy Co-Chair, and Brazil Caucus Co-Chair. https://kamlager-dove.house.gov/about
- **Co-chair of the Congressional Caucus on Foster Youth.** https://fosteryouthcaucus-gwenmoore.house.gov/about/membership
- Launched the bipartisan movies/music/entertainment/sports ("MoMEntS") caucus on Sept 16, 2026. https://kamlager-dove.house.gov/media/press-releases
- Her stated framework is "L.E.A.D.": Land, Economic Justice, Art, Democracy. https://kamlager-dove.house.gov/about

**Bills and actions relevant to local issues.**
- **Foster and homeless youth:**
  - Medicaid eligibility bills for foster youth with Rep. Bacon (Oct 1, 2026).
  - Higher-education barriers bill for homeless and foster youth with Sen. Murray and Rep. Houchin (Jul 28, 2026).
  - Source: https://capitolreleases.com/house/kamlagerdove-sydney
- **Immigration:**
  - Statement on LA ICE raids (Jun 6, 2025). https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-statement-ice-raids-los-angeles
  - VISIBLE Act (Jul 23, 2025), requiring officers to display ID. https://kamlager-dove.house.gov/media/press-releases?page=10
  - With Rep. Vargas, an effort to **block immigrants' personal data from being used for deportations** (Sept 11, 2025). https://kamlager-dove.house.gov/media/press-releases?page=8
  - Bill on medical care for ICE detainees (Jul 29, 2026) and a floor demand for a detained constituent's care (Jul 23, 2026). https://kamlager-dove.house.gov/media/press-releases
- **World Cup and LA28:**
  - Led a California delegation letter seeking **$2B for LA28 mobility** in the FY27 budget (Mar 6, 2026). https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-leads-effort-secure-2-billion-transit-initiatives-ahead-la28
  - $1M for Expo Park safety before the World Cup and LA28 (Jan 26, 2026). https://kamlager-dove.house.gov/media/press-releases?page=4
  - **H.R. 5021 American Decade of Sports Act**, sponsor, passed HFAC Dec 3, 2025. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-celebrates-committee-passage-american-decade-sports-act
  - Letter urging FIFA to lower ticket prices (Mar 11, 2026). https://kamlager-dove.house.gov/media/press-releases?page=2
  - Convened the LA County delegation with Mayor Bass on Games preparation (Mar 30, 2025). https://kamlager-dove.house.gov/media/press-releases?page=12
- **Housing and safety net:**
  - Voted yes on the 21st Century ROAD to Housing Act (May 20, 2026) and held an LA panel on its local impact (Jul 28, 2026). https://kamlager-dove.house.gov/media/press-releases?page=1 and https://kamlager-dove.house.gov/media/press-releases
  - INSURE Act with Sen. Schiff on home insurance (Jul 18, 2025). https://kamlager-dove.house.gov/media/press-releases?page=10
  - Opposed SNAP cuts (Apr 30, 2026). https://capitolreleases.com/house/kamlagerdove-sydney
- **Environment:** bill requiring EPA to account for climate risk at Superfund sites (Apr 14, 2026). https://kamlager-dove.house.gov/media/press-releases?page=2
- **Tech:** investigation into the UAE AI chip deal (Feb 12, 2026). https://kamlager-dove.house.gov/media/press-releases?page=3 She is wary of AI hype in trade policy, which is one more reason not to lead with "it uses AI".

**Community Project Funding.**
- **FY26: $11.56M for 15 projects** (Feb 26, 2026). https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-secures-115-million-strengthen-housing-transportation-and-health
  - $2.6M Metro bus shelters and stop upgrades
  - $1.04M Expo Park safety
  - $1.2M Culver City hydrogen bus
  - $1M Culver City Overland Ave bike and pedestrian connector
  - $850k Inside Safe
  - $850k Urban Awnings (17 low-income units, South LA)
  - $850k Jubilo Village (93 affordable units)
  - $500k Vermont/Manchester transit priority
  - $440k Carver MS STEM center
  - $250k each: veterans gym, Broadway Sur lighting, **Pueblo del Rio AC** (1,792 residents), **South LA Community Food Hall**
  - $200k Blackwelder Greenbelt on Ballona Creek
  - $1.03M opioid recovery
- **FY27: 20 requests, $43.5M stated** (itemized amounts sum to about $40.85M). https://kamlager-dove.house.gov/services/fiscal-year-2027-community-project-funding-selections
  - **$4.5M Western Ave traffic safety and trees**
  - **$1.5M Ladera/Windsor Hills Vision Zero crossings**
  - **$4.35M Pueblo del Rio AC (660 units)** and **$1.2M Avalon Gardens AC (164 units)**
  - $2.5M Future Force foster/homeless youth apprenticeships
  - $980k Epworth TAY supportive housing
  - $1.5M CIRCLE unarmed homeless response
  - $2.8M Expo Park dispatch; $1.4M LAPD drones (special events)
  - $1.2M LAUSD aerospace fabrication hub
  - Clinics: UMMA $3.5M, Watts Healthcare $5M, T.H.E. $998k, Kedren mobile $471k, Eisner $1M

**Reading for app pitches.** Her clearest local funding themes are bus stops and shelters, heat (AC in public housing, trees on Western), pedestrian safety, foster and homeless youth, Expo Park and LA28 readiness, and immigrant families' data and safety. No press release on the Inglewood Oil Field was found in the pages reviewed. Environmental pitches should tie instead to "Land" in L.E.A.D., her Superfund climate-risk bill, and her prior Natural Resources seat.

---

## 4. Open data inventory

The browser-access ratings below are based on documentation. Live CORS tests from this sandbox were blocked by the egress proxy, so verify each in a browser in 5 minutes before committing.

| Source | What | Access / format | Browser-direct? |
|---|---|---|---|
| **LA City Open Data (Socrata)**, data.lacity.org | Traffic Collision Data 2010–present (`d5tf-ez2w`): https://data.lacity.org/Public-Safety/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w. Also MyLA311 service requests (annual datasets) and LAPD data. | SODA JSON/CSV at `/resource/<id>.json` | **Yes.** Socrata supports CORS and JSONP for public read-only data: https://dev.socrata.com/docs/cors-and-jsonp.html. Check each dataset's last-updated date (verify). |
| **LA County Open Data**, data.lacounty.gov | Hub portal (ArcGIS Hub), including County building and parcel layers | ArcGIS REST, GeoJSON downloads | Likely yes; ArcGIS Hub/REST usually allows CORS (verify). Portal platform: https://data.lacounty.gov/ |
| **CalEnviroScreen 4.0** feature service | Tract scores and about 80 fields (PM2.5, diesel, traffic, asthma, poverty, housing burden, and more) | ArcGIS REST, JSON/geoJSON/PBF, maxRecordCount 2000: https://gispublic.waterboards.ca.gov/portalserver/rest/services/Hosted/CES4_final/FeatureServer/0 | Likely yes (ArcGIS REST); CORS not stated, so verify |
| **CalEnviroScreen 5.0** | Final release Jul 1, 2026. New indicators: diabetes and small air-toxic sites. | Downloads on data.ca.gov: https://oehha.ca.gov/calenviroscreen/report/calenviroscreen-50 | Precompute (download, then serve static) |
| **CalGEM WellSTAR wells** | Every CA oil/gas well, updated **daily**. 28 fields: API, LeaseName, WellStatus, WellType, OperatorName, FieldName, Latitude/Longitude, SpudDate, **inHPZ** (SB 1137 health-protection zone), and more. | REST: https://gis.conservation.ca.gov/server/rest/services/WellSTAR/Wells/MapServer/0 (JSON/geoJSON/PBF, max 5,000 records). CSV/SHP daily downloads: https://www.conservation.ca.gov/calgem/maps | Likely yes (ArcGIS Server); verify. CSV via scheduled job also works. |
| **CalGEM idle wells** | Definitions, operator plans | https://www.conservation.ca.gov/calgem/idle_well/Pages/IW-Homepage.aspx | Reference only |
| **LA County oil well dashboard** | GIS well dashboard tied to the ROWO | Mentioned in https://www.swlaw.com/publication/la-countys-revised-oil-well-ordinance-what-real-estate-investors-and-developers-need-to-know/ | Verify URL and services |
| **Tree canopy and heat** | USC/SLATC canopy stats; Tree Equity Score (0–100 need score built from canopy, surface temperature, income, health, and more), with a data-download section: https://www.treeequityscore.org/ | Static downloads | Precompute |
| **CalHeatScore** | ZIP-level heat risk 0–4, updated daily, REST API plus monthly archive (launched Dec 31, 2024): https://calheatscore.calepa.ca.gov/ | REST | CORS unknown, so **proxy through a Next.js API route** |
| **LA Metro realtime** | GTFS-rt trip updates and vehicle positions (every minute), canceled bus service (every 15 min), weekly calendar_dates: https://api.metro.net/ (Swagger at /docs). All GTFS endpoints need an agency_id. | GTFS-rt (protobuf); JSON variants (verify) | CORS unknown, so **proxy** |
| **LA Metro static GTFS** | Bus GTFS repo: https://gitlab.com/LACMTA/gtfs_bus | zip/txt | Precompute (stops.txt, stop_times) |
| **Metro ridership** | Monthly ridership by line: https://opa.metro.net/MetroRidership/IndexRail.aspx | HTML form | Scrape or precompute |
| **LAHSA homeless count** | Tract-level street counts 2024 and 2025 (xlsx): https://economicrt.org/publication/los-angeles-county-homeless-count-data-library/. LAHSA SPA summaries are PDFs that block bots. | xlsx/PDF | Precompute |
| **LAUSD / CDE** | Ed-Data district profile (https://www.ed-data.org/district/Los-Angeles/Los-Angeles-Unified) and CA Dashboard. CDE DataQuest blocks automated fetch. | Downloads | Precompute; no browser API |
| **Census ACS API** | Now **requires an API key** ("Missing Key" error) | REST | Use a server route to hide the key; sign up at https://api.census.gov/data/key_signup.html |
| **Urban Displacement Project** | LA gentrification typologies (2018 ACS), CSV/GPKG on GitHub | Static | Yes, if served from your own repo |
| **City Plants** | Free street and yard tree requests (LADWP-funded): https://www.cityplants.org/ | Web forms (no API) | Deep-link only |

---

## 5. Eight candidate app ideas

Lanes avoided as requested: generic wildfire, mental-health chatbots, elder-care memory apps, and to-do/study apps.

### Idea 1: PlugWatch (Inglewood Oil Field accountability tracker)
- **Pitch:** A live public scoreboard showing whether the Inglewood Oil Field is actually on track to be fully plugged by the 2030 deadline in state law, and what that means for your block.
- **Users:**
  - Baldwin Hills, Ladera, View Park, Culver City, and West Adams residents
  - Neighborhood councils and teachers (science and civics)
  - Council and congressional staff
- **Local problem and stat:** AB 2716 requires all wells plugged by end of 2030 and low producers starting 2026. Penalties fund neighborhoods within 2.5 miles (https://www.aol.com/news/newsom-signs-bills-close-inglewood-225501648.html). The County says 157 of 581 unplugged wells are idle and over 1M people live within 5 miles (https://lacounty.gov/2025/12/10/la-county-sues-oil-companies-for-failing-to-plug-idle-oil-and-gas-wells-in-inglewood/).
- **Technical core:**
  1. **Ingest and diff.** A nightly job (GitHub Actions cron or Vercel cron) pages through CalGEM WellSTAR REST for `FieldName` = Inglewood and the LA City drill sites. It stores a versioned snapshot (SQLite or JSON in the repo) and diffs statuses (active → idle → plugged) into a public change feed (JSON/RSS).
  2. **Compliance projection.** From status counts and the 12/31/2030 deadline, compute the required plug rate per month versus the observed rate. Show "months behind or ahead", using a simple Poisson or linear model with an uncertainty band.
  3. **Exposure geometry.** Run Turf.js spatial joins of every well against school points, parks, and census-block population. Report population-weighted distance, a count of children within 3,200 ft (CalGEM's `inHPZ` flag; verify the distance against SB 1137), and a 2.5-mile community-fund buffer around the field polygon.
  4. **Address lookup.** "Am I in the AB 2716 benefit zone? Which wells are nearest my school?"
  - What makes it hard: incremental ETL, temporal diffing, geodesic buffers, and a defensible projection model.
- **Data:** CalGEM WellSTAR REST and daily CSV; LA County lawsuit and ROWO facts; CalEnviroScreen 5.0 tract context; school locations (LAUSD/CDE); census blocks.
- **Feasibility (7 days, 3 people): High.** The data is clean and official.
- **Caveats:**
  - With only 7 days, the change feed will be sparse. Seed a baseline and show the pipeline running.
  - "Low-producing" classification needs CalGEM production data (verify availability).
- **Prior art:**
  - CalGEM Well Finder and the HPZ map (https://www.conservation.ca.gov/calgem/maps)
  - LA County oil well dashboard (via https://www.swlaw.com/publication/la-countys-revised-oil-well-ordinance-what-real-estate-investors-and-developers-need-to-know/)
  - FracTracker analyses (https://www.fractracker.org/)
  - All of these show where wells are. None tracks progress against the legal deadline or answers "am I in the fund zone?"
- **Member fit: Medium-high.** It fits "Land" in L.E.A.D., her Superfund climate-risk bill (Apr 2026), and her prior Natural Resources seat. It also reflects the County's environmental-justice lawsuit in her district.
- **CAC reputation risk: Low-medium.**
  - Frame it as transparency on a state law using official data.
  - Avoid "toxic neighborhood" language.
  - Don't make health claims beyond cited sources.
  - Don't characterize Sentinel Peak beyond court filings (litigation is ongoing).

### Idea 2: ShadeStop (heat exposure ranking for every bus stop)
- **Pitch:** Ranks every bus stop in CA-37 by how much sun riders actually stand in, so the Member's $2.6M bus-shelter money and LA28 upgrades go to the hottest stops first. It also tells riders when to leave so they wait as little as possible in the sun.
- **Users:**
  - Riders, including LACES students who commute by bus
  - Metro and LADOT planners
  - Council offices and the Member's CPF staff
- **Local problem and stat:** only 26% of Metro stops have shade shelters (https://www.sustainablela.ucla.edu/news/ucla-study-finds-only-quarter-la-metro-bus-stops-offer-shade). Only 23.3% of residents say their nearest stop has enough shade (https://dornsife.usc.edu/cesr/wp-content/uploads/sites/54/2025/11/LABarometer_ShadeReport_FINAL.pdf).
- **Technical core:**
  1. **Shade simulation.** For each stop's waiting area, compute the shaded fraction every 15 minutes over a hot-season day. Use solar position (SunCalc or NOAA SPA) plus 2.5D shadow casting from building footprints with heights (LA County LARIAC buildings; verify the layer) and tree canopy. Precompute in a Web Worker or with a Python job.
  2. **Exposure index.** Sum unshaded fraction × heat (CalHeatScore or historic temperature) × boardings × expected wait (headway/2 from GTFS).
  3. **Prioritization.** Produce a ranked list exportable as CSV for council and CPF staff. Add a "what if" toggle that adds a shelter or a tree and re-ranks.
  4. **Rider mode.** GTFS-rt predictions drive "leave in N minutes" so riders wait under X minutes at an unshaded stop, plus the nearest shadier stop on the same route within about 150 m.
  - What makes it hard: the shadow geometry, joining time-varying data, and live GTFS-rt.
- **Data:** Metro GTFS and GTFS-rt (https://api.metro.net/); building footprints and heights (LA County hub); canopy (Tree Equity Score / USC); CalHeatScore (https://calheatscore.calepa.ca.gov/).
  - Shelter inventory may not be public (verify). The fallback is a team-run field audit of about 50 stops through an in-app photo tagger, which also gives the video its personal-story footage.
- **Feasibility: Medium-high.** The shadow precompute is the risk. Fallback: canopy-only plus building shadow on major corridors (Crenshaw, Western, Pico, Venice, Vermont, Jefferson).
- **Prior art:** ShadeMap (browser shadow simulation, https://shademap.app/); UCLA Lewis Center shelter analyses (https://www.lewis.ucla.edu/research/progress-priorities-and-obstacles-to-providing-adequate-shade-lighting-at-la-bus-stops). Neither ranks stops by rider-weighted heat exposure or connects to live arrivals.
- **Member fit: High.**
  - FY26 $2.6M Metro stop enhancement
  - FY27 Western Ave trees and safety
  - FY27 public-housing AC (heat is a stated concern)
  - $2B LA28 mobility letter and Expo Park readiness
  - Source for CPF items: https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-secures-115-million-strengthen-housing-transportation-and-health
- **CAC risk: Low.** This is an investment-prioritization tool.

### Idea 3: Plantable (finds legal street-tree spots and requests them)
- **Pitch:** Finds every parkway spot on low-canopy blocks where a street tree is legally plantable today, shows the shade and cooling it would add, and gets residents to a free City Plants request in one tap.
- **Users:** renters and homeowners in low-canopy blocks; tree-planting nonprofits; council offices.
- **Local problem and stat:** South LA canopy is about 13% versus 21% citywide, as low as 5% (https://publicexchange.usc.edu/wp-content/uploads/2024/09/USC-SLATC-Project-One-Pager.pdf). City Council is reviewing tree-spacing rules that may block plantings (Aug 2026; https://hoodline.com/2026/08/john-lee-moves-to-axe-l-a-s-strict-street-tree-rules-cool-hotter-neighborhoods/).
- **Technical core:**
  1. **Constraint solver.** Encode spacing rules (distance from intersections, driveways, hydrants, streetlights, and existing trees) as geometric constraints. Run them over parkway or curb geometry minus existing street-tree points to produce candidate planting points.
  2. **"Rules sandbox".** A slider shows how many more trees become plantable if the rules change. This ties to the live Council review.
  3. **Ranking.** Score candidates by heat (land-surface temperature) × foot traffic (bus stops, schools).
- **Data:** LA City street-tree inventory and sidewalk/curb layers (StreetsLA/BOE; **verify availability**); Tree Equity Score; Metro stops; City Plants request flow (https://www.cityplants.org/).
- **Feasibility: Medium.** Everything depends on finding usable sidewalk and tree layers on day 1. Fallback: OSM plus manual digitizing of 3–4 pilot blocks.
- **Prior art:** City Plants (free trees, no siting tool); Tree Equity Score (need scores, not sites); UCLA/Boyle Heights spacing study (via the Hoodline article).
- **Member fit: Medium-high.** FY27 Western Our Way includes trees. Also FY26 Blackwelder Greenbelt and "Land".
- **CAC risk: Low.**
- **Note:** this could merge into ShadeStop as its "fix" layer (plant here at the worst stops).

### Idea 4: FreshReach (food access by transit and time of day)
- **Pitch:** Shows which blocks can't reach a full-service grocery store or EBT-accepting market by bus within 20 minutes at the hours people actually shop. It routes CalFresh users to the nearest open option.
- **Users:** CalFresh households without cars; food pantries and the LA Food Bank; council offices.
- **Local problem and stat:** 1 in 4 LA County households were food insecure in 2025 (https://www.lafoodbank.org/our-work/food-insecurity-and-nutrition-insecurity-in-los-angeles-county/). Stricter CalFresh rules took effect Oct 1, 2026, affecting a program with 1.5M recipients and 320k eligible but not enrolled (https://laist.com/brief/news/food/community-groups-step-in-as-snap-benefit-cuts-take-hold).
- **Technical core:**
  1. **RAPTOR transit router.** Implement RAPTOR in a Web Worker over Metro GTFS. Compute time-dependent isochrones (Tue 6 pm, Sat 10 am, and so on) from every census block to stores filtered by their opening hours.
  2. **Access-gap map.** Compare blocks against a car baseline and rank pantry pop-up sites by the number of residents newly covered (greedy max-coverage).
  3. **Pointers, not a rules engine.** Link to official DPSS and GetCalFresh screening rather than encoding eligibility rules, to avoid giving wrong legal or benefit advice.
- **Data:** Metro GTFS; SNAP retailer locations (USDA; verify source and URL); pantry lists (LA Food Bank locator; verify scrapeability); OSM supermarkets; census blocks.
- **Feasibility: Medium.** RAPTOR is about 300 lines but needs testing. A fallback is precomputing with an existing router (OpenTripPlanner/r5) and shipping static isochrones.
- **Prior art:** LA Food Bank pantry locator; Propel (EBT balance app); USDA Food Access Research Atlas (static, car/distance-based). None does time-of-day transit isochrones for CA-37.
- **Member fit: Medium-high.** She opposed SNAP cuts (Apr 2026; https://capitolreleases.com/house/kamlagerdove-sydney). FY26 South LA Community Food Hall.
- **CAC risk: Low-medium.** Avoid "food desert" stigma framing; use "access gap".

### Idea 5: ReadyFamily (zero-knowledge family emergency plan for mixed-status households)
- **Pitch:** An offline, no-account app that helps a family make a plan before an emergency. It covers who picks up the kids, caregiver authorization forms, emergency contacts, and key documents, encrypted so that only the family can read it.
- **Users:** parents in mixed-status families, LAUSD family centers, and legal-aid partners.
- **Local problem and stat:** LAUSD lost 13,000+ immigrant students after the 2025 raids (https://www.laschoolreport.com/?p=68485). Region South had the lowest first-day attendance (https://edsource.org/2025/lausd-attendance-immigration-enforcement). 31% of detainees interviewed had US-born children (https://centerforhealthjournalism.org/our-work/reporting/first-it-was-covid-19-now-ice-raids-keep-students-risk-missing-school).
- **Technical core:**
  1. **Encryption.** WebCrypto AES-GCM with passphrase-derived keys (PBKDF2/Argon2-wasm), stored in IndexedDB, with no server.
  2. **Sharing.** Encrypted QR or one-time bundle sharing with a designated caregiver.
  3. **Forms.** In-browser PDF form filling (pdf-lib) for California caregiver authorization and school emergency cards.
  4. **Resilience.** Offline PWA, panic-wipe, and multilingual UI (Spanish first).
  5. **Threat model.** A written threat model is part of the submission.
  - What makes it hard: the security engineering.
- **Data:** none sensitive leaves the device. Static legal-resource lists come from partners (CHIRLA or ILRC; verify their current forms).
- **Feasibility: High.**
- **Prior art:** family preparedness plan PDFs from legal nonprofits (ILRC page did not load; verify); hotline-based rapid-response networks (https://edsource.org/2026/trump-california-child-detentions/762148).
- **Member fit: High.** Her bill with Vargas to block immigrants' personal data from deportation use (Sept 2025; https://kamlager-dove.house.gov/media/press-releases?page=8) matches the zero-data design. Also the ICE detainee care bill (Jul 2026).
- **CAC risk: Medium (political).**
  - Stay strictly on preparedness and legal documents.
  - **No ICE-sighting maps or alerts**, and nothing that reads as evading law enforcement.
  - No legal advice; link to attorneys.

### Idea 6: CountCheck (tract-level anomaly detector for the homeless count)
- **Pitch:** Flags census tracts where the homeless count jumped or dropped more than other independent signals can explain, so the LAHSA review and council offices know where to recount.
- **Users:** council and LAHSA analysts, journalists, homeless-service nonprofits.
- **Local problem and stat:** CD8's 2026 count rose 128%. One West Park Terrace tract went from under 20 people to 277, and the City Council ordered a review (https://laist.com/news/lahsa-to-review-2026-homeless-count-numbers). RAND found a 32% undercount in three areas in 2025 (https://kfiam640.iheart.com/content/2025-10-15-study-finds-la-homeless-count-undercounts-32-in-key-areas/).
- **Technical core:**
  1. **Anomaly model.** A hierarchical Poisson model with spatial smoothing (BYM/CAR), or a simpler empirical-Bayes version. It predicts each tract's count from prior years plus independent proxies: MyLA311 encampment requests, cleanups, and shelter capacity.
  2. **Output.** Tracts whose observed count falls outside the posterior predictive interval go on a review list, with a map and explanations.
- **Data:** LAHSA tract counts 2024 and 2025 (https://economicrt.org/publication/los-angeles-county-homeless-count-data-library/); 2026 tract data (**verify release**); MyLA311 on Socrata (CORS OK).
- **Feasibility: Medium.** 2026 tract data availability is the gate.
- **Prior art:** RAND's independent counts; LAHSA dashboard. No public anomaly tool was found.
- **Member fit: Medium.** Housing votes, FY27 CIRCLE unarmed response, FY26 Inside Safe.
- **CAC risk: Medium.** Homelessness maps can read as portraying the district negatively. Frame it as data quality ("every person counted"), not as "where the homeless are".

### Idea 7: HoldGround (tenant displacement early warning)
- **Pitch:** Enter your address to see whether your building is rent-stabilized and what protections you have. Organizers get an early-warning map of buildings showing investor-purchase and eviction-notice spikes.
- **Users:** renters in Crenshaw, Leimert, West Adams, and Hyde Park; tenant organizers; legal aid.
- **Local problem and stat:** home value to income in CA-37 is about 12.6× ($878,300 / $69,595; https://censusreporter.org/profiles/50000US0637-congressional-district-37-ca/). A $1B, 961-unit Crenshaw Mall redevelopment broke ground in Mar 2026 (https://lasentinel.net/redevelopment-of-baldwin-hills-crenshaw-plaza-begins.html). Investor pressure in Leimert Park was reported in 2024 (https://en.wikipedia.org/wiki/Leimert_Park,_Los_Angeles).
- **Technical core:**
  1. **Entity resolution.** Fuzzy-match LLC owner names and mailing addresses across assessor sales to cluster investor portfolios.
  2. **Parcel joins.** Join by APN across rent-stabilization, eviction-notice, and code-enforcement datasets.
  3. **Risk score.** A transparent, explainable score.
  4. **Multilingual output.** Rights lookup in multiple languages.
- **Data:** LA County Assessor parcels and sales (verify); LAHD RSO and eviction-notice data on data.lacity.org (**verify they exist and are current**); UDP typologies (https://www.urbandisplacement.org/maps/los-angeles-gentrification-and-displacement/).
- **Feasibility: Low-medium.** The data joins are heavy and availability is unverified.
- **Prior art:** NYC's "Who Owns What" (JustFix) model and LA tenant groups (not fetched; verify); UDP maps.
- **Member fit: Medium.** ROAD to Housing Act; FY26 affordable-housing CPF.
- **CAC risk: Medium.** Naming landlords creates defamation exposure. Show only public records and avoid accusatory labels.

### Idea 8: BellTime (school-zone crossing-guard and slow-zone optimizer)
- **Pitch:** Uses crash data at arrival and dismissal times to tell LADOT and LAUSD exactly where the next crossing guard or 15 mph sign would prevent the most injuries near CA-37 schools.
- **Users:** LADOT/LAUSD Safe Routes staff, principals, PTAs, council offices.
- **Local problem and stat:** 56% of fatal and injury collisions occur within ¼ mile of a school (https://abc7.com/post/la-city-council-committee-advances-proposed-15-mph-zones-around-hundreds-schools/16240623/). 169 pedestrians were killed in LA in 2024 (https://xtown.la/2025/04/28/walking-in-l-a-sidewalks-are-increasingly-unsafe-for-pedestrians).
- **Technical core:**
  1. **Hotspot model.** Spatiotemporal kernel density of collisions restricted to weekday bell windows and school-calendar days.
  2. **Placement optimizer.** A maximal-covering location problem (ILP via HiGHS-wasm or glpk.js) places N guards or signs. It is validated against LADOT's 201 new 15 mph zones.
- **Data:** LA City Traffic Collision Data (`d5tf-ez2w`, Socrata, CORS OK; check last update); school locations; bell schedules.
- **Feasibility: Medium-high.**
- **Prior art and overlap:** LADOT Safe Routes to School program; **the team's own Safe Routes LA** (route scoring). The overlap is high, so this only makes sense as a clearly scoped "Safe Routes LA 2.0" with only the new optimizer code judged, or skip it.
- **Member fit: High.** FY27 Ladera/Windsor Hills Vision Zero crossings ($1.5M) and Western Our Way ($4.5M).
- **CAC risk: Low-medium.** Frame it as where to invest, not "dangerous neighborhoods".

**Lanes considered and dropped:**
- **Youth jobs matcher:** 11.9% county disconnection (https://measureofamerica.org/los-angeles-2026/), but a job board reads as generic.
- **Broadband price auditor:** relies on scraping ISP sites, which is a ToS risk; the core data is from 2022.
- **Mental-health or attendance app:** avoided per instructions. The relevant stat is chronic absenteeism of 21.3% (https://edsource.org/updates/lausd-celebrates-progress-in-student-test-scores-dashboard-markers).

---

## 6. Ranking: top 3

Criteria: narrow and local; working demo in 7 days; a defensible technical core that isn't an LLM wrapper; Member fit; data reliability; novelty versus prior art; reputational risk; personal story.

**#1 PlugWatch.**
- **Most uniquely CA-37.** The largest urban oil field (https://culvercitycrossroads.com/?p=69605) sits in the middle of the district, under a hard legal deadline (2030) and active County litigation (Dec 2025).
- **Best-quality data.** Official, daily, ArcGIS REST with JSON/geoJSON, which makes it the least risky to demo.
- **Technical core judges can name:** ETL plus temporal diffing, compliance projection, and geospatial exposure.
- **Personal story:** LACES is roughly 2–3 miles from the field (estimate), and students hike Kenneth Hahn and Baldwin Hills.
- **Gap it fills:** existing maps show wells; none answers "are we on schedule, and am I in the fund zone?"
- **Main weakness:** the Member has no oil-specific press releases. Pitch it through environmental justice ("Land") and community benefit.

**#2 ShadeStop.**
- **Strongest Member alignment.** It plugs directly into her FY26 $2.6M bus-shelter CPF, the FY27 Western Ave trees, heat and AC concerns, and the $2B LA28 mobility push.
- **Very visual demo:** shadows sweeping across a stop over a day, plus a live "leave now" timer.
- **Real geometric computation** at its core.
- **Personal story:** LACES students' bus commutes in September heat.
- **Weakness:** shelter inventory data may need a field audit. That's manageable and makes good video footage.

**#3 FreshReach.**
- **Timely.** The Oct 1, 2026 CalFresh changes landed 3 weeks before the deadline.
- **Real algorithm (RAPTOR)**, not a lookup table.
- **Low risk and clear fit** with her SNAP stance and the South LA Food Hall CPF.
- **Strong demo:** a time slider showing the access map shrinking at night.
- **Alternatives:** Plantable can stand in for #3, or merge into ShadeStop, if the team prefers one heat narrative and finds the sidewalk and tree layers on day 1. ReadyFamily is strongest on Member fit but carries political and judging-panel risk, and its technical core (security) is harder to show in a 3-minute video.

**Suggested 7-day plan for the #1 or #2 pick:**
- **Day 1:** data spike. Verify CORS and endpoints, and download baselines.
- **Days 2–4:** core algorithm and map UI (Next.js + MapLibre).
- **Day 5:** the user-facing flow (address lookup or "leave now").
- **Day 6:** polish, accessibility, Spanish strings, and the AI-use disclosure doc.
- **Day 7:** 3-minute video. Open with a 20-second personal story, then a live demo, then the technical core diagram.

---

## 7. Gaps and what to verify
- WebSearch budget was exhausted mid-research, so some lanes have thinner sourcing.
- **SPA 6 homeless headcounts** were not retrieved because LAHSA PDFs block automated fetch. Get them from LAHSA's dashboard by hand.
- **No 2025–26 statistics** were found for Crenshaw/Leimert displacement, CA-37 broadband by tract, or LAUSD mental-health surveys.
- **Hire LA's Youth** figures: the site blocked fetch.
- **CORS** for Metro api.metro.net and CalHeatScore is unknown. The sandbox proxy blocked live tests of all APIs.
- **Unverified datasets:** Metro bus-shelter inventory, LA City sidewalk and street-tree layers, and LAHD eviction-notice data.
- **AB 2716 vs. "AB 2617":** the bill number is inconsistent in press. Verify on leginfo before citing in the video.
- **SB 1137 health-protection-zone distance** (commonly 3,200 ft): confirm on CalGEM before using it in the UI.
- **FY27 CPF totals** don't add up: the stated $43.5M versus about $40.85M itemized.

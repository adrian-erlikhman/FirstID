# How past Congressional App Challenge winners were built

Research notes, compiled 2026-10-18, for a 3-person LA team entering CAC 2026 (deadline Oct 26, 2026).

Conventions:
- Every fact has a URL.
- [UNCONFIRMED] marks inference or single-source claims.
- "Transcript" means the auto-generated YouTube transcript at youtubetotranscript.com/transcript?v=ID. These transcripts garble names, so tool names taken from them are best-effort.
- Repo stats come from my own shallow clones; the method is in the "Repo analysis method" section.

Access limits:
- congressionalappchallenge.us blocked direct curl (proxy 403), so every CAC page and the rules PDF were read through WebFetch. Rules quotes are as WebFetch extracted them from the PDF.
- The GitHub search API was blocked. I found repos through GitHub topic pages, which WebFetch could read, and then git-cloned them.
- The WebSearch budget ran out partway through, so a few leads were not chased. They are listed at the end.

---

## 0. Does "CAC Top Apps" exist for 2023/2024? No. It started with the 2025 cycle.

- The theCoderSchool page says the program begins "starting in 2025–2026", with winners announced in April. https://www.thecoderschool.com/congressionalappchallenge/
- The CAC Top Apps page calls it "a new annual recognition program" and says honorees are notified in early 2026. https://www.congressionalappchallenge.us/cac-top-apps-presented-by-thecoderschool/
- The only Top Apps class is the 2025 one. https://www.congressionalappchallenge.us/meet-the-2025-cac-top-apps-winners-presented-by-thecoderschool/
- 2023 "national honorees": I found none.
  - #HouseOfCode 2024 celebrated 2023 winners: "Day two at #HouseOfCode was dedicated to celebrating the 2023 App Challenge winners".
  - Over 350 winners from 47 states attended. No national awards, sponsor prizes, or "best of" honors are named.
  - Source: https://www.congressionalappchallenge.us/capitol-hill-lights-up-with-stem-brilliance-at-houseofcode-2024/
- The theCoderSchool page lists 2021–2023 "winners" by city only (for example, a 2023 food bank support app in Irvine, CA). It gives no districts or tech details. [UNCONFIRMED] These appear to be theCoderSchool's own students, not a national tier. https://www.thecoderschool.com/congressionalappchallenge/

### How Top Apps are selected (this matters for code quality)

All quotes are from https://www.congressionalappchallenge.us/cac-top-apps-presented-by-thecoderschool/

- Eligibility: "All first-place district winners from the Congressional App Challenge are automatically considered".
- Basis for selection: picks rely on "the original submitted materials, including the demo video and code base." **Reviewers read the code base.**
- Criteria:
  - "Technical sophistication – code quality, architecture, and innovation"
  - "Creativity – originality and design approach"
  - "Community impact – the app's ability to solve real problems or serve others"
- AI: "AI tools are welcome, but transparency and understanding are key." Students "must clearly identify any AI-generated code and demonstrate comprehension of how their app functions."
- Possible special distinctions: "Most Creative, Most Impactful, or Most Technically Complex."
- Prize: a trophy or certificate presented at #HouseOfCode in D.C., plus national recognition.

---

## 1. 2025 CAC Top Apps: what they built and how

Main source: https://www.congressionalappchallenge.us/meet-the-2025-cac-top-apps-winners-presented-by-thecoderschool/ (cited below as TOP25).

### BoostT1D: National Winner and East Regional (MA-04, Aaron Prager, solo)
- **What it does:** type 1 diabetes management.
  - Estimates carbs and insulin from food photos and current glucose.
  - Analyzes glucose trends and suggests dose adjustments.
  - Includes a buddy network and volunteer mentorship. (TOP25)
- **Stack:** Next.js, SwiftUI, PostgreSQL, Google AI. It integrates with Nightscout for real-time CGM data. (TOP25)
- **Platforms:** web plus iPhone. diaTribe: it "reads CGM data from Dexcom Share" or Nightscout, analyzing 3- or 7-day windows. https://diatribe.org/diabetes-technology/5-minutes-aaron-prager-teen-programmer-award-winning-diabetes-app-boost-t1d
- **AI and data handling** (Boston Globe, https://www.bostonglobe.com/2026/08/12/business/diabetes-management-app-ai-aaron-prager/):
  - He "used AI coding tools through Google to create the user interface".
  - He "mostly prefers to write his own code".
  - The food photo feature uses a computer vision model.
  - "all personal data is stored on each user's own phone".
  - Downloaded "almost 2,000 times".
- **Code public?** Not found. Searched for "BoostT1D github"; the CAC page has no link. https://www.congressionalappchallenge.us/25-MA04/
- **Video:** "Congressional App Challenge 2025 Submission: BoostT1D", 6:42 long. https://www.youtube.com/watch?v=7CO-mNGIdww
  - That is over the "1-3 minutes" the rules say the video "should" be, and it still won.
  - Structure, per transcript https://youtubetotranscript.com/transcript?v=7CO-mNGIdww: personal T1D story, then a full feature tour (setup with Nightscout URL, dashboard, glucose stats and CSV export, treatments, therapy adjustments, food-photo carbs, buddy matching, an insulin-access map using dummy data labeled 2.0).
  - It has no code walkthrough. It claims "over 30,000 lines of code" [UNCONFIRMED, self-reported].

### VERDIS: South Regional (TX-03, Ron Minin, Bosco Qiu, Abyudh Mukkavilli; team of 3)
- **What it does:** a custom-built quadcopter with an infrared camera surveys fields, and the app makes field-wide health maps and identifies disease strains.
  - Uses NDVI from stitched orthomosaic imagery, a fine-tuned CNN, and a prompt-engineered LLM. (TOP25)
- **District page** (https://www.congressionalappchallenge.us/25-TX03/):
  - It is a web application.
  - Students quote: "programming machine learning algorithms using existing datasets".
  - They built their own drone because commercial ones "cost several thousand dollars".
- **Languages:** not stated.
- **Code public?** Not found.
- **Video:** "VERDIS - Congressional App Challenge 2025 | Texas District 3". https://www.youtube.com/watch?v=xcg6vVcqzDk
  - The transcript fetch failed, so the structure is unknown.

### OptiSense: Midwest Regional (MO-01, Tanish Asesa Reddy Dorasani, solo)
- **What it does:** a non-invasive glucose trend monitor with low-glucose alerts.
  - Hardware: MAX30102 optical sensor, Nordic nRF52840 MCU, Bluetooth.
  - App: Swift. (TOP25)
- **District page:** a companion app to the OptiSense Band. https://www.congressionalappchallenge.us/25-MO01/
- **Code public?** Not found.
- **Video:** "OptiSense GTM || Congressional App Challenge 2025 || Tanish Dorasani". https://www.youtube.com/watch?v=0jCowU3zKV8
  - Transcript: about 2 minutes. Personal story, then the problem and audience, then a hardware explanation (red/IR LEDs, photodiode, MCU running ML).
  - It describes the user flow but shows no live demo and no code. https://youtubetotranscript.com/transcript?v=0jCowU3zKV8

### Computerpreter: West Regional (UT-01, Victor and Forest Niu Young, team of 2)
- **What it does:** ASL-to-English chat between Deaf and hearing users.
  - A Random Forest classifies the 26 fingerspelling handshapes.
  - An RNN with a bidirectional LSTM handles dynamic signs.
  - An API translates ASL gloss into English. (TOP25)
- **District page:** they used "3D detection, where time and motion are included", unlike past student projects. https://www.congressionalappchallenge.us/25-UT01/
- **Video:** "Congressional App Challenge 2025 Computerpreter". https://www.youtube.com/watch?v=Rd9QsmKGvD4
  - Tech named in the transcript (https://youtubetotranscript.com/transcript?v=Rd9QsmKGvD4): Python, Random Forest, RNN/LSTM, a 2D CNN as the rejected alternative, Streamlit, GitHub.
  - Rough time split:
    - intro about 8%
    - problem and audience about 12%
    - model choice and architecture about 15% (why an RNN over a CNN; training loss and accuracy curves; face, body and hand landmarks)
    - live two-person demo about 40%
    - brief code overview about 8%
    - deaf-educator interview and impact (claims "up to 62%" time saved) about 10%
    - closing
- **Code public?** The video says the code is on GitHub, but no URL was found. [UNCONFIRMED]

### RoadWatch: Top Creative App (NJ-06, Vaibhav Sitaraman and Eric Dai, team of 2)
- **What it does:** cameras and dashcams detect potholes and broken streetlights. It alerts drivers, can start an emergency call after an accident, and gives governments an aggregated map.
  - Hardware: Raspberry Pi cameras and Bluetooth dashcams, with ML models. (TOP25)
- **Pallone press release** (https://pallone.house.gov/media/press-releases/pallone-announces-winners-2025-congressional-app-challenge):
  - Runs on iOS and Android.
  - Severity is estimated "based on the number of reports and the size of anomalies".
  - Judged by "a panel of local experts" on coding knowledge, programming skill, and idea quality.
- **Stack named in the transcript** (https://youtubetotranscript.com/transcript?v=7xBYVLS6vmc):
  - Expo Router, React Native, Tailwind
  - Supabase (transcribed "superbase"), OpenWeather, Python
  - YOLO
  - SMS auth
  - about $50 DIY Raspberry Pi and Arducam rig
- **Video:** "RoadWatch". https://www.youtube.com/watch?v=7xBYVLS6vmc
  - Structure: hook scenario, then crash statistics, then team and one-sentence purpose, audience, tech stack and architecture, and accuracy claims (99%/90% [UNCONFIRMED]).
  - It has no code walkthrough.
- **Code public?** Not found.

### CoFIS: Community Impact (IA-01, Kento Sugiyama, solo)
- **What it does:** a browser-only flood-inundation mapping and damage tool for more than 2.7M U.S. river reaches.
  - Browser tech: WebAssembly (GDAL), Web Workers, IndexedDB.
  - Method: HAND for inundation, FEMA Hazus damage functions.
  - Data: NOAA, USGS, FEMA, USACE. (TOP25)
- **Miller-Meeks release:** it uses National Water Model discharge predictions. https://millermeeks.house.gov/media/press-releases/miller-meeks-announces-congressional-app-challenge-winner-iowa-city-west-high
- **Video:** "Congressional App Challenge - Kento Sugiyama", 2:58. https://www.youtube.com/watch?v=JXiA6QSFwFs
  - Transcript (https://youtubetotranscript.com/transcript?v=JXiA6QSFwFs): intro with mentors credited, audience (emergency managers, planners, farmers), approach (WASM and Web Workers instead of servers), tech (JavaScript/JSX, Tailwind).
  - Demo: an Omaha river reach in scenario, historical and forecast modes, including the March 2019 flood.
  - **Code walkthrough:** UI components, a services folder (dataset joins and flood-raster compute), and a styles folder.
- **Code public?** Not found.

### 2025 Top Apps runners-up (honorable mentions; TOP25 gives no tech)
- **MotionBloom** (NC-02): Parkinson's rehab and tremor logger; combines "sensor engineering with machine learning and neuroscience". https://www.congressionalappchallenge.us/25-NC02/
- **Auteur** (IN-03): Adobe After Effects plug-in. An AI copilot that will "generate valid ExtendScript". https://www.congressionalappchallenge.us/25-IN03/
- **AlertNow** (NJ-03): gun-threat detection "combining audio and video AI models". Video is on Vimeo (1132354039). https://www.congressionalappchallenge.us/25-NJ03/
- **LeftoSense** (CA-19): web tool that "uses AI" to judge food spoilage. https://www.congressionalappchallenge.us/25-CA19/
- **Delta Protein Atlas** (TX-09): maps genetic diseases to proteins and mutations. https://www.congressionalappchallenge.us/25-TX09/
- **OnSight Music** (NY-10): MIDI to sheet music, then sing along with mistake flagging. https://www.congressionalappchallenge.us/25-NY10/

Observation: no 2025 Top App or runner-up is a government-process or benefits navigator.

---

## 2. Navigator / civic-benefits district winners, 2023–2025

District pages almost never list tech. Where tech is given, it comes from the video transcript.

"Personalized?" key:
- **P** = computes a per-user answer (eligibility, scoring, matching, a plan)
- **L** = lists or teaches information
- **?** = unknown

### Shelter and homelessness
- **Shelter Link** (CA-45, 2025; 4 students across 3 schools; LA homelessness). https://www.congressionalappchallenge.us/25-CA45/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=mIZs7q9jYe8): React.js, Material UI, JavaScript, geolocation APIs, an unnamed "AI matching tool". Four languages.
  - **Personalized:** P. Search by rating, availability and distance. A shelter-staff login updates bed counts live (demoed 10 to 20 beds). Shows job listings.
  - **Video:** no code shown.
- **ShelterSearch** (CA-12, 2024; Keshav Rangan). https://www.congressionalappchallenge.us/24-CA12/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=6krmUusLLQI): Python web app, Swift iOS app, an Azure-hosted API running the recommendation algorithm, OpenAI, Google Maps geocoding, Twilio SMS.
  - **Data:** a database of about 30 shelters in Oakland, Berkeley and SF.
  - **Personalized:** P. It scores each shelter on 5 factors (proximity, availability, speed, length of stay, services) and returns the top 3.
  - **Video:** architecture overview only, no code.
- **ShelterSpot** (FL-10, 2025): "accurate, real-time information on shelter availability", plus jobs and support. L/?. Tech not stated. https://www.congressionalappchallenge.us/25-FL10/
- **ReStart** (CA-20, 2025): connects "unhoused individuals with paid, meaningful work". ?. https://www.congressionalappchallenge.us/25-CA20/
- **FCHome** (CA-18, 2025): mobile app for transitional-age youth. Free transit passes, shelters, clinics, food. ?. https://www.congressionalappchallenge.us/25-ca18/

### Food
- **FindFoodPantries** (CA-49, 2024; Justin Tam): food pantry directory web app. https://www.congressionalappchallenge.us/24-CA49/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=SN6SZMdNBA0): Google sign-in, Google Maps API (ZIP to county), food bank database by county, community submissions.
  - **Personalized:** light P/L. Shows pantries in your county.
  - **Rep. Levin:** "Building an app from scratch is no small feat." https://levin.house.gov/media/press-releases/rep-mike-levin-announces-2024-congressional-app-challenge-winner
- **Find My Food Drive** (NY-04, 2025): a database of local food drives. L. https://www.congressionalappchallenge.us/25-NY04/
- **PantryLink** (NJ-12, 2025; team of 4): nearby food banks and their available stock. L/?. https://www.congressionalappchallenge.us/25-NJ12/
- **Bridge 2 Meal** (IL-14, 2025): "a comprehensive, real-time logistics solution" for food rescue. ?. https://www.congressionalappchallenge.us/25-IL14/
- **Fulltray** (NY-01, 2025): surplus food donation to pantries. ?. https://www.congressionalappchallenge.us/25-ny01/
- **Fill Food Banks** (CA-47, 2023): find food banks that accept healthy food donations. ?. https://www.congressionalappchallenge.us/23-CA47/

### General resources
- **AidSense** (NJ-09, 2025; team of 4). https://www.congressionalappchallenge.us/25-NJ09/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=5opk96gpXq8):
    - Flutter/Dart (98% or more), with small Kotlin/Swift for maps and location
    - Firebase Auth
    - a map API and walking polylines
    - a ChatGPT-style API (transcribed "Chad GBT") plus intent matching
    - offline preloaded resource data
  - **Personalized:** P (chatbot plus intent-to-resource matching).
  - **Video:** the only navigator video in the sample that walks code, briefly covering main.dart.

### Rights and legal
- **Know Your Rights / Conozca Sus Derechos** (CA-34, 2025; Julian Miramontes, El Sereno **Middle** School). https://www.congressionalappchallenge.us/25-CA34/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=_xDgQh2p5WE): "block code" plus JavaScript, English and Spanish, about 10 weeks to build.
  - **Personalized:** L. A reading followed by a randomized 4-question quiz.
  - **Lesson:** an LA district can be won with a simple app.
- **RightsNow!** (MI-12, 2025): rights overview, RSVP to workshops, Q&A, quiz. L. https://www.congressionalappchallenge.us/25-mi12/
- **LegalEase** (FL-20, 2025): teen legal rights education web tool. L. https://www.congressionalappchallenge.us/25-FL20/
- **Homonium** (TX-37, 2024): free instant legal support using "particularly AI". ?. https://www.congressionalappchallenge.us/24-tx37/

### Voting and civics
- **MinnVotes** (MN-04, 2024; Idrees Ahmad). https://www.congressionalappchallenge.us/24-MN04/
  - **Personalized:** P. An eligibility pre-screener, then a live registration and polling-place lookup against the MN Secretary of State, then a voting plan, which is texted to the user. Also a school leaderboard.
  - **Video** (transcript https://youtubetotranscript.com/transcript?v=_pw20sTy0yg): names a Node.js proxy. Demo only.
  - **Code:** https://github.com/reece365/minnvotes (commit email idrees.s.ahmad, which matches the winner). See section 3.
- **Voting Buddy** (GA-04, 2024; team of 4): register, learn ways to vote, find polling location. ?. https://www.congressionalappchallenge.us/24-GA04/
- **Voting4Teens** (MD-01, 2024): website teaching the voting process. L. https://www.congressionalappchallenge.us/24-md01/
- **Civic Connect** (PA-01, 2024): one place for government and voting info. L. https://www.congressionalappchallenge.us/?p=9489
- **CivicsEd** (CA-15, 2025): cross-platform web app; AI "guides students as they draft their responses". P (AI feedback). The transcript fetch failed. https://www.congressionalappchallenge.us/25-CA15/
- **TeenCivics** (CA-40, 2025; Olivia Skeete). https://www.congressionalappchallenge.us/25-CA40/
  - **Tech** (transcript https://youtubetotranscript.com/transcript?v=EptmKeGNFB4): a daily GitHub Actions pipeline pulls new bills from Congress.gov, an LLM summarizes them at an 8th–10th grade reading level, and posts go to X/Twitter API. Hosted on Railway with Cloudflare. Free-tier services only.
  - **Personalized:** P-lite. A 0–10 "Teen Impact Score"; the method is not explained.
  - **Quote:** "Teen Civics isn't a demo. It's production grade software built to last."
  - **Video:** no code.
- **Youth Voter** (CA-33, 2021, 2nd place; Samantha Chang): the release links youthvoter.org only and gives no description. https://lieu.house.gov/media-center/press-releases/rep-lieu-honors-winners-annual-congressional-app-challenge-1

### Veterans and immigrants
- **VeteranCare** (FL-15, 2024): veterans "aware of the resources they may be eligible for". ?. https://www.congressionalappchallenge.us/24-FL15
- **EmpowerVets** (MT-01, 2023): veterans' access to online resources. L. https://www.congressionalappchallenge.us/23-mt01/
- **patriotPerks** (VA-01, 2023; team of 4): veterans' financial aid, jobs, healthcare. ?. https://www.congressionalappchallenge.us/?p=7988
- **GlobaLingo** (TX-20, 2025): English for Afghan immigrants (Dari and Pashto), using "OpenAI's API" to generate practice sentences. L/P. https://www.congressionalappchallenge.us/25-tx20
- **Everyone Will Work** (IL-07, 2024): aimed at immigrants' employment and stability. ?. https://www.congressionalappchallenge.us/24-il07/

### Member and judge quotes
- Nearly every CAC district page has none. The ones I found:
  - **Levin:** "Building an app from scratch is no small feat."
  - **Miller-Meeks** on CoFIS: "this app can better protect lives and property."
  - **Pallone** on judging: done by "a panel of local experts".
  - **Lieu (2021):** judges praised the 1st-place app's modern user interface and product strategy (paraphrase).
- Sources: the URLs above. Lieu's release is https://lieu.house.gov/media-center/press-releases/rep-lieu-honors-winners-annual-congressional-app-challenge-1

### 2026 entrants already public in this lane (competitors, not winners)
- **Benefits Matcher · LA County** (CA-30, 2026). https://github.com/arthurtunyan/benefits-matcher
  - Per-person eligibility for LA County benefits; dated rules engine; source link on every answer.
  - English, Spanish and Armenian; on-device only; CI.
  - The README claims "480+ passing tests". The repo has 28 test()/it() blocks, some parameterized over personas.json.
  - Its own docs/SUBMISSION.md says Claude Code "drafted the rules data, rules engine, user interface…".
- **Costa** (CA-16, 2026). https://github.com/oliverc08/costa
  - Multilingual Medi-Cal, CalFresh, WIC and CalEITC navigator over web, SMS and voice (Twilio).
  - Next.js 16 with AI SDK; "Eligibility screening is deterministic TypeScript, not the model."
  - 10 test files, about 100 test()/it() blocks.
  - Its docs say the CA-16 district theme is "access vital federal, state, or local benefits and services". [UNCONFIRMED; the member page was not fetched.]

### Verdict: is the navigator lane crowded? Yes, at the district level. It has never placed nationally.
- **Crowding:** at least 27 district first-place winners in this lane across 2023–2025 in my non-exhaustive sample (above). Shelter and food apps alone account for 11 or more.
- **No national placement:** none placed in the 2025 Top Apps or runners-up. The national tier rewarded deep, domain-specific computation: hydrology, CV and ML, custom hardware, CGM analytics.
- **New competition:** at least two 2026 entrants, one of them in LA County, already ship serious public repos with rules engines, tests and multilingual support.

What separated stronger navigator winners from list apps, based on what they shipped:
1. **They compute an answer for this user.**
   - ShelterSearch: 5-factor score, top 3.
   - MinnVotes: eligibility, then live state registration lookup, then a plan.
   - Shelter Link: AI match plus staff-updated bed counts.
2. **They connect to a real system of record.**
   - MinnVotes: MN Secretary of State.
   - TeenCivics: Congress.gov plus an automated daily pipeline.
   - FindFoodPantries: Google Maps.
3. **They close the loop off-screen:** a texted plan (MinnVotes, ShelterSearch via Twilio) or a social post (TeenCivics).
4. **They update data both ways:** shelter staff edit availability (Shelter Link); community-submitted pantries (FindFoodPantries).
5. **They are multilingual:** Shelter Link (4 languages), Know Your Rights (2), GlobaLingo.

Caveat: district judging varies a lot. A middle-schooler's block-code reading-plus-quiz app won CA-34 in 2025.

---

## 3. Open-source code of CAC winners

### Repo analysis method
1. Found candidates through https://github.com/topics/congressional-app-challenge (43 repos, pages 1–3).
2. Verified each against its CAC district page.
3. Cloned each and ran git log, line counts by file extension excluding vendored dirs, and test and CI file listings.

Raw output: /tmp/claude-0/-home-claude/b5de5169-8809-574e-bb86-086144ad5808/scratchpad/research/repo_analysis_raw.txt

### Confirmed winners with public code

| Repo | Win (verified) | Stack | Size and structure | Team split (git) | README | Tests / CI |
|---|---|---|---|---|---|---|
| https://github.com/reece365/minnvotes | MinnVotes, MN-04 2024 (https://www.congressionalappchallenge.us/24-MN04/) | Bootstrap static HTML/JS (Bootstrap Studio .bsdesign), Flask proxy scraping mnvotes.sos.mn.gov, Firebase Functions, Mapbox | about 550 JS + 540 HTML + 225 Py lines. **Also committed a Python venv (5,102 vendored files).** 6 commits before the deadline (first Oct 17, 2024) | 1 author | 46 lines. Problem stats, features, run steps. Has a "172.0.0.1" typo | none / none |
| https://github.com/ulookuglynoob/Nova-AI | Nova-AI, KS-03 2024, 8th grader (https://www.congressionalappchallenge.us/24-KS03/) | Flutter/Dart. On-device TFLite SSD-MobileNet object detection, ML Kit OCR, Gemini image description, Picovoice wake word ("Hey Nova"), TTS | 1,378 Dart lines in 13 files: lib/{ui,service,models,utils}. APK in Releases | 1 author, 76 commits from Aug 12, 2024 | 90 lines. Features, API-key setup, run steps, MIT | Default Flutter "Counter increments" test, which does not match the app / none |
| https://github.com/iriskopecky/Cacao | CACAO, TX-36 2024 (https://www.congressionalappchallenge.us/24-TX36/) | Native Android, Java. AndroidX, WorkManager, Gson, jsoup/HtmlUnit. Pulls free public APIs (dictionaryapi.dev, numbersapi, jokeapi, and others) for the feed | about 2,530 Java lines. activities/ plus models. 176 commits, May to Oct 2024 | 3 authors. Java lines added: about 3.6k, 0.76k, 0.1k (lopsided) | 7 lines: just names and district | template ExampleUnitTest / none |
| https://github.com/ag2027/SAFEY_1 (team repo) and https://github.com/Amrik-Majumdar/safey (cleaned copy) | SAFEY, VA-11 2025 (https://www.congressionalappchallenge.us/25-va11/) | Vanilla-JS PWA. Service worker; Web Crypto PBKDF2 encryption on local storage; Cloudflare Worker proxy to Cerebras (llama-3.3-70b) chatbot | about 8,700 JS lines: app.js (3,065) plus 14 modules in js/ (stealth, lockout, crypto, contacts). Live on GitHub Pages | **Built Oct 26–30, 2025.** In that window: ag2027 46 commits, **copilot-swe-agent[bot] 33**, Amrik 4 | Strong. Features, privacy, structure, PRIVACY/TERMS/SECURITY docs (in the cleaned copy) | none / none |
| https://github.com/froge79/polidebater | PoliDebater, TX-22 2025 (https://www.congressionalappchallenge.us/25-TX22/) | Next.js 16, React 19, TS, Tailwind, shadcn/Radix, OpenAI API (two API routes: argue, judge), Upstash Redis share links, Vercel | about 3,400 TSX/TS lines: app/, app/api/*, components/ui (shadcn) | 1 author. **2 commits before the deadline ("initial commit" Oct 29, "asdf" Oct 30)** | 27-line README added after winning (2026) | none / none |
| https://github.com/AlphaGameDeveloper/Seen | Seen, CA-02 2025 (https://www.congressionalappchallenge.us/25-CA02/) | Kotlin plus Jetpack Compose. AES-encrypted SQLite; PHQ-9 scoring; EN/FR/ES translations; Flask backend (not in repo) calling OpenRouter LLMs | about 11,300 Kotlin lines in 66 files: ai/, data/, encryption/, screens/, workers/, widget/. APK via Releases | 2 humans (147 and 68 commits) plus Copilot bot (4). 219 commits, June to Oct 2025 | Detailed. Badges, **explicit AI disclosure (what AI did and did not do)**, stack, privacy, build steps, GPLv3 | template 2+2 unit test / GitHub Actions build-and-release on tag |
| https://github.com/atticuscornett/AtmosWeather (older reference) | Atmos Weather, AL-03 2022 (https://congressionalappchallenge.us/22-al03) | Svelte/JS. Capacitor (Android) plus Electron (desktop). api.weather.gov (NWS) | about 28k code lines today. 231 commits before the 2022 deadline; maintained through 2026 (898 total). On IzzyOnDroid | 1 main author | Rich. Badges, install docs, themes | template test / multi-platform build CI |

### Not verified as winners (excluded)
- **TanujKS/Resolve:** README says "Submitted to CAC 2022 (CA-18)". The CA-18 2022 winner was "Signer". https://www.congressionalappchallenge.us/22-CA18/
- Others on the topic page are entries with no win found: Recap, Aspira, Project-Democracy, campus-compass, nikrp/connect, PHS-TSA/our_democracy, KennanHunter (a 2023 "Cafe Demo").

### What winning code typically looks like (the bar)
- **Size:** 1.4k–11k lines of real code for district winners. National Top Apps claim more: BoostT1D says "over 30,000 lines" in its video [self-reported].
- **Stack:** one main language and a mainstream framework, with no exotic architecture: Flutter, Kotlin/Compose, Java Android, Next.js plus shadcn, vanilla-JS PWA, Bootstrap.
- **Structure:** a folder split by concern (ui/screens, service, data, models, utils, api routes) is common. Some winners dump everything into one file: SAFEY's app.js is 3,065 lines.
- **Tests:** none of the 7 has a meaningful test suite. Only IDE template tests exist, and one of those does not even match the app.
- **CI:** where present, it builds and releases artifacts (Seen, Atmos) rather than running tests.
- **Git history:** often crunch-time and messy. SAFEY took 5 days with a Copilot agent; PoliDebater went in as a 2-commit dump; MinnVotes committed its venv.
- **README quality:** varies from 7 lines (CACAO) to excellent (Seen, SAFEY).
- **Shippable artifact:** usually present (APK release, GitHub Pages or Vercel URL, iOS app).

Implication: tests, a clean structure, an honest AI-disclosure section and a working live link would put a 2026 entry above every winning repo I found. In this lane, the 2026 entrants above already do this.

---

## 4. Video structure (from transcripts)

1. **Computerpreter** (West Regional): https://youtubetotranscript.com/transcript?v=Rd9QsmKGvD4
   - Intro, then problem stats, then model choice explained (RNN vs CNN, loss and accuracy), then a two-person live demo (about 40%), then a brief code overview (Python, Streamlit, GitHub), then a deaf-educator interview and impact number, then closing.
2. **CoFIS** (Community Impact, 2:58): https://youtubetotranscript.com/transcript?v=JXiA6QSFwFs
   - Intro with mentors, then audience, then why client-side (WASM, Web Workers), then tech list, then a demo on a real 2019 flood, then a **folder-level code walkthrough** (components, services with the compute logic, styles), then closing.
3. **BoostT1D** (National, 6:42): https://youtubetotranscript.com/transcript?v=7CO-mNGIdww
   - Personal story, then a long feature-by-feature tour with disclaimers. Includes a v2.0 teaser on dummy data. No code.
4. **RoadWatch** (Creative): https://youtubetotranscript.com/transcript?v=7xBYVLS6vmc
   - Hook scenario, then statistics, then purpose and audience, then the full stack named (front end, back end, ML, hardware), then accuracy claims and future users. No code.
5. **Navigator winners** (Shelter Link, MinnVotes, FindFoodPantries, ShelterSearch, TeenCivics):
   - Problem, then audience, then a live click-through. Usually no code.
   - ShelterSearch and TeenCivics give an architecture or stack overview. AidSense briefly explains main.dart.

Pattern: every video hits the required beats (names, app name, one-sentence purpose, audience, tools, demo). The national winners add one technical "why": why an RNN, why client-side, why YOLO.

---

## 5. 2026 rules check

Source: https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf (read via WebFetch).

**AI (Section 3, App Parameters):**
- "The use of AI tools in app development for the Congressional App Challenge is permitted"
- "provided that all AI usage is fully disclosed in the submission materials."
- "AI may only be used to support specific aspects of the project"
- "and must not constitute the entirety of the technical development."
- "Participants are expected to demonstrate significant individual contributions and technical understanding of their app."
- Top Apps reviewers additionally say students "must clearly identify any AI-generated code". https://www.congressionalappchallenge.us/cac-top-apps-presented-by-thecoderschool/

**Originality (Section 3):**
- "The app must be original and solely created by the contestant."
- "All coding and technical development must be done by the student or student team."
- "While participants may use open-source libraries, frameworks, and external tools," they "must clearly document any such usage".

**Teams (Sections 1 and 4):**
- "Students can compete as individuals, or in teams of up to four (4) students."
- "Any team with more than four (4) students is not eligible to compete."
- "At least half of teammates on any team must live or attend school in the same Congressional District."
- "Students may compete in either the district in which they reside, or the district in which they attend school."
- The team creator can "create the team profile, which will allow for that user to invite up to three other team members".
- Other limits: "Students may only submit ONE app per year." "Students may submit any app they've created after October 30th, 2025."

**Video (Section 4):**
- "DEMONSTRATION VIDEO (max 3 min)"
- "The video should be 1-3 minutes long."
- Required bullets:
  - "The name(s) of each participant"
  - "The name of the app"
  - "Clearly explain the purpose of the app (Students should do this in one, clear sentence)"
  - "Explain the app's target audience (who the app is intended for?)"
  - "The tools and coding languages used to create the app"
  - "Showcase the functionality of the app"
- "Upload the completed video to YouTube or Vimeo." "The video must be setto "public"." [sic]
- The rules do not require a code walkthrough.
- The 2025 rules had the same 1–3 minute language (https://morgangriffith.house.gov/UploadedFiles/2025-CAC-Rules.pdf), yet BoostT1D's 6:42 video won nationally. Do not copy that.

**Submission questions (Section 4, "similar to the following"):**
1. "What is the title of your app?"
2. "Explain the app's purpose."
3. "What inspired you to create this app?"
4. "What technical/coding difficulty did you face in programming your app, and how did you address this technical challenge?"
5. "What did you learn while participating in the CAC? What was your biggest takeaway?"
6. "What would you change about your app if you were to create a 2.0 version?"

The PDF mentions a Submission Checklist that the extracted text does not include.

**Deadline (Section 5):**
- "12:00 pm EDT, Monday, October 26th, 2026." That is **9:00 am Pacific** for an LA team.
- "After the Submission Period has ended, the Submission cannot be modified in any way."

**Source code:**
- The PDF has no GitHub or upload requirement.
- Section 7: "The Judges have the right to request access to the App and source code in person or via any reasonable manner". Failing to honor such a request means "immediate disqualification".
- Top Apps selection uses the "code base" from the original submitted materials, which implies the code is part of the submission. [UNCONFIRMED: the exact form field was not seen. A 2026 entrant's checklist treats a public GitHub link as the way to make source available: https://github.com/oliverc08/costa]

**Judging (Section 7):**
- "Quality of the idea (including creativity and originality)"
- "Implementation of the idea (including user experience and design)"
- "Demonstrated excellence of coding and programming skills."

---

## 6. Open leads (not finished: WebSearch budget ran out)
- A TeenCivics GitHub repo (its pipeline uses GitHub Actions, so it may be public).
- The CivicsEd and VERDIS transcripts (fetches failed).
- Whether LA-area members (CA-30, CA-32, CA-34, CA-36, CA-37, and others) set a 2026 district theme, as CA-16 reportedly did.
- The exact 2026 submission form fields (source code link, AI disclosure box) and the Submission Checklist.

# First ID: landscape research notes (CAC 2026, CA-37)

Compiled 2026-10-18. Every fact has a URL. Labels: **[UNCONFIRMED]** = not verified from a primary page; **[CALC]** = my own arithmetic on cited figures; **[GAP]** = searched and not found.
Limits: the shared WebSearch budget ran out partway through. congress.gov, govtrack, leginfo (dynamic pages), lahsa.org PDFs, kids-alliance.org and ballotpedia blocked automated fetches (robots or client errors). Bash egress to .gov hosts was blocked, so CORS headers could not be tested directly.

---

## 1. PRIOR ART

### 1a. Software or online tools

| # | Tool | Who runs it | What it does | Personalized path? | URL |
|---|---|---|---|---|---|
| 1 | **ID Documents App** (Street Law Centre WA) | Street Law Centre WA; built by UWA Law students (Legal 'APP'titude) on Checkbox, launched May 2019 | Asks about the user's situation, says whether they have enough ID for Centrelink, a bank account or a photo ID, and suggests what to apply for | **Yes**: a rules-based checker. It is Australian, so the rules don't carry over, and it has no cost, fee-waiver or packet output | https://streetlawcentre.org.au/id-documents-app/ ; checker https://app.checkbox.ai/pubt/c241b767-878f-4819-b9eb-6561b4a7d0b7 ; launch release https://unitingwa.org.au/?p=2709 |
| 2 | **Keep.id** | Philadelphia nonprofit that started as a UPenn student team | Encrypted document locker for people experiencing homelessness. Staff upload documents, and it flags documents missing from a form and can autofill applications | **Partly**: it detects missing documents for a given form, but it is a locker and form tool for nonprofit staff, not a legal path planner. Its site was a JS app with no readable features. Last confirmed stage: prototype and beta (MIT Solve entry, 2020) | https://solve.mit.edu/solutions/35127 ; https://www.artificiallawyer.com/2020/08/21/keep-id-app-for-homeless-people-product-walk-through/ ; https://keep.id |
| 3 | **CA DMV interactive REAL ID document checklist** | California DMV | You select the documents you have, then "Create Your Checklist" | **Partly**: personalized only to documents you already hold. It doesn't plan how to get a birth certificate or SSN card, and doesn't apply fee waivers | https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/how-do-i-get-a-real-id/ |
| 4 | **Mini City** (Atlanta) | Social enterprise (India Hayes, Amber McCain, Anita Jones). Piloted in 2017 with the Salvation Army of Metro Atlanta | App for replacing lost documents, tracking ID application status, booking shelter beds and finding jobs | Unclear. The article doesn't say it computes steps. Its site returned no readable content, so status is [UNCONFIRMED] | https://tpinsights.com/this-tech-company-is-trying-to-help-homeless-people-get-ids/ ; https://www.minicityatl.com/ |
| 5 | **Housing California "Photo ID How-To"** (individual and provider versions) | Housing California (sponsor of AB 1733, 2014) | Four-step guide to a free CA ID and free birth certificate | **No**: static page | https://housingca.org/photo-id-how-to-individuals ; https://housingca.org/resources/community/providers/help-someone-get-a-ca-photo-id |
| 6 | **SchoolHouse Connection CA guide** | SchoolHouse Connection (national nonprofit) | Statutes (HSC §103577, Veh. Code §14902), forms (VS 111, affidavit, DL 933) and steps | **No**: static | https://schoolhouseconnection.org/article/how-to-obtain-a-free-birth-certificate-or-id-in-california-instructions-and-the-law |
| 7 | **LA County Recovery "Replace documents"** and **ca.gov/lafires "Replace personal documents"** | LA County; State of CA | Link lists for fire survivors (DMV, vital records, SSA, passports) | **No**: static link lists | https://recovery.lacounty.gov/replace-documents/ ; https://ca.gov/lafires/help-for-you/replace-personal-documents/ |
| 8 | GAO's survey of "digital lockers" as a mitigation | GAO-24-105435 (Feb 2024) | Lists lockers, alternative documents, fee waivers and third-party attestation, and notes the fraud and data-security risks | n/a (federal report) | https://www.gao.gov/assets/d24105435.pdf |

### 1b. Human navigator programs (in-person, not software)

| Program | Who / where | What it does | URL |
|---|---|---|---|
| **The Source @ LAPL Central Library** | LA Public Library, 630 W 5th St (last Tuesday monthly, 12:30–3 pm) | Free DMV ID vouchers, birth certificate services, CES assessment, Medi-Cal/CalFresh | https://lapl.org/node/79896 ; https://lapl.org/node/203452 ; https://lapl.org/homeless-resources |
| **ICLC Vital Documents Clinic** | Inner City Law Center (Skid Row) | Bi-weekly free legal help with birth certificates, consular records, IDs and fee waivers, plus a mailing address for storing documents. This was an LA2050 2024 proposal; the clinic is **not listed** on ICLC's current clinics page, so current status is [UNCONFIRMED] | https://la2050.org/ideas/2024/iclc’s-vital-documents-clinic ; https://innercitylaw.org/clinics/ |
| **Safe Place for Youth** "document ready" staff | Venice nonprofit | Dedicated staff who get youth "document ready" | https://spectrumlocalnews.com/ca/california/homelessness/2022/04/04/lost-foster-care-documents-homeless-angelenos |
| **DMV Mobile Homeless Connect / pop-ups** | CA DMV and the Governor's office | On-request ID events. A three-day event in August 2022 yielded 84 ID applications. The AB 1738 pilot (LA, OC, SD, Sacramento, SF) was **vetoed Sept 22, 2024** | https://atrn.assembly.ca.gov/sites/atrn.assembly.ca.gov/files/AB%201738%20%28Wendy%20Carrillo%29.pdf ; https://www.gov.ca.gov/wp-content/uploads/2024/09/AB-1738-Veto-Message.pdf |
| **CDCR CAL-ID program** | CDCR, all institutions (PC §3007.05) | CA ID at release, **only if** the person has an SSN and a prior CA DL or ID | https://www.cdcr.ca.gov/rehabilitation/calid/ |
| **RR/CC fire-survivor no-cost records** | LA County Registrar-Recorder | Free replacement birth, death and marriage records for fire-impacted residents | https://recovery.lacounty.gov/2025/01/16/registrar-recorder-county-clerk-offers-no-cost-replacement-records-to-fire-impacted-residents/ |
| **IDignity** (Orlando, FL) | Nonprofit, founded 2008 | Free help getting FL ID, out-of-state birth certificates and SS cards | https://en.wikipedia.org/wiki/IDignity |
| **Operation ID / Project ID** (Houston) | Main Street Ministries | Referral-based help: gathers documents, pays fees, gets out-of-state birth certificates. No online tool | https://houstoncasemanagers.com/operation-id/ |
| **Homeless ID Project** (Phoenix) | Nonprofit | Provided about 4,000 birth certificates in 2022 | https://azpbs.org/horizon/2023/05/1000-voices-campaign-raises-awareness-about-homelessness/ |

### 1c. Not checked (search budget ran out)
- "ID Ready" and "Bridges" apps: **[GAP]**, not found.
- Code for America and USDR: the one search found no ID-recovery tool from either. CfA's GetYourRefund identity-proofing work is adjacent. **[GAP]**: absence not fully confirmed. https://digitalgovernmenthub.org/library/code-for-america-and-getyourrefund-org-non-filer-learnings-and-recommendations/
- LawHelpCA ID page: fetch failed. LA Law Library: a 2017 article lists rights classes and pro bono days but no ID or notary help. https://www.crescentavalleyweekly.com/?p=91808
- LA County Library ID help: **[GAP]**.

### 1d. Verdict
No US or California tool found computes a **personalized, source-cited legal path to a California ID** that covers missing birth certificates, SSN cards, residency proof and fee waivers (DL 933, DL 937, HSC §103577 affidavit, fire waivers) and outputs a printable packet. Closest competitors:
1. **Street Law Centre WA ID app**: same concept (a rules-based "what you're missing and how to get it" checker), but Australian law and no citations or cost.
2. **Keep.id**: US, but a document locker and autofill tool for nonprofit staff, not a path planner.
3. **DMV REAL ID checklist**: official and interactive, but assumes you already hold the documents.
Everything else is static guides or in-person navigators. **The idea is new in CA and the US**, with one direct overseas precedent the team should cite as inspiration.

---

## 2. SIZE OF THE PROBLEM

### 2a. Lacking ID among unhoused people
- **No reliable LA- or SF-specific prevalence figure was found** [GAP]. The SF 2019 count report has no ID question (https://hsh.archive.sf.gov/wp-content/uploads/2020/01/ExecutiveSummary_SanFrancisco2019.pdf). CASPEH (UCSF 2023) names "lack of necessary documentation" as a barrier to re-entering housing but gives no percentage (https://endhomelessness.org/wp-content/uploads/2024/10/CASPEH_Report_62023.pdf, Exec. Summary p. 8).
- **National (NLCHP 2004 survey, cited by Pew Stateline 2017)**: among homeless people without photo ID, 54% were denied access to shelters or housing services, 53% were denied food stamps and 45% were denied Medicaid or medical services. https://stateline.org/2017/05/15/without-id-homeless-trapped-in-vicious-cycle/
- **NLCHP 2004**: 36% of surveyed clients couldn't get photo ID because they couldn't afford it (cited in an Oregon legislative summary). https://apps.oregonlegislature.gov/liz/2021R1/Downloads/CommitteeMeetingDocument/242316
- **Massachusetts Youth Count 2021**: 28% of 265 unaccompanied homeless youth under 25 named not having an ID or key documents as a barrier, and 40% of those with justice involvement did. https://mahomeless.org/wp-content/uploads/2024/01/Mass-ID-bill-fact-sheet-1-8-24.pdf
- **Statewide CA demand**: DMV issued **100,721** no-fee IDs to unhoused people in 2021 (137,888 in 2019; 75,314 in 2020). https://atrn.assembly.ca.gov/sites/atrn.assembly.ca.gov/files/AB%201738%20%28Wendy%20Carrillo%29.pdf
- **GAO-24-105435**: average ID cost of $54 across 10 states reviewed. It describes the loop where replacing lost documents often requires an existing ID. https://www.gao.gov/assets/d24105435.pdf
- **LA policy hook**: since Feb 1, 2023, LA's Coordinated Entry System gives "document-ready" households (ID plus SS card uploaded to HMIS; birth certificates for minors) matching preference for permanent supportive housing. https://www.csh.org/wp-content/uploads/2023/10/LA-CES-Shifting-to-Doc-Ready-Housing-Referrals.pdf

### 2b. Homeless counts (LAHSA)
| Geography | 2024 | 2025 | 2026 | Source |
|---|---|---|---|---|
| LA County | 75,312 | 72,308 at release (revised to 72,195) | **73,040** (+1.2%) | 2025: https://www.foxla.com/news/los-angeles-homeless-count-2025 ; 2026 and revised 2025: https://lasentinel.net/?p=304823 ; https://laist.com/news/housing-homelessness/la-homelessness-rose-in-2026-official-count-shows |
| City of LA | 45,252 | 43,669 at release (revised to 43,695) | **45,194** (+3.4%) | same |
| County unsheltered / sheltered 2026 | | 47,450 / 24,745 | 49,002 / 24,038 | http://www.laalmanac.com/social/so14.php (secondary, compiled from LAHSA) |
| City unsheltered / sheltered 2026 | | 26,972 / 16,723 | ~29,115 / 16,079 | LAist; LA Almanac |
| **SPA 6 (South LA)** | 13,886 | 13,587 | **14,289** | LA Almanac compiled from LAHSA (secondary). The primary PDF is https://www.lahsa.org/documents?id=10084-hc26-spa-6-data-summary but is blocked by robots, so these figures are [UNCONFIRMED against primary] |
| **SPA 5 (West)** | 5,383 | 5,029 | **4,518** | LA Almanac (secondary). Primary: https://www.lahsa.org/documents?id=10083-hc26-spa-5-data-summary |
- LAHSA says the 2026 increases are within the margin of error and not statistically significant (LAist). On Aug 26, 2026, the LA City Council called for a review of the 2026 count after possible errors, including CD-8 (South LA, where homelessness reportedly rose 128%). https://laist.com/news/housing-homelessness/lahsa-to-review-2026-homeless-count-numbers
- There are no CA-37-specific numbers. LAHSA publishes HC26 raw data by census subtract (https://www.lahsa.org/documents?id=10172-hc-26-raw-data-by-census-subtract-2026-08-06), which could be aggregated to the district. [GAP]: not done.

### 2c. Foster youth
- About **1,000** youth age out of LA County foster care each year (California Policy Lab, July 2024). https://capolicylab.org/aging-out-of-foster-care-in-los-angeles/
- LA County "is home to over 30,000 foster youth" (Kamlager-Dove press release, May 6, 2025). https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-foster-youth-caucus-colleagues-introduce-resolution-recognize-0
- By age 23, about one in four former CA foster youth have been homeless (UChicago 2021, via Spectrum). Safe Place for Youth (Venice): former foster youth are about 36% of clients, and about **half arrive missing important documents** (ED Erika Hartman, 2022). https://spectrumlocalnews.com/ca/california/homelessness/2022/04/04/lost-foster-care-documents-homeless-angelenos
- Law: WIC §391 requires the county to verify that the youth has a SS card, certified birth certificate and DL/ID before exit. https://california.public.law/codes/welfare_and_institutions_code_section_391
- No LA document-possession rate was found [GAP]. Comparison point: NYC ACS 2021 found that of 501 youth discharged to APPLA, 63.9% had a state ID (so **~36% did not**), 77.2% had an SS card and 81.8% had a birth certificate [CALC from counts]. https://www.nyc.gov/assets/acs/pdf/data-analysis/2021/GovIDFosterCare2021.pdf
- CA data source: CDSS SOC 405X exit outcomes (Excel, quarterly). It wasn't opened because the download was blocked. https://cdss.ca.gov/inforesources/Research-and-Data/Childrens-Programs-Data-Tables/SOC405X

### 2d. Jail and prison releases
- **LA County jails (LASD), 2025**: Q2 16,260; Q3 16,476; Q4 17,144 releases. Q1 averaged 5,096 a month (about 15,290). The 2025 total is about **65,000 releases** [CALC]. Average daily population was 13,054 in 2025.
  - Q4: https://lasd.org/wp-content/uploads/2026/03/Transparency_Custody_Division_Population_2025_Fourth_Quarter_Report.pdf
  - Q3: https://lasd.org/wp-content/uploads/2025/12/Transparency_Custody_Division_Population_2025_Q3_Report.pdf
  - Q2 (with the Q1 average): https://lasd.org/wp-content/uploads/2025/09/Transparency_Custody_Division_Population_2025_Second_Quarter_Report.pdf
- **State prison**: 30,655 people were released from CDCR in FY 2020-21, and **28.4%** were released to LA County (about 8,550 [CALC]). https://www.cdcr.ca.gov/research/wp-content/uploads/sites/174/2026/06/Statewide-Recidivism-Report-for-Individuals-Released-in-Fiscal-Year-2020-21.pdf
- CASPEH: 19% of unhoused Californians entered homelessness from an institution such as prison or a long jail stay, and 20% spent time in jail in the six months before becoming homeless. https://endhomelessness.org/wp-content/uploads/2024/10/CASPEH_Report_62023.pdf

### 2e. Eaton and Palisades fires
- **Eaton**: 9,419 structures destroyed and 1,076 damaged. https://www.fire.ca.gov/incidents/2025/1/7/eaton-fire
- **Palisades**: 6,845 destroyed and 975 damaged. https://www.fire.ca.gov/incidents/2025/1/7/palisades-fire
- Households that lost documents: **[GAP]**, no published count. FEMA (June 6, 2025) reports $136M+ in Individual Assistance and 3,426 households on rental assistance, but no count of lost documents. https://www.fema.gov/press-release/20250606/los-angeles-county-wildfire-recovery-continues-over-3-billion-federal
- Waivers: RR/CC no-cost vital records (immediate family; notarized affidavit by mail). DMV: "no fee for cards lost in the fires." https://ca.gov/lafires/help-for-you/replace-personal-documents/

### 2f. How long it takes without help
- CDPH Vital Records certified copies: an average of **5 to 7 weeks**. https://www.cdph.ca.gov/Programs/CHSI/Pages/Vital-Records-Processing-Times.aspx
- LA County RR/CC birth record by mail: $34, mailed within **20 business days**. https://lavote.gov/home/records/birth-records/birth-records-request/mail-request
- DMV ID card arrives in **3 to 4 weeks**; check status if it hasn't come after 60 days. https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/identification-id-cards/
- DMV paper process for IDs for people in jail (San Diego): about **120 days**. https://spsf.senate.ca.gov/sites/spsf.senate.ca.gov/files/ab_1329_analysis.pdf
- Anecdotes: "almost a year" with a caseworker (Flint, MI; Stateline 2017). A former LA foster youth had spent **16 years** trying to get a birth certificate (Spectrum 2022). Links above.
- Implied chain [CALC]: birth certificate by mail (4–7 wk) plus DMV mailing (3–4 wk) comes to roughly **7–11 weeks** before any waiting for a missing SSN card or residency letter.

### 2g. Rule facts gathered (useful for the graph)
- Fees: regular ID **$40**; reduced fee **$11** (DL 937, public-assistance recipients); seniors 62+ free; Class C DL $46. https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/licensing-fees/
- No-fee ID for McKinney-Vento homeless (Veh. Code §14902) uses **DL 933**. DL 933 and DL 937 apply to ID cards only, not driver licenses. For REAL ID, an unhoused applicant can use DL 933 plus a letter on letterhead from a shelter, nonprofit, church, employer or agency as residency proof (two proofs needed). Ordering forms is limited to government agencies and 501(c)(3)s serving unhoused or low-income people (CoC membership or government homeless funding). https://www.dmv.ca.gov/portal/?p=288122
  - Note: the statute lets a broader set sign verification, including school liaisons, attorneys and law-enforcement homeless liaisons (https://housingca.org/resources/community/providers/help-someone-get-a-ca-photo-id). The DMV FAQ also swaps the DL 933/937 labels in one place (same DMV page). Model both and cite.
- Free birth certificate: HSC §103577. The affidavit must be signed by the applicant **and** a homeless service provider. Minors can apply themselves with no parent signature; CDPH issues up to three copies a year. https://schoolhouseconnection.org/article/how-to-obtain-a-free-birth-certificate-or-id-in-california-instructions-and-the-law
- Pre-release prison ID (CAL-ID) requires an SSN and a prior CA DL/ID. https://www.cdcr.ca.gov/rehabilitation/calid/
- Jail ID fee under existing law is $8. https://atrn.assembly.ca.gov/sites/atrn.assembly.ca.gov/files/AB%201738%20%28Wendy%20Carrillo%29.pdf

---

## 3. LOCAL PARTNERS AND TESTERS

District check uses House ZIP lookup (ziplook.house.gov). Fully CA-37 ZIPs: **90008, 90016, 90018, 90037, 90062**. Split ZIPs: 90007 and 90089 (CA-34/37), 90003, 90043 and 90044 (CA-37/43), 90230 and 90232 (CA-36/37). ZIP-level only; an exact street-address check was not done.

| Org | Location | What they do | Contact | In CA-37? |
|---|---|---|---|---|
| **HOPICS** | 5715 S Broadway, LA 90037 (also Crocker 90003, Central 90011, Nav Center 90044, Compton) | SPA 6 homeless access centers, interim housing, outreach, re-entry | (323) 948-0444. https://www.hopics.org/ | **Yes** (90037) |
| **First Place for Youth, South LA** | 4337 Leimert Blvd, LA 90008 (main: 3530 Wilshire) | Housing and support for youth leaving foster care (~210 a year). Regional Director LaMont Walker | 213-279-2785, info@firstplaceforyouth.org. https://firstplaceforyouth.org/los-angeles/ | **Yes** (90008) |
| **CRCD** | 3101 S Grand Ave, LA 90007 | Project Tipping Point (foster youth), Reentry and Financial Education Center, youth Coordinated Entry, 681 PSH and affordable units in South LA | 213.743.6193, info@coalitionrcd.org. https://www.coalitionrcd.org/ | Likely (ZIP split 34/37) [UNCONFIRMED] |
| **USC Homelessness Policy Research Institute** | 669 W 34th St #201, LA 90089 | Research collaborative of 100+ researchers and providers; good expert reviewer | hpri@usc.edu. https://hpri.usc.edu/ | Likely (ZIP split 34/37) [UNCONFIRMED] |
| **LAPL Exposition Park–Bethune Regional Library** | 3900 S Western Ave, LA 90062 | Public computers and tech help; a testing venue | (323) 290-3113, expopk@lapl.org. https://www.lapl.org/branches/exposition-park | **Yes** (90062) |
| **LAPL The Source** (Central Library) | 630 W 5th St, LA 90071 | Monthly fair with DMV ID vouchers and birth certificate services | 213-228-7000. https://lapl.org/node/79896 | No (DTLA) |
| **A New Way of Life Reentry Project** | PO Box 875288, LA 90087 (South LA; street address not published) | Reentry housing, case management, pro bono legal (expungement) | 323.563.3575, info@anewwayoflife.org. https://anewwayoflife.org/contact-us/ | [UNCONFIRMED] |
| **1736 Family Crisis Center** | Address not on contact page | DV and family shelters, youth services, legal services | Office (323) 737-3900; 24-hr hotlines (213) 745-6434, (310) 379-3620. https://www.1736fcc.org/contact | [UNCONFIRMED]; a 323-737 number suggests West Adams |
| **LAUSD Homeless Education Office** (McKinney-Vento) | 333 S Beaudry Ave (district HQ) | McKinney-Vento support. School liaisons and social workers can sign DL 933 and the birth certificate affidavit (per Housing CA) | 213-241-3552 (Dir. Denise Miranda, Ed.D.). https://studentsupportprograms.lausd.org/apps/pages/HEO | HQ no; serves CA-37 schools |
| **Inner City Law Center** | 1309 E 7th St, LA 90021 | Homeless legal aid; proposed a vital documents clinic (LA2050 2024) | (213) 891-2880. https://www.innercitylaw.org/ | No (Skid Row) |
| **Anti-Recidivism Coalition** | 601 N Alvarado St, LA 90026 | Reentry housing, supportive services, expungement | 213-955-5885; contact form; media@antirecidivism.org. https://antirecidivism.org/contact/ | No |
| **Homeboy Industries** | 130 W Bruno St, LA 90012 | Reentry, case managers and navigators, legal services | (323) 526-1254, info@homeboyindustries.org. https://homeboyindustries.org/contact/ | No |
| **Children's Law Center of CA** | 101 Centre Plaza Dr, Monterey Park 91754 | Lawyers for foster youth in dependency court | (323) 980-1700; contact form. https://www.clccal.org/ | No |
| **Alliance for Children's Rights** | [UNCONFIRMED]: site blocked automated reading | Foster youth legal and benefits advocacy | https://kids-alliance.org/ | [UNCONFIRMED] |
| **Safe Place for Youth** | Venice | Youth homelessness services with document-readiness staff | https://spectrumlocalnews.com/ca/california/homelessness/2022/04/04/lost-foster-care-documents-homeless-angelenos | No (CA-36) |
| **LA County DCFS Independent Living Program** | (page fetch failed) | Transition services for youth aging out | https://www.dcfs.lacounty.gov/youth/ilp/ [UNCONFIRMED] | n/a |
| **Better Youth Inc. / West LA College** | WLAC (Culver City area) | Named in Kamlager-Dove's FY27 request: "Future Force: Apprenticeships and Housing Support" (foster youth), $2.5M | https://kamlager-dove.house.gov/services/fiscal-year-2027-community-project-funding-selections | Likely [UNCONFIRMED] |
| **Kamlager-Dove district office** | 4929 Wilshire Blvd Ste 650, LA 90010 | Casework, including help with federal agencies such as SSA | (323) 965-1422. https://kamlager-dove.house.gov/fires | Office ZIP 90010 |

---

## 4. MEMBER FIT (Rep. Sydney Kamlager-Dove)

**Roles (119th Congress)**, from https://kamlager-dove.house.gov/about/committees-and-caucuses:
- **Co-Chair, Congressional Caucus on Foster Youth.** Fellow co-chairs listed in May 2025: Bacon, Houchin, Moore, Nunn and Scanlon. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-foster-youth-caucus-colleagues-introduce-resolution-recognize-0
- Member, **Reentry Caucus**. Founding member, **Renters Caucus**. CBC Whip. Policy Co-Chair, Democratic Women's Caucus.
- **House Judiciary**: Subcommittee on Crime and Federal Government Surveillance; Subcommittee on Courts, IP, AI and the Internet.
- **House Foreign Affairs**: Ranking Member, South and Central Asia; member, Western Hemisphere.

**Federal bills and actions (bill numbers not retrieved because congress.gov was blocked [GAP])**
- Higher Education Access and Success for Homeless and Foster Youth Act. Introduced May 7, 2024 with Murray, Braun and Houchin; reintroduced July 28, 2026. Prioritizes these students for Work-Study, gives in-state tuition to students without stable residency, and expands outreach. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-murray-braun-and-houchin-introduce-legislation-break-down ; https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-murray-and-houchin-introduce-legislation-break-down-barriers
- Foster Care Month resolution as caucus co-chair, May 6, 2025 (link above).
- **Fresh Start Act** with Laurel Lee (R-FL), Apr 30, 2025: grants for record-sealing systems. Quote: "No one should be denied a job, housing, or education because of bureaucratic red tape." https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-lee-introduce-bipartisan-fresh-start-act
- Women in Criminal Justice Reform Act, reintroduced May 21, 2026, with reentry provisions. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-reintroduces-women-criminal-justice-reform-act
- Minimum wage for incarcerated workers (Mar 19, 2026); incarcerated firefighters' pay and protections (May 27, 2025); custody-death notification with Ossoff (Apr 9, 2025); juvenile justice package with Cárdenas and Booker (July 2023). Links: https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-cardenas-booker-reintroduce-bicameral-juvenile-justice ; https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-leads-federal-push-support-increased-pay-workplace-protections
- Immigration: a bill (with Vargas) to block immigrants' personal data being used for deportations (Sept 11, 2025); Stop ICE's Medical Neglect Act (July 29, 2026); a "Know Your Rights" page on her site. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-vargas-lead-federal-effort-block-immigrants-personal-data-being ; https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-announces-bill-ensure-medical-care-ice-detainees
  - Design implication: privacy-first design (no accounts, no stored personal data) fits her stated priorities.
- Fires: applauded the Jan 8, 2025 major disaster declaration; a fire resources page on her site. https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-bipartisan-california-congressional-delegation-applaud-president ; https://kamlager-dove.house.gov/fires
- No federal bill on IDs or vital documents was found [GAP].

**Appropriations (Community Project Funding)**
- FY26: $11.56M across 15 projects, mostly housing-related (Inside Safe $850K, Jubilo Village, Urban Awnings, Rebuilding Lives). https://kamlager-dove.house.gov/media/press-releases/kamlager-dove-secures-115-million-strengthen-housing-transportation-and-health
- FY27 requests ($43.5M stated): include CIRCLE crisis response ($1.5M), Epworth Apartments ($980K), Better Youth/WLAC foster youth apprenticeships and housing ($2.5M), and HACLA housing projects. https://kamlager-dove.house.gov/services/fiscal-year-2027-community-project-funding-selections

**State record (Assembly AD-54, Apr 2018–Mar 2021; Senate SD-30, Mar 2021–Dec 2022)**
- **AB 1950 (2020)** limited probation terms (Penal Code §§1203a, 1203.1). Chaptered: Ch. 328, Stats. 2020; she was primary author. https://legiscan.com/CA/bill/AB1950/2019 ; https://legiscan.com/CA/sponsors/AB1950/2019
- **AB 2054 (2020)**, the CRISES Act: community response grant pilot (non-police emergency response). Passed 78-0 and 35-2; vetoed Sept 30, 2020. https://legiscan.com/CA/bill/AB2054/2019
- AB 241 and AB 242 (2019): implicit-bias training for health professionals, lawyers and judges. She chaired the Assembly Select Committee on Incarcerated Women, sat on Public Safety, and was appointed in 2020 to the Committee on Revision of the Penal Code. https://en.wikipedia.org/wiki/Sydney_Kamlager-Dove
- No state ID, foster-youth or homelessness-specific bill was confirmed [GAP; leginfo author search could not be fetched].

---

## 5. LOCATION DATA ENDPOINTS

| Need | Endpoint | Format | Fields | CORS | License / terms |
|---|---|---|---|---|---|
| DMV offices (best) | `https://www.dmv.ca.gov/portal/wp-json/wp/v2/dmv_field-office?per_page=100&page=N` (WordPress REST; the type is listed at `/wp-json/wp/v2/types`) | JSON | `meta.dmv_field_office_street/city/zipcode/latitude/longitude`, per-day `hours`, `appointment`; services and payment options in `class_list` (e.g. `dmv_services-original-id-cards`). No phone, no wait times | Not tested. WordPress REST usually sends CORS headers, but DMV may sit behind a WAF. Undocumented endpoint. [UNCONFIRMED] | Not stated. Undocumented and could change, so snapshot it at build time |
| DMV offices (official open data) | `https://services6.arcgis.com/8zbIxywG5xu2vq8a/arcgis/rest/services/Department_of_Motor_Vehicles_Office_Locations/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`; CSV/GeoJSON downloads at https://lab.data.ca.gov/dataset/department-of-motor-vehicles-office-locations | GeoJSON, JSON, CSV, KML | Name, FAC_ID, ZIP, Address. The `latitude`/`longitude` attributes are in projected units, so use `outSR=4326` geometry. No hours | ArcGIS Online hosted service; these usually allow CORS [UNCONFIRMED] | **Public domain** (dataset page) |
| DMV appointments | No API found. The appointment system is on the DMV site [GAP] | n/a | n/a | n/a | n/a |
| SSA offices | `https://www.ssa.gov/data/FO-Address-Open-Close-Times.csv` (plus Resident Stations CSV and VSD-Sites.csv); described at https://www.ssa.gov/open/data/FO-RS-Address-Open-Close-Time-App-Devs.html | CSV, updated quarterly (last Mar 9, 2026) | Office code and name, address, phone, fax, Mon–Fri open and close times. **No lat/long**, so geocode at build time | Not tested [UNCONFIRMED]; bundle a static copy | Not stated (US federal data) |
| SSA (also) | LA County LMS layer 73 "Social Security Administration" (below) | JSON, GeoJSON | Includes lat/long and hours | Not tested | Not stated |
| RR/CC birth certificate offices | https://lavote.gov/contact-us/branch-office-locations | HTML (7 offices; hand-curate). Birth copies are issued at Norwalk, East LA, Lancaster, LAX/Courthouse (11701 S La Cienega), Van Nuys and Florence/Firestone (7807 Compton Ave), **not Beverly Hills** | | n/a | County site |
| LA County facilities (shelters, libraries, self-help legal, SSA, "Public Records") | `https://public.gis.lacounty.gov/public/rest/services/LACounty_Dynamic/LMS_Data_Public/MapServer/{id}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`. Layer ids: 73 SSA, 100 Libraries, 105 Public Records, 145 Self-Help Legal Centers, 154 DV Services, 157 Forms Assistance, 158 Homeless Shelters and Services, 160 Immigration, 172 Welfare Offices. Front end: https://locator.lacounty.gov | JSON, GeoJSON, PBF | name, org_name, addrln1, city, zip, hours, phones, url, email, description, latitude/longitude, date_updated | Not tested [UNCONFIRMED] | Not stated (licenseInfo blank). **Sample records were last updated in 2020**, so data may be stale |
| Shelters (LAHSA/County) | DRP "Homeless Shelters" layer `https://arcgis.gis.lacounty.gov/arcgis/rest/services/DRP/Sensitive_Uses_Gun_Dealers/MapServer/12` (as of 7/31/22; copyright LAHSA and County CEO; **must not display beyond 1:80,000 for privacy**). Interim Housing Pipeline `https://services.arcgis.com/RmCCgQtiZLDCtblq/ArcGIS/rest/services/Interim_Housing_Pipeline_v8_(Public)/FeatureServer/1` (Apr 2022) | JSON, GeoJSON | Project and site names, city, zip, beds, population type, SPA, council district | Not tested | Copyright noted. Both are **2022 snapshots** |
| Shelters (LAHSA current) | 2026 Housing Inventory Count, "no-address" version: https://www.lahsa.org/documents?id=10148-2026-housing-inventory-count-no-address-2026-07-08 | Spreadsheet (no addresses; robots block automated fetch) | Program inventory | n/a | LAHSA |
| 211 LA | 211 National Data Platform APIs (Search, Query, Export): https://apiportal.211.org/ | API with key; free trial | Services, locations, organizations | n/a | Terms not shown. Export API limited to authorized users. **211 LA participation [UNCONFIRMED]** |
| Free notary | No machine-readable source found [GAP]. 211 LA lists notary services (e.g. Azusa City Library, fixed fee): https://211la.org/services/HxKokxmKNH9xbn0ptxyB7GjCJVwJD3/notary-public-services | | | | |
| Homeless count by tract | https://www.lahsa.org/documents?id=10172-hc-26-raw-data-by-census-subtract-2026-08-06 | Spreadsheet | Counts by census subtract | n/a | LAHSA |
| Foster exits (CA) | https://cdss.ca.gov/Portals/9/Additional-Resources/Research-and-Data/DSSDS/Tables/SOC405XFFY24-25.xlsx | Excel | Exit outcomes by quarter (cells under 11 masked) | n/a | CDSS |

Recommendation: snapshot all location data into static JSON at build time (DMV WP REST plus CA open data, SSA CSV geocoded, RR/CC hand-curated, a selected set of shelters), with a "last verified" date per record. Don't depend on live CORS.

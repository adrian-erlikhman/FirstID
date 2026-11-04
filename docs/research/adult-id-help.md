# Who can help an adult get ID: candidates for the no-path screen

Nov 3, 2026. The no-path screen's "Who can help today" offers adults only 211 LA County; LAUSD's Homeless Education Office is shown only to people under 22. `tests/dead-ends.test.tsx` keeps this as an open item, skipped until "an adult option whose own site says it helps with ID or documents" is added.

A Claude research agent looked for one (logged in [`AI-USE.md`](../../AI-USE.md)). Every quote below was copied from the organization's own page, and Claude re-opened each top candidate's page the same day and found the quote and phone number on it. These are leads, not facts for the app: before one goes on the screen, a teammate should call it and ask whether it helps someone who walks in (not only its own clients), what it costs, and what to bring. Then add it to `helpOptions` in `src/whatif.ts`, give it strings in `src/i18n.ts`, and unskip the test.

## Best candidates

| | Who it serves | What its own page says | Phone | Watch out for |
|---|---|---|---|---|
| **The Midnight Mission**, emergency shelter, 601 S. San Pedro St., Los Angeles 90014 ([page](https://www.midnightmission.org/our-services/emergency-services/shelter/)) | Adults, women, limited family spaces. "Walk-in welcome", open 24/7. "no cost". | "No ID? We'll help you get one." FAQ: "Do I need ID?" "No, we can help you get one." | 213-624-9258 (also on its [contact page](https://www.midnightmission.org/contact/)) | The ID help is listed as part of the shelter offer. Ask whether someone who isn't staying there can get it. |
| **Los Angeles Public Library: The Source**, a monthly resource fair at Central Library, 630 W. Fifth St., Los Angeles 90071 ([page](https://www.lapl.org/homeless-resources)) | "homeless Angelenos"; "Services are also available for eligible low-income residents." "All services are free of charge." | Under "Services offered may vary by location and include:": "Free California ID vouchers for the DMV", then "Birth certificate services". | 213-228-7000 | Last Tuesday of the month, 12:30-3 p.m. The [event page](https://www.lapl.org/events/source-free-health-emergency-shelter-services) lists dates only until Nov 24, 2026; no 2027 dates yet. |
| **LA County JCOD: D.O.O.R.S. Community Reentry Center**, 3965 S. Vermont Ave., 3rd floor, Los Angeles 90037 ([program page](https://jcod.lacounty.gov/program/d-o-o-r-s-community-reentry-center/), [fact sheet PDF](https://jcod.lacounty.gov/wp-content/uploads/2025/10/D.O.O.R.S-Community-Reentry-Center-Developing-Opportunities-and-Offering-Reentry-Solutions.pdf)) | Justice-impacted people and their families. "(Walk-ins and Appointments are Welcomed)". | Fact sheet: "DOORS LA provides clothing, DMV waivers, Computer Lab." Its referral form lists "DMV ID Fee Waiver". | 323-730-4442 (reception); 833-522-5263 (JCOD support line, 6 a.m.-11 p.m. daily) | Only the DMV fee waiver (the DL 933's job), not birth certificates or Social Security cards. Hours differ: the web page says Mon-Thu 9-4, the fact sheet 8-4. Fits the app's people leaving jail. |

## Narrower, but real

| | Who it serves | What its own page says | Phone | Note |
|---|---|---|---|---|
| **LA County RR/CC fire replacement records** ([page](https://recovery.lacounty.gov/replace-documents/)) | Eaton and Palisades fire survivors. | "These documents lost in the 2025 Eaton and Palisades Fires can be replaced for free:", first item "LA County birth certificates". | 1-800-201-8999, option 1, then 2 | Birth, marriage and death records only. The app's rules already cite this program (`rrcc_fire`); it could be the help line for fire survivors. |
| **City of Long Beach Homeless Services Bureau**, library outreach ([page](https://www.longbeach.gov/homelessness/homeless-services/street-outreach-network/)) | People experiencing homelessness, at three Long Beach libraries. | "We can assist with:" … "Getting vital records (like birth certificates or IDs)" | 562-570-4500 | Long Beach only. "Hours of operation may vary and are subject to change or cancellation." |
| **Harbor Interfaith Services**, Family Resource Center, 670 W. 9th St., San Pedro ([page](https://www.harborinterfaith.org/services/find-help/)) | "homeless or working poor" in the South Bay, under the federal poverty line. "Walk-ins accepted". | "Present your driver's license or state identification (adults). If you don't have these, we will help you get them." | 310-831-9123 | The page looks old (© 2019, 2015 poverty figures). Call first. |

Also real, with weaker or narrower wording (checked by the agent only): SELAH Neighborhood Homeless Coalition (volunteer drop-ins in Echo Park, Los Feliz, Silver Lake, Hollywood; "help with special services like ID replacement", 323-539-7570); Downtown Women's Center (women; 213-680-0600); WLCAC Homeless Access Center (South LA residents; 323-563-4721); Union Station Homeless Services (Pasadena, employment clients; 626-240-4550); Center for Living and Learning (Van Nuys, reentry clients; 818-781-1073).

## Looked at and set aside

- **Inner City Law Center's Vital Documents Clinic** would fit best, but its site blocks automated reading and the only event pages found were from 2023-24. Open https://innercitylaw.org/event/vital-documents-clinic-4 in a browser to check.
- St. John's Community Health RISE (its page doesn't mention ID), Home Again LA (only directories say it), the Sheriff's Community Transition Unit (people still in custody), A New Way of Life (its own residents).
- DPSS, LAFLA, NLSLA, Public Counsel, Bet Tzedek, The People Concern, Weingart, PATH, LA Family Housing, St. Joseph Center, VOALA, Homeboy, Chrysalis, LA Mission, Union Rescue Mission and JCOD Care Management: their pages don't say plainly that they help with ID.
- LAHSA's LA-HOP couldn't be read (it is a JavaScript app).

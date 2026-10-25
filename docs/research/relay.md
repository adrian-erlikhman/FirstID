# Relay — 2026 Congressional App Challenge assessment (research notes)

Researched 2026-10-18. Every factual claim has a URL. Lines marked **[judgment]** are my analysis, not sourced facts. Lines marked **[unverified]** are leads I could not confirm (the web-search budget ran out partway through, and fcc.gov / leginfo.ca.gov would not load).

Idea recap: a text-first calling assistant for people with speech disabilities and limited-English speakers. The user types, TTS speaks into the call, the IVR menu shows as text, DTMF is sent, a classifier labels the far end (IVR / human / AI agent / hold music), a silence manager plays announcements, and a transcript is saved. Proposed stack: Twilio 3-leg conference + Media Streams + Deepgram + ElevenLabs.

---

## 1. Prior art

### Apple Live Speech (iOS 17+)
- Type text and it is spoken aloud "during phone and FaceTime calls," announced May 16, 2023. https://www.apple.com/newsroom/2023/05/apple-previews-live-speech-personal-voice-and-more-new-accessibility-features/
- Apple support: works in FaceTime and phone calls, where "other participants hear your words." Needs iOS 17 / macOS Sonoma / watchOS 10 or later on iPhone XS or later. https://support.apple.com/105018
- Saved phrases, dozens of system voices, or your Personal Voice. Apple: "Live Speech even allows the audio from apps to be audible in voice and video calls." https://www.apple.com/accessibility/speech/
- **Cellular calls:** Apple's wording is "Phone and FaceTime calls," and the Phone app handles ordinary carrier calls. AT&T's own device-support page documents it for calls on the iPhone 16 Plus: "This feature can be used on phone calls as well as in person conversations." https://www.att.com/device-support/article/142199/apple/iphone-16-plus/ Neither source uses the word "cellular," but both describe ordinary phone calls, not just FaceTime. **Verdict: yes, it works on regular calls.**
- Closeness to Relay: **very close on type-to-speak**. It does not show IVR menus as text, classify the far end, manage silences, or save transcripts.

### Apple Personal Voice
- A synthetic voice modeled on the user's own voice, built on-device, for people at risk of losing speech (for example, ALS). The 2023 launch version used 15 minutes of recorded prompts. https://www.apple.com/newsroom/2023/05/apple-previews-live-speech-personal-voice-and-more-new-accessibility-features/
- Now takes 10 randomized phrases and makes a voice "in under a minute." Users who struggle with full sentences can read three-word phrases instead. Processing is on-device, with an optional encrypted iCloud copy. https://www.apple.com/accessibility/speech/
- Works with Live Speech, VoiceOver, and third-party augmented-speech apps, which "can use your Personal Voice during calls" once the user allows it. Requires iPhone 12 or later on iOS 17+. https://support.apple.com/HT213878
- Closeness: a voice layer, not a calling assistant. **[judgment]** It complements Relay. An iOS build could even speak in the user's own voice instead of ElevenLabs.

### iOS 26 Phone app (new since Live Speech; directly relevant)
- **Hold Assist:** the iPhone "listens for hold music playing, and then alerts you when a person comes on the line." Voice-based automated reminders or music with lyrics can confuse it. https://www.macrumors.com/guide/ios-26-phone-app
- Announced June 9, 2025. The Phone app detects hold music, offers to wait, and notifies you when a live agent is available. https://techcrunch.com/snippet/3016749/ios-26-can-screen-calls-and-hold-your-place-in-call-center-queues/
- **Live Translation in calls:** runs on-device, and the other party needs no iPhone. Supports English, French, German, Portuguese, and Spanish, with live transcript and AI voiceover. https://www.macrumors.com/guide/ios-26-phone-app
- MacRumors does not mention IVR-menu transcription on iPhone. **[judgment]** I found no iPhone equivalent of Direct My Call.
- Closeness: **Hold Assist is a shipping hold-music-vs-human detector**, which is half of Relay's classifier.

### Google Pixel Call Assist
- **Direct My Call:** "Displays automated phone menu options on screen so you can tap through them." https://blog.google/products/pixel/pixel-call-assist-call-notes-tips/ (Feb 20, 2025). Pixel 3a or later, US and English only. https://www.androidpolice.com/what-is-pixel-call-assist/
- **Hold for Me:** waits on hold, and "when a representative is ready, it tells them you're returning and notifies you." Pixel 3 or later. https://blog.google/products/pixel/pixel-call-assist-call-notes-tips/
- **Call Screen:** transcribes calls live, offers reply options, and saves audio and transcripts in Recents. https://blog.google/products/pixel/pixel-call-assist-call-notes-tips/ It runs on-device. https://support.google.com/pixelphone/answer/13383733?hl=en
- **Clear Calling:** "filters out your caller's background noise and enhances their voice." https://support.google.com/pixelphone/answer/13383733?hl=en
- **Live Caption type-to-reply:** "Shows the caller's words as text. You type responses, and the phone reads them aloud." https://blog.google/products/pixel/pixel-call-assist-call-notes-tips/
- **Call Notes:** transcripts and summaries; Pixel 9 or later, US only. https://blog.google/products/pixel/pixel-call-assist-call-notes-tips/
- **Voice Translate (Pixel 10):** two-way, near-real-time call translation in the speaker's own voice, on-device on the Tensor G5 (Aug 20, 2025). https://www.androidauthority.com/pixel-10-voice-translate-3588125/
- Wait Times shows estimated hold length (US, English). https://www.androidpolice.com/what-is-pixel-call-assist/
- Closeness: **the closest prior art.** Direct My Call + Hold for Me + type-to-reply + Call Screen transcripts together cover most of Relay. They are Pixel-only and mostly US English, and they are not packaged for speech disability.

### Google Project Relate
- Android beta. Listen (transcribes the user's atypical speech), Repeat (restates it in a clear synthetic voice), and Type (dictation into other apps). "Relate is not accepting new users at the moment." No mention of phone calls. https://sites.research.google/relate/
- Closeness: low. It recognizes the user's own speech, while Relay assumes the user types. **[judgment]** It is effectively frozen.

### Nagish (text-to-call)
- Real-time speech-to-text and text-to-speech on calls. Users with speech disabilities type and the app speaks. https://ixd.prattsi.org/2024/09/assistive-technology-nagish-call-captioning-app/
- FCC-certified for IP CTS in Jan 2024 and as an IP Relay provider (announced Feb 13, 2025), "the first vendor to be FCC-certified for IP Relay since 2014." Free app. https://prnewswire.co.uk/news-releases/fcc-certification-nagish-brings-ai-powered-phone-calls-to-countless-deaf-and-hard-of-hearing-individuals-302375803.html
- Observation: nagish.com now 302-redirects to rylo.com, an FCC-certified, free IP CTS / IP Relay captioning app "designed for people who are Deaf, hard of hearing, or have speech disabilities," with "speak or type to reply." https://rylo.com/ **[unverified]** Whether Rylo is a rebrand of Nagish; the site does not say so.
- No IVR-specific features found. Closeness: **high on type-to-speak plus transcript.** It is free and federally funded for eligible users.

### Hamilton CapTel
- Hamilton Mobile CapTel captions calls with either "Auto (computer-generated)" or "Assisted (operator facilitated)." It costs the user nothing, is limited to registered users with hearing loss, and is US only. No type-to-speak. https://apps.apple.com/us/app/-/id1518872972
- Closeness: low. It serves hearing loss, not speech output.

### InnoCaption
- Captions from live stenographers or ASR, switchable before or during calls. **"Type to speak"** speaks typed replies, and pre-written shortcuts are spoken immediately. The features page says this helps with automated phone systems. Past transcripts can be saved or emailed. Keeps the user's own number. https://innocaption.com/features
- March 12, 2026: added AI text-to-speech features (QuickSpeak pre-written phrases, Saved Phrases, AI Refine that expands a few typed words into a sentence, AI Practice Calls). "Free of charge for individuals in the US with a hearing loss or speech disability." https://www.businesswire.com/news/home/20260312560362/en/InnoCaptions-New-AI-powered-Text-to-Speech-Features-Empower-Users-With-Hearing-Loss-or-Speech-Disabilities-to-Make-Calls-With-Greater-Confidence
- Closeness: **very high.** Free, FCC-funded type-to-speak plus phrases plus transcripts, aimed explicitly at speech disabilities and automated menus. **[judgment]** QuickSpeak phrases are effectively a manual silence manager.

### FCC Speech-to-Speech Relay (STS) and California Relay Service
- FCC definition: STS is a TRS "that allows individuals with speech disabilities to communicate with voice telephone users," using specially trained operators who repeat the user's words. https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-F/section-64.601
- FCC fact sheet (Oct 30, 2025, TRS modernization NPRM): STS use is **under 400,000 minutes a year**. The NPRM proposes recognizing IP STS, with video-assisted STS as an add-on. https://docs.fcc.gov/public/attachments/DOC-415186A1.pdf
- California Relay Service STS: free (normal phone charges only). A trained CA joins the call and repeats either difficult words or everything. Works with the user's own voice or a speech-generating device. Numbers: English 1-800-854-7784, Spanish 1-800-855-7200. Visually Assisted STS uses a webcam via Jami, English 1-800-855-7400. https://caconnect.org/relay
- 711 reaches CRS (TTY, VCO, HCO, STS, captioned telephone), 24/7. https://www.granitenet.com/wp-content/uploads/2025/06/2026-California-Directory-Page.pdf
- VA-STS is "not mandated by the FCC." It is available in 15 states. https://at3center.net/?p=3346
- Closeness: same goal, done by a human intermediary. **[judgment]** Low usage (<400k min/yr nationwide) supports the claim that people avoid relay calls, which is a good "need" talking point.

### Voiceitt
- Web app with Speak (speech-to-speech), Dictate, and Integrations (Webex, Zoom beta, Teams coming soon; Alexa through the mobile app). Targets stroke, ALS, Parkinson's, and cerebral palsy. The page does not say the app works on phone calls. It also offers a **Speech API for making automated phone menus (IVRs) accessible to people with non-standard speech**, sold to integrators. 30-day free trial. https://www.voiceitt.com/
- Closeness: medium. It recognizes the user's atypical speech, and its IVR-accessibility API is the same problem approached from the enterprise side.

### Whispp (bonus)
- Converts whispered speech (people who stutter severely tend to whisper fluently) and affected speech (throat cancer, vocal cord paralysis, ALS) into a clear voice in real time, with a calling feature. https://www.extruct.ai/hub/whispp-com/

### AI agents that call businesses for you
- **Simple AI (YC S24):** consumer AI that places calls for you, including customer-support billing calls. "Simple can wait on hold and navigate phone trees." 33 countries, 15 languages (Dec 5, 2024). https://www.ycombinator.com/launches/MOM-simple-ai-ai-phone-assistant-for-consumers
- **Pine AI:** "make[s] real phone calls to real customer service lines, navigate[s] automated menus, wait[s] on hold," then negotiates with the human rep and returns a summary. https://www.19pine.ai/zh-hans/blog/can-ai-call-customer-service-for-you
- **Google Ask for Me** (Search Labs, Jan 30, 2025): calls local businesses (auto services, nail salons) for prices and availability, and "clearly discloses" that the call is automated. https://androidauthority.com/google-search-ask-for-me-3521795
- **Infinitus:** AI that makes provider-to-insurer calls (benefits verification, prior auth). https://www.fiercehealthcare.com/tech/infinitus-systems-pulls-30m-to-automate-provider-calls-insurers
- **Twilio Answering Machine Detection:** classifies `human` / `machine_start` / `fax` / `unknown` near answer time, and "will not always return the right answer." $0.0075 per call. https://www.twilio.com/docs/voice/answering-machine-detection , https://www.twilio.com/en-us/voice/pricing/us
- Closeness: these agents already do IVR navigation plus hold detection plus human handoff, autonomously. Relay differs by keeping the human user in control in real time.

### Novelty verdict **[judgment]**
- **Not new:** type-to-speak (Live Speech, Pixel, InnoCaption, Nagish/Rylo), IVR menu as text (Direct My Call), DTMF, hold-music/human detection (Hold Assist, Hold for Me, Twilio AMD, Pine/Simple), transcripts (Call Screen, Call Notes, InnoCaption), call translation (iOS 26, Pixel 10).
- **IVR/human/AI-agent/hold classifier:** two of the four classes ship today. Hold music vs. human is Hold Assist and Hold for Me; machine vs. human is AMD. **The only new label is "AI agent,"** and there is no public labeled data or ground truth for it, so a 7-day team cannot validate it. The classifier is a component, not a novelty.
- **Silence manager:** the most distinctive piece *for this population*. Hold for Me already tells a returning rep "you're returning," and InnoCaption QuickSpeak is a manual version. An automatic, timer-driven "I'm typing with an assistive app, one moment" when the user goes quiet mid-turn appears unshipped as an automatic feature. It is a UX feature, not an invention.
- **What is genuinely different:** the *combination*, delivered cross-platform (any browser, any phone), designed for speech disability, with the user in control. Today that combination exists only on Pixel (US English), or split across InnoCaption plus iOS. That integration story is the honest pitch.

---

## 2. Feasibility and cost

### Twilio pricing (US; page says current as of August 2026) — https://www.twilio.com/en-us/voice/pricing/us
| Item | Price |
|---|---|
| Outbound call, local/toll-free | $0.0140/min |
| Inbound local | $0.0085/min |
| Browser/app (Voice SDK) leg | $0.0040/min |
| Conference | from $0.0018 per participant-minute |
| Media Streams | $0.0044/min |
| ConversationRelay | $0.07/min |
| Real-time transcription (Twilio) | $0.027/min |
| Call recording | $0.0025/min |
| AMD | $0.0075/call |
| Local number | $1.15/month |

### Media Streams bidirectional: difficulty and gotchas
- Bidirectional streams start only with `<Connect><Stream>`, which "block[s] subsequent TwiML instructions" until the WebSocket closes. Only the **inbound track** can be received. **One bidirectional stream per call.** https://www.twilio.com/docs/voice/media-streams
- **DTMF:** "Outbound DTMF from your server to Twilio isn't supported" on bidirectional streams, and "DTMF isn't supported with unidirectional streams." https://www.twilio.com/docs/voice/media-streams **This breaks the spec's "send DTMF" step in the obvious design.**
- The only way to stop a bidirectional stream is to end the call or update it with new TwiML. Only `wss` is supported, with no query strings (use custom parameters). https://www.twilio.com/docs/voice/twiml/stream
- Audio is `audio/x-mulaw`, 8000 Hz, mono, base64. Outbound payloads must be mulaw/8k base64 with no header bytes. `mark` and `clear` handle playback tracking and barge-in. https://www.twilio.com/docs/voice/media-streams/websocket-messages
- The Conference Participant API documents no send-digits parameter and does not say whether DTMF passes through a conference. https://www.twilio.com/docs/voice/api/conference-participant-resource
- The Voice JS SDK's `call.sendDigits()` plays DTMF ("useful ... when an automated phone menu expects DTMF tones"). https://static0.twilio.com/docs/voice/sdks/javascript/twiliocall **[unverified]** Whether those tones survive a Twilio conference to the PSTN leg. Test this on day 1.
- Deepgram accepts `mulaw` input. https://developers.deepgram.com/docs/encoding ElevenLabs offers μ-law output, "commonly used for Twilio audio inputs." https://elevenlabs.io/docs/api-reference/text-to-speech/stream So no transcoding is needed.
- **Simpler alternative:** Twilio **ConversationRelay** bundles Deepgram STT and ElevenLabs TTS (Flash 2/2.5). https://www.twilio.com/docs/voice/conversationrelay Its WebSocket accepts `text` (speak), `play`, and **`sendDigits`**, and emits `prompt` (transcripts), `interrupt`, and `dtmf`. https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
- **[judgment]** Recommended architecture: 2 legs, not 3. Twilio dials the business, `<Connect><ConversationRelay>` handles it, and the user's browser talks to your server over a WebSocket. Add a listen-in browser leg only if needed. For the hold-music classifier, try a non-blocking `<Start><Stream>` (unidirectional, raw audio) before `<Connect><ConversationRelay>`; they share the 4-track budget. **[unverified]** That the two coexist. Test it.
- **[judgment]** Difficulty: the raw Media Streams + conference + DTMF route is 2–3 days of plumbing for a strong student. The ConversationRelay route is about 1 day.

### Trial accounts
- Calls only to and from **verified numbers** (up to 5 recipients); 30-day expiry; "75 voice minutes"; "some TwiML verbs are blocked during trial"; upgrading removes the verified-recipient restriction. https://www.twilio.com/docs/usage/trials
- **Max 10 minutes per call**, max 5 concurrent calls, and "Calls to and from your free trial phone number will play a short trial message before your TwiML is executed." https://support.twilio.com/hc/en-us/articles/360036052753
- **[judgment]** A trial account can demo against a **mock IVR you build on your own Twilio number**, with a teammate's verified phone as the "human agent." It **cannot** call a real pharmacy or insurer IVR (unverified number), and the trial message ruins realism. **Upgrade for the recorded demo.**

### Deepgram — https://deepgram.com/pricing
- **$200 free credit**, no credit card, no expiration on Pay As You Go.
- Nova-3 streaming: $0.0048/min monolingual, $0.0058/min multilingual. Flux English $0.0065/min. Aura-2 TTS $0.030 per 1k characters.

### ElevenLabs
- API: Free tier includes 20,000 Flash/Turbo characters per month. Starter is $6/month ("first month $1") with 150k Flash characters. Flash/Turbo is $0.04 per 1k characters, latency "~75ms." https://elevenlabs.io/pricing/api
- Free plan: "does not include commercial usage rights — you must attribute ElevenLabs in any public content." This is a secondary source. https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/

### Rough 7-day cost **[judgment, using the prices above]**
- Raw stack, per live call-minute: outbound $0.014 + Media Streams $0.0044 + conference 2–3 legs (about $0.005) + browser leg $0.004 ≈ **$0.028/min Twilio**. Deepgram is covered by the $200 credit. TTS is typed text, a few hundred characters a minute, so about $0.01/min or inside the free 20k characters.
- ConversationRelay route: $0.014 + $0.07 ≈ **$0.084/min**.
- Assume 300–500 test and demo minutes across 3 people: **$10–45 in usage, plus $1.15 for a number, plus $1–6 for ElevenLabs Starter.**
- **All-in: about $20–50**, mostly the Twilio top-up needed to leave trial. **[unverified]** The exact minimum top-up; check the Twilio console.

### Biggest technical risks **[judgment unless cited]**
1. **DTMF delivery.** Not supported from bidirectional Media Streams (cited above). Use ConversationRelay `sendDigits`, synthesize in-band DTMF tones into the mulaw stream (some IVRs may reject in-band tones), or end and re-issue TwiML with `<Play digits>`.
2. **Topology.** One bidirectional stream per call, inbound track only, and `<Connect>` blocks TwiML (cited). Conference + stream wiring is where student projects stall.
3. **Typing latency → reps hang up.** This is the real-world failure mode. The silence manager is the mitigation, so make it the hero feature.
4. **Classifier accuracy.** Even Twilio's AMD "will not always return the right answer," and Hold Assist is fooled by voice reminders and music with lyrics (cited). The 4-class model needs labeled audio the team does not have. Plan for rules plus a small hand-labeled eval set, and report measured accuracy honestly.
5. **Age-gated vendor accounts.** Deepgram: "You must be at least 18 years old." https://deepgram.com/terms ElevenLabs: "If you are under 18 years of age ... you may not use our Services." https://elevenlabs.io/terms-of-use Twilio's terms say "Our services are generally intended for business or professional use only." https://www.twilio.com/en-us/legal/tos A parent or teacher must own the accounts.
6. **LEP scope creep.** Typing in another language requires machine translation, which the spec does not include. iOS 26 Live Translation covers only EN/FR/DE/PT/ES (cited above). That is a real gap, but it is a separate feature. Cut it or keep it to a one-language stretch goal.
7. **Name collision.** "Relay" collides with TRS "relay" services (California Relay Service, https://caconnect.org/relay) and with Twilio's "ConversationRelay." Consider a different name.

### California Penal Code 632 (two-party consent)
- 632(a): a person who, "intentionally and without the consent of all parties to a confidential communication," "uses an electronic amplifying or recording device to **eavesdrop upon or record** the confidential communication." Fine up to $2,500 per violation and/or jail. 632(c) excludes communications where parties could reasonably expect to be overheard or recorded. https://california.public.law/codes/penal_code_section_632
- **632 covers "eavesdrop upon," not just "record."** Not storing audio does not by itself remove the issue, and a text transcript is plausibly a "record."
- Courts are applying CIPA to real-time AI call processing:
  - *Ambriz v. Google* (N.D. Cal., Feb 10, 2025): a § 631 claim against Google's Contact Center AI, which "transcribes calls in real time," survived under the "capability test." https://www.zwillgen.com/privacy/federal-judge-allows-google-customer-service-ai-class-action-to-proceed/
  - *Taylor v. ConverseNow* (N.D. Cal., Aug 11, 2025): **§ 632** and § 631 claims against an AI phone-ordering vendor survived. Sharing personal and financial information made the call "confidential." https://www.wsgrdataadvisor.com/2025/09/u-s-federal-court-allows-cipa-class-action-against-ai-customer-service-provider-to-proceed/
  - Generic "may be monitored" disclaimers likely fail; consent should be explicit. https://www.ebglaw.com/insights/publications/eavesdropping-by-algorithm-how-courts-are-applying-decades-old-privacy-laws-to-ai
- **§ 632.7** (cell or cordless calls, no confidentiality element) applies to **parties** as well as outsiders: *Smith v. LoanMe* (Cal. Sup. Ct., Apr 1, 2021). The opinion suggested that notice such as a "beep" may support implied consent. https://www.arnoldporter.com/en/perspectives/blogs/enforcement-edge/2021/04/say-yes-to-the-beep
- **Does transcription without stored audio count?** I found **no California case squarely holding** either way. The IAPP (Nov 2025) also notes the question is unsettled for AI transcription. https://iapp.org/news/a/dressing-old-laws-in-class-action-suits-applying-anti-wiretapping-laws-to-ai-transcription-services **[judgment]** Treat it as covered. Talking to an IVR alone involves no human confidential communication, so it is low risk. Once a human agent joins, it is in scope.
- **Mitigation [judgment]:** have the silence manager's first line be the disclosure. For example: "Hi, I'm using an assistive typing app because of a speech disability. This call is transcribed for me." That is all-party notice, built in. Keep transcripts on-device or user-owned, and make sure the ASR vendor does not train on the data. This matters because "capability" to use the data is what sank Ambriz and ConverseNow. Not legal advice.
- **[unverified]** FCC AI-voice / TCPA angle. The FCC's 2024 ruling treats AI voices as "artificial" voices under the TCPA, and a later NPRM floated carve-outs for people with disabilities. I could not load fcc.gov to confirm. Calls to business lines that a live user initiates are likely low risk, but check.

---

## 3. CAC fit

### Accessibility and communication winners, 2023–2025 (congressionalappchallenge.us)
- **2025 CA-44 (Rep. Barragán, LA area): "Communication Board"**, a digital AAC board "designed to support individuals with speech or language impairments" (Narbonne HS). https://www.congressionalappchallenge.us/25-CA44/
- **2025 CA-38 (Rep. Linda Sánchez): "SpeakSmart"**, public-speaking and communication feedback (Glen A. Wilson HS, 3 students). https://www.congressionalappchallenge.us/25-CA38/
- **2025 GA-07: "SpeakEase"**, AI next-phrase prediction and speech output, built for a low-verbal autistic brother. https://www.congressionalappchallenge.us/25-GA07/
- **2024 CA-46 (Rep. Correa): "Aries"**, a voice-controlled assistant for digital accessibility (4 students, Oxford Academy). https://www.congressionalappchallenge.us/24-CA46/
- **2024 GA-08: "Signify"**, real-time translation for deaf and hard-of-hearing users. https://www.congressionalappchallenge.us/24-GA08/
- **2023 MD-08: "SignMe"**, ASL ↔ spoken language. https://www.congressionalappchallenge.us/23-MD08/
- **2023 MN-06: "Accessify"**, emergency communication for Deaf/HoH users. https://www.congressionalappchallenge.us/23-MN06/
- **2023 FL-15: "Signify."** https://www.congressionalappchallenge.us/23-FL15/
- **[judgment]** The category wins often, including in LA-area districts in 2025, so judges like it. It is also crowded, and AAC boards and sign translators are common. A telephony app is more technically ambitious than the typical entry, which helps on the "coding excellence" criterion.

### 2026 rules — https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf
- Deadline: **"12:00 pm EDT, Monday, October 26th, 2026"**, which is **9:00 am PDT** in LA. Teams of up to 4. Apps must be created after Oct 30, 2025. The app "must demonstrate some degree of functionality."
- Original work: "All coding and technical development must be done by the student or student team." Open-source libraries and external tools are allowed but must be clearly documented and show "significant personal effort and technical understanding."
- AI: allowed if "all AI usage is fully disclosed," and AI "must not constitute the entirety of the technical development."
- Privacy: the app "must not violate any Intellectual Property, common law, or privacy rights of third parties."
- Video: 1–3 minutes, public on YouTube or Vimeo. It must include participant names, the app name, a one-sentence purpose, target audience, tools and languages used, and functionality.
- Judging: quality of idea (creativity and originality), implementation (UX and design), and coding excellence. Judges may request source code, and refusing means disqualification.
- Eligibility: compete in the district of residence or school. At least half the team must be eligible for the district. https://www.congressionalappchallenge.us/students/rules/

### Rule issues for Relay **[judgment, applying the rules above]**
1. **Heavy API dependence vs. "significant personal effort."** Document Twilio, Deepgram, and ElevenLabs. Make sure the students' own code is visible: orchestration, the classifier, the silence-manager state machine, and the UI.
2. **AI disclosure.** Disclose any coding assistants (Claude, Copilot), any LLM used in the classifier or for phrase suggestions, and AI TTS and ASR as AI components.
3. **Privacy.** The demo video must not include real customer-service agents' voices or real health or insurance data. Use teammates and a mock IVR (or a real IVR with no human). Build the disclosure announcement in and show it in the video; it doubles as a design strength.
4. **Accounts owned by adults** (vendor 18+ terms) are fine under CAC. Students still do all the coding.
5. **Originality score.** Judges who know Pixel or iPhone features or InnoCaption may mark it down. Address prior art head-on in the video ("Pixel-only / US-English-only; we work on any phone or browser and add X").

---

## 4. Verdict: **MEDIUM** **[judgment]**
- **For it:** a real, sympathetic, well-defined problem; technically impressive (telephony + streaming ASR + TTS + a classifier); the category wins, including LA districts in 2025; a 3-person team fits; cost about $20–50.
- **Against it:** extensive, shipping prior art, much of it free (Pixel Call Assist, iOS Live Speech and Hold Assist, InnoCaption, Nagish/Rylo, CRS STS). The stated novelties are weak (classifier is 2/4 shipped, silence manager is incremental). Seven part-time days is tight given the DTMF and topology gotchas. There is legal and age friction, and the LEP half needs translation that is not specced.
- **How to push it toward strong:**
  1. Use ConversationRelay, a 2-leg design, and mock-IVR-first development.
  2. Make the **silence manager + disclosure** the hero feature, with a measured result (for example, "rep stayed on the line in N/N test calls versus hung up without it").
  3. Cut the "AI agent" class, or show it as experimental with honest accuracy.
  4. Drop LEP or limit it to one language.
  5. Get one real user tester (a person who stutters or uses AAC) on camera, with consent.
  6. Show a prior-art slide in the video.
  7. Submit by Sunday night PDT, not Monday morning.

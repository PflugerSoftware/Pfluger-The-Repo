# Ezra Rollout: Decisions Needed

**Target:** End of January 2026 -> moved to End of Feb
**Status:** Built and ready. Blocked on approvals.

This document lists decisions that need to be made by stakeholders to move forward. Each item includes context, options, and consequences of delay.

---

## People
| Abbrev | Name | Role |
|--------|------|------|
| CO | Christian Owens | Chief Design Officer (Board) |
| LP | Lauren Paver | COO / co-CEO (Board) |
| CC | Cody Cunningham | Chief Growth Officer (Board) |
| TH | Terry Hoyle | CEO (Board)|
| LF | Lisa Ftize | Finance Director |
| CB | Craig Bogner | CIO/CTO (Innerium, outsourced) |
| DY | David Yound  | Communications and Engagement Manager Board|

| CM | Chad Martin | Principal, Architect Director |
| TS | Tony Schmitz | Principal, Process Performance Director |
| JS | Josh Sawyer | Principal, Educational Planning Director |
| TP | Tony Plascencia | Principal, Design Director | 
 | AS | Ally Schnider | Principal, Interior Design Director

| AW | Alex Wickes | Associate Design Performacne Leader | 
| LS | Logan Steitle| Associalte Visualization + Immersive Designer|
| AN | Austin Nguyen | Associate Systems Administrator|
| DC | Dennis Carrisalez | Systems Administrator, outsourced|
| CW | Casey Wilkinson | Marketing Specialist|
| BS | Brenda Swirczynski | Education Facilities Planner |

---

## Software & Infrastructure (CO, CM, LP + Board) Budget approving EOM Jan

### Database Platform Options

| Platform | Pros | Cons |
|----------|------|------|
| Cloudflare D1/R2 | Fast, cheap, serverless, already used elsewhere | New vendor approval |  | ~$5-20 | Username/account |
| Bluehost (existing) | Already approved, MySQL/PHP | Legacy stack, no serverless, no CLI | | Already paying | using HB email and domain@pfluger |
| Supabase | Modern, Postgres, real-time | New vendor approval | | Free tier / ~$25 | Username/account |
| OpenAsset | Already have DAM | Not a database platform || Included in license | Username/account |
| Local Egnyte drive | No approval needed | No web access, single point of failure Claude MCP, $11,154/year |
| Azure SSO sign in | [*] 2/4 sent requirements doc to Crag, awaiting timeline estimate

### APIs & Services

| API / Service | Purpose | Monthly Cost | Approval Needed |
|---------------|---------|--------------|-----------------|
*| Claude Max 5x | $100/mo, $1,200/yr per seat | Username/account | nick
*| Claude Teams | Std: $30/mo, $360/yr. Premium: $150/mo, $1,800/yr. (1 Std + 2 Premium = $330/mo, $3,960/yr) | Username/account | 3 st, two ultimate
*| Claude API - Opus 4.5 | ~1k msgs/mo (3K tk/msg), $35/mo, $420/yr | Username/account |
*| Claude API - Sonnet 4.5 | ~2k msgs/mo (3K tk/msg), $42/mo, $504/yr | Username/account |
*| Claude API - Haiku 4.5 | ~8k msgs/mo (3K tk/msg), $56/mo, $672/yr | Username/account |
*| Mapbox API | Interactive maps | Free tier (50k loads/mo) | Username/account |
*| GitHub | Code repository | Included / Free | Username/account |
*| Climate Studio | Building performance simulation in lue of Safira Sketchup $2000/yr | ~$2,500/year | TBD - pending | going to try to pro rate and cancle safiri
| Resend API | email automation API | Free Tier 3k emails/mo | Username/account |
| Census API | Demographics / district data | Free | Username/account |
| Vantage Point API | CRM / contact routing | Included in license | Username/account |

### ArchVis APIs & Services

| API / Service | Purpose | Yearly Cost | Approval Needed |
|---------------|---------|-------------|-----------------|
*| Magnific GUI | AI image upscaling | $468/yr ($39/mo) | Apps@pfluger | | TBD |
*| Magnific API (Freepik) | AI upscaling | ~500 upscales/mo, $55/mo, $660/yr | TBD |
*| Nano Banana Pro API | AI image generation (4K) | ~500 imgs/mo, $120/mo, $1,440/yr | TBD |  Told LP 1500
*| Google Gemini GUI | Pro: 1k img, 3 vid, $20/mo, $240/yr. Ultimate: 1k img, 5 vid, $249/mo, $2,988/yr | TBD |
*| MidJourney GUI | AI image generation | $360/yr ($30/mo) | TBD | getting a number of user accounts for people to use 
*| Veo 3 Fast API | ~50 vids/mo (4-sec), $30/mo, $360/yr | TBD |   at $360
*| Veo 3 Standard API | ~50 vids/mo (4-sec), $80/mo, $960/yr | TBD |  Told LP 1000
*| CapCut Pro | Video editing | $240/yr ($20/mo) | TBD | 
*| Digital Model Assets | 3D asset budget | $1,200/yr ($100/mo) | dedicated Username/account |
*| Twinmotion | Real-time visualization | Free | team@pfluger | double check with Logan on account cost
*| Adobe Substance | Model creation, texturing | reduced from $4700 to $1400 | Designers pfluger email | 
*| Blender | 3D modeling | Free | — |
*| Unreal Engine | Real-time engine | Free | team@pfluger |
*| Figma Professional | UI/UX design & prototyping | 5 seats × $16/mo = $80/mo, $960/yr | Jackie's pfluger email |
*| Apple Developer | App distribution Build to Apple Vision Pro | $99/yr | TBD | 
|AI Bucket|
|Bambu Labs | 3d printing |  apps@pfluger|free 


---
## Application Action Items

### Vision
- [*] SSO sign in - 2/4 sent requirements doc to Crag, awaiting estimate
- CC meeting

### Prism
- SaaS business model
- Give Vermeulens access to log in

### Ezra
- Table schema for pitch
- My Research page
- AI RAG
- Check block system and research .ts for accuracy
- [*] SSO sign in - 2/4 sent requirements doc to Crag, awaiting estimate

### Phoenix
- Check how Phoenix is interfacing with the space library table - not loading


---

## Meetings

### 1/8 1pm-2pm — R&B Block 2: Software & Infrastructure
**Attendees:** CO, CM, LP, LF, CB, DC
**Messages**
1/7 AW to Craig/Austin:
Hey Craig/Austin, just following up on our meeting and seeing what your availability is Friday afternoon to tackle the username/accounts for the following. Below are the known accounts. I'm not sure if any of these are being switched—if so, the goal would be to cancel/change user/set them up and running. If they can be skipped, great! I have placed "Card" next to the ones that will either need a card on file if the free tier is crossed, or if it is a paid service. With the budget not being passed until end of January, let me know if the Card ones aren't able to be done and we can tackle the non-Card ones first. The main ones holding production are Azure SSO, Bluehost, Cloudflare, Supabase, Claude GUI/API, VP API, and OA API. All the others "work."

Top Priority: Bluehost (HB@gmail, domain@pfluger), Cloudflare (TBD) Card?, Supabase (TBD) Card?, GitHub (JW pfluger as org, research@pfluger, AW@pfluger, LS@pfluger, apps@pfluger) Card, Claude Max 5x (CH@pfluger) → Claude Teams (apps@pfluger) Card, Azure SSO (TBD), Claude API (TBD) Card, VP API (TBD) Included, Mapbox API (apps@pfluger) Card?, Census API (apps@pfluger) Free, Resend API (TBD) Free, OpenAsset API (AW@pfluger, LS@pfluger) Free

Other Vis Setup: Magnific GUI (apps@pfluger) Card, Midjourney GUI (TBD) Card, Google Gemini GUI (TBD) Card, CapCut Pro (TBD) Card, Digital Model Assets (TBD), Apple Developer (apps@pfluger) Card, Figma (LS@pfluger) Card, Unreal Engine (team@pfluger) Free, Twinmotion (team@pfluger) Free, Magnific API (TBD) Card, Gemini API (TBD) Card


**Agenda:**
By LP
12/17 Update: Expanding this discussion to include Chad Martin, as Architect Director, I want to ensure we've got his input as well. I will share the full list of software and license quantity for your review in advance.

Thanks for the time to finalize our line of business app tech stack and spend for 2026. 
Agenda:
Review existing licensing needs
Discuss trade-offs and finalize software procurement/budget for 2026

### Meeting Notes (LP Sidebar): ###

**Software & Licensing**
- Safira: Prorate and cancel license
- Rhino: Reach out for pricing, confirm with Austin
- Claude: Kill Max 5x, set up Teams (1 Std + 1 Ulti), cancel CH account
- Claude API username: `software@pflugerarchitects.com` workes better with Crag (noted from Austin)
- Autodesk: ATG is rep, transitioning to FORMA

**IT & Account Management**
- Log all users/passwords into IT Glue
- Double-check with Craig on IT Glue setup
- Set up monthly 30-min tech budget check-in

**Hardware & Equipment**
- Get render machine cost from Austin
- Get Apple Vision Pro costs
- Get 3D printer costs

**Makerspace (CP)**
- Get CP membership + training costs
- Bill time to regular CP, track hours separately if reallocation needed

**Materials**
- Get glass and plexi pricing

**Actionitems:**
In Progress
- AW: Prorate/cancel Safira license | need to hard conteact
- AW: Cancel CH Claude Max 5x | awaiting support to contact back, calcled plan
- AW: Cancel Apps@ Claude Teams | awaiting support to contact back, calcled plan
- aw create census account | 

- AW: Confirm IT Glue setup with Craig and all new log all users/passwords accounts created. 
- AW: Track all hours to C&P (keep separate log if reallocation needed)

Done
- Makerspace cost, ($95/mo consider 4mo a year / person), aditional one time training: $70 base, $135 laser cutting, $250 CNC. 
- AW: Send glass and plexi pricing to TS, CO
- AW: Send Makerspace (CP) membership + training costs to LP, CO
- AW: Set up monthly 30-min tech budget check-in
- AW download to LP | recipts, 9k computer, Rhino isnt Lic, $1k a seat.
- AW: Reach out on Rhino pricing, confirm with Austin | no aditional rhino costs. Seats: 10 R8, 10 R7, 2 R6, aditional seat is $995. Seats are floating, 10 R8 max.
- AW: Get render machine, Apple Vision, 3D printer | Boxx render machine was ($9,000 not $5000)
- created new teams account for claude teams with software@pflugerarchitects.com, phone number is austin W, LP is card at $150 / mo for 5 seats.
- AW set up claude developer account | software@pflugerarchitects, no pass (email)
- Github account | created software@pflugerarchitects.com  kk(otS0>H-9r<kRHY|Cc, need to add to IT Glue
- Mapbox, | created account named pflugerarchtiects. email: software@pflugerarchitects.com, password is kk(otS0>H-9r<kRHY|Cc, need to add to IT Glue
- AW create CF account | software@pflugerarchitects.com veg72_pyvA3q6JU, deleter the developer@ account*- AW create SB account | software@pflugerarchitects.com -bQ98aK!kQ94pnT, deleted old org and requested deletion of account. project Pfluger_RB_Repo -c77.xSjc9v_RJc.
- aw create resend account | software@pflugerarchitects.com X-khxUcD.fjcWV9
- new apple cloud account first: software last: pfluger, 01/01/1972 software@pflugerarchitects.com

 
### 1/9 11am-noon — R&B Blocks 3, 4 + Prime 1, 5
**Messages**
1/8 AW → LF:
Provided project number breakdowns for R&B. LF said she emailed Matt (AW not CC'd).

**Attendees:** CO
**Agenda:**

**Set the date** (5 min)
- Propose R&B launch end of January  ok. 
- Are we committed to this date? Will need unblocks to accomplish this.

**Internal Launch** (10 min)
- RB projects inner and outfacing need review will get the software from Grag, we need to get going. get the low items done. 
- Ezra AI assistant and repo, pitch needs tech unblocks (reviewed with LP 1/7)
- Who reviews? JS, CO, Me, BS, Others? Can we get tech unblocked?

R&B purpose is to enhance the work' - CO
secondary is expertice
- in the application we will need to vet the projects and thier current schedule. 
- The conversations will need to all go through th edirectors, they control the hours. 
- peopel approving pitchs are CO, JS, BW, AW

**External Launch** (10 min) , there is going to be a new marketing director. 
- 2025 Content sign-off (12 projects, About/Process pages)
- UI/Branding sign-off (colors, logo, URL)
- Marketing pipeline (A4LE, not Texas Architect)?
- Who does marketing? What resources do we have?

**Research Hours** (10 min)  CO - There wil be no OT, suffer the Revenue. 
- 726 logged vs 2,000 planned - current policy isn't working
- $50k (OT) vs $255k (on-clock) for same output
- Need OT eligibility restored to hit research targets
- Can we restore OT? What's the chain of command to get people on projects?

 - we will still go with the VP project numbers. Lisa will have all the VP, Get with Lisa with VP to go over hours. 
 get with lisa, walk through what we did for 2025, show the work flow, starting at 2000

**Budgets**
 wont have $$ hours, budgets and expenses, we will make a bucket for RB. CO will regroup with Terry on the 2k hours.

Tony is now the direct or design, will be learing the design shareouts.

There are now design forumns will be with the designers and planners to insipre people. 
That day is TBD. directors and designers. adgenda is getting developed, RB will be aparts. 

Need to let the Directors know about the RB before roll out. Give Tony a heads up, see what the days is. 
After midwinter everyone will be in person. There will be a section that is a What's Next.

With Chad M, there is a new BIM manager coming on board. 

**VP Codes** (10 min)
- Need codes created + communication chain activated
- Who tells People Leaders, PMs, PAs it's legit?

**Action items per CO (1/8):**
- [*] Tony - Get forum date and get R&B on the agenda
- [*] LP, CB (Craig) - Get software/accounts set up
- [x] LF (Lisa) - Coordinate on VP hours/coding (1/8 - sent project breakdowns, she emailed Matt)
- [x] Craig/Austin - Email about software, CC Lauren and CO (1/8 - sent to Craig, checking with Austin 1/9)
- [x] Pick launch date (avoid TASA Midwinter)

 ---

### 1/9 3pm-4pm - Vision: BD+I Dashboard
**Messages**
1/4
Happy New year everyone, Cody Cunningham seeing a spot on the Calander next week, 1/13 3-4pm. It would be awesome to get this thing online and out to the teams to prep for Tasa Mid Winter as the info in it, is pretty useful. 
Cody Cunningham removed Jacqueline Warner from the chat.
Cody Cunningham removed Heather Blazi from the chat.
Cody Cunningham added David Young to the chat.
3-4 pm on the 13th is open but that is before their meeting with McAllen ISD at 4-5 pm, and the bond presentation to the board that evening at 5:30 pm. There would likely need to be an awareness to finish before 4 pm if possible.

CC: I have a window on Thursday if you're available to visit. 
DY: I can’t see the initial part of this conversation. What is the conversation we are trying to arrange?
Cody Cunningham changed the group name to Pfluger Vision (BD Tool)
CC: Sorry David, I meant to include the previous thread.  This is our thread with Alex on the BD Dashboard Tool.  Just including you for future conversations as we plan the rollout.  I don't think it's quite ready to roll out (I still want to add the bond data from schoolbondfinder).  
CC: I also want more eyes on it providing refinements, including you and Terry M., before we roll it out to MPs and PMs. 

CW had TM send AW invite to school bond finder

**Agenda**

**Data currently in Vision:**
- Districts: name, tier, tax rate, valuation, office controller, revenue totals
- Schools: name, type, enrollment, principal, address, linked Pfluger projects
- Projects: project number/name, yearly billed/spent/compensation
- Activities: subject, type, date, owner, contacts, notes
- Bond Elections: date, result, amount, purpose, votes
- Census: population, income, home values, housing, commute, WFH
- Client Contacts: name, title, email, phone, decision maker flag, notes
- TASA Convention: attendees by district, cross-ref with known contacts, new prospects
- Competition: architecture firms attending, BDC Giants sector rank + revenue, attendee counts
- Firm Detail: who from each competitor is going (names, titles)

**Bond Data Gap** (10 min)
- Bond data already exists - what's missing that SchoolBondFinder has?
- Who provides any additional data? CC or Alex?
- Deadline to add it

**Refinements List** (10 min)
- CC/DY: Name specific changes needed
- Prioritize: must-have vs nice-to-have
- Deadlines to use for TASA Mid Winter

**Tech Blockers** (5 min)
- Database/API decisions from Wednesday must resolve first (Claude, DB, VP, etc)
- Confirm board is aware this blocks rollout

**Sign-Off Criteria** (5 min)
- Define what "ready to roll out" looks like
- Who gives final approval? CC? CO?

**Rollout Plan** (5 min)
- Target date for MPs/PMs
- Delivery method: email, demo, training?
- TASA Mid Winter prep timeline

 ---

### 01/15 - Project Prism (X25-RB10)
**Messages**
1/4 AW:
Hello everyone, and Happy new year. Seeing some spots next week to set up a regroup on the cost estimator for 2026. Some items to revisit is our gameplan for LHISD, and the other ISDs it has been brought up to, and our relationship with Vermeulens/Alpha, subscription model, and the level of development we are comfortable with in 2026. Let me know yalls thoughts. Thanks!

1/6 Claire (Terry's secretary):
Hey Alex - terry mentioned you're looking to get a meeting set up to touch base on cost mgmt tool?

1/6 AW:
Yes, would love to get something on the calendar ASAP with Terry and Tavo. A few things to cover:
- District outreach status, Tavo mentioned there is a new one
- SaaS Partnership/IP discussion with Vermeulens/Alpha
- Development scope and comfort level
Let me know what works for their schedules this week or early next.

**Attendees:** Terry, Tavo, AW, JS
**Agenda:**
- District outreach status (LHISD + new one Josh mentioned)
- SaaS Partnership/IP with Vermeulens/Alpha
- Development scope and comfort level for 2026

**Outcome:** _TBD_
- what are the districts that have been pitched this and in what scope
- SaaS pricing / business model 
- IP ownership structure Contract template / who sells
- 2026 dev budget and scope threshhold


 Questions to answer:
- Who have we been talking to about this? (Districts, Vermeulens, others?)
- What's been promised or discussed?
- What's the relationship with Vermeulens - partner, vendor, co-owner?
- What districts are we targeting beyond LHISD?
- How much development do you want in 2026?

**Meeting Notes:**
pflugervill and delvalle, dripping springs, along with LHSID, Mannor may be a maybe, no burnet, also sheryland and burnet and mcallan. 
JS wants to combine all the efforts. 
we need to check with Blair on the level of detail, and resolution. 
CMTA does performaci modeling, MEP engineer
Alpha does assessments and cost
CMTA will tell us what combinations of alpha needs to get. 
they can say if you swap and perforamnce compairisons. 
so north start of the prism is to plan for a bond. the mainence and sub domain is secondary. 
alpha is just spec level items. 
HT told JS somthing about round up to the 10k. 
verm is a flat % 

**Attendees:**
AW To have Clair send follow up email
JS Wants to set up meeting week of 19th to go over 1/15 meeting and consolidated Cam work into it and get on a reoccurring maintenance loop with Verm to update tables. 
Verm agreed to meeting on 2/4, they have not signed an NDA
Need to mirage d1, DNA, mapbox

 ---

### 01/15 - Meeting with school bond finder

Alex.wickes@pflguerarchitects.com should have been set up. Password 43Bfjv-ad3.EQrP
Are notifications for all of them or just the ones that updated
CC not attend. CW, SW, TM attend. Amy Berd, director of client retention
Api access, documentation, Costs, Limits
Frequency  of data updates? Is every district updated every month?
Data ethics, how they are getting the data, all public, private? Its all public data. They are using AI. 
They harvest meeting minutes 
A team is updating the information on the site, all sites or just us. Are others getting data faster?
Whats the research team size?
How do they get the school and district contacts? From the website
Integration fee of $2500 to get into salsforce or salsforce or CRM, API not sure, no documentation.  No additional call fee. Dustin and Ben, and Chuck. 
We are paying the whole country. To Texas the cost would drop down to regional price. 
Updated 24-48hours AFTER a bond pass or fails, no updated during voting
They follow 4 different types of bonds. 

---
 
### TBD - Turf Melting Analysis (X25-RB11)
**Messages**
1/4
Hey all, Happy new years. Tony Schmitz did you have a time in mind to tackle this thing out? Let me know and I can refresh myself with the results of the options we explored. Thanks!
 
**Attendees:** CO
**Agenda:**
**Status:** TBD
**Outcome:** _TBD_

---

## 1. Research Hours Policy (CO, LP, LF)

**Decision Owner:** CO, LP, LF
**Decision:** ~~Reverse the "research on the clock" policy and restore OT eligibility for research hours.~~

### UPDATE (1/8/26 CO Meeting)

**Decision: Research stays ON THE CLOCK. No OT.**

CO acknowledged the math ($50k OT vs $255k on-clock) and chose the on-clock path. Expectation is passion-driven work within 40 hours.

**Chain of Command Paradox:**
```
Worker (has idea)
    → tells PM "this is cool, we should do this"
    → PM tells Principal to integrate into client conversations
    → Directors oversee that it happens
```

The person doing the research has no authority to allocate hours. They must convince up the chain. Directors "control" hours but aren't initiating research. Principals talk to clients but aren't doing research. The researcher is at the bottom with ideas but no agency to execute.

**R&B Council (Pitch Panel):**
- CO (Christian Owens) - Chief Design Officer
- BS (Brenda Swirczynski) - Education Facilities Planner
- JS (Josh Sawyer) - Educational Planning Director
- AW (Alex Wickes) - R&B Lead

This panel decides which pitches are "worthy" of R&B effort.

---

### What Counts as "Research" (per CO, 1/8/26)

**IS R&B:**
- Novel ideas that differentiate the firm from competitors
- Must tie to project outcomes quickly
- Must demonstrate results before publishing externally
- Example: Katherine & Braden's Sanctuary Spaces (X25-RB01) - it was "flipping it, an idea"

**IS NOT R&B (just "Best Practices"):**
- Post-occupancy surveys - "We've talked about this for five years"
- Mass timber basics - "Every firm doing architecture should be doing this"
- Materials research (Monse's work) - "Is that really R&B or just how we should be doing best practice?"
- Sustainability/energy modeling - "We're barely talking about it, we need to be on level with competition"

**The Contradiction:**
CO says R&B is for differentiation, but then categorizes anything the firm *should* already be doing as "not R&B." If the firm isn't doing post-occupancy, mass timber, or energy modeling - and competitors are - that's not "best practice," that's a gap.

**The Catch-22:**
1. Can't publish research without project outcomes
2. Can't get research on a project without convincing PM → Principal
3. Can't explore ideas without a project to anchor to
4. But novel ideas by definition don't have projects yet

**CO's actual framework (reading between the lines):**
- R&B = Ideas CO finds interesting that can be tied to active work
- Not R&B = Foundational capability building the firm should fund through normal operations (but doesn't)

**2025 R&B Department:**
- 11 active projects in 2025 (X25-RB01 through X25-RB11)
- 5 Claude accounts allocated (research1-5@pflugerarchitects.com)
- ~7 active researchers
- 726 Hours by research project: 253, 199, 129, 72, 49, 23, 1

**2026 Research Hours (approved):** 2,000

**Gap:** 2025 actual (726) was only 36% of 2026 target. Research is already being suppressed under current model.

**Quote from PM** (when trying to allocate two staff to research, not even on project hours):
> For a 200+ hour scope reduced to 140 hours "Try to increase the efficiency of the process by removing 33% of the hours."

This is the reality: even when research is approved, PMs push back to cut hours. On-clock research will always lose to billable work.


---


### Consequence of Delay

- Cannot finalize database, apps, hosting
- Cannot roll out Vision, Prism or R&B
- Ezra (research assistant) won't run, searching is all manual
- Static CRM  data, two sources of truth

---

Un Resolved Blocks

## 3. Public Launch (CO, CC)

**Decision Owner:** CO, CC
**Decision:** Approve public-facing content, branding, and marketing pipeline

### What Needs Review

**Content:**
- [ ] Research project descriptions (12 projects)
- [ ] About/Process/Tools page copy
- [ ] Use of AI transparency statement
- [ ] Map presentation of confidential projects (currently show as locked)

**Branding:**
- [ ] Color palette alignment (currently using Pfluger brand colors)
- [ ] Typography consistency
- [ ] Logo usage on platform
- [ ] URL/domain decision (ezra.pfluger? research.pfluger?)

**Marketing Pipeline:**
- [ ] Texas Architect submissions (e.g., X25-RB01 Sanctuary Spaces)
- [ ] Conference presentations (A4LE LearningScapes, etc.)
- [ ] External research shareouts
- [ ] Case studies and white papers
- [ ] Social media / firm website content

---

## 4. Internal Launch (CO, CC, CB)

**Decision Owner:** CO, CB
**Decision:** Approve internal dashboard for research team

### What Needs Review

- [ ] Dashboard functionality scope
- [ ] Ezra AI assistant approach
- [ ] Pitch submission workflow
- [ ] Analytics/metrics visibility


---

## 5. Vantage Point + Staff Assignment (LP, LF, JS, CO)

**Decision Owner:** LP, LF (codes), JS (people leaders), CO (direction)
**Decision:** Create VP codes AND establish communication chain for staff assignment

### The Problem

Two things need to happen:

1. **VP codes must exist** - Without codes, hours have nowhere to go
2. **Staff must be assigned** - Alex cannot talk to employees directly; someone must communicate through People Leaders → PMs

As of 1/4 there is a new VP job structure for overhead. But creating new project codes requires approval, and assigning staff requires going through the proper chain.

### Communication Chain for Staff Assignment



**Actual (per 1/8 meeting) - The Paradox:**
```
Worker (has idea, no authority)
        ↓
tells PM "this is cool, we should do this"
        ↓
PM tells Principal to integrate into client conversations
        ↓
Directors oversee that it happens
```

**The problem:** The person with the idea is at the bottom. They must convince up the chain to get hours. Directors "control" hours but don't initiate research. Principals are client-facing but aren't researching. The worker has vision but no agency.

**Action Items**
AW Cordinated with LF, LF sent email to Matt, AW to log all hours under Craft and Prduct.
---

### 2/15 Design Forum (NEW - per 1/8 meeting)

**What:** Tony Schmitz (TS) is now leading design shareouts/forums. R&B will be part of the agenda.

**Who:** Directors + 2-3 "catalysts" per office (not just designers - includes PMs, PAs)

**Purpose (per CO):** "Empower instigators" to ensure research happens in each office. Create an "army of instigators."

**Timing & Location:**
- Day and a half workshop in San Antonio
- Scheduled right AFTER TASA Midwinter (conference ends Tue/Wed, workshop Wed/Thu)
- PMs will already be in San Antonio for the conference - minimizes travel cost
- Tony is finalizing the attendee list (tied to budget)

**R&B at the Forum:**
- Doesn't need to be a 20 minute presentation - just a heads-up
- Goal: Let directors know R&B is coming before it launches
- Message: "Your people are gonna be excited about it. Here's the best ways to support them."

**Additional Coupling (per CO):**
- AW to be partnered with Chad Martin + potential new BIM manager
- Focus: Process and design technology alignment
- CO: "Getting you coupled with this group is pretty important"

**The Additional Layer:**
```
R&B Council approves pitch
        ↓
Design Forum "empowers" catalysts
        ↓
Catalysts tell... their office?... to care about research?
        ↓
But hours still controlled by Directors
        ↓
Who weren't part of the pitch decision
```

**The problem:** This adds inspiration/motivation theater but doesn't solve the authority gap. Catalysts can be "empowered" all day, but if Directors control hours and weren't involved in approving the pitch, the catalyst still has to convince up the chain.

**Action Item:** AW to coordinate with Tony on forum date and get R&B on the agenda. 

---

**The gap:** Alex controls the R&B projects in VP but cannot directly assign or communicate with staff. Someone at leadership level must:
1. Inform People Leaders that research participation is legitimate
2. People Leaders tell PMs that staff can bill to R&B codes
3. PMs actually assign people

### Consequence of No Action

Without codes:
- Researchers can't log time
- Hours get buried in project overhead (inaccurate, PM friction)
- Audit risk from incorrect logging

Without communication chain:
- Staff don't know they can participate
- PMs don't know research is approved use of time
- Research stays siloed to those who already know

### The Real Question

It's not "how do we allocate training or research time?"

It's: **Does R&B participation have a legitimate home in the timesheet, AND does anyone know about it?**

If codes exist but no one knows, adoption fails. If people know but codes don't exist, they can't participate.

---

##VANTAGE POINT API - DATA REQUIREMENTS##

  1. EMPLOYEES

  - employee_number
  - first_name
  - preferred_name
  - last_name
  - full_name
  - job_title
  - business_unit
  - location (office)
  - email

  2. PROJECTS

  Basic Info:
  - project_number
  - project_name
  - client_id
  - client_name
  - office (assigned Pfluger office)
  - project_address, city, state, zip
  - description
  - status
  - start_date
  - completion_date

  Financial (by year):
  - revenue_year
  - total_contract (compensation)
  - total_billed
  - total_spent (labor costs)

  Team:
  - project_owner
  - team_members (list of employees)
  - team_member_roles

  Schedule & Phases:
  - project_phases (WBS2)
  - phase_name
  - phase_start_date
  - phase_end_date
  - phase_status
  - tasks (WBS3)
  - task_name
  - task_start_date
  - task_end_date
  - task_status
  - milestone_dates

  3. CLIENTS

  Client Properties:
  - client_id
  - client_name
  - firm_number
  - market
  - priority_rank

  Contacts (property of client):
  - contact_nameFull
  - contact_nameFirst
  - contact_nameLast
  - contact_namePreferred
  - contact_title
  - contact_department
  - contact_email
  - contact_business (phone)
  - contact_mobile (phone)
  - contact_home (phone)
  - contact_decisionMaker (Y/N)
  - contact_notes

  Activities (property of client):
  - subject
  - activity_type
  - start_date
  - primary_contact
  - contact
  - owner (employee assigned)
  - notes

  ---
  DOCUMENTATION REQUEST

  We need complete API documentation, not just the incomplete online
  reference.

  Please provide:
  1. Complete OpenAPI/Swagger specification file (.json or .yaml)
  2. Full endpoint reference with all available fields for each object
  3. Authentication guide (OAuth setup, credentials, tokens)
  4. Example API calls for each of our data requirements above
  5. Rate limits and pagination details for bulk data sync
  6. Data sync best practices for nightly batch updates

  The online documentation at https://vantagepointapi-prior.deltek.com is
  incomplete and difficult to navigate. We need comprehensive technical
  documentation for our integration.

  ---
  Questions:
  1. Can the API provide all the data listed above?
  2. What's the recommended approach for nightly batch sync to external
  database?

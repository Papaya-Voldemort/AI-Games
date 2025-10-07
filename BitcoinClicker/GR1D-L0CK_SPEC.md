# 🤖 NPC Integration Spec: GR1D-L0CK – Blackmarket Loan Broker

## 📌 Overview
GR1D-L0CK is a robotic NPC who manages loans and exclusive item sales in the Blackmarket. It evolves based on player debt, offers branching dialogue, and enforces consequences for unpaid loans.

---

## 🧬 Core Attributes

**Name**: GR1D-L0CK  
**Faction**: Blackmarket Syndicate  
**Type**: Robotic NPC  
**Role**: Loan broker, enforcer, item vendor  
**Location**: Accessible via Blackmarket tab  
**Voice**: Cold, sarcastic, with glitchy modulation

---

## 🧱 Visual Design

### GR1D-L0CK
- **Shape**: Tall rectangular torso, segmented limbs, triangular head with rotating lens  
- **Color**: Chrome with red neon accents  
- **Face**: Single glowing red eye, digital ticker across chest displaying debt balance  
- **Motion**: Smooth gliding movement, occasional twitching when agitated  
- **UI Presence**: Appears in Blackmarket tab and as pop-up during debt events

### Reclaim Units (Debt Enforcers)
- **Shape**: Cube-shaped bodies with spider-like limbs  
- **Color**: Matte black with green hazard lights  
- **Behavior**: Patrol player space, disable hardware, drain hash rate  
- **Spawn Trigger**: Debt > $100K or missed payment threshold

### Market Bots (Vendors)
- **Shape**: Spherical bodies with rotating item trays  
- **Color**: Silver with blue glow  
- **Behavior**: Passive, hover near player, rotate inventory every 10 minutes

---

## 🗣️ Dialogue System

### Dialogue Tree Structure

#### Debt Level < $10K
- "Welcome, debtor. Need a boost or just browsing desperation?"
- Options:
  - [Take Loan]
  - [View Market]
  - [Leave]

#### Debt Level $10K–$100K
- "Your balance is maturing like a virus. Infectious and irreversible."
- Options:
  - [Extend Loan]
  - [Negotiate Terms]
  - [View Market]
  - [Leave]

#### Debt Level > $100K
- "Default detected. Asset seizure protocol pending."
- Options:
  - [Beg for Mercy]
  - [Offer Payment]
  - [Threaten GR1D-L0CK]
  - [Leave]

---

## 🎯 Dialogue Outcomes

### [Take Loan]
- Opens loan tier menu  
- Adds debt with 15% upfront fee  
- Triggers interest timer (online/offline)  
- May increase GR1D-L0CK’s hostility if abused

### [View Market]
- Opens Blackmarket inventory  
- Items may be locked based on debt level  
- Prestige unlocks rare items  
- Debt > $25K may trigger price hike

### [Extend Loan]
- Adds time to current loan  
- Increases total interest  
- May delay consequences temporarily  
- 25% chance GR1D-L0CK offers a “deal” with hidden penalty

### [Negotiate Terms]
- Opens dialogue mini-game (optional)  
- Success: Reduces interest or fee  
- Failure: Increases hostility or triggers audit  
- 10% chance of unlocking secret item

### [Offer Payment]
- Pays off part or all of debt  
- Improves reputation  
- Unlocks high-tier items  
- 5% chance of triggering “Debt Forgiveness” event

### [Beg for Mercy]
- 50% chance GR1D-L0CK reduces interest  
- 30% chance of triggering “Reclaim Unit” anyway  
- 20% chance of unlocking rare dialogue

### [Threaten GR1D-L0CK]
- 70% chance of triggering hostile response  
- 20% chance of unlocking secret sabotage mission  
- 10% chance GR1D-L0CK glitches and wipes part of debt

### [Leave]
- Closes dialogue  
- May trigger passive reminder pop-up later  
- No immediate consequence

---

## 💼 Loan Mechanics

### Loan Tiers

- **Small Loan**: $1,000  
  - Interest: 45%/15min (online), 10%/12h (offline)  
  - Upfront Fee: 15%

- **Medium Loan**: $10,000  
  - Same interest structure

- **Large Loan**: $100,000  
  - Same interest structure

### Loan Behavior

- Loans compound every 15 minutes while online  
- Offline interest applies every 12 hours  
- GR1D-L0CK tracks time since loan and updates debt dynamically  
- Debt is displayed in real-time on GR1D-L0CK’s chest ticker

---

## ⚠️ Consequence System

### Trigger Thresholds

- **Debt > $25K**  
  - Lock access to high-tier Blackmarket items

- **Debt > $50K**  
  - Trigger random "Asset Seizure" events (remove mining hardware, reduce hash rate)

- **Debt > $100K**  
  - GR1D-L0CK sends "Reclaim Units" (enemy bots) to sabotage player progress

### Event Examples

- **Asset Seizure**: "GR1D-L0CK has repossessed your Pentium Gold G7400."  
- **Blackmarket Audit**: "All market prices increased by 25% due to your delinquency."  
- **Debt Forgiveness (Rare)**: "A glitch in GR1D-L0CK's ledger wipes 10% of your debt."

---

## 🛒 Market Integration

### Inventory Behavior

- Items rotate every 10 minutes  
- Locked items require debt below $10K  
- Prestige unlocks exclusive inventory tiers  
- GR1D-L0CK offers rare upgrades not found in standard shops

### Sample Items

- **Golden Touch**: Double coins per click ($25)  
- **Power Surge**: +25% mining power ($25)  
- **BTC Magnet**: +10% Bitcoin spawn rate ($25)  
- **Hacker’s Toolkit**: +50% chance to hack Bitcoin ($50)

---

## 🧠 Reputation System (Optional)

### Reputation Score

- Based on loan repayment history  
- **High Rep**: Discounts, rare item access  
- **Low Rep**: Price hikes, hostile dialogue, locked features  
- GR1D-L0CK’s tone and behavior shift based on reputation

---

## 🔧 Technical Notes

- NPC should be modular and event-driven  
- Dialogue should support branching logic based on debt and reputation  
- Loan system must sync with online/offline timers  
- GR1D-L0CK should be accessible via UI tab but also trigger pop-ups during gameplay  
- Reclaim Units should be implemented as hostile bots with randomized sabotage effects  
- All consequences and events should be logged in a player debt history tracker

---

## ✅ Implementation Checklist

- [ ] Add GR1D-L0CK to Blackmarket tab  
- [ ] Implement loan tiers and interest logic  
- [ ] Create dynamic dialogue system based on debt thresholds  
- [ ] Add consequence triggers and event handlers  
- [ ] Integrate rotating Blackmarket inventory  
- [ ] Add reputation tracking and Reclaim Unit encounters  
- [ ] Implement visual designs for GR1D-L0CK, Reclaim Units, and Market Bots  
- [ ] Add dialogue outcome logic for each player choice

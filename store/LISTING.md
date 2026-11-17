# Omegs – App Store and Google Play listing (draft for review)

Copy each field into App Store Connect / Google Play Console. Character limits are in brackets.

## Shared details
| Field | Value |
|---|---|
| Developer / seller | Omegs Cleaning Services Ltd |
| Support email | info@omegscleaning.co.uk |
| Phone | +44 7565 666 871 |
| Address | Sherwood Business Centre, 616a–620a Mansfield Road, Nottingham NG5 2GA, United Kingdom |
| Website / marketing URL | https://www.omegscleaning.co.uk/ |
| Support URL | https://lewyjonny.github.io/omegs/contact |
| Privacy policy URL | https://lewyjonny.github.io/omegs/privacy |
| Terms URL | https://lewyjonny.github.io/omegs/terms |
| Price | Free (no in-app purchases; cleaning is paid outside the app) |
| Countries | United Kingdom |
| Bundle / package ID | uk.co.omegscleaning.app |

## Apple App Store
- **App name** [30]: `Omegs Cleaning`
- **Subtitle** [30]: `Home & office cleaning, booked`
- **Primary category:** Lifestyle · **Secondary:** Business
- **Age rating:** 4+ (no objectionable content)
- **Copyright:** `2026 Omegs Cleaning Services Ltd`
- **Keywords** [100]: `cleaner,cleaners,house,home,office,deep clean,end of tenancy,move out,sofa,nottingham,maid`
- **Promotional text** [170]:
  `Book trusted home, office and deep cleaning in Nottingham in a few taps, or chat with our team on WhatsApp.`

## Google Play
- **App name** [30]: `Omegs Cleaning: Book Cleaners`
- **Short description** [80]: `Book trusted home, office and deep cleaning in Nottingham in a few taps.`
- **Category:** House & Home · **Content rating:** Everyone (complete the IARC questionnaire: no violence, no user-to-user chat, no gambling)
- **Contains ads:** No

## Full description (both stores) [4000]
```
Omegs makes professional cleaning simple. Book trusted cleaners for your home or business in a few taps, and keep track of every booking in one place.

WHAT YOU CAN BOOK
• Home cleaning – regular upkeep for every room
• Deep cleaning – a thorough top-to-bottom reset
• Office and commercial cleaning
• Move-in / move-out cleaning
• Sofa and upholstery cleaning
• Post-construction cleaning

WHY OMEGS
• Book in minutes – pick a service, date, time and address
• See exactly what's included before you book
• Clear quotes – your price is agreed before your booking is confirmed
• Manage your bookings – see when a booking is confirmed, or cancel if your plans change
• Prefer to talk? Book or ask a question on WhatsApp in one tap
• Friendly local team based in Nottingham

HOW IT WORKS
1. Choose a service and send your booking request
2. Our team confirms your booking and price
3. Your cleaner arrives at the agreed time

Opening hours: Monday–Saturday, 8am–6pm.
Questions? Email info@omegscleaning.co.uk or call +44 7565 666 871.
```

## Screenshots and graphics (in this folder)
| Store slot | File(s) | Size |
|---|---|---|
| iPhone 6.9" (required) | `screenshots/iphone-6.9/*.png` | 1320 × 2868 |
| Google Play phone | `screenshots/android-phone/*.png` | 1080 × 1920 |
| Google Play feature graphic | `graphics/play-feature-graphic-1024x500.png` | 1024 × 500 |
| Google Play app icon | `graphics/play-icon-512.png` | 512 × 512 |
| App Store icon (also built into the iOS app) | `graphics/app-store-icon-1024.png` | 1024 × 1024 |

The iOS app is set to iPhone only, so no iPad screenshots are needed. Screenshots are regenerated from the app with `store/make-screenshots.py`.

## Privacy forms (draft answers – check before submitting)
**What the app collects:** name, email, phone number, cleaning address, booking details and notes, contact-form messages, and an account ID. It is used only to run bookings and reply to customers. No ads, no tracking, no data sold, no analytics SDKs. All data is sent encrypted (HTTPS).

**Apple – App Privacy:**
| Data type | Collected | Linked to user | Tracking | Purpose |
|---|---|---|---|---|
| Name, Email address, Phone number, Physical address | Yes | Yes | No | App functionality |
| User content – Customer support (contact messages), Other (booking notes) | Yes | Yes | No | App functionality |
| Identifiers – User ID | Yes | Yes | No | App functionality |
| Everything else (location, payments, health, diagnostics, usage) | No | – | – | – |

**Google Play – Data safety:**
- Personal info: Name, Email address, Phone number, Address – collected, not shared, required for bookings, purpose "App functionality" and "Account management".
- Messages: Other in-app messages (contact form) – collected, not shared, purpose "App functionality".
- Data encrypted in transit: Yes.
- Users can request data deletion: Yes (needs the account-deletion feature below).

## Must be done before submitting
1. **Delete-account option in the app.** Apple and Google both require apps with sign-up to let users delete their account in the app, and Google also needs a web link for it. Not built yet (needs database access).
2. **Demo login for reviewers.** Create a customer account that Apple and Google reviewers can sign in with, and put it in "App Review Information" / "App access".
3. **Working sign-up emails** (custom SMTP), so reviewers can create an account.
4. **Push notifications** (or another phone-specific feature): Apple may reject apps that look like a website in a frame (guideline 4.2).
5. **Final legal pages** (remove "Draft") and **prices or "Free quote"** wording.

## App Review notes (Apple) – draft
```
Omegs is the booking app for Omegs Cleaning Services Ltd, a cleaning company in Nottingham, UK. Customers request a cleaning, our team confirms it, and the customer can track or cancel it in the app. Cleaning is paid in person after the price is agreed, so the app has no in-app purchases. The WhatsApp button opens a chat with our business number.
Demo customer account: <email> / <password>
```

# UniEvents

A modern, responsive web platform for university students to discover upcoming and past events.

## 🎯 Target Audience
- University students (18–25)
- Student club members

## 🧩 Core Pages & Components

### 1) Homepage
- Search bar + filters (date, tags, club, event type)
- Event browsing feed (cards)
- **Highlighted Upcoming Events** section
- **Featured approved events** carousel
- Color‑coded categories (tech, sports, culture, etc.)

### 2) Calendar Page
- Monthly calendar view 
- Category color-coding on dates
- Clear empty states (“No events this week”)

### 3) Event Details Page
- Large banner image
- Full event description
- Media gallery (images/videos)
- Organizer (club profile)
- Tags & category
- Add‑to‑calendar button
- Share buttons

### 4) Club Dashboard
- Create / edit event form
- Media upload
- Tag selection
- Event status indicator (pending approval / approved / rejected)

### 5) Clubs Page
- Grid/list of all student clubs
- Club cards with logo, name, category, and short bio
- View Club Profile button link 

### 6) Login Page
- Email/username + password inputs with clear labels
- Show/hide password toggle
- Primary login button + secondary “Create account” link
- Helper text for errors (invalid credentials, empty fields)


## ✅ UX Considerations
- Clear visual distinction between approved vs pending events
- Smooth transitions and hover states
- Clear empty states (“No events this week”)



## 📁 Suggested Project Structure
```
UniEvents/
├── README.md
├── pages/
│   ├── index.html            # Home
│   ├── calendar.html         # Calendar
│   ├── clubs.html            # Clubs
│   ├── login.html            # Login
│   ├── club-dashboard.html   # Club Dashboard
│   └── event.html            # Event Details
├── assets/
│   ├── images/
│   │   ├── events/
│   │   ├── clubs/
│   │   └── ui/
│   └── icons/
├── styles/
│   ├── base.css              # reset, variables, typography
│   ├── layout.css            # grid, containers, spacing
│   ├── components.css        # cards, buttons, badges
│   └── pages.css             # page-specific tweaks
└── scripts/
    ├── main.js               # shared interactions
    ├── calendar.js           # calendar logic
    └── filters.js            # search & filters
```

## 🚀 Getting Started
Open the main HTML file in your browser:
1. Double‑click `index.html`, or
2. Use the **Live Server** extension in VS Code (optional).
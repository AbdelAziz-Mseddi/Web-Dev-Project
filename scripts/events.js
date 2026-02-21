// Event data - loaded from JSON files
let eventsData = [];

// List of all club event JSON files
const clubEventFiles = [
  "../data/ieee_events.json",
  "../data/acm_events.json",
  "../data/securinets_events.json",
  "../data/aerobotix_events.json",
  "../data/cine_radio_events.json",
  "../data/jci_events.json",
  "../data/junior_events.json",
  "../data/theatro_events.json",
];

// Load events from all club JSON files
async function loadEvents() {
  try {
    // Fetch all club event files in parallel
    const responses = await Promise.all(
      clubEventFiles.map((file) => fetch(file)),
    );

    // Parse all responses
    const clubEvents = await Promise.all(
      responses.map((response) => response.json()),
    );

    // Flatten and combine all events into a single array
    eventsData = clubEvents.flat();

    renderFeaturedEvents();
    renderUpcomingEvents();
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

// Render featured events to the DOM
function renderFeaturedEvents() {
  const featuredGrid = document.querySelector(".featured-grid");
  if (!featuredGrid) return;

  // Clear existing events
  featuredGrid.innerHTML = "";

  // Filter and render featured events
  const featured = eventsData.filter((event) => event.featured);

  featured.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.className = "event-card-featured";
    eventCard.innerHTML = `
      <img src="${event.image}" class="featured-bg" alt="${event.title}" />
      <div class="featured-overlay">
        <div class="club-tag">
          <img src="${event.clubLogo}" alt="${event.club} logo" /> ${event.club}
        </div>
        <h3>${event.title}</h3>
      </div>
    `;
    eventCard.addEventListener("click", () => viewEvent(event.id));
    featuredGrid.appendChild(eventCard);
  });
}

// Render upcoming events to the DOM
function renderUpcomingEvents() {
  const upcomingSection = document.querySelector(".upcoming-section");
  if (!upcomingSection) return;

  let eventsContainer = document.querySelector(".events-container");
  if (!eventsContainer) {
    eventsContainer = document.createElement("div");
    eventsContainer.className = "events-container";
    upcomingSection.appendChild(eventsContainer);
  }

  // Clear existing events
  eventsContainer.innerHTML = "";

  // Get current date (midnight) for comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Filter events that haven't happened yet and sort by date
  const upcoming = [...eventsData]
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  upcoming.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.className = "small-event-card";
    eventCard.innerHTML = `
      <div class="thumb">
        <img src="${event.image}" alt="${event.title}" />
      </div>
      <div class="small-card-content">
        <div class="club-tag">
          <img src="${event.clubLogo}" alt="${event.club} logo" /> ${event.club}
        </div>
        <h4>${event.title}</h4>
        <p><i class="far fa-calendar"></i> ${formatDate(event.date)} at ${event.time}</p>
        <p><i class="far fa-map-pin"></i> ${event.location}</p>
      </div>
    `;
    eventCard.addEventListener("click", () => viewEvent(event.id));
    eventsContainer.appendChild(eventCard);
  });
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// View event details
function viewEvent(eventId) {
  const event = eventsData.find((e) => e.id === eventId);
  if (!event) return;

  // Store event in sessionStorage for the event detail page
  sessionStorage.setItem("currentEvent", JSON.stringify(event));
  // Navigate to event page
  window.location.href = "event.html";
}

// Add a new event
function addEvent(eventObj) {
  const newId = Math.max(...eventsData.map((e) => e.id), 0) + 1;
  const newEvent = {
    id: newId,
    featured: false,
    ...eventObj,
  };
  eventsData.push(newEvent);
  renderFeaturedEvents();
  renderUpcomingEvents();
  return newEvent;
}

// Remove an event by ID
function removeEvent(eventId) {
  const index = eventsData.findIndex((e) => e.id === eventId);
  if (index !== -1) {
    eventsData.splice(index, 1);
    renderFeaturedEvents();
    renderUpcomingEvents();
    return true;
  }
  return false;
}

// Update an event
function updateEvent(eventId, updates) {
  const event = eventsData.find((e) => e.id === eventId);
  if (event) {
    Object.assign(event, updates);
    renderFeaturedEvents();
    renderUpcomingEvents();
    return event;
  }
  return null;
}

// Get all events
function getAllEvents() {
  return [...eventsData];
}

// Get event by ID
function getEventById(eventId) {
  return eventsData.find((e) => e.id === eventId);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
});

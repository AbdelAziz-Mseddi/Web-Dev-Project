<?php

class EventManager {
    private $events = [];
    private $dataDir;
    private $currentDate;
    
    // Mapping of club IDs to display names
    private $clubIdToName = [
        'acm' => 'ACM',
        'jci' => 'JCI',
        'ieee' => 'IEEE',
        'cine_radio' => 'Cine Radio',
        'securinets' => 'Securinets',
        'junior' => 'Junior',
        'aerobotix' => 'Aerobotix',
        'theatro' => 'Theatro',
        '3zero' => '3ZERO',
        'android' => 'Android Club',
        'genesis_labs' => 'Genesis Labs',
        'insat_press' => 'INSAT Press'
    ];

    public function __construct() {
        $this->dataDir = __DIR__ . '/../data/';
        $this->currentDate = date('Y-m-d');
        $this->loadEventsFromFiles();
    }

    /**
     * Load all events from JSON files in the data directory
     */
    private function loadEventsFromFiles() {
        foreach ($this->clubIdToName as $clubId => $clubName) {
            $filePath = $this->dataDir . $clubId . '_events.json';
            
            if (file_exists($filePath)) {
                try {
                    $jsonContent = file_get_contents($filePath);
                    $eventsData = json_decode($jsonContent, true);
                    
                    if (is_array($eventsData)) {
                        foreach ($eventsData as $event) {
                            // Add computed status field
                            $event['status'] = $this->getEventStatus($event['date'], $event['time']);
                            $this->events[] = $event;
                        }
                    }
                } catch (Exception $e) {
                    error_log("Failed to load events from $filePath: " . $e->getMessage());
                }
            }
        }
    }

    /**
     * Calculate event status based on current date and event date/time
     * Status values: "pending", "published", "finished", "history" (for now only finished and published are implemented)
     */
    private function getEventStatus($eventDate, $eventTime) {
        $currentDateTime = strtotime($this->currentDate . ' 00:00:00');
        $eventDateTime = strtotime($eventDate . ' ' . $eventTime);
        
        if ($eventDateTime > $currentDateTime) {
            // Event is in the future
            return 'published';
        } else {
            // Event is in the past
            return 'finished';
        }
    }

    /**
     * Get a single event by ID
     * @param int $id Event ID
     * @return array|null Event object or null if not found
     */
    public function getEventById($id) {
        foreach ($this->events as $event) {
            if ($event['id'] == $id) {
                return $event;
            }
        }
        return null;
    }

    /**
     * Get all events for a specific club
     * @param string $club Club name
     * @return array Array of events for the club or empty array
     */
    public function getEventsByClub($club) {
        $result = [];
        foreach ($this->events as $event) {
            if ($event['club'] === $club) {
                $result[] = $event;
            }
        }
        return $result;
    }

    /**
     * Get events for a specific club filtered by status
     * @param string $club Club name
     * @param string $status Event status (pending, published, finished, history)
     * @return array Array of filtered events or empty array
     */
    public function getEventsByClubAndStatus($club, $status) {
        $result = [];
        foreach ($this->events as $event) {
            if ($event['club'] === $club && $event['status'] === $status) {
                $result[] = $event;
            }
        }
        return $result;
    }

    /**
     * Get all events (useful for debugging or dashboard views)
     * @return array All loaded events
     */
    public function getAllEvents() {
        return $this->events;
    }

    /**
     * Get all events with a specific status
     * @param string $status Event status
     * @return array Events matching the status
     */
    public function getEventsByStatus($status) {
        $result = [];
        foreach ($this->events as $event) {
            if ($event['status'] === $status) {
                $result[] = $event;
            }
        }
        return $result;
    }

    /**
     * Get featured events across all clubs
     * @return array Featured events
     */
    public function getFeaturedEvents() {
        $result = [];
        foreach ($this->events as $event) {
            if (isset($event['featured']) && $event['featured'] === true) {
                $result[] = $event;
            }
        }
        return $result;
    }
}

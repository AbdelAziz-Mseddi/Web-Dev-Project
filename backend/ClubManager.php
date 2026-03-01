<?php

class ClubManager {
    private $clubs = [];
    private $dataDir;

    public function __construct() {
        $this->dataDir = __DIR__ . '/../data/';
        $this->loadClubsFromFile();
    }

    /**
     * Load all clubs from the JSON file
     */
    private function loadClubsFromFile() {
        $filePath = $this->dataDir . 'clubs.json';
        
        if (file_exists($filePath)) {
            try {
                $jsonContent = file_get_contents($filePath);
                $clubsData = json_decode($jsonContent, true);
                
                if (is_array($clubsData)) {
                    $this->clubs = $clubsData;
                }
            } catch (Exception $e) {
                error_log("Failed to load clubs from $filePath: " . $e->getMessage());
            }
        }
    }

    /**
     * Get a single club by ID
     * @param string $id Club ID
     * @return array|null Club object or null if not found
     */
    public function getClubById($id) {
        foreach ($this->clubs as $club) {
            if ($club['id'] === $id) {
                return $club;
            }
        }
        return null;
    }

    /**
     * Get all clubs
     * @return array All loaded clubs
     */
    public function getAllClubs() {
        return $this->clubs;
    }

    /**
     * Get clubs filtered by category
     * @param string $category Club category
     * @return array Array of clubs in the category or empty array
     */
    public function getClubsByCategory($category) {
        $result = [];
        foreach ($this->clubs as $club) {
            if ($club['category'] === $category) {
                $result[] = $club;
            }
        }
        return $result;
    }

    /**
     * Get all unique categories
     * @return array Array of unique categories
     */
    public function getAllCategories() {
        $categories = [];
        foreach ($this->clubs as $club) {
            if (!in_array($club['category'], $categories)) {
                $categories[] = $club['category'];
            }
        }
        return $categories;
    }
}

<?php
#the big guy, the router
header('Content-Type: application/json');

require_once 'EventManager.php';

$response = ['status' => 'error', 'message' => '', 'data' => null, 'errors' => []];

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? null;

    if (!$action) {
        http_response_code(400);
        $response['errors'][] = "Missing 'action' parameter";
        echo json_encode($response);
        exit;
    }

    $manager = new EventManager();

    switch ($method) {
        case 'GET':
            if ($action === 'get') {
                $id = $_GET['id'] ?? null;
                if (!$id) throw new Exception("Missing event ID");
                $response['data'] = $manager->getEventById($id);
                $response['status'] = 'success';
            } elseif ($action === 'getAll') {
                $response['data'] = $manager->getAllEvents();
                $response['status'] = 'success';
            } elseif ($action === 'getByClub') {
                $club = $_GET['club'] ?? null;
                if (!$club) throw new Exception("Missing club name");
                $response['data'] = $manager->getEventsByClub($club);
                $response['status'] = 'success';
            } elseif ($action === 'getByClubAndStatus') {
                $club = $_GET['club'] ?? null;
                $status = $_GET['status'] ?? null;
                if (!$club || !$status) throw new Exception("Missing club or status");
                $response['data'] = $manager->getEventsByClubAndStatus($club, $status);
                $response['status'] = 'success';
            } else {
                throw new Exception("Unsupported GET action");
            }
            break;

        default:
            throw new Exception("Unsupported HTTP method");
    }

} catch (Exception $e) {
    $response['errors'][] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
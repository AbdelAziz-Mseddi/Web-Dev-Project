<?php
#the big guy, the router
header('Content-Type: application/json');

require_once 'ClubManager.php';

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

    $manager = new ClubManager();

    switch ($method) {
        case 'GET':
            if ($action === 'get') {
                $id = $_GET['id'] ?? null;
                if (!$id) throw new Exception("Missing club ID");
                $response['data'] = $manager->getClubById($id);
                $response['status'] = 'success';
            } elseif ($action === 'getAll') {
                $response['data'] = $manager->getAllClubs();
                $response['status'] = 'success';
            } elseif ($action === 'getByCategory') {
                $category = $_GET['category'] ?? null;
                if (!$category) throw new Exception("Missing category");
                $response['data'] = $manager->getClubsByCategory($category);
                $response['status'] = 'success';
            } elseif ($action === 'getCategories') {
                $response['data'] = $manager->getAllCategories();
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

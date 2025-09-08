<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

include 'config.php'; // ajuste o caminho conforme necessário

$sql = "SELECT id, item, quantidade, prateleira, lado, status FROM info";
$result = $conn->query($sql);

$pedidos = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = $row;
    }
} else {
    echo json_encode(["error" => "Erro na consulta ao banco"]);
    exit;
}

echo json_encode($pedidos);

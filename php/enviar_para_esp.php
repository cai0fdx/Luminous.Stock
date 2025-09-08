<?php
$item = $_GET['item'] ?? '';

if ($item) {
    $esp_ip = "http://10.40.50.200"; 
    $url = $esp_ip . "/led?item=" . urlencode($item);

    $resposta = file_get_contents($url);
    echo $resposta;
} else {
    echo "Item não informado";
}
?>

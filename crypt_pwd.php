<?php

function opennsslencrypt($data)
{
    $open_ssl_key = "GKEReaKDKDkEVzF9NvUSZ9mrIBM0wKPZ";
    $cipher_algo = 'aes-256-cbc';
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($cipher_algo));
    $encrypted = openssl_encrypt($data, $cipher_algo, $open_ssl_key, OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv.$encrypted);
}

$pwd = '';
if (isset($_GET['pwd']))
	$pwd = $_GET['pwd'];

echo json_encode(array('crypt' => opennsslencrypt($pwd)));

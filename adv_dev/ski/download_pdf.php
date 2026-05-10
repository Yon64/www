<?php
include_once('../adv/advPage.php');
advPage::DownloadPDF('/adv/robotLive/pdf/'.adv::GetKey($_GET, 'pdf'));
?>


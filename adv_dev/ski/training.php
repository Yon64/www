<?php
define("VERSION_BOOTSTRAP", "5.3.2");
?>

<!DOCTYPE HTML>
<html lang="fr">
	<head>
		<title>live training</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		
		<link href="../bootstrap/v<?php echo VERSION_BOOTSTRAP;?>/css/bootstrap.min.css" rel="stylesheet">
		<link href="../bootstrap/v<?php echo VERSION_BOOTSTRAP;?>/choices/styles/choices.min.css" rel="stylesheet">
		
		<link href="./css/training.css?v2" rel="stylesheet">
		
		<link rel="shortcut icon" href="./16x16_agil.png" />
		<link rel="icon" href="./16x16_agil.png"/>
	</head>

	<body>
		<header id="header" class="page-header">
			<h3 id="title">&nbsp;</h3>
			<h4 id="sub_title">&nbsp;</h4>
		</header>

		<main id="main" class="container-fluid">
		</main>

		<div class="container" id="container_message">
			<br>
			<div class="d-flex align-items-center" col>
				<strong id="message">Loading...</strong>
				<div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
			</div>
		</div>
		
		<footer>
		</footer>
		
		<script src="../bootstrap/v<?php echo VERSION_BOOTSTRAP;?>/js/bootstrap.min.js"></script>

		<script src="../adv/ws.js"></script>
		<script src="../adv/ws_params.js"></script>
		<script src="../adv/adv.js"></script>
		<script src="../adv/ski.js"></script>
		
		<script src="./js/training.js?v2"></script>
		
		<script>document.addEventListener('DOMContentLoaded', function() {Init();})</script>
	</body>
</html>

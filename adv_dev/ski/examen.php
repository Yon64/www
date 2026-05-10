<?php
include_once('../adv/adv.php');
include_once('../adv/advPage.php');

class MyExamen extends advPage
{
	function Init(&$arrayParams)
	{
		parent::Init($arrayParams);
		
		$this->m_head_icon = './16x16_esf.png';
		array_push($this->m_head_css, './css/live_esf.css?v1');
	}

	function Header()
	{
		?>
		<div id="header">Liste des Examens</div>
		<?php
	}

	function Main()
	{
		?>
		<div id="main">
			<div id="main_message"></div>
			<div id="main_container"></div>
		</div>
		<?php
	}
	
	function Script()
    {
		parent::Script();
		?>
		<script src="../adv/ski.js?v3"></script>
		<script src="./js/live_params_esf.js?v1"></script>
		<script src="./js/examen.js?v7"></script>
		<?php  
		self::ScriptInit();
	}
}

new MyExamen($_GET);
?>


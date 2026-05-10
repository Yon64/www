<?php
include_once('../adv/adv.php');
include_once('../adv/advPage.php');

include_once('live_config.php');

include_once('../adv/adv.php');
include_once('../adv/advPage.php');

class MyLives extends advPage
{
	function Init(&$arrayParams)
	{
		parent::Init($arrayParams);
		
		$liveParams = GetLiveParams();
		$this->m_head_title = $liveParams['title'];
		$this->m_head_icon = $liveParams['icon'];
		array_push($this->m_head_css, $liveParams['css']);
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
		<script src="./js/params.js?v1"></script>
		<script src="./js/lives.js?v7"></script>
		<?php  
		self::ScriptInit();
	}
}

new MyLives($_GET);
?>


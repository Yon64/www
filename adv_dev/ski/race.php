<?php
include_once('../adv/adv.php');
include_once('../adv/advPage.php');

class MyRace extends advPage
{
	function Init(&$arrayParams)
	{
		parent::Init($arrayParams);

		$this->m_head_title = 'TV-Race';
		$this->m_version_bootstrap = VERSION_BOOTSTRAP;
		$this->m_head_css = array();
	}

	function Header()
	{
		?><header id="header"><h1>Liste des Courses</h1></header><?php
	}

	function Footer()
	{   
		?><footer id="footer"></footer><?php
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
		
		self::AddScript('../adv/ski.js?v3');
		self::AddScript('./js/race.js?v1');
		self::ScriptInit();
	}
}

new MyRace($_GET);
?>


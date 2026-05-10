<?php
include_once('../php/adv.php');
include_once('../php/adv_page.php');

// http://localhost/adv_dev/ski/live.php?data_key=BDAT0070&js_context=./js/live_params_biath.js&css_context=./css/live_ffs.css
// http://localhost/adv_dev/ski/live.php?data_key=BDAT0070&js_context=./tv_etor/context.js&css_context=./tv_etor/main.css

class MyLive extends advPage
{
	function Init(&$arrayParams)
	{
		parent::Init($arrayParams);
	}

	function Header()
	{
		?><header id="header"></header><?php
	}

	function Footer()
	{   
		?>
		<div id="footer" class="container">
			<footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
				<p class="col-md-4 mb-0 text-body-secondary">&copy; 2025 - E.S.F. / Agil Informatique</p>
			</footer>
		</div>
		<?php
/*
		?>
		<div id="footer" class="container">
		  <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
			<p class="col-md-4 mb-0 text-body-secondary">&copy; 2025 ESF - Agil Informatique</p>

			<a href="/" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
			  <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"/></svg>
			</a>

			<ul class="nav col-md-4 justify-content-end">
			  <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Home</a></li>
			  <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Features</a></li>
			  <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Pricing</a></li>
			  <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">FAQs</a></li>
			  <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">About</a></li>
			</ul>
		  </footer>
		</div>
		<?php
*/		
	}

	function Main()
	{
		?><div id="main"></div><?php
	}

	function Script()
    {
		parent::Script();
		
		self::AddScript('../js/ski.js?v3');
		self::AddScript('./js/live.js?v1');
		$this->AddParamsJavascript($_POST);
		self::ScriptInit();
	}
}

new MyLive($_GET);
?>


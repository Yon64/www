<?php
include_once('../php/adv_page.php');

class MyPage extends advPage
{
	function Init(&$arrayParams)
	{
		$arrayParams['server_config'] = './tv_inrace.json';
		parent::Init($arrayParams);

		if (!$this->IsParam(KEY_CFG))
		{
			// valeur par défaut ...
			$this->m_head_title = 'FFCK';
			$this->m_head_icon = './16x16_ffck.png';
		}
	}

 	function Head()
	{
		parent::Head();

		if (!isset($this->m_paramsServer['css']) && !isset($this->m_params['css']))
		{
			// Valeur par défaut ...
			static::AddCSS('./css/tv_inrace.css?v1');
		}
	}

	function Header()
	{
	}
	
	function Main()
	{
		?>
		<div id="block_start" class="template" style="display:none">
			<div class="bib">99</div>
			<div class="name">Name</div>
			<div class="nation">Nat</div>
			<img class="img_nation" src="./img/Flags/Empty.png" alt="" height="35" width="45" />
			<div class="categ">Categ</div>
		</div>

		<div id="block_inter" class="template red" style="display:none">
			<div class="time">1:59.99</div>
			<div class="diff">+99.99</div>
			<div class="pena"></div>
		</div>
	
		<div id="block_finish" class="template" style="display:none">
			<div class="bib">99</div>
			<div class="name">Name</div>
			<div class="nation">Nat</div>
			<img class="img_nation" src="./img/Flags/Empty.png" alt="" height="35" width="45">
			<div class="categ">Categ</div>
			<div class="rank">>999</div>	
			<div class="time">1:59.99</div>
			<div class="diff red">+99.99</div>
			<div class="pena"></div>
		</div>

		<div id="block_running" class="template" style="display:none">
			<div class="time">9:59:99</div>
			<div class="pena"></div>
		</div>

		<div id="block_leader" class="template" style="display:none">
			<div class="name">P.ABCDEFGHIJK</div>
			<div class="time">1:59.99</div>
		</div>
		<?php 
	}

	function Script()
    {
		parent::Script();

		self::AddScript('../js/ws.js?v3');
		self::AddScript('../js/ws_params.js?v3');
		self::AddScript('../js/canoe.js?v3');

		self::AddScript('./js/tv_order.js?v2');
		self::AddScript('./js/categories.js?v2');
		self::AddScript('./js/tv_inrace.js?v2');

		$this->AddParamsJavascript($_POST);
		self::ScriptInit();
	}
}

new MyPage($_GET);
?>


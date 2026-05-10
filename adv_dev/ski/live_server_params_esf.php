<?php
function GetParamsServer(&$params)
{
	if (isset($params['mode']) && $params['mode'] == 'ffs')
	{
		return array( 
			'context' => 'ffs',
			'title' => 'Live FFS',
			'icon' => './16x16_ffs.png',
			'css' => './css/live_ffs.css?v1',
			'params_js' => './js/live_params_esf.js?v1'
		);
	}
	else
	{
		return array( 
			'context' => 'esf',
			'title' => 'Live ESF',
			'icon' => './16x16_esf.png',
			'css' => './css/live_esf.css?v1',
			'params_js' => './js/live_params_esf.js?v1'
		);
	}
}
?>
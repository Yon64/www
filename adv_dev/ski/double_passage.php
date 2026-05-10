<?php
include_once('../adv/advPage.php');

class MyDoublePassage extends advPage
{
	function Title()
	{
		?>
		<title>Double Passage</title>
		<?php
	}

	function Head()
	{
		parent::Head();
		?>
		<link href="./css/double_passage.css?v2" rel="stylesheet">

		<link rel="shortcut icon" href="./16x16_ffs.png" />
		<link rel="icon" href="./16x16_ffs.png"/>
		<?php
    }

	function Header()
	{
		?>
		<header id="header" class="page-header">
		</header>
		<?php
	}

	function Main()
	{
		?>
		<table id="passage">
			<tr>
				<td id="bib_left" class="left">&nbsp;</td>
				<td id="bib_right" class="right">&nbsp;</td>
			</tr>
			<tr>
				<td id="time_left" class="left">&nbsp;</td>
				<td id="time_right" class="right">&nbsp;</td>
			</tr>
			<tr>
				<td id="diff_left" class="left">&nbsp;</td>
				<td id="diff_right" class="right">&nbsp;</td>
			</tr>
			<tr>
				<td id="winner_left" class="left">&nbsp;</td>
				<td id="winner_right" class="right">&nbsp;</td>
			</tr>
		</table>

		<div id="message">
		</div>
		<?php
	}
	
	function Script()
    {
		parent::Script();
		?>
		<script src="../adv/ski.js"></script>
		<script src="./js/double_passage.js?v4"></script>
		<script>document.addEventListener('DOMContentLoaded', function() {Init();})</script>
		<?php
	}
}

new MyDoublePassage($_GET);
?>

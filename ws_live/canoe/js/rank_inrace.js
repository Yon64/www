function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({key:'<race_load>', key_race:'*' }));
}

function OnCommandRaceLoad(objJSON)
{
	canoe.SetRace(objJSON);

	const tCompetition = canoe.GetTable('Competition');
	const tCompetition_Course = canoe.GetTable('Competition_Course');
	const tCompetition_Course_Phase = canoe.GetTable('Competition_Course_Phase');

	document.querySelector("#head .place").innerHTML = 'CURRENT RANKING';
	
	const code_phase = canoe.GetCodePhase();
	if (tCompetition_Course_Phase.GetNbRows() >= code_phase && code_phase > 0)
		document.querySelector("#head .title").innerHTML = tCompetition_Course_Phase.GetCell('Libelle', code_phase-1);
	else
		document.querySelector("#head .title").innerHTML = tCompetition_Course_Phase.GetCell('Libelle', 0);
	
	// Chargement de toutes les épreuves ...
	const cmd = { key : '<epreuve_load>',  epreuve : '' };	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON)
{
	canoe.SetRanking(objJSON);

	const tRanking = canoe.GetTableRanking();
	canoe.SetColumnNameRanking(tRanking);

	const course_phase = canoe.GetCodeCoursePhase();
	tRanking.OrderBy('Tps'+course_phase+', Dossard');
	
	if (wsMain.epreuve == '')
		SetCurrentEpreuve(tRanking);
	
	ShowRanking(tRanking);
}

function OnBroadcastPenaltyAdd(objJSON) 
{
	Reload();
}

function Reload()
{
	const cmd = { key : '<epreuve_load>',  epreuve : wsMain.epreuve };	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function SetCurrentEpreuve(tRanking)
{
	const course_phase = canoe.GetCodeCoursePhase();
	var lastHeureDep = 0;

	wsMain.epreuve = '';
	wsMain.scroll_start = 0;
	
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (tRanking.GetCellInt('Tps'+course_phase,i) >= adv.chrono.OK)
		{
			if (tRanking.GetCellInt('Heure_depart'+course_phase,i) > lastHeureDep)
			{
				lastHeureDep = tRanking.GetCellInt('Heure_depart'+course_phase,i);
				wsMain.epreuve = tRanking.GetCell('Code_categorie',i);
			}
		}
	}
}

function HideRow(row)
{
	document.querySelector('#block_ranking .row'+row).style.display = 'none';
}

function ShowRow(row)
{
	document.querySelector('#block_ranking .row'+row).style.display = 'block';
}

function HideRows()
{
	for (let i=1;i<=5;i++)
		HideRow(i);
}

function ShowRanking(tRanking)
{
	HideRows();
	if (tRanking && typeof tRanking === 'object')
	{
		const course_phase = canoe.GetCodeCoursePhase();

		var row = 1;
		var i = wsMain.scroll_start;
		while (row <= 5 && i < tRanking.GetNbRows())
		{
			if (tRanking.GetCell('Code_categorie', i) == wsMain.epreuve && 
				tRanking.GetCellInt('Tps'+course_phase,i, adv.chrono.KO) != adv.chrono.KO)
			{
				ShowRankingRow(row, tRanking, i, course_phase);
				++row;
			}
			++i;
		}
	}
}

function GetCountRanking(tRanking, course_phase, iStart)
{
	let count = 0;
	for (let i=iStart;i<tRanking.GetNbRows();i++)
	{
		if (tRanking.GetCell('Code_categorie', i) == wsMain.epreuve && 
			tRanking.GetCellInt('Tps'+course_phase,i, adv.chrono.KO) != adv.chrono.KO)
		{
			++count;
		}
	}
	return count;
}

function ShowRankingRow(row, tRanking, i, course_phase)
{
	if (tRanking.GetCellInt('Tps'+course_phase, i) > 0)
		document.querySelector('#block_ranking .row'+row+' .rank').innerHTML = tRanking.GetCell('Cltc'+course_phase, i);
	else
		document.querySelector('#block_ranking .row'+row+' .rank').innerHTML = '';
		
	document.querySelector('#block_ranking .row'+row+' .bib').innerHTML = tRanking.GetCell('Dossard', i);
	
	const identity = tRanking.GetCell('Bateau', i);
	document.querySelector('#block_ranking .row'+row+' .identity').innerHTML = identity.length < 14 ? identity : identity.substring(0,14)+'.';
	
	const code_nation = tRanking.GetCell('Code_nation', i);
	if (code_nation.length > 0)
		document.querySelector('#block_ranking .row'+row+' .img_nation').innerHTML = `<img src='./img/Flags/${code_nation}.png' height='20' width='30' />`;
	else
		document.querySelector('#block_ranking .row'+row+' .img_nation').innerHTML = '';

	document.querySelector('#block_ranking .row'+row+' .time').innerHTML = tRanking.GetCellChrono('Tps'+course_phase, i, 'HHMMSSCC');

	const tps = tRanking.GetCellInt('Tps'+course_phase, i);
	if (tps > 0) {
		if (tRanking.GetCell('Cltc'+course_phase, i) != '1') {
			document.querySelector('#block_ranking .row'+row+' .diff').innerHTML = adv.GetChronoDiffXSCC(tRanking.GetDiffTime('Tps'+course_phase, i, 'Code_categorie'));
			document.querySelector('#block_ranking .row'+row+' .diff').style.color ='#e00000';
		} else {
			document.querySelector('#block_ranking .row'+row+' .diff').innerHTML = tRanking.GetCellChrono('Tps'+course_phase, i, 'XSCC');
			document.querySelector('#block_ranking .row'+row+' .diff').style.color ='#00195A';
		}
	} else {
		document.querySelector('#block_ranking .row'+row+' .diff').innerHTML = '';
	}

	ShowRow(row);
}

function Init()
{
	wsMain.lang = 'en';
	wsMain.epreuve = '';
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	if (urlParams.has('epreuve')) {
		wsMain.epreuve = urlParams.get('epreuve');
		// update header if possible
	}
	
	wsMain.scroll_start = 0;
	
	// Command Notification
	wsMain.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsMain.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);
	wsMain.mapCommand.set('<penalty_add>', OnBroadcastPenaltyAdd);
	wsMain.mapCommand.set('<bib_time>', OnBroadcastPenaltyAdd);

	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);

	// Socket.io for UI events
	if (typeof socket !== 'undefined') {
		socket.on('show_graphic', (payload) => {
			const type = typeof payload === 'string' ? payload : payload.type;
			if (type === 'rank_inrace') {
				Reload();
			}
		});
	}

	// Periodic Refresh
	setInterval(Reload, 10000);
}

////////// Variables globales et Initialisation  //////////
const wsMain = new ws.Context(wsParams.url, wsParams.port);
const socket = io();

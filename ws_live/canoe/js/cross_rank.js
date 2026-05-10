const wsMain = new ws.Context(wsParams.url, wsParams.port);
const socket = io(); // Shortcut for offline shim

function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({key:'<race_load>', key_race:'*' }));
}

function OnCommandRaceLoad(objJSON)
{
	canoe.SetRace(objJSON);

	// Chargement de toutes les épreuves ...
	const cmd = { key : '<epreuve_load>',  epreuve : '' };	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON)
{
	canoe.SetRanking(objJSON);
	const tRanking = canoe.GetTableRanking();
	if (tRanking) canoe.SetColumnNameRanking(tRanking);
	
	// Re-render if we have data
	if (wsMain.crossData) {
		ShowRanking(tRanking, wsMain.crossData);
	}
}

function ShowRanking(tRanking, data)
{
	if (!tRanking) return;
	HideRows();
	
	const course_phase = canoe.GetCodeCoursePhase();

	const competitors = [
		{ bib: data.bib1, color: data.color1, pena: data.faute1, rank: data.rank1 },
		{ bib: data.bib2, color: data.color2, pena: data.faute2, rank: data.rank2 },
		{ bib: data.bib3, color: data.color3, pena: data.faute3, rank: data.rank3 },
		{ bib: data.bib4, color: data.color4, pena: data.faute4, rank: data.rank4 }
	];

	competitors.forEach((comp) => {
		const i = canoe.GetRankingBibIndex(tRanking, comp.bib);
		if (i !== -1) {
			const rowIdx = parseFloat(comp.rank);
			if (rowIdx >= 1 && rowIdx <= 5) {
				ShowRankingRow(rowIdx, tRanking, i, course_phase, comp.pena, comp.color);
			}
		}
	});
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

function  ShowRankingRow(row, tRanking, i, course_phase, pena, color)
{
	const rankEl = document.querySelector('#block_ranking .row'+row+' .rank');
	rankEl.innerHTML = row;
	
	// Map colors
	const colorMap = { 'r': 'red', 'b': 'blue', 'v': 'green', 'j': 'yellow' };
	rankEl.style.backgroundColor = colorMap[color] || 'transparent';
	
	const identity = tRanking.GetCell('Bateau', i);
	document.querySelector('#block_ranking .row'+row+' .identity').innerHTML = identity.length < 16 ? identity : identity.substring(0,15)+'.';
	
	if (pena && pena !== '-') {
		document.querySelector('#block_ranking .row'+row+' .pena').innerHTML = pena;
	} else {
		document.querySelector('#block_ranking .row'+row+' .pena').innerHTML = '';
	}
		
	const code_nation = tRanking.GetCell('Code_nation', i);
	if (code_nation.length > 0)
		document.querySelector('#block_ranking .row'+row+' .img_nation').innerHTML = `<img src='./img/Flags/${code_nation}.png' height='20' width='30' />`;
	else
		document.querySelector('#block_ranking .row'+row+' .img_nation').innerHTML = '';
	
	ShowRow(row);
}

function Init()
{
	wsMain.lang = 'en';
	wsMain.crossData = null;

	// Listen for updates from control.html
	socket.on('update_stCross', (data) => {
		wsMain.crossData = data;
		const tRanking = canoe.GetTableRanking();
		if (tRanking) {
			ShowRanking(tRanking, data);
		}
	});
	
	// Command Notification
	wsMain.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsMain.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);

	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

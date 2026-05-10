const wsMain = new ws.Context(wsParams.url, wsParams.port);
const socket = io(); // Shortcut for offline shim

function OnOpenWebSocketCommand() {
	wsMain.websocket.send(JSON.stringify({ key: '<race_load>', key_race: '*' }));
}

function OnCommandRaceLoad(objJSON) {
	canoe.SetRace(objJSON);

	// Chargement de toutes les épreuves ...
	const cmd = { key: '<epreuve_load>', epreuve: '' };
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON) {
	canoe.SetRanking(objJSON);
	const tRanking = canoe.GetTableRanking();
	
	if (tRanking) {
		canoe.SetColumnNameRanking(tRanking);
		
		// Re-render if we have data
		if (wsMain.indivData) {
			ShowRanking(tRanking, wsMain.indivData);
		}
	}
}

function ShowRanking(tRanking, data) {
	if (!tRanking || !data) return;

	const dos = parseFloat(data.bib);
	const color = (data.color || '').trim();

	const bibDiv = document.querySelector('#block_start .bib');
	switch (color) {
		case 'r': bibDiv.style.backgroundColor = 'red'; break;
		case 'b': bibDiv.style.backgroundColor = 'blue'; break;
		case 'v': bibDiv.style.backgroundColor = 'green'; break;
		case 'j': bibDiv.style.backgroundColor = 'yellow'; break;
		default: bibDiv.style.backgroundColor = ''; break;
	}

	bibDiv.innerHTML = dos;

	const i = canoe.GetRankingBibIndex(tRanking, dos);
	if (i === -1) return;

	const bateau = tRanking.GetCell('Bateau', i);
	const shortName = bateau.length > 27 ? bateau.substring(0, 27) + '.' : bateau;

	document.querySelector("#block_start .name").innerHTML = shortName;
	document.querySelector("#block_start .nation").innerHTML = tRanking.GetCell('Code_nation', i);
	document.querySelector("#block_start .img_nation").src = "./img/Flags/" + tRanking.GetCell('Code_nation', i) + ".png";
	document.querySelector("#block_start .categ").innerHTML = tRanking.GetCell('Code_categorie', i);
}

function Init() {
	wsMain.lang = 'en';
	wsMain.indivData = null;

	// Listen for updates from control.html
	socket.on('update_indiv', (data) => {
		wsMain.indivData = data;
		const tRanking = canoe.GetTableRanking();
		if (tRanking) {
			ShowRanking(tRanking, data);
		}
	});

	wsMain.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsMain.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);

	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

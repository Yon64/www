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

	document.querySelector("#head .title").innerHTML = tCompetition.GetCell('Nom', 0);
	
	const code_phase = canoe.GetCodePhase();
	if (tCompetition_Course_Phase.GetNbRows() >= code_phase && code_phase > 0)
		document.querySelector("#head .phase").innerHTML = tCompetition_Course_Phase.GetCell('Libelle', code_phase-1);
	else
		document.querySelector("#head .phase").innerHTML = tCompetition_Course_Phase.GetCell('Libelle', 0);
		
	document.querySelector("#head .place").innerHTML = tCompetition.GetCell('Ville', 0);
	document.querySelector("#head .date").innerHTML = tCompetition.GetCell('Date_debut', 0) + " - " + tCompetition.GetCell('Date_fin', 0);
	
	// Chargement de toutes les épreuves ...
	const cmd = { key : '<epreuve_load>',  epreuve : '' };	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON)
{
	// Pas besoin de charger les épreuves pour le titre simple
}

function Init()
{
	wsMain.lang = 'en';
	
	// Command Notification
	wsMain.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsMain.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

////////// Variables globales et Initialisation  //////////
const wsMain = new ws.Context(wsParams.url, wsParams.port);

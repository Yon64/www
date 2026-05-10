function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({key : '<competition_load>' }));
}

function OnCommandCompetitionLoad(objJSON) 
{
//	alert("OnCommandCompetitionLoad :"+JSON.stringify(objJSON));

	wsMain.notify_competitions = objJSON;
	const tCompetitions = adv.GetTableUnique(wsMain.notify_competitions, 'competitions');

	var html = '';
	html += '<table class="table table-striped">';
	html += '<thead class="table-dark"><tr>';
		html += '<th class="text-center">Nom</th>';
		html += '<th class="text-center">Date</th>';
	html += '</tr></thead>';

	html += '<tbody>'
	for (let r = 0; r < tCompetitions.GetNbRows(); r++)
	{
		const key = tCompetitions.GetCell('key', r);
		const activite = tCompetitions.GetCell('Code_activite', r);
		const discipline = tCompetitions.GetCell('Code_discipline', r);
	
		const nom = tCompetitions.GetCell('Nom', r);
		const date_epreuve = tCompetitions.GetCellDate('Date_epreuve', r,'DDMMYYYY');
		
		var img_online = '';
		if (tCompetitions.GetCellInt('active', r) == 1)
            img_online = '<img width="24" height="24" src="./img/32x32_online.png" alt="On Line !">&nbsp;';

		html += '<tr>';
		html += '<td><a href="#" class="link-dark" data-key="'+key+'" data-activite="'+activite+'" data-discipline="'+discipline+'" >'+nom+'</a></td>';
		html += '<td>'+date_epreuve+'</td>';
		html += '</tr>';
		
/*		
		html += '<td>';
		html += '<a href="#" data-key="'+key+'" data-activite="'+activite+'" data-discipline="'+discipline+'" >'+img_online+label+'</a>';

		if (tCompetitions.GetCell('mode_test',r) == 1)
		{
			html += " *** Mode TEST ***";
		}
		
		html += '<td>'+activite+'</td>';
		html += '<td>'+discipline+'</td>';
		html += '<td>'+tCompetitions.GetCell('Code_categorie',r)+'</td>';
		html += '<td>'+tCompetitions.GetCell('Sexe',r)+'</td>';
		html += '<td>'+tCompetitions.GetCell('Code_regroupement',r)+'</td>';
		html += '<td>'+tCompetitions.GetCell('Distance',r)+'</td>';
*/		
		html += '</tr>';
	}
	html += '</table>\n';
	
	document.getElementById("main_container").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#main_container tr td a'), function(el) {
		el.addEventListener('click', function() {
			const key = el.getAttribute('data-key');
			const activite = el.getAttribute('data-activite');
			const discipline = el.getAttribute('data-discipline');
			
			if (activite == 'SAUT')
				window.location.href  = '/ws_live/ski/live_saut.html?key_race='+key;
			else if (discipline == 'P')
				window.location.href  = '/ws_live/ski/live_para.html?key_race='+key;
			else
				window.location.href  = '/ws_live/ski/live.php?data_key='+key;
		})
	})
}

const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	// Command Notification
	wsMain.SetCommand('<competition_load>', OnCommandCompetitionLoad);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

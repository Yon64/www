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
		html += '<th class="text-center">TV</th>';
	html += '</tr></thead>';

	html += '<tbody>'
	for (let r = 0; r < tCompetitions.GetNbRows(); r++)
	{
		const key = tCompetitions.GetCell('key', r);
		const activite = tCompetitions.GetCell('Code_activite', r);
		const discipline = tCompetitions.GetCell('Code_discipline', r);
	
		const nom = tCompetitions.GetCell('Commentaire_live', r);
		const date_epreuve = tCompetitions.GetCellDate('Date_epreuve', r,'DDMMYYYY');
		
		var img_online = '';
		if (tCompetitions.GetCellInt('active', r) == 1)
            img_online = '<img width="24" height="24" src="./img/32x32_online.png" alt="On Line !">&nbsp;';

		html += '<tr>';
		html += '<td><a href="#" class="link-dark" data-key="'+key+'" data-activite="'+activite+'" data-discipline="'+discipline+'" >'+img_online+nom+'</a></td>';
		html += '<td><button data-key="'+key+'" type="button">TV '+key+'</button></td>';
		html += '</tr>';
	
	}
	html += '</table>\n';
	
	document.getElementById("main_container").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#main_container tr td a'), function(el) {
		el.addEventListener('click', function() {
			const key = el.getAttribute('data-key');
			const activite = el.getAttribute('data-activite');
			
			if (activite == 'BIATH')
				adv.OpenURL('./live.php?data_key='+key, { params_server : 'live_server_params_biath.php' });
			else
				adv.OpenURL('./live.php?data_key='+key, { params_server : 'live_server_params_esf.php', password: "007" });
				
		})
	});

	[].forEach.call(document.querySelectorAll('#main_container button'), function(el) {
		el.addEventListener('click', function() {
			const key = el.getAttribute('data-key');
			const cmd = { key:'<order>', action:'reload', data_key:key };
			wsMain.websocket.send(JSON.stringify(cmd));
			alert('Send='+JSON.stringify(cmd));
		})
	});

}

const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	// Command Notification
	wsMain.SetCommand('<competition_load>', OnCommandCompetitionLoad);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

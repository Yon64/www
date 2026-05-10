function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({ key : '<duel_race>',  key_race : wsMain.key_race }));
//	console.log('OnOpenWebSocketCommand : send <duel_race> '+wsMain.key_race);
}

function OnCommandDuelRace(objJSON) 
{
//	console.log('OnCommandDuelRace : '+JSON.stringify(objJSON));

	ski.SetDuelRace(objJSON);
	wsMain.key_race = objJSON.key_race;
	
	const nb_tour = ski.duel.GetNbTour();
	const nb_max_duel = ski.duel.GetMaxNbDuel();
//	alert('Max Nb Duel='+nb_max_duel);
	const nb_max_couloir = ski.duel.GetMaxNbCouloir();
//	alert('Max Nb Couloir='+nb_max_couloir);

	const elContainerDuel = document.getElementById("container_duel");
	if (elContainerDuel !== null)
	{
		var htmlTxt = '\n';
		for (let t=1;t<=nb_tour;t++)
		{
			htmlTxt += '<div id="tour_'+t.toString()+'_label" class="tour_label">';
			htmlTxt += ski.duel.GetTourLabel(t);
			htmlTxt += '</div>\n';
		}
		
		for (let t=1;t<=nb_tour;t++)
		{
			const nb_duel = ski.duel.GetNbDuel(t);
			for (let d=1;d<=nb_duel;d++)
			{				
				htmlTxt += '<div id="duel_'+t.toString()+'_'+d.toString()+'" class="duel">';
				htmlTxt += '<table>';
				
				const nb_couloir = ski.duel.GetNbCouloir(t,d);
				htmlTxt += '<tr>';
				htmlTxt += '<td rowspan="0" class="label_duel">D'+d.toString()+'</td>';
				htmlTxt += '<td class="label">C.</td>';
				htmlTxt += '<td class="label">Dos.</td>';
				htmlTxt += '<td class="label">Identité</td>';
				htmlTxt += '<td class="label">Club</td>';
				htmlTxt += '<td class="label">Clt</td>';
				htmlTxt += '</tr>';
				
				for (let c=1;c<=nb_couloir;c++)
				{
					htmlTxt += '<tr data-couloir='+c.toString()+'>';
					htmlTxt += '<td class="couloir">'+c.toString()+'</td>';
					htmlTxt += '<td class="dossard">'+ski.duel.GetCell(t,d,c,'dossard')+'</td>';
					htmlTxt += '<td class="identite">'+ski.duel.GetCell(t,d,c,'nom')+' '+ski.duel.GetCell(t,d,c,'prenom')+'</td>';
					htmlTxt += '<td class="club">'+ski.duel.GetCell(t,d,c,'club')+'</td>';
					htmlTxt += '<td class="tps">'+ski.duel.GetCell(t,d,c,'tps')+'</td>';
					
					htmlTxt += '</tr>';
				}

				htmlTxt += "</table>";
				htmlTxt += "</div>\n";
			}
		}

		elContainerDuel.innerHTML = htmlTxt;
	}
	
	const w = 450;
	const h = 24*(nb_max_couloir+1);
	const space = 10;
	
	const hLabel = 24;
	const yLabel = 88;
	
	var x = 0;
	for (let t=1;t<=nb_tour;t++)
	{
		const elTourLabel = document.getElementById("tour_"+t.toString()+'_label');
		if (elTourLabel !== null)
		{
			elTourLabel.style.position = 'absolute'; 
			elTourLabel.style.width = w.toString()+'px'; 
			elTourLabel.style.height = hLabel.toString()+'px'; 
			elTourLabel.style.left = x.toString()+'px'; 
			elTourLabel.style.top = yLabel.toString()+'px';
		}

		const nb_duel = ski.duel.GetNbDuel(t);
		var y = yLabel+hLabel+space;
		for (let d=1;d<=nb_duel;d++)
		{				
			const elDuel = document.getElementById("duel_"+t.toString()+'_'+d.toString());
			if (elDuel !== null)
			{
				elDuel.style.width = w.toString()+'px'; 
				elDuel.style.height = h.toString()+'px'; 
				elDuel.style.left = x.toString()+'px'; 
				elDuel.style.top = y.toString()+'px'; 
			}
			y += h+space;
		}

		x += w + space;
	}

	DoDuelSelection();
}

function OnCommandDuelLoad(objJSON)
{
//	alert("OnCommandDuelLoad :"+JSON.stringify(objJSON));
	if (objJSON.key_race == wsMain.key_race)
	{
		const t = objJSON.tour;
		const d = objJSON.duel;
		
		wsMain.selection_tour = t;
		wsMain.selection_duel = d;
		DoDuelSelection();

		const tDuel = adv.GetTableUnique(objJSON, 'table_duel');
		if (typeof tDuel === 'object' && tDuel != null)
		{
			const nb_couloir = tDuel.GetNbRows();
			for (let c=1;c<=nb_couloir;c++)
			{
				const el = document.querySelector("#duel_"+t.toString()+'_'+d.toString()+" table tr[data-couloir='"+c+"'] td.tps");
				if (el && typeof el === "object")
				{
					const tps = tDuel.GetCell('tps', c-1);
					el.innerHTML = tps;
				}
			}
		}
	}
}

function DoDuelSelection()
{
	const t = wsMain.selection_tour;
	const d = wsMain.selection_duel;
	
	if (t >= 1 && d >= 1)
	{
		const matches = document.querySelectorAll('div.duel.selection');
		matches.forEach(function(el) {
			el.classList.remove('selection')
		});		
		
		document.getElementById('duel_'+t.toString()+'_'+d.toString()).classList.add('selection');
	}
}

function GetIdentite(bib) 
{
	const t = 1;
	const nb_duel = ski.duel.GetNbDuel(t);
	for (let d=1;d<=nb_duel;d++)
	{
		if (ski.duel.GetCell(t,d,1,'dossard') == bib)
			return ski.duel.GetCell(t,d,1,'nom')+' '+ski.duel.GetCell(t,d,1,'prenom');
		else if (ski.duel.GetCell(t,d,0,'dossard') == bib)
			return ski.duel.GetCell(t,d,0,'nom')+' '+ski.duel.GetCell(t,d,0,'prenom');
	}

	return '';
}

function GetIdentiteClub(bib) 
{
	const t = 1;
	const nb_duel = ski.duel.GetNbDuel(t);
	for (let d=1;d<=nb_duel;d++)
	{
		if (ski.duel.GetCell(t,d,1,'dossard') == bib)
			return ski.duel.GetCell(t,d,1,'nom')+' '+ski.duel.GetCell(t,d,1,'prenom')+ ' ('+ski.duel.GetCell(t,d,1,'club')+')';
		else if (ski.duel.GetCell(t,d,0,'dossard') == bib)
			return ski.duel.GetCell(t,d,0,'nom')+' '+ski.duel.GetCell(t,d,0,'prenom')+ ' ('+ski.duel.GetCell(t,d,0,'club')+')';
	}

	return '';
}

function OnCommandMsg(objJSON) 
{
//	alert("OnCommandMsg :"+JSON.stringify(objJSON));
	const htmlMsg = objJSON.msg;
	const elMsg = document.getElementById("msg");
	if (elMsg !== null && htmlMsg !== null)
		elMsg.innerHTML = htmlMsg;
}

////////// Variables globales et Initialisation  //////////

const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	wsMain.lang = 'fr';
	
	wsMain.selection_tour = 0;
	wsMain.selection_duel = 0;

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	wsMain.key_race = '*';
	if (urlParams.has('key_race'))
		wsMain.key_race = urlParams.get('key_race');
	
	wsMain.title = 'Ko-Sprint';
	if (urlParams.has('title'))
		wsMain.title = urlParams.get('title');
	
	document.getElementById('container_title').innerHTML = wsMain.title+'<br>&nbsp;';

	wsMain.lengthIdentity = 35;
	if (urlParams.has('length_identity'))
		wsMain.lengthIdentity = parseInt(urlParams.get('length_identity'));
	
	// Command Notification
	wsMain.SetCommand('<duel_race>', OnCommandDuelRace);
	wsMain.SetCommand('<duel_load>', OnCommandDuelLoad);
	wsMain.SetCommand('<msg>', OnCommandMsg);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}


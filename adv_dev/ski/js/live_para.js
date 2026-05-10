function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({ key : '<duel_race>',  key_race : wsMain.key_race }));
}

function OnCommandDuelRace(objJSON) 
{
	ski.SetParaRace(objJSON);
	
	const nb_tour = ski.para.GetNbTour();
	const nb_duel_max = ski.para.GetNbDuel(1);

	const elBlock = document.getElementById("container_duel");
	if (elBlock !== null)
	{
		var htmlTxt = '';
		for (let t=1;t<=nb_tour;t++)
		{
			htmlTxt += '<div id="duel_'+t.toString()+'_label" class="duel_label">';
			htmlTxt += ski.para.GetTourLabel(t);
			htmlTxt += '</div>\n';
		}
		
		for (let t=1;t<=nb_tour;t++)
		{
			var nb_duel = ski.para.GetNbDuel(t);
			if (t == nb_tour && nb_duel == 1)
				++nb_duel;
			
			const nb_run =  ski.para.GetNbRun(t);
			
			for (let d=1;d<=nb_duel;d++)
			{				
				htmlTxt += '<div id="duel_'+t.toString()+'_'+d.toString()+'" class="duel">';
				
				const left = 1;
				htmlTxt += '<div class="left">';
				
				htmlTxt += '<div class="dossard">';
				htmlTxt += ski.para.GetCell(t,d,left,'dossard');
				htmlTxt += '</div>';
				
				htmlTxt += '<div class="identite">';
				htmlTxt += '<div>'+ski.para.GetCell(t,d,left, 'nom')+' '+ski.para.GetCell(t,d,left, 'prenom')+'</div>';
				htmlTxt += '<div>'+ski.para.GetCell(t,d,left, 'club')+'</div>';
				htmlTxt +='</div>\n';
					
				for (let r=1;r<=nb_run;r++)
				{
					htmlTxt += '<div class="tps run'+r.toString()+'">';
					htmlTxt += ski.para.GetCellTime(t,d,left,r);
					const diffTxt = ski.para.GetCellDiff(t,d,left,r);
					if (diffTxt.length > 0)
						htmlTxt += ' ['+diffTxt+']';
					htmlTxt += '</div>';
				}
				
				htmlTxt += "</div>";

				const right = 0;
				htmlTxt += '<div class="right">';
				
				htmlTxt += '<div class="dossard">';
				htmlTxt += ski.para.GetCell(t,d,right, 'dossard');
				htmlTxt += '</div>';
	
				htmlTxt += '<div class="identite">';
				htmlTxt += '<div>'+ski.para.GetCell(t,d,right, 'nom')+' '+ski.para.GetCell(t,d,right, 'prenom')+'</div>';
				htmlTxt += '<div>'+ski.para.GetCell(t,d,right, 'club')+'</div>';
				htmlTxt += '</div>\n';

				for (let r=1;r<=nb_run;r++)
				{
					htmlTxt += '<div class="tps run'+r.toString()+'">';
					htmlTxt += ski.para.GetCellTime(t,d,right,r);
					const diffTxt = ski.para.GetCellDiff(t,d,right,r);
					if (diffTxt.length > 0)
						htmlTxt += ' ['+diffTxt+']';
					htmlTxt += '</div>';
				}

				htmlTxt += "</div>";

				htmlTxt += '</div>\n';
			}
		}
		elBlock.innerHTML = htmlTxt;
	}
	
	const w = 200+80*ski.para.GetMaxNbRun();
	const h = 60;
	const wb = 16;
	const hb = 24;
	const height_total = ski.para.GetNbDuel(1)*(h+hb);
	const x = 20;
	const y = 120;
	
	for (let t=1;t<=nb_tour;t++)
	{
		const elDuelLabel = document.getElementById("duel_"+t.toString()+'_label');
		elDuelLabel.style.width = w.toString()+'px'; 
		elDuelLabel.style.height = (h/2).toString()+'px'; 
		elDuelLabel.style.left = (x+(w+wb)*(t-1)).toString()+'px'; 
		elDuelLabel.style.top = y.toString()+'px';

		const nb_duel = ski.para.GetNbDuel(t);
		const padding_duel = (height_total-(h+hb)*nb_duel)/(nb_duel);
		
		var htop = y+h;
		if (t > 1)
			htop += padding_duel/2;

		for (let d=1;d<=nb_duel;d++)
		{				
			const elDuel = document.getElementById("duel_"+t.toString()+'_'+d.toString());
			
			elDuel.style.width = w.toString()+'px'; 
			elDuel.style.height = h.toString()+'px'; 
			elDuel.style.left = (x+(w+wb)*(t-1)).toString()+'px'; 
			elDuel.style.top = htop.toString()+'px';
			SetChildWidth(t, d);
			
			if (t == nb_tour && nb_duel == 1)
			{
				// Petite Finale
				const elPfDuel = document.getElementById("duel_"+t.toString()+'_2');
				elPfDuel.style.width = w.toString()+'px'; 
				elPfDuel.style.height = h.toString()+'px'; 
				elPfDuel.style.left = (x+(w+wb)*(t-1)).toString()+'px'; 
				elPfDuel.style.top = (htop+hb+120).toString()+'px';
				SetChildWidth(nb_tour, 2);
			}
			
			if (t==1)
				htop += h+hb;
			else
				htop += padding_duel+h+hb;
		}
	}

	DoDuelSelection();
}

function SetChildWidth(tour, duel)
{
	const nbRun = ski.para.GetNbRun(tour);
	const pBib = 8;
	const pIdentity = 30;
	const pRun = 20;
	const pTot = pBib+pIdentity+pRun*nbRun;
	
	const matchesBib = document.querySelectorAll('#duel_'+tour.toString()+'_'+duel.toString()+' .dossard');
		matchesBib.forEach(function(el) {
			el.style.width = (parseInt((99*pBib)/pTot)).toString()+'%'; 
	});		

	const matchesIdentity = document.querySelectorAll('#duel_'+tour.toString()+'_'+duel.toString()+' .identite');
		matchesIdentity.forEach(function(el) {
			el.style.width = (parseInt((99*pIdentity)/pTot)).toString()+'%'; 
	});		

	const matchesRun = document.querySelectorAll('#duel_'+tour.toString()+'_'+duel.toString()+' .tps');
	matchesRun.forEach(function(el) {
		el.style.width = (parseInt((99*pRun)/pTot)).toString()+'%'; 
	});		
	
	for (let r=1;r<=nbRun;r++)
	{
		for (let leftright=0;leftright<=1;leftright++)
		{
			const diffTxt = ski.para.GetCellDiff(tour, duel, leftright, r);
			txtLeftRight = 'left';
			if (leftright == 0)
				txtLeftRight = 'right';
			
			const el = document.querySelector('#duel_'+tour.toString()+'_'+duel.toString()+' .'+txtLeftRight+' .tps.run'+r.toString());
			if (el !== undefined)
			{
				el.classList.remove('winner');
				el.classList.remove('looser');
				if (diffTxt.length > 0)
				{
					if (diffTxt.substr(0,1) == '+')
						el.classList.add('looser');
					else if (diffTxt.substr(0,1) == '-')
						el.classList.add('winner');
				}
			}
		}
	}
}

function OnCommandDuelSelection(objJSON)
{
//	alert("OnCommandDuelSelection :"+JSON.stringify(objJSON));

	wsMain.selection_tour = objJSON.tour;
	wsMain.selection_duel = objJSON.duel;
	wsMain.selection_run = objJSON.run;
	
	DoDuelSelection();
	
	if (objJSON.refresh == true)
	{
		wsMain.websocket.send(JSON.stringify({ key : '<duel_race>',  key_race : wsMain.key_race }));
	}
}

function DoDuelSelection()
{
	const t = wsMain.selection_tour;
	const d = wsMain.selection_duel;
	const r = wsMain.selection_run;
	
	if (t >= 1 && d >= 1 && r >= 1)
	{
		const matches = document.querySelectorAll('div.duel.selection');
		matches.forEach(function(el) {
			el.classList.remove('selection')
		});		
		
		document.getElementById('duel_'+t.toString()+'_'+d.toString()).classList.add('selection');
		
		var htmlTxt = '<div class="oncourse title">';
		if (t >= 1 && d >= 1)
		{
			htmlTxt += ski.para.GetTourLabel(t)+' - Duel '+d.toString()+' - Run '+r.toString();
		}
		htmlTxt += '</div>';

		const left = 1;
		const bibLeft = ski.para.GetCell(t,d, left, 'dossard');
		htmlTxt += '<div class="oncourse">';
		htmlTxt += bibLeft+ ' '+GetIdentiteClub(bibLeft);
		htmlTxt += '</div>';

		const right = 0;
		const bibRight = ski.para.GetCell(t,d, right, 'dossard');
		htmlTxt += '<div class="oncourse">';
		htmlTxt += bibRight+ ' '+GetIdentiteClub(bibRight);
		htmlTxt += '</div>';

		document.getElementById("container_oncourse").innerHTML = htmlTxt;
	}
	else
	{
		wsMain.websocket.send(JSON.stringify({ key : '<duel_selection>',  key_race : wsMain.key_race }));
	}
}

function OnBroadcastBibTime(objJSON)
{
//	alert("OnBroadcastBibTime :"+JSON.stringify(objJSON));
	if (objJSON.passage == -1)
	{
		const bib = objJSON.bib;
		const t = wsMain.selection_tour;
		const d = wsMain.selection_duel;
		if (t > 0 && d > 0)
		{
			const bibLeft = ski.para.GetCell(t, d, 1, 'dossard');
			const bibRight = ski.para.GetCell(t, d, 0, 'dossard');
			if (bibLeft == bib || bibRight == bib)
			{
				const tpsChrono = adv.GetChronoHHMMSSCC(objJSON.time);
				if (bibLeft == bib)
				{
					ski.para.SetCell(t, d, 1, 'tps', tpsChrono);
					const elTps = document.querySelector('#duel_'+t.toString()+'_'+d.toString()+' .left .tps');
					elTps.innerHTML = tpsChrono;
					elTps.classList.remove('oncourse');
				}
				else
				{
					ski.para.SetCell(t, d, 0, 'tps', tpsChrono);
					const elTps = document.querySelector('#duel_'+t.toString()+'_'+d.toString()+' .right .tps');
					elTps.innerHTML = tpsChrono;
					elTps.classList.remove('oncourse');
				}
				
				const tpsLeft = ski.para.GetCell(t, d, 1, 'tps');
				const tpsRight = ski.para.GetCell(t, d, 0, 'tps');
				if (tpsLeft.length == 0 || tpsRight.length == 0)
				{
					// Neutralisation SendDuelRace ...
					return;
				}
			}
		}
	}

	setTimeout("SendDuelRace()", 1500);
}

function SendDuelRace()
{
	wsMain.websocket.send(JSON.stringify({ key : '<duel_race>',  key_race : wsMain.key_race }));
}

function OnFlowOnCourse(objJSON) 
{
	const tOnCourse = adv.GetTableUnique(objJSON, 'table');

	const t = wsMain.selection_tour;
	const d = wsMain.selection_duel;

	var htmlTxt = '';
	htmlTxt += '<div class="oncourse">';
	if (t >= 1 && d >= 1)
	{
		htmlTxt += ski.para.GetTourLabel(t)+' - Duel '+d.toString()+' : ';
	}
	htmlTxt += adv.GetChronoHHMMSSD(objJSON.clock);
	htmlTxt += '</div>';

	for (let i=0;i<tOnCourse.GetNbRows();i++)
	{
		htmlTxt += '<div class="oncourse">';
		htmlTxt += tOnCourse.GetCell('bib',i);
		htmlTxt += ' '+GetIdentite(tOnCourse.GetCell('bib',i));
		htmlTxt += ' - '+tOnCourse.GetCellChrono('time', i, 'HHMMSSD');
		htmlTxt += '</div>';
	}
	document.getElementById("container_oncourse").innerHTML = htmlTxt;

	if (t > 0 && d > 0)
	{
		const bibLeft = ski.para.GetCell(t, d, 1, 'dossard');
		const bibRight = ski.para.GetCell(t, d, 0, 'dossard');

		for (let i=0;i<tOnCourse.GetNbRows();i++)
		{
			var bib = tOnCourse.GetCell('bib',i);
			if (bib == bibLeft)
			{
				const elTps = document.querySelector('#duel_'+t.toString()+'_'+d.toString()+' .left .tps');
				elTps.innerHTML = tOnCourse.GetCellChrono('time', i, 'HHMMSSD');
				elTps.classList.add('oncourse');
			}
			else if (bib == bibRight)
			{
				const elTps = document.querySelector('#duel_'+t.toString()+'_'+d.toString()+' .right .tps');
				elTps.innerHTML = tOnCourse.GetCellChrono('time', i, 'HHMMSSD');
				elTps.classList.add('oncourse');
			}
		}
	}
}

function TruncateName(name)
{
	if (wsMain.lengthIdentity > 0)
	{
		if (name.length > wsMain.lengthIdentity)
			return name.substring(0, wsMain.lengthIdentity)+"...";
	}
	
	return name;
}

function GetIdentite(bib) 
{
	const t = 1;
	const nb_duel = ski.para.GetNbDuel(t);
	for (let d=1;d<=nb_duel;d++)
	{
		if (ski.para.GetCell(t,d,1,'dossard') == bib)
			return ski.para.GetCell(t,d,1,'nom')+' '+ski.para.GetCell(t,d,1,'prenom');
		else if (ski.para.GetCell(t,d,0,'dossard') == bib)
			return ski.para.GetCell(t,d,0,'nom')+' '+ski.para.GetCell(t,d,0,'prenom');
	}

	return '';
}

function GetIdentiteClub(bib) 
{
	const t = 1;
	const nb_duel = ski.para.GetNbDuel(t);
	for (let d=1;d<=nb_duel;d++)
	{
		if (ski.para.GetCell(t,d,1,'dossard') == bib)
			return ski.para.GetCell(t,d,1,'nom')+' '+ski.para.GetCell(t,d,1,'prenom')+ ' ('+ski.para.GetCell(t,d,1,'club')+')';
		else if (ski.para.GetCell(t,d,0,'dossard') == bib)
			return ski.para.GetCell(t,d,0,'nom')+' '+ski.para.GetCell(t,d,0,'prenom')+ ' ('+ski.para.GetCell(t,d,0,'club')+')';
	}

	return '';
}

////////// Variables globales et Initialisation  //////////

const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	wsMain.selection_tour = 0;
	wsMain.selection_duel = 0;
	wsMain.selection_run = 0;

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	wsMain.key_race = '*';
	if (urlParams.has('key_race'))
		wsMain.key_race = urlParams.get('key_race');
	
	wsMain.title = 'Parallèle';
	if (urlParams.has('title'))
		wsMain.title = urlParams.get('title');
	
	document.getElementById('container_title').innerHTML = wsMain.title+'<br>&nbsp;';

	wsMain.lengthIdentity = 35;
	if (urlParams.has('length_identity'))
		wsMain.lengthIdentity = parseInt(urlParams.get('length_identity'));
	
	// Command Notification
	wsMain.SetCommand('<duel_race>', OnCommandDuelRace);
	wsMain.SetCommand('<duel_selection>', OnCommandDuelSelection);
	wsMain.SetCommand('<bib_time>', OnBroadcastBibTime);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}


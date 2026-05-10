function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({key : '<race_load>', key_race : wsMain.key_race }));
}

function OnCommandRaceLoad(objJSON) 
{
//	alert("OnCommandRaceLoad :"+JSON.stringify(objJSON));
	ski.SetRace(objJSON);

	const tEpreuve = ski.GetTable('Epreuve');
	if (tEpreuve !== undefined)
	{
		for (let e=0;e<tEpreuve.GetNbRows();e++)
		{
			const code_epreuve = tEpreuve.GetCell('Code_epreuve',e);
			const cmd = { key : '<epreuve_load>',  epreuve:code_epreuve , fn:'response_EpreuveLoad'};	
			wsMain.websocket.send(JSON.stringify(cmd));
		}
	}
}

function response_EpreuveLoad(objJSON) 
{
//	alert("response_EpreuveLoad :"+JSON.stringify(objJSON));
	
	const epreuve = objJSON.epreuve;
	ski.SetEpreuveMulti(objJSON, epreuve);
	
	const tEpreuve = ski.GetTable('Epreuve');
	if (tEpreuve.GetNbRows() == ski.GetNbEpreuveMulti())
	{
		// Chargement complet ...
		Navigation_Epreuve();
	}
}

function Navigation_Epreuve() 
{
	const tEpreuve = ski.GetTable('Epreuve');
	const nb_epreuve = tEpreuve.GetNbRows();
	
//	alert('nb_epreuve='+nb_epreuve);
	
	var html = '<br><br><br><br><br>';
	html += '<h2 class="text-center">Choix des Epreuves</h2>';
	html += '<ul class="list-group">';
	for (let e=0;e<nb_epreuve;e++)
	{
		const categ = tEpreuve.GetCell('Code_categorie', e);
		const sexe = tEpreuve.GetCell('Sexe', e);
		const epreuve = tEpreuve.GetCellInt('Code_epreuve', e);
		
		const nb_course = ski.GetInfoEpreuveMulti(epreuve, 'Nb_course');
//		alert('epreuve='+epreuve+"/"+sexe+"/"+categ+"/"+nb_course);
		
		for (let course=1;course<=nb_course;course++)
		{
			const label_course = ski.GetInfoEpreuveMulti(epreuve, 'Label_course'+course.toString());
			const nb_run = ski.GetInfoEpreuveMulti(epreuve, 'Nb_run_course'+course.toString());
			for (let run=1;run<=nb_run;run++)
			{
				html += '<button type="button" class="list-group-item list-group-item-action" ';
				html += 'data-epreuve="'+epreuve.toString()+'" ';
				html += 'data-course="'+course.toString()+'" ';
				html += 'data-run="'+run.toString()+'" ';
				html += '>Epr. '+epreuve.toString()+' ['+categ+'/'+sexe+']';
				html += ' : Course '+course.toString()+' - '+label_course;
				html += ' : Run '+run.toString();
				html += '</button>';
			}
		}
	}
	html += '</ul>';

	document.getElementById("navigation").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#navigation ul button'), function(el) {
		el.addEventListener('click', function() {
			Navigation_Epreuve_active_clear();
			el.classList.add('active');
			const e = parseInt(el.getAttribute("data-epreuve"));
			const c = parseInt(el.getAttribute("data-course"));
			const r = parseInt(el.getAttribute("data-run"));
			ShowRun(e,c,r);
		})
	})
}

function Navigation_Epreuve_active_clear()
{
	[].forEach.call(document.querySelectorAll('#navigation ul button.active'), function(el) {
		el.classList.remove('active');
	})
}

function ShowRun(epreuve, course, run) 
{
	wsMain.select_epreuve = epreuve;
	wsMain.select_course = course;
	wsMain.select_run = run;

	if (wsMain.refresh_interval != null)
		window.clearInterval(wsMain.refresh_interval);
	wsMain.refresh_interval = window.setInterval(function () { onRefresh(); }, 3000);
	
	const cmd = { key : '<epreuve_load>',  epreuve:epreuve , fn:'response_EpreuveLoad_show'};	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function response_EpreuveLoad_show(objJSON) 
{
//	alert("response_EpreuveLoad_show :"+JSON.stringify(objJSON));

	wsMain.select_epreuve = objJSON.epreuve;
	ski.SetEpreuveMulti(objJSON, wsMain.select_epreuve);
	
	ShowRanking();
}

function ShowRanking() 
{
	const epreuve = wsMain.select_epreuve;
	const course = wsMain.select_course;
	const run = wsMain.select_run;

	const tEpreuve = ski.GetTable('Epreuve');
	const categ = tEpreuve.GetCell('Code_categorie', epreuve-1);
	const sexe = tEpreuve.GetCell('Sexe', epreuve-1);
	
	const label_course = ski.GetInfoEpreuveMulti(epreuve, 'Label_course'+course.toString());
	const nb_judge = parseInt(ski.GetInfoEpreuveMulti(epreuve, 'Nb_juge_course'+course.toString()));

	var html = '';
	wsMain.select_label  = 'Epreuve '+epreuve.toString()+' ['+categ+'/'+sexe+']';
	wsMain.select_label += ' : Course '+course.toString()+' - '+label_course;
	wsMain.select_label += ' : Run '+run.toString();
		
	html += '<h4 class="text-center text-info">'+wsMain.select_label+'</h4>';
	
	const tRanking = ski.GetTableRankingMulti(epreuve);
	if (tRanking !== undefined)
	{
		html += '<table class="table table-striped">';
		html += '<thead class="table-dark"><tr>';
		html += '<th class="text-center" data-sort-header="Dossard">Dossard</th>';
		html += '<th class="text-center" data-sort-header="Identite">Identité</th>';
		html += '<th class="text-center">Style JP</th>';
		
		for (let j=1;j<=nb_judge;j++)
		{
			html += '<th class="text-center">J'+j.toString()+'</th>';
		}
		html += '<th class="text-center">Note</th>';
		html += '<th class="text-center" data-sort-header="'+'Notation_C'+course.toString()+'_M'+run.toString()+'_Clt'+'">Clt</th>';
		html += '</tr></thead>';

		html += '<tbody>';
		
		if (wsMain.sort_column == '')
			wsMain.sort_column = 'Dossard';

		tRanking.OrderBy(wsMain.sort_column);

		const colStyleJp = tRanking.GetIndexColumn('Notation_C'+course.toString()+'_Style_jp_M'+run.toString());
		for (let r=0;r<tRanking.GetNbRows();r++)
		{
			const bib = tRanking.GetCell('Dossard', r);
			var styleJp = '';
			if (colStyleJp >= 0)
				styleJp = tRanking.GetCell(colStyleJp, r);

			html += '<tr data-dossard="'+bib+'">';
			html += '<td class="text-end">'+bib+'</td>';
			html += '<td>'+tRanking.GetCell('Nom', r)+' '+tRanking.GetCell('Prenom', r)+'</td>';
			html += '<td class="text-center">'+styleJp+'</td>';
				
			for (let j=1;j<=nb_judge;j++)
			{
				html += '<td class="text-center" data-juge="'+j.toString()+'">'+tRanking.GetCellDouble('Notation_C'+course.toString()+'_M'+run.toString()+'_J'+j.toString(), r, 1)+'</td>';
			}

			html += '<td class="text-center note" >'+tRanking.GetCellDouble('Notation_C'+course.toString()+'_M'+run.toString(), r, 1)+'</td>';
			const clt = tRanking.GetCellInt('Notation_C'+course.toString()+'_M'+run.toString()+'_Clt', r);
			if (clt >= 1)
				html += '<td class="text-center clt">'+clt.toString()+'</td>';
			else
				html += '<td class="text-center clt">&nbsp;</td>';
		}
		
		html += '</tbody>';
		html += '</table>';
	}
	
	document.getElementById("main").innerHTML = html;
	
	[].forEach.call(document.querySelectorAll('#main table thead th[data-sort-header]'), function(el) {
		const sortColumn = el.getAttribute("data-sort-header");
		el.innerHTML += '&nbsp;'+tRanking.GetSortHeaderImageHTML(sortColumn);
		el.style.cursor = "pointer";
		el.addEventListener('click', function() {
			wsMain.sort_column = sortColumn;
			ShowRanking();
		})
	});
}

function onRefresh()
{
	const cmd = { key:'<epreuve_load>', epreuve:wsMain.select_epreuve, force_refresh:true, fn:'response_EpreuveLoad_refresh'};	
	wsMain.websocket.send(JSON.stringify(cmd));
}

function response_EpreuveLoad_refresh(objJSON) 
{
//	alert("response_EpreuveLoad_refresh :"+JSON.stringify(objJSON));
	
	const epreuve = wsMain.select_epreuve;
	const course = wsMain.select_course;
	const run = wsMain.select_run;
	
	ski.SetEpreuveMulti(objJSON, epreuve);

	const nb_judge = parseInt(ski.GetInfoEpreuveMulti(epreuve, 'Nb_juge_course'+course.toString()));
	const tRanking = ski.GetTableRankingMulti(epreuve);
	if (tRanking !== undefined)
	{
		const colStyleJp = tRanking.GetIndexColumn('Notation_C'+course.toString()+'_Style_jp_M'+run.toString());
		for (let r=0;r<tRanking.GetNbRows();r++)
		{
			const bib = tRanking.GetCell('Dossard',r);
			[].forEach.call(document.querySelectorAll("#main table tr[data-dossard='"+bib+"']"), function(el) {
				for (let j=1;j<=nb_judge;j++)
				{
					const elJuge = el.querySelector("td[data-juge='"+j.toString()+"']");
					if (elJuge !== undefined && typeof elJuge == 'object')
					{
						elJuge.innerHTML = tRanking.GetCellDouble('Notation_C'+course.toString()+'_M'+run.toString()+'_J'+j.toString(), r, 1);
					}
				}

				const elNote = el.querySelector("td.note");
				if (elNote !== undefined && typeof elNote == 'object')
				{
					elNote.innerHTML = tRanking.GetCellDouble('Notation_C'+course.toString()+'_M'+run.toString(), r, 1);
				}

				const elClt = el.querySelector("td.clt");
				if (elClt !== undefined && typeof elClt == 'object')
				{
					const clt = tRanking.GetCellInt('Notation_C'+course.toString()+'_M'+run.toString()+'_Clt', r);
					if (clt >= 1)
						elClt.innerHTML = clt.toString();
					else
						elClt.innerHTML = '&nbsp';
				}

				if (colStyleJp >= 0)
				{
					const styleJp = tRanking.GetCell(colStyleJp, r);
					const elSelect = el.querySelector("td select");
					if (elSelect !== undefined && typeof elSelect == 'object' && elSelect !== null)
					{
						const valueSelect = elSelect.value;
						if (valueSelect != styleJp && styleJp != '')
							elSelect.value = styleJp;
					}
				}
			});
		}
	}
}

////////// Variables globales et Initialisation  //////////
const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	wsMain.select_epreuve = -1;
	wsMain.select_course = -1;
	wsMain.select_run = -1;
	wsMain.select_label = '';
	wsMain.sort_column = '';
	wsMain.refresh_interval = null;
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	wsMain.key_race = '*';
	if (urlParams.has('key_race'))
		wsMain.key_race = urlParams.get('key_race');
	
	wsMain.title = 'Freestyle';
	if (urlParams.has('title'))
		wsMain.title = urlParams.get('title');
	
	document.getElementById('container_title').innerHTML = wsMain.title+'<br>&nbsp;';

	wsMain.lengthIdentity = 35;
	if (urlParams.has('length_identity'))
		wsMain.lengthIdentity = parseInt(urlParams.get('length_identity'));
	
	// Command Notification
	wsMain.SetCommand('<race_load>', OnCommandRaceLoad);
	
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}


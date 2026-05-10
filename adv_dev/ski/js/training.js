function OnOpenWebSocketCommand()
{
//	wsContext.wsCommand.send(JSON.stringify({key : '<competition_load>' }));
	
	var cmd;
	cmd = { key : '<db>',  select : 'Select * From Evenement Order By Code', table : 'Evenement', fn : 'ListCompet' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
	
/*	
	cmd = { key : '<db>',  select : 'Select * From Resultat Where Code_evenement = 2665', table : 'Resultat' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
	
	cmd = { key : '<db>',  select : 'Select * From Evenement Where Code = 2665' , table : 'Evenement'};
	wsContext.wsCommand.send(JSON.stringify(cmd));

	cmd = { key : '<db>',  select : 'Select * From Epreuve Where Code_evenement = 2665', table : 'Epreuve' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
	
	cmd = { key : '<db>',  select : "Select * From Saison Where Code = '2013'", table : 'Saison' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
*/
}

function ListCompet(objJSON) 
{
	if (adv.IsTableUnique(objJSON, 'data'))
	{
		const tCompet = adv.GetTableUnique(objJSON, 'data');
		tCompet.SetColumnAlignment('Code', adv.align_horz.RIGHT);
		tCompet.SetColumnAlignment('Nom', adv.align_horz.CENTER);
		tCompet.SetColumnJSON('Code', { toto: 27, titi: 44 } );

		var html;
		html  = '<table class="table table-striped">';
		html += '<thead class="table-dark">';
		html += '<tr>';
		html += '<th class="text-center">Chrono</th>';
		html += '<th class="text-center" data-sort-header="Code">'+tCompet.GetColumnLabel('Code')+'</th>';
		html += '<th class="text-center" data-sort-header="Nom">'+tCompet.GetColumnLabel('Nom')+'</th>';
		html += '<th class="text-center" data-sort-header="Organisateur">'+tCompet.GetColumnLabel('Organisateur')+'</th>';
		html += '</tr>';
		html += '</thead>';

		html += '<tbody>'
		for (let row = 0; row < tCompet.GetNbRows(); row++)
		{
			const code = tCompet.GetCell('Code', row);
			html += '<tr>';
			html += '<td><button data-code="'+code+'" class="btn btn-warning btn-sm"><img src="/ws_live/bootstrap/icons-1.11.2/clock.svg"></button></td>'
			html += '<td class="text-end">'+code+'</td>';
			html += '<td class="text-center">'+tCompet.GetCell('Nom', row)+'</td>';
			html += '<td>'+tCompet.GetCell('Organisateur', row)+'</td>';
			html += '</tr>';
		}
		html += '</tbody>';
		html += '</table>';

		document.getElementById("main").innerHTML = html;

		[].forEach.call(document.querySelectorAll('#main table tbody tr td button'), function(el) {
			el.addEventListener('click', function() {
				const code_compet = el.getAttribute('data-code');
				DoChrono(code_compet);
			})
		});

		const toto = tCompet.GetColumnJSON('Code');
//		if (toto !== undefined)
//			alert('JSON COL='+JSON.stringify(toto));
//			alert('JSON COL='+typeof toto);
	}
}

function DoChrono(code_compet)
{
	const code_manche = 1;

	var cmd = { key : '<db>',  select : 'Select * From Resultat_Chrono Where Code_evenement = '+code_compet+' And Code_manche = '+code_manche+' Order By Seq Desc', table : 'Resultat_Chrono', fn : 'LoadResultatChrono' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
}

function LoadResultatChrono(objJSON)
{
	if (adv.IsTableUnique(objJSON, 'data'))
	{
		const tResultatChrono = adv.GetTableUnique(objJSON, 'data');

		var html;
		html  = '<div class="row">';
		html += '<div class="col">';
		html += '<h6 class="alert alert-primary text-center" role="alert">Départ</h6>';
		html += ShowResultatChrono(tResultatChrono, 0);
		html += '</div>';
		html += '<div class="col">';
		html += '<h6 class="alert alert-primary text-center" role="alert">Arrivée</h6>';
		html += ShowResultatChrono(tResultatChrono, -1);
		html += '</div>';
		html += '<div class="col">';
		html += '<h6 class="alert alert-primary text-center" role="alert">Résultats</h6>';
		html += '</div>';

		html += '</div>';
		document.getElementById("main").innerHTML = html;
	}
}

function ShowResultatChrono(tResultatChrono, passage)
{
	html  = '<table class="table table-striped">';
	html += '<thead class="table-dark">';
	html += '<tr>';
	html += '<th class="text-center" data-sort-header="Seq">'+tResultatChrono.GetColumnLabel('Seq')+'</th>';
	html += '<th class="text-center" data-sort-header="Dossard">Dos.</th>';
	html += '<th class="text-center" data-sort-header="Heure">'+tResultatChrono.GetColumnLabel('Heure')+'</th>';
	html += '</tr>';
	html += '</thead>';

	html += '<tbody>'
	for (let row = 0; row < tResultatChrono.GetNbRows(); row++)
	{
		if (tResultatChrono.GetCellInt('Id', row) == passage)
		{
			const seq = tResultatChrono.GetCell('Seq', row);
			html += '<tr>';
			html += '<td class="text-end">'+seq+'</td>';
			html += '<td><input type="text" value="'+tResultatChrono.GetCell('Dossard')+'"></td>';
			html += '<td class="text-end">'+tResultatChrono.GetCellFormat('Heure', row, '%2hh%2m:%2s.%3f')+'</td>';
			html += '</tr>';
		}
	}
	html += '</tbody>';
	html += '</table>';

	return html;
}

function OnFlowOnCourse(objJSON) 
{
	if (wsContext.scrolling > 0)
	{
		if (objJSON.epreuve !== undefined)
		{
			if (objJSON.epreuve != GetCurrentEpreuve())
			{
				const cmd = { key : '<epreuve_load>',  epreuve : objJSON.epreuve };
				wsContext.wsCommand.send(JSON.stringify(cmd));
				return;
			}
		}
	}

	const elClock = document.getElementById("clock");
	if (elClock == null)
		return;

	elClock.innerHTML = adv.GetChronoHHMMSSD(objJSON.clock);
	
	const tRanking = ski.GetTableRanking();
	if (typeof tRanking != 'object')
		return;

	const tOnCourse = adv.GetTableUnique(objJSON, 'table');
	const tOnCoursePrev = wsContext.notify_on_course;

	if (typeof tOnCoursePrev == 'object')
	{
		// Suppression des anciens on_course tjs ok ...
		for (let i=0;i<tOnCourse.GetNbRows();i++)
		{
			var bib = tOnCourse.GetCell('bib',i);
			
			for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
			{
				if (tOnCoursePrev.GetCell('bib',k) == bib)
				{
					tOnCoursePrev.RemoveRowAt(k);
					break;
				}
			}
		}
	}
	
	// Traitement on_course ok ...
	for (let i=0;i<tOnCourse.GetNbRows();i++)
	{
		var bib = tOnCourse.GetCell('bib',i);
		for (let j=0;j<tRanking.GetNbRows();j++)
		{
			if (bib == tRanking.GetCell('Dossard', j))
			{
				const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
				if (elemTime && typeof elemTime === "object")
				{
					elemTime.innerHTML = tOnCourse.GetCellChrono('time', i, 'HHMMSSD');
					elemTime.setAttribute('data-oncourse', '1');
				}
				break;
			}
		}
	}

	if (typeof tOnCoursePrev == 'object')
	{
		// Remise en état des anciens on_course ko ...
		for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
		{
			var bib = tOnCoursePrev.GetCell('bib',k);
			for (let j=0;j<tRanking.GetNbRows();j++)
			{
				if (bib == tRanking.GetCell('Dossard', j))
				{
					const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
					if (elemTime && typeof elemTime === "object")
					{
						elemTime.innerHTML = tRanking.GetCellChrono('Tps'+ski.GetCodeManche(), j, 'HHMMSSCC');
						const stateOnCourse = elemTime.getAttribute('data-oncourse');
						if (stateOnCourse == '1')
							elemTime.setAttribute('data-oncourse', '0');
					}
					break;
				}
			}
		}
	}

	wsContext.notify_on_course = tOnCourse;
}

function OnBroadcastModeChrono(objJSON)
{
//	alert('OnBroadcastModeChrono:'+JSON.stringify(objJSON));
}

function OnBroadcastRunErase(objJSON)
{
	if (objJSON.Code_evenement == ski.GetCodeEvenement() && objJSON.Code_manche == ski.GetCodeManche())
	{
		const tOnCourse = wsContext.notify_on_course;
		if (typeof tOnCourse === 'object')
			tOnCourse.RemoveAllRows();
		
		const elem = document.querySelectorAll('#main table tbody tr td[data-oncourse="1"]');
		if (elem && typeof elem === "object" && elem.length >= 1)
		{
			for (let i=0;i<elem.length;i++)
				elem[i].setAttribute('data-oncourse', '0');
		}

		const tRanking = ski.GetTableRanking();
		const manche = ski.GetCodeManche();
		tRanking.SetColumnToNull('Tps_chrono'+manche);
		tRanking.SetColumnToNull('Tps'+manche);
		tRanking.SetColumnToNull('Clt'+manche);
		tRanking.SetColumnToNull('Cltc'+manche);
		
		SetBodyEpreuve(true);
	}
}

function OnBroadcastBibTimeLap(objJSON) 
{
	alert("OnBroadcastBibTimeLap :"+JSON.stringify(objJSON));
}

function OnBroadcastBibTime(objJSON) 
{
//	alert("OnBroadcastBibTime :"+JSON.stringify(objJSON));

	const passage = parseInt(objJSON.passage);
	if (passage >= 1)
		DoBroadcastBibTimeInter(objJSON, passage);
	else
		DoBroadcastBibTimeFinish(objJSON);
}

function OnBroadcastBibNext(objJSON) 
{
//	alert("OnBroadcastBibNext :"+JSON.stringify(objJSON));
	if (ski.GetCodeActivite() == 'SAUT' && objJSON.bib !== null)
	{
		wsContext.bib_current = parseInt(objJSON.bib);

		const elClock = document.getElementById("clock");
		if (elClock !== null)
			elClock.innerHTML = objJSON.bib;
		
		SetBodyEpreuve(true);
	}
}

function OnBroadcastBibSave(objJSON) 
{
	if (ski.GetCodeActivite() == 'SAUT' && objJSON.bib !== null)
	{
		wsContext.bib_save = parseInt(objJSON.bib);
	}
}

function OnBroadcastRankingLoad(objJSON) 
{
//	alert("OnBroadcastRankingLoad :"+JSON.stringify(objJSON));
	if (ski.GetCodeActivite() == 'SAUT' || ski.GetCodeActivite() == 'CN')
	{
		ski.SetEpreuve(objJSON);

		const tRanking = ski.GetTableRanking();
		const manche = ski.GetCodeManche();
		if (manche == 1)
		{
			tRanking.OrderBy('Clt1, Rang1');
		}
		else
		{
			for (let i=0;i<tRanking.GetNbRows();i++)
			{
				if (tRanking.GetCellInt('Clt2', i) > 0)
					tRanking.SetCell('Clt_best',i, tRanking.GetCellInt('Clt',i));
				else
					tRanking.SetCell('Clt_best',i, -1);
			}
			
			tRanking.OrderBy('Clt_best, Rang2');
		}
	
		SetBodyEpreuve(true);
	}
}

function DoBroadcastBibTimeFinish(objJSON) 
{
	const bib = objJSON.bib;
	const tRanking = ski.GetTableRanking();
	const manche = ski.GetCodeManche();
	
	const tOnCoursePrev = wsContext.notify_on_course;
	if (tOnCoursePrev && typeof tOnCoursePrev === "object")
	{
		for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
		{
			if (tOnCoursePrev.GetCell('bib',k) == bib)
			{
				tOnCoursePrev.RemoveRowAt(k);
				break;
			}
		}
	}
	
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (bib == tRanking.GetCell('Dossard', i))
		{
			tRanking.SetCell('Tps_chrono'+manche,i, objJSON.time_chrono);
			tRanking.SetCell('Tps'+manche,i, objJSON.time_chrono);
	
			tRanking.UpdateRankingTime(i, tRanking.GetIndexColumn('Tps'+manche), tRanking.GetIndexColumn('Clt'+manche), tRanking.GetCellInt('Tps'+manche,i), objJSON.time_chrono);
			const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
			if (elemTime && typeof elemTime === "object")
			{
				const time_chrono = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
				if (objJSON.diff === undefined)
				{
					elemTime.innerHTML = time_chrono;
					elemTime.setAttribute('data-oncourse', '2');
				}
				else
				{
					elemTime.innerHTML = time_chrono+' ['+adv.GetChronoDiffMMSSCC(objJSON.diff)+']';
					if (objJSON.diff > 0)
						elemTime.setAttribute('data-oncourse', 'red');
					else
						elemTime.setAttribute('data-oncourse', 'green');
				}

				window.setTimeout(function() { 
					elemTime.setAttribute('data-oncourse', '3');
					window.setTimeout(function() { 
						elemTime.innerHTML = time_chrono; 
						ReOrder();
						const elemTimeReorder = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
						if (elemTimeReorder && typeof elemTimeReorder === "object")
						{
							elemTimeReorder.setAttribute('data-oncourse', 'yellow');
							window.setTimeout(function() {elemTimeReorder.setAttribute('data-oncourse', '0')}, 3000);
						}
					}, 3000);
				} , 1000);
			}
			
			// Ré-Affichage Colonne Clt
			for (let k=0;k<tRanking.GetNbRows();k++)
			{
				const elemRank = document.querySelector('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank');
				if (elemRank && typeof elemRank === "object")
				{
					elemRank.innerHTML = tRanking.GetCellRank('Clt'+manche, k);
				}
			}
		}
	}
}

function ReOrder()
{
	const tRanking = ski.GetTableRanking();
	const manche = ski.GetCodeManche();

	if (manche == 1)
		tRanking.OrderBy('Clt1,Heure_depart1, Rang1');
	else
		tRanking.OrderBy('Clt,Heure_depart2, Rang2');

	SetBodyEpreuve();
}

function DoBroadcastBibTimeInter(objJSON, inter) 
{
	const bib = objJSON.bib;
	const tRanking = ski.GetTableRanking();
	const manche_inter = ski.GetCodeManche()+'_inter'+inter;
		
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (bib == tRanking.GetCell('Dossard', i))
		{
			tRanking.UpdateRankingTime(i, tRanking.GetIndexColumn('Tps'+manche_inter), tRanking.GetIndexColumn('Clt'+manche_inter), tRanking.GetCellInt('Tps'+manche_inter,i), objJSON.time_chrono);

			const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time_inter[data-inter="'+inter+'"]');
			if (elemTime && typeof elemTime === "object")
			{
				if (objJSON.diff === undefined)
				{
					elemTime.innerHTML = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
				}
				else
				{
					const time_inter = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
					elemTime.innerHTML = time_inter+' ['+adv.GetChronoDiffMMSSCC(objJSON.diff)+']';

					if (objJSON.diff > 0)
						elemTime.setAttribute('data-oncourse', 'red');
					else
						elemTime.setAttribute('data-oncourse', 'green');

					window.setTimeout(function() { 
						elemTime.setAttribute('data-oncourse', 'end');
						window.setTimeout(function() { elemTime.innerHTML = time_inter; elemTime.setAttribute('data-oncourse', '0') }, 3000);
						} , 4000
					);
				}
			}
			
			for (let k=0;k<tRanking.GetNbRows();k++)
			{
				const elemRank = document.querySelector('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank_inter[data-inter="'+inter+'"');
				if (elemRank && typeof elemRank === "object")
				{
					elemRank.innerHTML = tRanking.GetCellRank('Clt'+manche_inter, k);
				}
			}
			
			break;
		}
	}	
}

function RefreshFinishTime(tRanking, row, newTps)
{
	const manche = ski.GetCodeManche();
	const bib = tRanking.GetCell('Dossard', row);

	const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
	if (elemTime && typeof elemTime === "object")
	{
		elemTime.innerHTML = adv.GetChronoXSCC(newTps);
		
		if (newTps >= adv.chrono.OK)
		{
			if (tRanking.GetCellInt('Clt'+manche, row) == 1)
				elemTime.setAttribute('data-oncourse', 'green');
			else
				elemTime.setAttribute('data-oncourse', 'red');
		
			window.setTimeout(function() { 
				elemTime.setAttribute('data-oncourse', '3');
				window.setTimeout(function() { 
					ReOrder();
					const elemTimeReorder = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
					if (elemTimeReorder && typeof elemTimeReorder === "object")
					{
						elemTimeReorder.setAttribute('data-oncourse', 'yellow');
						window.setTimeout(function() {elemTimeReorder.setAttribute('data-oncourse', '0')}, 3000);
					}
				}, 3000);
			} , 1000);
		}
	}
	
	for (let k=0;k<tRanking.GetNbRows();k++)
	{
		const elemRank = document.querySelector('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank');
		if (elemRank && typeof elemRank === "object")
		{
			elemRank.innerHTML = tRanking.GetCellRank('Clt'+manche, k);
		}
	}
}

function OnCommandCompetitionLoad(objJSON) 
{
	alert("OnCommandCompetitionLoad :"+JSON.stringify(objJSON));

	wsContext.notify_competitions = objJSON;

	document.getElementById("container_message").innerHTML = '';
	document.getElementById("navigation_epreuve").style.display = 'none';

	const tCompetitions = adv.GetTableUnique(wsContext.notify_competitions, 'competitions');

	var html;
	html  = '<table class="table table-striped">';

	html += '<thead><tr>';
	html += '<th class="text-center">'+GetTraduction('Codex')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Activité')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Nom')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Date')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Disc.')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Categ.')+'</th>';
	html += '<th class="text-center">'+GetTraduction('Sexe.')+'</th>';
	html += '<th class="text-center">'+GetTraduction('On line')+'</th>';
	html += '</tr></thead>';

	html += '<tbody>';
	for (let r = 0; r < tCompetitions.GetNbRows(); r++)
	{
		const key = tCompetitions.GetCell('key', r);
		const disc = tCompetitions.GetCell('Code_discipline', r);
		const categ = tCompetitions.GetCell('Code_categorie', r);
		const sexe = tCompetitions.GetCell('Sexe', r);
		
		html += '<tr>'
		html += '<td class="text-center"><a href="#" data-key="'+key+'" data-disc="'+disc+'" data-categ="'+categ+'" data-sexe="'+sexe+'">'+key+'</a></td>';
		html += '<td class="text-center">'+tCompetitions.GetCell('Code_activite', r)+'</td>';
		html += '<td class="text-center">'+tCompetitions.GetCell('Nom', r)+'</td>';
		html += '<td class="text-center">'+tCompetitions.GetCell('Date_epreuve', r)+'</td>';
		html += '<td class="text-center">'+disc+'</td>';
		html += '<td class="text-center">'+categ+'</td>';
		html += '<td class="text-center">'+sexe+'</td>';

        if (tCompetitions.GetCellInt('active', r) == 1)
            html += '<td class="text-center"><img width="24" height="24" src="./img/32x32_online.png"></td>';
        else
            html += '<td class="text-center">-</td>';

		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	document.getElementById("main").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#main table td a'), function(el) {
		el.addEventListener('click', function() {
			DoLive(el);
		})
	})
}

function DoLive(el) 
{
	if (el !== null)
	{
		const key = el.getAttribute('data-key');
		const disc = el.getAttribute('data-disc');
		
		//	alert("Key Race ="+key+" / "+disc);

		if (disc == 'KO')
		{
			const categ = el.getAttribute('data-categ');
			const sexe = el.getAttribute('data-sexe');
			
			window.location.href = './live_ko.html?key_race='+key+'&title=Ko-Sprint<br>'+categ+ ' - '+sexe;		
		}
		else
		{	
			const cmd = { key:'<race_load>', key_race:key };
			wsContext.wsCommand.send(JSON.stringify(cmd));
		}
	}
}

function OnCommandRaceLoad(objJSON) 
{
	ski.SetRace(objJSON);

	SetArrayColumns();
	if (ski.GetCodeActivite() == "SAUT" || ski.GetCodeActivite() == "CN")
	{
		const cmd = { key : '<epreuve_load>',  epreuve : '' };
		wsContext.wsCommand.send(JSON.stringify(cmd));
	}
	else
	{
		document.getElementById("navigation_epreuve").style.display = 'block';
		document.getElementById("container_message").innerHTML = '';
		
		SetBodyHeader();
		SetBodyEpreuves();
	}
}

function SetBodyHeader() 
{
	const tEvenement = ski.GetTable('Evenement');
	const tEpreuve = ski.GetTable('Epreuve');

	document.getElementById("title").innerHTML = tEvenement.GetCell('Nom', 0);
	document.getElementById("sub_title").innerHTML = tEvenement.GetCell('Codex', 0)+' - Manche '+ski.GetCodeManche();
}

function GetTraduction(key)
{
	if (wsContext.traduction[key] == undefined)
		return key;
	else
		if (wsContext.lang == 'en')
			return wsContext.traduction[key].en;
		else
			return wsContext.traduction[key].fr;
}

function GetTraductionStateHTML(state) 
{
	if (wsContext.lang == 'en')
	{
		if (state == '1')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_1.png">&nbsp;Waiting'; 
		else if (state == '2')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_2.png">&nbsp;Programmed'; 
		else if (state == '3')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_3.png">&nbsp;In progress'; 
		else if (state == '4')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_4.png">&nbsp;Unofficial'; 
		else if (state == '5')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_5.png">&nbsp;Official'; 
		else
			return state;
	}
	else 
	{
		if (state == '1')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_1.png">&nbsp;En attente'; 
		else if (state == '2')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_2.png">&nbsp;Programmée'; 
		else if (state == '3')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_3.png">&nbsp;En cours'; 
		else if (state == '4')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_4.png">&nbsp;Officieux'; 
		else if (state == '5')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_5.png">&nbsp;Officiel'; 
		else
			return state;
	}
}

function Refresh()
{
	if (typeof ski.GetTableRanking() === 'object')
		ReOrder();
	else if (typeof ski.GetTable("Evenement") == "object")
		ShowEpreuves();
}

function PrevEpreuve()
{
	const tEpreuve = ski.GetTable('Epreuve');
	const epreuve = GetCurrentEpreuve();

	for (let r = 0; r < tEpreuve.GetNbRows(); r++)
	{
		if (tEpreuve.GetCellInt('Code_epreuve', r) == epreuve)
		{
			--r;
			if (r >= 0)
			{
				const cmd = { key : '<epreuve_load>',  epreuve : tEpreuve.GetCellInt('Code_epreuve', r) };
				wsContext.wsCommand.send(JSON.stringify(cmd));
			}
			break;
		}
	}
}

function NextEpreuve()
{
	const tEpreuve = ski.GetTable('Epreuve');
	const epreuve = GetCurrentEpreuve();
	for (let r = 0; r < tEpreuve.GetNbRows(); r++)
	{
		if (tEpreuve.GetCellInt('Code_epreuve', r) == epreuve)
		{
			++r;
			if (r < tEpreuve.GetNbRows())
			{
				const cmd = { key : '<epreuve_load>',  epreuve : tEpreuve.GetCellInt('Code_epreuve', r) };
				wsContext.wsCommand.send(JSON.stringify(cmd));
			}
			break;
		}
	}
}

function ShowEpreuves()
{
	SetBodyEpreuves();
}

function ShowPDF()
{
	const cmd = { key:'<pdf>',  type:'res' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
/*
	const cmd = { key:'<ping>',  type:'res2' };
	wsContext.wsCommand.send(JSON.stringify(cmd));
*/
}

function SetBodyEpreuves() 
{
	const tEpreuve = ski.GetTable('Epreuve');

	var html;
	html  = '<table class="table table-striped">';
	html += '<thead><tr>';
	html += '<th class="text-center">'+GetTraduction('categ')+'</th>';
	html += '<th class="text-center">'+GetTraduction('sex')+'</th>';
	html += '<th class="text-center">'+GetTraduction('distance')+'</th>';
	html += '<th class="text-center">'+GetTraduction('state')+'</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	for (let r = 0; r < tEpreuve.GetNbRows(); r++)
	{
		var state = '4';
			
		html += '<tr>'
		html += '<td class="text-center">'+tEpreuve.GetCell('Code_categorie', r)+'</td>';
		html += '<td class="text-center">'+tEpreuve.GetCell('Sexe', r)+'</td>';
		html += '<td class="text-center">'+tEpreuve.GetCell('Distance', r)+'</td>';
		html += '<td class="text-center"><button data-row="'+r.toString()+'">'+GetTraductionStateHTML(state)+'</button></td>';
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	document.getElementById("main").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#main table td button'), function(el) {
		el.addEventListener('click', function() {
			const r = parseInt(el.getAttribute("data-row"));
			const epreuve = tEpreuve.GetCell('Code_epreuve', r);
//			const cmd = { key : '<epreuve_load>',  epreuve : epreuve };
			const cmd = { key : '<epreuve_load>' };
			wsContext.wsCommand.send(JSON.stringify(cmd));
		})
	})
}

function OnCommandEpreuveLoad(objJSON) 
{
//	alert("OnCommandEpreuveLoad :"+JSON.stringify(objJSON));

	if (ski.GetCodeActivite() == "SAUT" || ski.GetCodeActivite() == "CN")
	{
		OnBroadcastRankingLoad(objJSON);
	}
	else
	{
		ski.SetEpreuve(objJSON);

		const tRanking = ski.GetTableRanking();
		const manche = ski.GetCodeManche();
		
		if (manche == 1)
			tRanking.OrderBy('Clt1,Heure_depart1,Rang1');
		else
			tRanking.OrderBy('Clt,Heure_depart2,Rang2');

		document.getElementById("navigation_prev").classList.remove('disabled');
		document.getElementById("navigation_next").classList.remove('disabled');

		SetBodyEpreuve(true);
	}
}

function OnCommandPDF(objJSON) 
{
//	alert("OnCommandPDF :"+JSON.stringify(objJSON));
//	window.open(objJSON.url, '_blank');

	// open after a timeout
	setTimeout(() => window.open(objJSON.url,'_blank'), 250);
}

function OnCommandDebug(objJSON) 
{
	alert("OnCommandDebug :"+JSON.stringify(objJSON));
}

function OnCommandPing(objJSON) 
{
//	alert("OnCommandPing :"+JSON.stringify(objJSON));
}

function OnCommandDatabase(objJSON) 
{
//	alert("OnCommandDatabase :"+JSON.stringify(objJSON));
	if (objJSON.fn !== undefined)
	{
		window[objJSON.fn](objJSON);
		return;
	}
	
	if (adv.IsTableUnique(objJSON, 'data'))
	{
		const t = adv.GetTableUnique(objJSON, 'data');
		alert(t.ToHTML());
	}
}

function filterDossard(table, itemRow)
{
	const bib = table.GetInt(itemRow, 'Dossard');
	if (bib > 3 && bib < 10)
		return true;
	else
		return false;
}

function SetArrayColumns() 
{
	wsContext.array_columns.length = 0;
	
	wsContext.array_columns.push({ "name" : "Clt", "label" : GetTraduction('rk'), "style" : "rank", "context" : "manche" });
	wsContext.array_columns.push({ "name" : "Dossard", "label" : GetTraduction('bib'), "style" : "bib" });
	wsContext.array_columns.push({ "name" : "Identite", "label" : GetTraduction('name'), "style" : "name" });
	wsContext.array_columns.push({ "name" : "Sexe", "label" : GetTraduction('sex'), "style" : "name" });
	wsContext.array_columns.push({ "name" : "Categ", "label" : GetTraduction('categ'), "style" : "name" });
	
	if (ski.GetCodeEntite() == 'FIS')
		wsContext.array_columns.push({ "context" : "Nation" });

	wsContext.array_columns.push({ "name" : "Club", "label" : GetTraduction('club'), "style" : "club" });
	wsContext.array_columns.push({ "context" : "inter_chrono" });
	wsContext.array_columns.push({ "name" : "Tps_chrono", "label" : GetTraduction('time_finish'), "style" : "time", "context" : "finish_start", "fmt" : 'HHMMSSCC'});
}

function GetCurrentEpreuve()
{
	if (typeof wsContext.notify_epreuve === 'object')
		return parseInt(wsContext.notify_epreuve.epreuve);
	else
		return 1;
}

function SetBodyEpreuveSAUT()
{
	const tRanking = ski.GetTableRanking();
	const manche = ski.GetCodeManche();
	const currentEpreuve = GetCurrentEpreuve();

	const elEpreuve = document.getElementById("sel_epreuve");
	if (elEpreuve != null)
	{
		elEpreuve.innerHTML = ski.GetStringEpreuve(currentEpreuve);
	}

	const elSubTitle = document.getElementById("sub_title");
	if (elSubTitle != null)
	{
		elSubTitle.innerHTML = GetTraduction('run')+' '+manche;
	}
	
	var html;
	html  = '<table class="table table-striped">';
	html += '<thead class="table-dark" id="onCourseHeader"><tr>';
	for (var i=0;i<wsContext.array_columns.length;i++)
	{
		if (wsContext.array_columns[i].hasOwnProperty('context'))
		{
			const columnContext = wsContext.array_columns[i].context;
			if (columnContext == 'manche')
			{
				var columnName = wsContext.array_columns[i].name
				if (manche == 1)
					columnName += "1";
				
				const style = wsContext.array_columns[i].style;
				var text_align = "text-center";
				if (style == 'rank' || style == 'chrono' || style == 'time')
					text_align = "text-end";
				html += '<th class="'+text_align+'" data-sort-header="'+columnName+'">'+wsContext.array_columns[i].label+'</th>';
			}
			else if (columnContext == 'finish_start')
			{
				if (manche == 1)
				{				
					html += '<th class="text_end" data-sort-header="Vitesse1">Vit</th>';
					html += '<th class="text_end" data-sort-header="NoteCompensation1">Plt</th>';
					html += '<th class="text_end" data-sort-header="Longueur1">Lg</th>';
					html += '<th class="text_end" data-sort-header="NoteLongueur1">P.Lg</th>';
					html += '<th class="text_end" data-sort-header="NoteA1">A</th>';
					html += '<th class="text_end" data-sort-header="NoteB1">B</th>';
					html += '<th class="text_end" data-sort-header="NoteC1">C</th>';
					html += '<th class="text_end" data-sort-header="NoteD1">D</th>';
					html += '<th class="text_end" data-sort-header="NoteE1">E</th>';
					html += '<th class="text_end" data-sort-header="NoteStyle1">Style</th>';
					html += '<th class="text_end" data-sort-header="Note1">Total M1</th>';
				}
				else
				{
					html += '<th class="text_end" data-sort-header="Note1">Tot.M1</th>';
					html += '<th class="text_end" data-sort-header="Clt1">Clt1</th>';
					html += '<th class="text_end" data-sort-header="Vitesse2">Vit2</th>';
					html += '<th class="text_end" data-sort-header="NoteCompensation2">Plt2</th>';
					html += '<th class="text_end" data-sort-header="Longueur2">Lg2</th>';
					html += '<th class="text_end" data-sort-header="NoteLongueur2">P.Lg2</th>';
					html += '<th class="text_end" data-sort-header="NoteA2">A</th>';
					html += '<th class="text_end" data-sort-header="NoteB2">B</th>';
					html += '<th class="text_end" data-sort-header="NoteC2">C</th>';
					html += '<th class="text_end" data-sort-header="NoteD2">D</th>';
					html += '<th class="text_end" data-sort-header="NoteE2">E</th>';
					html += '<th class="text_end" data-sort-header="NoteStyle2">Style2</th>';
					html += '<th class="text_end" data-sort-header="Note2">Tot.M2</th>';
					html += '<th class="text_end" data-sort-header="Clt2">Clt2</th>';
					html += '<th class="text_end" data-sort-header="Note">Total</th>';
				}
			}
			else if (columnContext == "nation")
			{
				html += '<th class="text-center" data-sort-header="Code_nation">Nation</td>';
			}
		}
		else
		{
			const style = wsContext.array_columns[i].style;
			var text_align = "text-center";
			if (style == 'rank' || style == 'chrono' || style == 'time')
				text_align = "text-end";
			html += '<th class="'+text_align+'" data-sort-header="'+wsContext.array_columns[i].name+'">'+wsContext.array_columns[i].label+'</th>';
		}
	}
	html += '</tr></thead>';
	html += '<tbody id="onCourse">'

	var rMin = 0;
	var rMax = tRanking.GetNbRows()-1;
	for (let r = rMin; r<=rMax; r++)
	{
		var bib = tRanking.GetCell('Dossard', r);
		html += '<tr ';
		if (parseInt(bib) == wsContext.bib_save)
			html += ' class="bib_save" ';
		else if (parseInt(bib) == wsContext.bib_current)
			html += ' class="bib_current" ';
		html += 'data-bib="'+bib+'">'

		for (var i=0;i<wsContext.array_columns.length;i++)
		{
			if (wsContext.array_columns[i].hasOwnProperty('context'))
			{
				const columnContext = wsContext.array_columns[i].context;
				if (columnContext == 'manche')
				{
					var columnName = wsContext.array_columns[i].name;
					if (manche == 1)
						columnName += "1";
				
					if (wsContext.array_columns[i].hasOwnProperty('fmt'))
						html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(columnName, r, wsContext.array_columns[i].fmt)+'</td>';
					else
						html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(columnName, r)+'</td>';
				}
				else if (columnContext == 'finish_start')
				{
					var lg = tRanking.GetCellFormat('Longueur'+manche, r);
					if (lg != '')
						lg = (parseFloat(lg)/10).toFixed(1);

					var vit = tRanking.GetCellFormat('Vitesse'+manche, r);
					if (vit != '')
						vit = (parseFloat(vit)/10).toFixed(1);

					if (vit.length > 0)
						vit += 'km/h';
					
					if (manche == 1)
					{
						html += '<th class="text_end">'+vit+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteCompensation1', r, '1')+'</th>';
						html += '<th class="text_end">'+lg+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteLongueur1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteA1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteB1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteC1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteD1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteE1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteStyle1', r, '1')+'</th>';
						html += '<th class="text_end">'+ski.GetSautNote(tRanking, r, 1)+'</th>';
					}
					else
					{
						html += '<th class="text_end">'+tRanking.GetCellFormat('Note1', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('Clt1', r)+'</th>';
						html += '<th class="text_end">'+vit+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteCompensation2', r, '1')+'</th>';
						html += '<th class="text_end">'+lg+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteLongueur2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteA2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteB2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteC2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteD2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteE2', r, '1')+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('NoteStyle2', r, '1')+'</th>';
						html += '<th class="text_end">'+ski.GetSautNote(tRanking, r, 2)+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('Clt2', r)+'</th>';
						html += '<th class="text_end">'+tRanking.GetCellFormat('PtsClt', r, '1')+'</th>';
					}
				}
				else if (columnContext == "nation")
				{
					const code_nation = tRanking.GetCell('Code_nation', r);
					var img_nation = "./img/Flags/empty.png";
					if (code_nation != '')
						img_nation = "./img/Flags/"+code_nation+".png";
					
					html += '<td class="nation">'+code_nation+'&nbsp;<img src="'+img_nation+'" alt="" height="16" width="16" /></td>';
				}
			}
			else
			{
				if (wsContext.array_columns[i].hasOwnProperty('fmt'))
				{
					const fmt = wsContext.array_columns[i].fmt;
					html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(wsContext.array_columns[i].name, r, fmt)+'</td>';
				}
				else
				{
					html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(wsContext.array_columns[i].name, r)+'</td>';
				}
			}
		}
		
		html += '</tr>';
	}
	
	html += '</tbody>';
	html += '</table>';
	
	document.getElementById("main").innerHTML = html;
	
	[].forEach.call(document.querySelectorAll('#main table thead th[data-sort-header]'), function(el) {
		const sortColumn = el.getAttribute("data-sort-header");
		el.innerHTML += '&nbsp;'+tRanking.GetSortHeaderImageHTML(sortColumn);
		el.style.cursor = "pointer";
		el.addEventListener('click', function() {
			if (sortColumn == "Clt"+ski.GetCodeManche())
			{
				tRanking.OrderBy(sortColumn+', Rang'+ski.GetCodeManche());
			}
			else
			{
				tRanking.SortHeaderColumn(sortColumn);
			}
			
			SetBodyEpreuve();
		})
	});

}

function SetBodyEpreuve(changeScrolling=false)
{
	if (ski.GetCodeActivite() == "SAUT" || ski.GetCodeActivite() == "CN")
	{
		SetBodyEpreuveSAUT(changeScrolling);
		return;
	}

	if (changeScrolling)
	{
		if (wsContext.scrolling_timeout != null)
		{
			window.clearTimeout(wsContext.scrolling_timeout);
			wsContext.scrolling_timeout = null;
		}
	}
	
	const tRanking = ski.GetTableRanking();
	const manche = ski.GetCodeManche();
	const nbInter = ski.GetNbInter();
	const currentEpreuve = GetCurrentEpreuve();
	
	const elEpreuve = document.getElementById("sel_epreuve");
	if (elEpreuve != null)
	{
		elEpreuve.innerHTML = ski.GetStringEpreuve(currentEpreuve);
	}

	const elSubTitle = document.getElementById("sub_title");
	if (elSubTitle != null)
	{
		elSubTitle.innerHTML = GetTraduction('run')+' '+manche;
	}
	
	var html;
	html  = '<table class="table table-striped">';
	html += '<thead class="table-dark" id="onCourseHeader"><tr>';
	for (var i=0;i<wsContext.array_columns.length;i++)
	{
		if (wsContext.array_columns[i].hasOwnProperty('context'))
		{
			const columnContext = wsContext.array_columns[i].context;
			if (columnContext == 'manche' || columnContext == 'finish_start')
			{
				const columnName = wsContext.array_columns[i].name + manche;
				const style = wsContext.array_columns[i].style;
				var text_align = "text-center";
				if (style == 'rank' || style == 'chrono' || style == 'time')
					text_align = "text-end";
				html += '<th class="'+text_align+'" data-sort-header="'+columnName+'">'+wsContext.array_columns[i].label+'</th>';
			}
			else if (columnContext == "inter_chrono")
			{
				for (let k=1;k<=nbInter;k++)
				{
					html += '<th class="text-end" data-sort-header="Clt'+manche+'_inter'+k+'" colspan="2">Inter'+k+'</td>';
				}
			}
			else if (columnContext == "nation")
			{
				html += '<th class="text-center" data-sort-header="Code_nation">Nation</td>';
			}
		}
		else
		{
			const style = wsContext.array_columns[i].style;
			var text_align = "text-center";
			if (style == 'rank' || style == 'chrono' || style == 'time')
				text_align = "text-end";
			html += '<th class="'+text_align+'" data-sort-header="'+wsContext.array_columns[i].name+'">'+wsContext.array_columns[i].label+'</th>';
		}
	}
	html += '</tr></thead>';
	
	html += '<tbody id="onCourse">'
	
	var rMin = 0;
	var rMax = tRanking.GetNbRows()-1;
	if (wsContext.scrolling > 0)
	{
		rMin = wsContext.scrolling_start;
		rMax = rMin + wsContext.scrolling-1;
		if (rMax > tRanking.GetNbRows()-1)
			rMax = tRanking.GetNbRows()-1;
	}
	
	for (let r = rMin; r<=rMax; r++)
	{
		var bib = tRanking.GetCell('Dossard', r);
		html += '<tr data-bib="'+bib+'">'

		for (var i=0;i<wsContext.array_columns.length;i++)
		{
			if (wsContext.array_columns[i].hasOwnProperty('context'))
			{
				const columnContext = wsContext.array_columns[i].context;
				if (columnContext == 'manche')
				{
					const columnName = wsContext.array_columns[i].name + manche;
					if (wsContext.array_columns[i].hasOwnProperty('fmt'))
						html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(columnName, r, wsContext.array_columns[i].fmt)+'</td>';
					else
						html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(columnName, r)+'</td>';
				}
				else if (columnContext == 'finish_start')
				{
					const columnName = wsContext.array_columns[i].name + manche;
					const columnFmt = wsContext.array_columns[i].fmt;
					let tps = tRanking.GetCellInt(columnName, r, adv.chrono.KO);
					if (tps != adv.chrono.KO)
						html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(columnName,r,columnFmt)+'</td>';
					else
					{
						const heure_dep = tRanking.GetCellFormat('Heure_depart'+manche,r,'HHMMSS');
						if (heure_dep.length >= 2)
							html += '<td class="'+wsContext.array_columns[i].style+'">['+heure_dep+']</td>';
						else
							html += '<td class="'+wsContext.array_columns[i].style+'">['+tRanking.GetCell('Rang'+manche,r)+']</td>';
					}
				}
				else if (columnContext == "inter_chrono")
				{
					for (let k=1;k<=nbInter;k++)
					{
						html += '<td class="rank_inter" data-inter="'+k+'">'+tRanking.GetCellRank('Clt'+manche+'_inter'+k, r)+'</td>';
						html += '<td class="time_inter" data-inter="'+k+'">'+tRanking.GetCellChrono('Tps'+manche+'_inter'+k, r, 'HHMMSSCC')+'</td>';
					}
				}
				else if (columnContext == "nation")
				{
					const code_nation = tRanking.GetCell('Code_nation', r);
					var img_nation = "./img/Flags/empty.png";
					if (code_nation != '')
						img_nation = "./img/Flags/"+code_nation+".png";
					
					html += '<td class="nation">'+code_nation+'&nbsp;<img src="'+img_nation+'" alt="" height="16" width="16" /></td>';
				}
			}
			else
			{
				if (wsContext.array_columns[i].hasOwnProperty('fmt'))
				{
					const fmt = wsContext.array_columns[i].fmt;
					html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(wsContext.array_columns[i].name, r, fmt)+'</td>';
				}
				else
				{
					html += '<td class="'+wsContext.array_columns[i].style+'">'+tRanking.GetCellFormat(wsContext.array_columns[i].name, r)+'</td>';
				}
			}
		}
		
		html += '</tr>';
	}
	html += '</tbody>';
	
	html += '</table>';
	
	document.getElementById("main").innerHTML = html;
	
	if (changeScrolling)
	{
		if (wsContext.scrolling > 0)
		{
			wsContext.scrolling_start = rMax+1;
			if (wsContext.scrolling_start > tRanking.GetNbRows()-1)
				wsContext.scrolling_start = 0;

			wsContext.scrolling_timeout = window.setTimeout(function () { SetBodyEpreuve(true); }, wsContext.scrolling_delay);
		}
	}
	
	[].forEach.call(document.querySelectorAll('#main table thead th[data-sort-header]'), function(el) {
		const sortColumn = el.getAttribute("data-sort-header");
		el.innerHTML += '&nbsp;'+tRanking.GetSortHeaderImageHTML(sortColumn);
		el.style.cursor = "pointer";
		el.addEventListener('click', function() {
			if (sortColumn == "Clt"+ski.GetCodeManche())
			{
				tRanking.OrderBy(sortColumn+',Heure_depart'+ski.GetCodeManche()+', Rang'+ski.GetCodeManche());
			}
			else
			{
				tRanking.SortHeaderColumn(sortColumn);
			}
			
			SetBodyEpreuve();
		})
	});
} 

function Init()
{
	wsContext.url = wsParams.url;
	wsContext.port = wsParams.port;
	wsContext.lang = 'fr';
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	
	if (urlParams.has('lang'))
		wsContext.lang = urlParams.get('lang')
	
	// Command Notification
	wsContext.mapCommand.set('<competition_load>', OnCommandCompetitionLoad);
	wsContext.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsContext.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);
	wsContext.mapCommand.set('<ping>', OnCommandPing);
	wsContext.mapCommand.set('<db>', OnCommandDatabase);
	
	wsContext.mapCommand.set('<*>', OnCommandDebug);
	wsContext.mapCommand.set('*', OnCommandDebug);
	
	// Broadcast Notification
	wsContext.mapCommand.set('<bib_time>', OnBroadcastBibTime);
	wsContext.mapCommand.set('<bib_time_lap>', OnBroadcastBibTimeLap);
	wsContext.mapCommand.set('<bib_next>', OnBroadcastBibNext);
	wsContext.mapCommand.set('<bib_save>', OnBroadcastBibSave);
	wsContext.mapCommand.set('<ranking_load>', OnBroadcastRankingLoad);

	wsContext.mapCommand.set('<mode_chrono>', OnBroadcastModeChrono);
	wsContext.mapCommand.set('<run_erase>', OnBroadcastRunErase);
	
	// Flow Notification
	wsContext.mapCommand.set('<on_course>', OnFlowOnCourse);

	// Ouverture ws 
	wsContext.OpenWebSocketCommand(OnOpenWebSocketCommand);
	
	// Navigation 
	[].forEach.call(document.querySelectorAll('ul#navigation li a'), function(el) {
		el.addEventListener('click', function() {
			const nav = el.getAttribute('data-nav');
			if (nav == 'epreuve') SetBodyEpreuves();
			else if (nav == 'refresh') document.location.reload();
		})
	})
	
	wsContext.bib_current = -1;
	wsContext.bib_save = -1;
}

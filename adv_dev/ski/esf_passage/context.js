function InitContext(paramsJSON)
{
	myContext.mode = 'esf_passage';

	myContext.htmlClassGroup = function(class_group)
	{
		if (class_group == 'my_table') return 'my_table table table-striped';
		else if (class_group == 'my_thead') return 'my_thead table-dark';
		else return class_group;
	}

	myContext.OnHeader = function()
	{
		const container = myContext.container_header;
		if (container != null && typeof container === 'object')
		{
			const tEvenement = ski.GetTable('Evenement');

			var html = '';
			html += '<div>';

			html += '<h1>'+tEvenement.GetCell('Commentaire_Live', 0)+'</h1>';
			html += '<h2>'+tEvenement.GetCell('Nom', 0)+'</h2>';
			html += '<h5>Résultats Officieux</h5>';
			 
			html += '<div class="row" id="row_marquee">';
			html += '<div class="col-3" id="label_marquee">&nbsp;</div>';
			html += '<div class="col-6" id="marquee"><span id="msg">&nbsp;</span></div>';
			html += '<div class="col-3"></div>';
			html += '</div>';
		
			html += '</div>';
			
			container.innerHTML = html;
			myContext.container_msg = document.getElementById('msg');
		}
	}

	myContext.OnClock = function(objJSON)
	{
		const elClock = document.getElementById("clock");
		if (elClock !== null)
		{
			elClock.innerHTML = adv.GetChronoHHMMSSD(objJSON.clock);
			myContext.current_clock = objJSON.clock;
		}
		
		const elClock_start = document.getElementById("clock_start");
		if (elClock_start !== null)
		{
			if (typeof myContext.current_clock_start === 'number')
				elClock_start.innerHTML = adv.GetChronoHHMMSSD(objJSON.clock-myContext.current_clock_start);
			else
				elClock_start.innerHTML = ' - ';
		}
	}
	
	myContext.OnBibInsert = function(objJSON) 
	{
		OnBibInsert(objJSON);
		myContext.SetCurrentClockStart();
	}

	myContext.getColumnsRanking = function()
	{
		var ranking = [];

		ranking.push({ name: "Dossard", label: 'Dos.', "class": 'text-end', lg: 4 });
		ranking.push({ name: "Identite", label: 'Nom - Prénom', "class": 'text-start hot', lg: 30, fn_value : myContext.GetCellValue});
		ranking.push({ name: "Equipe", label: 'ESF', "class": 'text-center', lg: 20});
		
		ranking.push({ name: "lap1", label: 'Inter1', "class" : 'text-end', lg: 7, fn_value : myContext.GetCellLapValue });
		ranking.push({ name: "lap2", label: 'Inter2', "class" : 'text-end', lg: 7, fn_value : myContext.GetCellLapValue });

		ranking.push({ name: "Tps_chrono1", label: 'Temps', "class" : 'text-end hot', lg: 7, fn_value : myContext.GetCellValue });
		ranking.push({ name: "Diff_chrono1", label: 'Ecart', fmt: '[DIFF]MMSSCC', "class" : 'text-end', lg: 6, fn_value : myContext.GetCellValue});
		ranking.push({ name: "Clt_chrono1", label: 'Clt', "class": 'text-end hot', lg:5, fn_value : myContext.GetCellValue });

		return ranking;
	}
	
	myContext.GetCellValue = function(tRanking, column, i, rowType)
	{
		if (rowType.substring(0,3) == 'lap')
		{
			const lap = rowType.substring(3);

			if (column.name == 'Nom')
				return tRanking.GetCell('Nom'+String(lap), i)+' '+tRanking.GetCell('Prenom'+String(lap), i)+' ('+ tRanking.GetCell('Nom',i)+')';
			else if (column.name == 'Tps_chrono1')
				return tRanking.GetCellChrono('Tps1_cumul'+String(lap),i, 'HHMMSSD');
			else if (column.name == 'Diff_chrono1')
				return tRanking.GetCellChronoDiff('Diff1_cumul'+String(lap),i, 'MMSSD');
			else if (column.name == 'Clt_chrono1')
				return tRanking.GetCellRank('Clt1_cumul'+String(lap),i);
		}
	
		return tRanking.GetCellFormat(column.name,i,column.fmt);
	}
	
	myContext.GetCellLapValue = function(tRanking, column, i, rowType)
	{
		const lap = column.name.substring(3);
		const lapCurrent = rowType.substring(0,3) == 'lap' ? rowType.substring(3) : '9999';

		if (parseInt(lap) <= parseInt(lapCurrent))
			return tRanking.GetCellChrono('Tps1_inter'+lap,i,'HHMMSSCC')+' ('+tRanking.GetCellRank('Clt1_inter'+lap,i)+')';
		else
			return '';
	}

	myContext.OnLive = function()
	{
		const tEpreuve = ski.GetTable('Epreuve');
		const tRanking = GetTableContextRanking();
		const manche = ski.GetCodeManche();
			
		myContext.SetCurrentClockStart(tRanking);
	
		myContext.current_manche = manche;
		if (typeof myContext.getColumnsRanking === 'function')
			myContext.current_columns = myContext.getColumnsRanking();
		tRanking.SetColumnType('Dossard', adv.index_type.LONG);

		var html = '';
		html += '<h2 class="text-center"><span id="clock_container"><img src="./img/32x32_clock.png"/>&nbsp;<span id="clock">00h00.0</span>&nbsp;<img src="./img/32x32_flag_green_v1.png"/>&nbsp;<span id="clock_start">00.0</span></span></h2>';
		html += '\n';
		html += htmlCode('<table>', {class_group:'my_table'});
		html += '\n';
		html += OnRankingHeader();
		html += htmlCode('<tbody>');
		html += '\n';

		// Passage  ...
		const nb_inter = 2;
		for (let inter=1;inter<=nb_inter;inter++)
		{
			tRanking.SetRanking('Clt1_inter'+String(inter), 'Tps1_inter'+String(inter));
			tRanking.ComputeDiffTime('Tps1_inter'+String(inter), 'Diff_inter'+String(inter));
			
			html += htmlCode('<tr>', {class_name:'lap', data:{'id':'label_lap'+String(inter)} });
			html += '\n\t';
			html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
			html += '<img src="./img/16x16_chronometer.png"/>&nbsp;Inter '+String(inter);
			html += htmlCode('</th>')
			html += '\n';
			html += htmlCode('</tr>');
			html += '\n';
			html += myContext.OnLiveLap(inter);
		}
		
		html += htmlCode('<tr>', {data:{'id':'label_finish'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_arrivee.png"/>&nbsp;Arrivée';
		html += htmlCode('</th>');
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnLiveFinish();

		html += htmlCode('<tr>', {data:{'id':'label_ranking'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_podium.png"/>&nbsp;Classement';
		html += htmlCode('</th>');
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnRankingHeader();
		html += OnLiveRanking();

		html += htmlCode('</tbody>');
		html += htmlCode('</table>');
		html += '\n';
		
		if (typeof myContext.container_racer === 'object')
			myContext.container_racer.innerHTML = html;

		if (typeof myContext.option_delay_on_course === 'number' && myContext.option_delay_on_course > 0)
		{
			if (typeof myContext.on_course_timeoutID === 'number')
				 clearTimeout(myContext.on_course_timeoutID);
			myContext.on_course_timeoutID = window.setTimeout(OnCourseStep, myContext.option_delay_on_course);
		}
	}

	myContext.SetCurrentClockStart = function()
	{
		if (typeof myContext.current_clock_start !== 'number')
		{
			const tRanking = GetTableContextRanking();
			if (typeof tRanking === 'object' && tRanking != null)
			{
				for (let i=0;i<tRanking.GetNbRows();i++)
				{
					if (tRanking.GetCellInt('Heure_depart_reelle', i, adv.chrono.KO) >= 0)
					{
						myContext.current_clock_start = tRanking.GetCellInt('Heure_depart_reelle', i);
						break;
					}
				}
			}
		}
	}

	myContext.OnLiveLap = function(lap)
	{
		const tRanking = GetTableContextRanking();
		tRanking.OrderBy('Tps1_inter'+String(lap)+', Dossard');
		
		var html = '';
		for (let i=0;i<tRanking.GetNbRows();i++)
		{
			if (tRanking.GetCellInt('Tps1_inter'+String(lap),i, adv.chrono.KO) < adv.chrono.OK)
				break;
	
			html += OnRankingBody(tRanking, i, 'lap'+String(lap), i);
		}
		
		return html;
	}
}	

function htmlClass(params)
{
	var class_value = '';

	const class_group = params.class_group;
	if (class_group != undefined && class_group != null && typeof class_group === 'string')
	{
		if (typeof myContext['htmlClassGroup'] === 'function')
			class_value = myContext['htmlClassGroup'](class_group);
		else
			class_value = class_group;
	}
	
	const class_name = params.class_name;
	if (class_name != undefined && class_name != null && typeof class_name === 'string')
	{
		if (class_value != '')
			class_value += ' ';
		class_value += class_name;
	}
	
	if (class_value == '')
		return '';
	else
		return ' class="'+class_value+'"';
}

function htmlData(data)
{
	if (data != undefined && data != null && typeof data === 'object')
	{
		var html = '';
		for (const key in data) 
		{
			if (data.hasOwnProperty(key)) 
				html += ' '+key+'="'+data[key]+'"';
		}
		return html;
	}
	return '';
}

function htmlCode(tag, params)
{
	if (typeof myContext['htmlCode'] === 'function')
	{
		return myContext['htmlCode'](tag, params);
	}
	else
	{
		if (params != undefined && params != null && typeof params === 'object')
		{
			if (tag == '<table>')
				return '<table '+htmlClass(params)+htmlData(params.data)+'>';
			else
			{
				return tag.substring(0, tag.length-1)+htmlClass(params)+htmlData(params.data)+'>';
			}
		}
		else
		{
			return tag;
		}
	}
}

function OnOpenWebSocketCommand()
{
	const cmd = { key:'<race_load>', key_race: myContext.data_key };
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnPDF(objJSON)
{
	if (objJSON.success)
	{
		const pdf_file = objJSON.pdf_file;
		window.open('./download_pdf.php?pdf='+pdf_file, "_blank");
	}
	else
	{
		alert(" PDF KO :"+JSON.stringify(objJSON));
	}
}

function OnCommandRunErase(objJSON)
{
//	alert("OnCommandRunErase :"+JSON.stringify(objJSON));
	window.setTimeout(OnOpenWebSocketCommand, 1000);
}

function OnCommandRaceLoad(objJSON) 
{
//	alert("OnCommandRaceLoad :"+JSON.stringify(objJSON));
	ski.SetRace(objJSON);
	myContext.current_manche = ski.GetCodeManche();
	
	Run(OnHeader);
	Run(OnOption);
	Run(OnEpreuve);
	Run(OnRacer);
	Run(OnFooter);

	const cmd = { key : '<epreuve_load>',  epreuve222 : -1, fn : 'OnCommandEpreuveLoad' };
	wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON)
{
//	alert("OnCommandEpreuveLoad :"+JSON.stringify(objJSON));
	myContext.current_ranking = objJSON;

	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
//      Filter exemples ...		
//		tRanking.FilterSexe('M');
//		tRanking.FilterColumn('Categ', 'U11');

//		ski.FilterSexe(tRanking, 'M');
//		tRanking.FilterColumnIn('Club', ['GUC GRENOBLE', 'SNB CHAMROUS']);
//		tRanking.FilterColumnNotIn('Categ', ['U11', 'U14']);
		
//		tRanking.FilterIn([ { col : 'Sexe', value : ['F'] }, { col : 'Categ', value : ['U13', 'U14']} ]);
//		tRanking.FilterNotIn([ { col : 'Sexe', value : ['F'] }, { col : 'Categ', value : ['U13', 'U14']} ]);

//		ski.FilterEpreuve(tRanking, 3);

/*
		tRanking.Filter((row, index) => { 
			if (tRanking.GetCell('Categ', index) !== 'U11') return false; 
			if (tRanking.GetCell('Sexe', index) !== 'M') return false; 
			return true;
		});
*/			
//		myContext.container_footer.innerHTML = tRanking.ToHTML_Bootstrap(['Dossard', 'Tps_chrono1', 'Clt_chrono1', 'Diff_chrono1']);

		const nbManche = ski.GetNbManche();
		for (let m=1;m<=nbManche;m++)
		{
			tRanking.ComputeDiffTime('Tps_chrono'+m, 'Diff_chrono'+m);
		}
		tRanking.ComputeDiffTime('Tps_chrono', 'Diff_chrono');
		
		const manche = ski.GetCodeManche();
		const nb_inter = ski.GetNbManche();
		for (let i=1;i<=nb_inter;i++)
		{
			if (manche == nbManche)
				tRanking.ComputeDiffTime('Tps_cumul'+String(manche)+'_inter'+String(i), 'Diff_cumul'+String(manche)+'_inter'+String(i), 'Tps');
			else
				tRanking.ComputeDiffTime('Tps'+String(manche)+'_inter'+String(i), 'Diff'+String(manche)+'_inter'+String(i));
		}
	}

	NavigationOption();

	// Message en cours ...
	window.setTimeout(function() { wsMain.websocket.send('{"key":"<msg>"}');}, 500);
}

function OnHeader()
{
	const container = myContext.container_header;
	if (container != null && typeof container === 'object')
	{
		const tEvenement = ski.GetTable('Evenement');

		var html = '';
		html += '<div>';

		html += '<h1>SKIOPEN - ESF - 2025</h1>';
		html += '<h2>'+tEvenement.GetCell('Commentaire_live', 0)+'</h2>';
		html += '<h5>Résultats Officieux</h5>';
		 
		html += '<div class="row" id="row_marquee">';
		html += '<div class="col-3" id="label_marquee">&nbsp;</div>';
		html += '<div class="col-6" id="marquee"><span id="msg">&nbsp;</span></div>';
		html += '<div class="col-3"></div>';
		html += '</div>';
	
		html += '<hr>';
		html += '</div>';
		
		container.innerHTML = html;
		myContext.container_msg = document.getElementById('msg');
	}
}

function OnFooter() {};

function OnOption()
{
	const container = myContext.container_main;
	if (typeof container === 'object')
	{
		const codeManche = ski.GetCodeManche();
		const nbManche = ski.GetNbManche();

		var html = '';
		html += '<ul class="nav nav-pills nav-fill" id="navigation_option">';
		if (nbManche == 1)
		{
			const active_startlist = myContext.current_option == 'startlist' ? ' active' : '';
			const active_live = myContext.current_option == 'live' ? ' active' : '';
			const active_ranking = myContext.current_option == 'ranking' ? ' active' : '';
			
			html += '<li class="nav-item"><a class="nav-link'+active_startlist+'" href="#" data-option="startlist" data-manche="1"><img src="./img/16x16_bib.png"/>&nbsp;Départ</a></li>\n';
			html += '<li class="nav-item"><a class="nav-link'+active_live+'" href="#" data-option="live"><img src="./img/16x16_chronometer.png"/>&nbsp;Live</a></li>\n';
			html += '<li class="nav-item"><a class="nav-link'+active_ranking+'" href="#" data-option="ranking" data-manche="1"><img src="./img/16x16_podium.png"/>&nbsp;Classement</a></li>\n';
		}
		else
		{
			if (codeManche == 1)
			{
				html += '<li class="nav-item"><a class="nav-link" href="#" data-option="startlist" data-manche="1"><img src="./img/16x16_bib.png"/>&nbsp;Départ M1</a></li>\n';
				html += '<li class="nav-item"><a class="nav-link active" aria-current="page" href="#" data-option="live"><img src="./img/16x16_chronometer.png"/>&nbsp;Live M1</a></li>\n';
				html += '<li class="nav-item"><a class="nav-link" href="#" data-option="ranking" data-manche="1"><img src="./img/16x16_podium.png"/>&nbsp;Classement M1</a></li>\n';
			}
			else
			{
				if (adv.GetScreenWidth() <= myContext.screen_width_medium)
				{
					for (let m=1;m<=nbManche;m++)
					{
						html += '<li class="nav-item"><a class="nav-link" href="#" data-option="startlist" data-manche="'+m+'">Dép.M'+m+'</a></li>\n';
					}
					html += '<li class="nav-item"><a class="nav-link active" aria-current="page" href="#" data-option="live">Live M'+codeManche+'</a></li>\n';
					for (let m=1;m<=nbManche;m++)
					{
						html += '<li class="nav-item"><a class="nav-link" href="#" data-option="ranking" data-manche="'+m+'">Clt.M'+m+'</a></li>\n';
					}
				}
				else
				{
					for (let m=1;m<=nbManche;m++)
					{
						html += '<li class="nav-item"><a class="nav-link" href="#" data-option="startlist" data-manche="'+m+'"><img src="./img/16x16_bib.png"/>&nbsp;Dép.M'+m+'</a></li>\n';
					}
					html += '<li class="nav-item"><a class="nav-link active" aria-current="page" href="#" data-option="live"><img src="./img/16x16_chronometer.png"/>&nbsp;Live M'+codeManche+'</a></li>\n';
					for (let m=1;m<=nbManche;m++)
					{
						html += '<li class="nav-item"><a class="nav-link" href="#" data-option="ranking" data-manche="'+m+'"><img src="./img/16x16_podium.png"/>&nbsp;Clt.M'+m+'</a></li>\n';
					}
				}
			}
		}
		html += '</ul>\n';
		html += '<br>\n';

		container.insertAdjacentHTML('beforeend', html);
		
		[].forEach.call(container.querySelectorAll('#navigation_option li a'), function(el) {
			el.addEventListener('click', function() {
				myContext.current_option = el.getAttribute('data-option');

				[].forEach.call(container.querySelectorAll('#navigation_option li a.active'), function(ela) {
					ela.classList.remove('active');
				});
				el.classList.add('active');

				myContext.current_manche = el.getAttribute('data-manche');
				NavigationOption();
			})
		})
	}
}

function OnEpreuve()
{
	const container = myContext.container_main;
	if (container != null && typeof container === 'object')
	{
		const tEpreuve = ski.GetTable('Epreuve');

		var html = '';
		if (tEpreuve.GetNbRows() > 1)
		{
			html += '<ul class="nav nav-pills nav-fill" id="navigation_epreuve">';
			for (let e=0;e<tEpreuve.GetNbRows();e++)
			{
				const epreuve = tEpreuve.GetCell('Code_epreuve', e);
				const txt = ski.GetStringEpreuve(epreuve);
				var active = ''
				if (epreuve == myContext.current_epreuve)
					active = ' active ';
			
				html += '<li class="nav-item"><a class="nav-link'+active+' " href="#" data-epreuve="'+epreuve+'">'+txt+'</a></li>\n';
			}
			html += '</ul>';
		}
		
		container.insertAdjacentHTML('beforeend', html);
		
		[].forEach.call(container.querySelectorAll('#navigation_epreuve li a '), function(el) {
			el.addEventListener('click', function() {
				const epreuve = el.getAttribute('data-epreuve');

				myContext.current_epreuve = epreuve;
				const cmd = { key : '<epreuve_load>',  epreuve : myContext.current_epreuve, fn : 'OnCommandEpreuveLoad' };
				wsMain.websocket.send(JSON.stringify(cmd));

				[].forEach.call(container.querySelectorAll('#navigation_epreuve li a.active'), function(ela) {
					ela.classList.remove('active');
				});
				el.classList.add('active');
			})
		})
	}
}

function OnRacer()
{
	const container = myContext.container_main;
	if (container != null && typeof container === 'object')
	{
		container.insertAdjacentHTML('beforeend', '<div id="container_racer"></div>');
		myContext.container_racer = document.getElementById('container_racer');
	}
}

function NavigationOption()
{
	if (myContext.current_option == 'startlist')
		Run(OnStartList);
	else if (myContext.current_option == 'live')
		Run(OnLive);
	else if (myContext.current_option == 'ranking')
		Run(OnRanking());
	else
		alert('option non ok ! : '+myContext.current_option);
}

function OnStartList()
{
	if (typeof myContext.getColumnsStartlist === 'function')
		myContext.current_columns = myContext.getColumnsStartlist();
	else if (typeof myContext.getColumnsRanking === 'function')
		myContext.current_columns = myContext.getColumnsRanking();

	if (typeof myContext.current_columns === 'object')
	{
		const tRanking = GetTableContextRanking();
		tRanking.SetColumnType('Dossard', adv.index_type.LONG);
		
		const manche = myContext.current_manche;
		if (manche == 1)
		{
			for (let i=0;i<tRanking.GetNbRows();i++)
			{
				if (tRanking.GetCellInt('Rang1', i) <= 0)
					tRanking.SetCell('Rang1',i, 9999);
			}
		}
		
		tRanking.OrderBy('Rang'+manche+',Dossard');

		var html = '';
		html += htmlCode('<table>', {class_group:'my_table'});
		html += OnRankingHeader();
		for (let row=0;row<tRanking.GetNbRows(); row++)
			html += OnRankingBody(tRanking, row, 'startlist', row);
		html += htmlCode('</table>');

		if (typeof myContext.container_racer === 'object')
			myContext.container_racer.innerHTML = html;
	}
}

function GetTableContextRanking()
{
	return adv.GetTableUnique(myContext.current_ranking, 'ranking');
}

function GetIndexContextColumn(colName)
{
	if (typeof myContext.current_columns === 'object')
	{
		for (let j=0;j<myContext.current_columns.length;j++)
		{
			if (myContext.current_columns[j].name == colName)
				return j;
		}
	}
	return -1;
}

function OnLive()
{
	const tRanking = GetTableContextRanking();
	const nbManche = ski.GetNbManche();
	const manche = ski.GetCodeManche();

	myContext.current_manche = manche;
	if (typeof myContext.getColumnsRanking === 'function')
		myContext.current_columns = myContext.getColumnsRanking();
	tRanking.SetColumnType('Dossard', adv.index_type.LONG);

	var html = '';
	html += '\n';
	html += htmlCode('<table>', {class_group:'my_table'});
	html += '\n';
	html += OnRankingHeader();
	html += htmlCode('<tbody>');
	html += '\n';

	if (myContext.option_tv)
	{
		// Option Tv
		html += htmlCode('<tr>', {data:{'id':'label_ranking'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_podium.png"/>&nbsp;Classement';
		html += htmlCode('</th>');
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnLiveRanking();
		
		html += htmlCode('<tr>', {data:{'id':'label_oncourse'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_chronometer.png"/>&nbsp;En Course&nbsp;+&nbsp;<img src="./img/16x16_arrivee.png"/>&nbsp;Arrivée&nbsp;<span id="clock">00h00.0</span>';
		html += htmlCode('</th>');
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnLiveOnCourse();
	}
	else
	{
		// Mode Std
		html += htmlCode('<tr>', {data:{'id':'label_start'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_depart.png"/>&nbsp;Au Départ';
		html += htmlCode('</th>')
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnLiveStart();

		html += htmlCode('<tr>', {data:{'id':'label_oncourse'} });
		html += '\n\t';
		html += htmlCode('<th>', {class_name:'text-center', data:{colspan:'100%'} });
		html += '<img src="./img/16x16_chronometer.png"/>&nbsp;En Course&nbsp;<span id="clock">00h00.0</span>';
		html += htmlCode('</th>');
		html += '\n';
		html += htmlCode('</tr>');
		html += '\n';
		html += OnLiveOnCourse();

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
	}

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

function OnCourseStep()
{
	myContext.on_course_timeoutID = window.setTimeout(OnCourseStep, myContext.option_delay_on_course);

	const elClock = document.getElementById("clock");
	if (elClock != null && typeof myContext.current_clock === 'number')
	{
		myContext.current_clock += myContext.option_delay_on_course;
		elClock.innerHTML = adv.GetChronoHHMMSSD(myContext.current_clock);
	}

	const tOnCourse = ski.tOnCourse;
	if (tOnCourse != undefined && tOnCourse != null && typeof tOnCourse === 'object')
	{
		if (tOnCourse.GetNbRows() > 0)
		{
			for (let i=0;i<tOnCourse.GetNbRows();i++)
				tOnCourse.SetCell('time', i, tOnCourse.GetCellInt('time',i)+myContext.option_delay_on_course);
		
			const tRanking = GetTableContextRanking();
			const manche = ski.GetCodeManche();
			if (typeof tRanking === 'object' && typeof myContext.container_racer === 'object' && document.getElementById("label_oncourse") != null)
			{
				const collectionOnCourse = myContext.container_racer.querySelectorAll('.oncourse');
				for (let i=0;i<collectionOnCourse.length;i++)
				{
					const el = collectionOnCourse[i];
					const children = el.querySelectorAll('[data-col]'); 
					const elTime = GetChildDataCol(children, 'Tps_chrono'+manche);
					if (elTime != null)
					{
						const classChrono = elTime.getAttribute('data-chrono');
						if (classChrono === 'running')
						{
							const indexColDossard = GetIndexContextColumn('Dossard');
							const elBib = children[indexColDossard].innerHTML;
							const k = tOnCourse.GetIndexRow('bib', elBib)
							if (k >= 0)
							{
								elTime.innerHTML = tOnCourse.GetCellChrono('time', k, 'HHMMSSD');
							}
						}
					}
				}
			}
		}
	}
}

function OnRanking()
{
	OrderRanking(myContext.current_manche);

	var html = '';
	html = htmlCode('<table>', {class_group:'my_table'});
	html += OnPageRanking(true, true, false);
	html += htmlCode('</table>');

	if (typeof myContext.container_racer === 'object')
		myContext.container_racer.innerHTML = html;
}

function OnLiveRanking(option_init=true, option_scroll=true)
{
	OrderRanking(ski.GetCodeManche());
	return OnPageRanking(option_init, false, option_scroll);
}

function OrderRanking(manche)
{
	const tRanking = GetTableContextRanking();
	const nbManche = ski.GetNbManche();

	if (manche == nbManche)
		tRanking.OrderBy('Clt_chrono,Tps_chrono,Rang'+manche+', Dossard');
	else
		tRanking.OrderBy('Clt_chrono'+manche+',Tps_chrono'+manche+',Rang'+manche+',Dossard');
}


function IsRowRankingOk(tRanking, manche, row)
{
	if (myContext.option_tv)
	{
		var startlist = true;
		for (let i=0;i<tRanking.GetNbRows();i++)
		{
			if (tRanking.GetCellInt('Tps_chrono'+manche,i,adv.chrono.KO) != adv.chrono.KO)
			{
				startlist = false;
				break;
			}
		}
	
		if (!startlist)
		{
			const tps = tRanking.GetCellInt('Tps_chrono'+manche,row,adv.chrono.KO);
			if (tps == adv.chrono.KO || tps == adv.DNS)
				return false;
		}
	}
	else
	{
		if (myContext.current_option == 'live')
		{
			if (tRanking.GetCellInt('Tps_chrono'+manche,row,adv.chrono.KO) == adv.chrono.KO)
				return false;
		}
	}

	return true;
}

function GetNextRowRankingOk(tRanking, manche, row)
{
	for (let i=row;i<tRanking.GetNbRows();i++)
	{
		if (IsRowRankingOk(tRanking, manche, i))
			return i;
	}
	return 0;
}

function OnPageRanking(option_init=false, option_header=false, option_scroll=false)
{
	const tRanking = GetTableContextRanking();
	const nbManche = ski.GetNbManche();
	const manche = myContext.current_manche;

	if (option_init)
	{
		if (myContext.current_option == 'ranking')
		{
			if (typeof myContext.getColumnsRanking === 'function')
			{
				if (typeof myContext.getColumnsRanking === 'function')
					myContext.current_columns = myContext.getColumnsRanking();
			}
		}


		myContext.start_ranking = 0;
	}

	var html = '';
	if (typeof myContext.current_columns === 'object')
	{
		if (option_header)
			html += OnRankingHeader();

		var i = 0;
		var row = myContext.start_ranking;
		while (row < tRanking.GetNbRows())
		{
			if (IsRowRankingOk(tRanking, manche, row))
			{
				html += OnRankingBody(tRanking, row, 'ranking', i);
				++i;

				if (i >= myContext.nb_ranking && myContext.nb_ranking > 0)
					break;
			}
			++row;
		}
	}

	if (myContext.nb_ranking > 0 && i < myContext.nb_ranking)
	{
		while (i < myContext.nb_ranking)
		{
			html += OnRankingBodyEmpty('ranking', i);
			++i;
		}
	}

	if (option_scroll && myContext.nb_ranking > 0)
	{
		myContext.start_ranking = GetNextRowRankingOk(tRanking, manche, row);
	}

	if (myContext.delay_ranking > 0)
	{
		if (typeof myContext.reload_rankingID === 'number')
			clearTimeout(myContext.reload_rankingID);

		myContext.reload_rankingID = window.setTimeout(ReloadRanking, myContext.delay_ranking, true);
	}

	return html;
}

function GetColumnsLgTotal()
{
	if (myContext.current_columns != null && typeof myContext.current_columns === 'object')
	{
		const columns = myContext.current_columns;
		var lg = 0;
		for (let j=0;j<columns.length;j++)
		{
			lg += columns[j].lg;
		}
		return lg;
	}
	return 0;
}

function GetColumnsPixelTotal()
{
	return 1920;
}

function GetRowsPixelTotal()
{
	return 1080;
}

function SetRowsPixel()
{
	const nb_rows = myContext.nb_ranking + myContext.nb_oncourse + 3;
	const header_height_px = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
	const header_height = parseInt(header_height_px.substring(0, header_height_px.length-2));
	const total_height = GetRowsPixelTotal()-header_height;
	const row_height = parseInt(total_height/nb_rows)-2;
//	alert('nb_rows = '+nb_rows+' tot='+GetRowsPixelTotal()+'-'+header_height+'='+total_height+' ==> '+row_height);
	
	document.documentElement.style.setProperty('--row-height', String(row_height)+'px');
}

function SetColumnsPixel()
{
	if (myContext.current_columns != null && typeof myContext.current_columns === 'object')
	{
		const columns = myContext.current_columns;
		const lgTotal = GetColumnsLgTotal();
		const pxTotal = GetColumnsPixelTotal();
		var pxComputeTotal = 0;

		for (let j=0;j<columns.length;j++)
		{
			const lg = columns[j].lg;
			const px = Math.floor((lg*pxTotal)/lgTotal);
			columns[j].px = px;
			pxComputeTotal += px;
		}

		j = 0;
		while (pxComputeTotal < pxTotal)
		{
			++columns[j].px;
			++pxComputeTotal;
			++j;
			if (j >= columns.length)
				j = 0;
		}
	}
}

function OnRankingHeader()
{
	var html = htmlCode('<thead>', { class_group:'my_thead' });
 	if (typeof myContext.current_columns === 'object')
	{
		if (myContext.option_tv)
		{
			SetRowsPixel();
			SetColumnsPixel();
		}

		const columns = myContext.current_columns;

        html += htmlCode('<tr>', {class_name:'ranking_header'});
        html += '\n';
		for (let j=0;j<columns.length;j++)
		{
			const column = columns[j];
			if (typeof column.fn_header === 'function')
				html += column.fn_header(column);
			else 
			{
			    html += '\t';
				if (column.px != null && typeof column.px === 'number')
				{
					html += htmlCode('<th>', {class_name:'text-center', data: {'data-sort-header':column.name, 'style':'width:'+String(column.px)+'px'}});
				}
				else
				{
					html += htmlCode('<th>', {class_name:'text-center', data: {'data-sort-header':column.name}});
				}

				if (typeof column.fn_header_value === 'function')
					html += column.fn_header_value(column);
				else
					html += column.label;
				html += htmlCode('</th>');
			    html += '\n';
	
			}
		}
		html += htmlCode('</tr>');
		html += htmlCode('</thead>');
		html += '\n';
	}
	return html;
}

function OnRankingBodyEmpty(rowType, rowData)
{
	const tRanking = GetTableContextRanking();

	const onlyColumns = true;
	var tRankingEmpty = tRanking.Clone(onlyColumns);
	tRankingEmpty.SetNbRows(1);

	return OnRankingBody(tRankingEmpty, 0, rowType, rowData);
}

function GetFormatColumn(colName)
{	
	if (typeof myContext.current_columns === 'object')
	{
		const columns = myContext.current_columns;
		for (let j=0;j<columns.length;j++)
		{
			if (columns[j].name === colName)
			{
				if (typeof columns[j].fmt === 'string')
					return columns[j].fmt;
				else
					return '';
			}
		}
	}
	
	return '';
}

function GetStringRanking(tRanking, i, column_name, rowType)
{
	if (typeof myContext.current_columns === 'object')
	{
		const columns = myContext.current_columns;
		for (let j=0;j<columns.length;j++)
		{
			const column = columns[j];
			if (column.name == column_name)
			{
				if (typeof column.fn_value === 'function')
					return column.fn_value(tRanking, column, i, rowType);
				else
					return tRanking.GetCellFormat(column.name, i, column.fmt);
			}
		}
	}

	return tRanking.GetCellFormat(column_name, i);
}

function OnRankingBody(tRanking, i, rowType, rowData)
{
	var html = '';
	
	if (typeof myContext.current_columns === 'object')
	{
		const columns = myContext.current_columns;
		
		html += htmlCode('<tr>', {class_name:rowType, data:{'data-row':rowData} });
		html += '\n';
		for (let j=0;j<columns.length;j++)
		{
			const column = columns[j];
			if (typeof column.fn === 'function')
				html += column.fn(tRanking, column);
			else
			{
				html += '\t';
				html += htmlCode('<td>', {class_name:column['class'], data:{"data-col":column.name} });
				if (typeof column.fn_value === 'function')
					html += column.fn_value(tRanking, column, i, rowType);
				else
					html += tRanking.GetCellFormat(column.name, i, column.fmt);
				html += htmlCode('</td>');
				html += '\n';
			}
		}
		html += htmlCode('</tr>');
		html += '\n';
	}
	return html;
}

function OnLiveStart()
{
	const tRanking = GetTableContextRanking();
	const manche = ski.GetCodeManche();

	tRanking.OrderBy('Rang'+manche+', Dossard');

	const onlyColumns = true;
	var tStart = tRanking.Clone(onlyColumns);

	var nb = 0;
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (tRanking.GetCellInt('Tps_chrono'+manche,i,adv.chrono.KO) == adv.chrono.KO)
		{
			if (tRanking.GetCellInt('Heure_depart_reelle',i,adv.chrono.KO) == adv.chrono.KO)
			{
				tStart.PushRow(tRanking,i);
				++nb;
				if (nb >= myContext.nb_start)
					break;
			}
		}
	}

	tStart.SetNbRows(myContext.nb_start);
	
	if (myContext.option_start_asc == false)
		tStart.OrderBy('Rang'+manche+' Desc,Dossard Desc');

	var html = '';
	var j =0;
	for (let i=tStart.GetNbRows()-1;i>=0;i--)
	{
		html += OnRankingBody(tStart, i, 'start', j);
		++j;
	}

	return html;
}

function OnLiveOnCourse()
{
	const tRanking = GetTableContextRanking();
	const manche = ski.GetCodeManche();

	var html = '';
	for (let i=0;i<myContext.nb_oncourse;i++)
	{
		html += OnRankingBodyEmpty('oncourse', i);
	}

	return html;
}

function OnLiveFinish()
{
	return OnPageFinish(myContext.nb_finish);
}

function GetIndexFinish(tRanking, rk)
{
	tFinish = new adv.table('finish');
	tFinish.AddColumn('index', adv.index_type.LONG);
	tFinish.AddColumn('heure_arrivee', adv.index_type.LONG);
	tFinish.SetNbRows(rk+1);

	for (let i=0;i<tFinish.GetNbRows();i++)
	{
		tFinish.SetCell('index', i, -1);
		tFinish.SetCell('Heure_arrivee_reelle', i, -1);
	}

	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		const heure_arrivee = tRanking.GetCellInt('Heure_arrivee_reelle',i, -1);
		if (heure_arrivee >= 0)
		{
			for (let j=0;j<tFinish.GetNbRows();j++)
			{
				if (tFinish.GetCellInt('index', j, -1) == -1)
				{
					tFinish.SetCell('index', j, i);
					tFinish.SetCell('heure_arrivee', j, heure_arrivee);
					break;
				}

				if (tFinish.GetCellInt('heure_arrivee', j) < heure_arrivee)
				{
					for (let k=tFinish.GetNbRows()-1;k>j;k--)
					{
						tFinish.SetCell('index', k, tFinish.GetCellInt('index', k-1));
						tFinish.SetCell('heure_arrivee', k, tFinish.GetCellInt('heure_arrivee', k-1));
					}

					tFinish.SetCell('index', j, i);
					tFinish.SetCell('heure_arrivee', j, heure_arrivee);
					break;
				}
			}
		}
	}

/*
	tBib = new adv.table('bib');
	tBib.AddColumn('bib', adv.index_type.LONG);
	tBib.AddColumn('heure_arrivee', adv.index_type.LONG);
	tBib.SetNbRows(tFinish.GetNbRows());

	for (let i=0;i<tFinish.GetNbRows();i++)
	{
		j = tFinish.GetCellInt('index', i, -1);
		if (j >= 0)
		{
			tBib.SetCell('bib',i, tRanking.GetCell('Dossard', j));
			tBib.SetCell('heure_arrivee',i, tFinish.GetCell('heure_arrivee', i));
		}
	}
	
//	myContext.container_footer.innerHTML = tFinish.ToHTML_Bootstrap(['index', 'heure_arrivee']);
	myContext.container_footer.innerHTML = tBib.ToHTML_Bootstrap(['bib', 'heure_arrivee']);
//	myContext.container_footer.innerHTML = tRanking.ToHTML_Bootstrap(['Dossard', 'Heure_arrivee_reelle']);
*/
	return tFinish.GetCellInt('index', rk, -1);
}

function OnPageFinish(nb, rowData='finish')
{
	const tRanking = GetTableContextRanking();
	tRanking.OrderBy("Heure_arrivee_reelle Desc, Dossard");
	
	var html = '';
	var j = 0;
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (tRanking.GetCellInt('Heure_arrivee_reelle',i, -1) >= 0)
		{
			html += OnRankingBody(tRanking, i, rowData, j);
			++j;
			if (j >= nb)
				break;
		}
	}

	while (j < nb)
	{
		html += OnRankingBodyEmpty(rowData, j);
		++j;
	}

	return html;
}

function OnCommandOnCourse(objJSON)
{
	Run(OnClock, objJSON);
	
	if (typeof objJSON.data == 'string' && objJSON.data.length > 0)
	{
		tOnCourse = new adv.table('on_course');
		tOnCourse.AddColumn('bib', adv.index_type.CHAR);
		tOnCourse.AddColumn('time', adv.index_type.CHRONO);
		
		const arrayBibTime = objJSON.data.split(',');
		for (let i=0;i<arrayBibTime.length;i++)
		{
			const BibTime = arrayBibTime[i].split('=');
			if (BibTime.length == 2)
			{
				if (parseInt(BibTime[0]) > 0)
				{
					// Uniquement les dossards numériques - Pas les ouvreurs ...
					const row = tOnCourse.AddRow();
					tOnCourse.SetCell('bib', row, BibTime[0]);
					tOnCourse.SetCell('time', row, BibTime[1]);
				}
			}
		}
		tOnCourse.OrderBy('time asc');
		ski.tOnCourse = tOnCourse;
		
		Run(OnCourse);
	}	
	
	ReloadOnCourse();
}

function OnClock(objJSON)
{
	const elClock = document.getElementById("clock");
	if (elClock !== null)
	{
		elClock.innerHTML = adv.GetChronoHHMMSSD(objJSON.clock);
		myContext.current_clock = objJSON.clock;
	}
}

function GetChildDataCol(children, colName)
{
	for (let c=0;c<children.length;c++)
	{
		const child = children[c];
		if (child != null && child != undefined && typeof child === 'object')
		{
			if (child.hasAttribute('data-col'))
			{	
				const data_col = child.getAttribute('data-col');
				if (data_col == colName)
					return child;
			}
		}
	}

	return null;
}

function ResetRow(children)
{
	for (let c=0;c<children.length;c++)
		children[c].innerHTML = '&nbsp;';
}

function ReplaceRow(children, tRanking, row)
{
	for (let c=0;c<children.length;c++)
	{			
		const col_name = children[c].getAttribute('data-col');
		const fmt = GetFormatColumn(col_name);
		children[c].innerHTML = tRanking.GetCellFormat(col_name, row, fmt);
	}
}

function OnCourse()
{
	const tOnCourse = ski.tOnCourse;
	const tRanking = GetTableContextRanking();
	const manche = ski.GetCodeManche();

	if (typeof tOnCourse === 'object' && typeof tRanking === 'object' && typeof myContext.container_racer === 'object' && document.getElementById("label_oncourse") != null)
	{
		const collectionOnCourse = myContext.container_racer.querySelectorAll('.oncourse');

		if (tOnCourse.GetNbRows() > 0)
		{
			var k = 0;
			for (let i=0;i<collectionOnCourse.length;i++)
			{
				const el = collectionOnCourse[i];
				const children = el.querySelectorAll('[data-col]'); 
				const elTime = GetChildDataCol(children, 'Tps_chrono'+manche);
				if (elTime != null && typeof elTime === 'object')
				{
					const classChrono = elTime.getAttribute('data-chrono');
					if (classChrono == 'running' || classChrono == null)
					{
						const indexColDossard = GetIndexContextColumn('Dossard');
						const elBib = children[indexColDossard].innerHTML;
						const bib = tOnCourse.GetCell('bib', k);
					
						if (elBib != bib)
						{
							ResetRow(children);
							children[indexColDossard].innerHTML = bib;
							
							const j = tRanking.GetIndexRow('Dossard', bib);
							if (j >= 0)
								ReplaceRow(children, tRanking, j);
							SynchroStart(bib);
						}
						elTime.innerHTML = tOnCourse.GetCellChrono('time', k, 'HHMMSSD');
						if (classChrono == null)
							elTime.setAttribute('data-chrono', 'running');
					}
				}

				++k;
				if (k >= tOnCourse.GetNbRows())
					break;
			}

			while (k < tOnCourse.GetNbRows())
			{
				var elPrev = document.getElementById("label_oncourse");
				if (collectionOnCourse.length > 0)
					elPrev = collectionOnCourse[collectionOnCourse.length-1];
	
				if (typeof elPrev == 'object' && elPrev != null)
				{
					const bib = tOnCourse.GetCell('bib', k);
					const i = tRanking.GetIndexRow('Dossard', bib);
					if (i >= 0)
					{
						tRanking.SetCell('Tps_chrono'+ski.GetCodeManche(), i, tOnCourse.GetCellInt('time', k));
						const html = OnRankingBody(tRanking, i, 'oncourse', k);		
						elPrev.insertAdjacentHTML('afterend', html);
					}
				}
				++k;
			}
		}

		OnCourseMini();
	}
}

function OnCourseMini()
{
	if (myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionOnCourse = myContext.container_racer.querySelectorAll('.oncourse');
		const nb = collectionOnCourse.length;
		
		if (nb < myContext.nb_oncourse)
		{
			var elPrev = document.getElementById("label_oncourse");
			if (collectionOnCourse.length > 0)
				elPrev = collectionOnCourse[collectionOnCourse.length-1];

			if (elPrev != null && typeof elPrev === 'object')
			{
				var html = '';
				for (let i=nb;i<myContext.nb_oncourse;i++)
				{
					html += OnRankingBodyEmpty('oncourse', i);
				}
				elPrev.insertAdjacentHTML('afterend', html);
			}
		}
	}
}

function SearchNodeOnCourse(bib)
{
	if (myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionOnCourse = myContext.container_racer.querySelectorAll('.oncourse');
		for (let i=0;i<collectionOnCourse.length;i++)
		{
			const el = collectionOnCourse[i];
			const children = el.querySelectorAll('[data-col]'); 
			const elBib = GetChildDataCol(children, 'Dossard');
			if (elBib != null)
			{
				if (elBib.innerHTML == bib)
					return el;
			}
		}
	}

	return null;
}

function ReloadStart()
{
	const elLabelStart = document.getElementById("label_start");
	if (elLabelStart != null && elLabelStart != undefined && myContext.current_option == 'live' &&  myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionStart = myContext.container_racer.querySelectorAll('.start');
		for (let i=collectionStart.length-1;i>=0;i--)
		{
			const el = collectionStart[i];
			el.remove();
		}
		
		const html = OnLiveStart();
		elLabelStart.insertAdjacentHTML('afterend', html);
	}
}

function ReloadOnCourse()
{
	if (myContext.option_tv)
	{
		const elLabelOnCourse = document.getElementById("label_oncourse");
		if (elLabelOnCourse != null && elLabelOnCourse != undefined && myContext.current_option == 'live' &&  myContext.container_racer != null && typeof myContext.container_racer === 'object')
		{
			const manche = ski.GetCodeManche();
			const tRanking = GetTableContextRanking();

			var nb_finish = 0;
			var nb_oncourse = 0;

			const collectionOnCourse = myContext.container_racer.querySelectorAll('.oncourse');
			for (let i=0;i<collectionOnCourse.length;i++)
			{
				const elRow = collectionOnCourse[i];
				const children = elRow.querySelectorAll('[data-col]'); 
				const elChrono = GetChildDataCol(children, 'Tps_chrono'+manche);
				if (elChrono != null && typeof elChrono === 'object')
				{
					const classChrono = elChrono.getAttribute('data-chrono');
					if (classChrono != null && typeof classChrono === 'string' && classChrono.length > 0)
					{
						++nb_oncourse;
					}
					else 
					{
						ResetRow(children);
						const i = GetIndexFinish(tRanking, nb_finish);
						if (i >= 0) 
							ReplaceRow(children, tRanking, i);
						++nb_finish;
					}
				}
			}
		}
	}
}

function ReloadFinish()
{
	const elLabelFinish = document.getElementById("label_finish");
	if (elLabelFinish != null && elLabelFinish != undefined && myContext.current_option == 'live' &&  myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionFinish = myContext.container_racer.querySelectorAll('.finish');
		for (let i=collectionFinish.length-1;i>=0;i--)
		{
			const el = collectionFinish[i];
			el.remove();
		}
		
		const html = OnLiveFinish();
		elLabelFinish.insertAdjacentHTML('afterend', html);
	}
}

function ReloadRanking(option_scroll=false)
{
/*
	if (option_scroll)
		alert('option_scroll:'+myContext.start_ranking);
*/
	const elLabelRanking = document.getElementById("label_ranking");
	if (elLabelRanking != null && elLabelRanking != undefined && myContext.current_option == 'live' && myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionRanking = myContext.container_racer.querySelectorAll('.ranking');
		for (let i=collectionRanking.length-1;i>=0;i--)
		{
			const el = collectionRanking[i];
			el.remove();
		}

		const html = OnLiveRanking(false, option_scroll);
		elLabelRanking.insertAdjacentHTML('afterend', html);
	}
}

function SynchroStart(bibOnCourse)
{
	if (myContext.current_option == 'live' && typeof myContext.container_racer === 'object')
	{
		for (let i=0;i<myContext.nb_start;i++)
		{
			const el = myContext.container_racer.querySelector('.start[data-row="'+i+'"]');
			if (el && typeof el === "object")
			{
				const children = el.querySelectorAll('[data-col]'); 
				const elBib = GetChildDataCol(children, 'Dossard');
				if (elBib != null)
				{
					if (elBib.innerHTML == bibOnCourse)
					{
						ReloadStart();
						return;
					}
				}
			}
		}
	}
}

function OnCommandBibTime(objJSON) 
{
//	alert("OnCommandBibTime :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnBibTime, objJSON);
}

function OnCommandBibTimeLap(objJSON) 
{
//	alert("OnCommandBibTimeLap :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnBibTimeLap, objJSON);
}

function OnBibTime(objJSON)
{
	const passage = objJSON.passage;
	if (passage == adv.passage.FINISH)
		OnBibTimeFinish(objJSON);
	else if (passage > 0)
		Run(OnBibTimeInterLap, objJSON);
//		OnBibTimeInter(objJSON);
}

function OnBibTimeInter(objJSON)
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const passage = objJSON.passage;
		
		const total_time = objJSON.total_time;
		const total_diff = total_time > 0 ? objJSON.total_diff : undefined;
		
		const nbManche = ski.GetNbManche();
		const manche = ski.GetCodeManche();

		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
			if (manche == nbManche)
			{
				tRanking.SetCell('Tps_cumul'+String(manche)+'_inter'+String(passage), row, total_time);
				tRanking.SetCell('Diff_cumul'+String(manche)+'_inter'+String(passage), row, total_diff);
			}
			else
			{
				tRanking.SetCell('Tps'+String(manche)+'_inter'+String(passage), row, total_time);
				tRanking.SetCell('Diff'+String(manche)+'_inter'+String(passage), row, total_diff);
			}
			
			const el = SearchNodeOnCourse(bib);
			if (el && typeof el === "object")
			{
				const children = el.querySelectorAll('[data-col]'); 
				const elTimeInter = GetChildDataCol(children, 'Inter'+String(passage));
				if (elTimeInter != null)
				{
					const col_inter = (manche == 1 ? String(manche)+'_inter'+String(passage) : '_cumul'+String(manche)+'_inter'+String(passage));
					elTimeInter.innerHTML = GetStringRanking(tRanking, row, 'Inter'+String(passage), 'oncourse');
				}
			}
		}
	}
}

function OnBibTimeFinish(objJSON)
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const passage = objJSON.passage;
	
		const time = objJSON.time;
		const diff = objJSON.diff;
		const rank = objJSON.rank;
		
		const total_time = objJSON.total_time;
		const total_rank = objJSON.total_rank;
		const total_diff = total_time > 0 ? objJSON.total_diff : undefined;
		
		const nbManche = ski.GetNbManche();
		const manche = ski.GetCodeManche();

		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
			if (passage == adv.passage.FINISH)
			{
				tRanking.SetCell('Tps_chrono'+manche, row, time);
				if (manche == nbManche)
					tRanking.SetCell('Tps_chrono', row, total_time);
				
				tRanking.SetRanking('Clt_chrono'+manche, 'Tps_chrono'+manche);
				tRanking.ComputeDiffTime('Tps_chrono'+manche, 'Diff_chrono'+manche);
				if (manche == nbManche)
				{
					tRanking.SetRanking('Clt_chrono', 'Tps_chrono');
					tRanking.ComputeDiffTime('Tps_chrono', 'Diff_chrono');
				}
			}

			const el = SearchNodeOnCourse(bib);
			if (el && typeof el === "object")
			{
				const children = el.querySelectorAll('[data-col]'); 
				const elTimeManche = GetChildDataCol(children, 'Tps_chrono'+manche);
				if (elTimeManche != null)
				{
					if (elTimeManche.getAttribute('data-chrono') == 'running')
					{
						const elTimeTotal = GetChildDataCol(children, 'Tps_chrono');
						if (elTimeTotal != null && manche == nbManche)
						{
							elTimeTotal.innerHTML = adv.GetChronoHHMMSSCC(total_time);
							if (total_diff === undefined)
							{
								elTimeTotal.setAttribute('data-chrono', 'finish_no_diff'); 
							}
							else 
							{
								if (total_diff > 0)
									elTimeTotal.setAttribute('data-chrono', 'finish_loser'); 
								else
									elTimeTotal.setAttribute('data-chrono', 'finish_winner'); 
								
								const elDiffTotal = GetChildDataCol(children, 'Diff_chrono');
								if (elDiffTotal != null)
								{
									elDiffTotal.innerHTML = adv.GetChronoDiffMMSSCC(total_diff)
									if (total_diff > 0)
										elDiffTotal.setAttribute('data-chrono', 'finish_loser'); 
									else
										elDiffTotal.setAttribute('data-chrono', 'finish_winner'); 
								}
							}

							const elCltTotal = GetChildDataCol(children, 'Clt_chrono');
							if (elCltTotal != null)
							{
								if (parseInt(total_rank) >= 1)
									elCltTotal.innerHTML = total_rank;
								else
									elCltTotal.innerHTML = '';
									
								if (parseInt(total_rank) == 1)
									elCltTotal.setAttribute('data-chrono', 'finish_winner'); 
								else
									elCltTotal.setAttribute('data-chrono', 'finish_loser'); 
							}
						}

						elTimeManche.innerHTML = adv.GetChronoHHMMSSCC(time);
						if (diff === undefined)
						{
							elTimeManche.setAttribute('data-chrono', 'finish_no_diff'); 
						}
						else 
						{
							if (diff > 0)
								elTimeManche.setAttribute('data-chrono', 'finish_loser'); 
							else
								elTimeManche.setAttribute('data-chrono', 'finish_winner'); 
								
							const elDiffManche = GetChildDataCol(children, 'Diff_chrono'+manche);
							if (elDiffManche != null)
							{
								elDiffManche.innerHTML = adv.GetChronoDiffMMSSCC(diff)
								if (diff > 0)
									elDiffManche.setAttribute('data-chrono', 'finish_loser'); 
								else
									elDiffManche.setAttribute('data-chrono', 'finish_winner'); 
							}
						}

						const elCltManche = GetChildDataCol(children, 'Clt_chrono'+manche);
						if (elCltManche != null)
						{
							if (parseInt(rank) >= 1)
								elCltManche.innerHTML = rank;
							else
								elCltManche.innerHTML = '';

							if (parseInt(rank) == 1)
								elCltManche.setAttribute('data-chrono', 'finish_winner'); 
							else
								elCltManche.setAttribute('data-chrono', 'finish_loser'); 
						}

						window.setTimeout(function() { 
							elTimeManche.setAttribute('data-chrono', 'finish_exit');
							window.setTimeout(function() { el.remove(); OnCourseMini(); }, 3000);
						} , 2500);
					}
				}
			}

			ReloadOnCourse();
			ReloadFinish();
			ReloadRanking();
		}
	}
}

function OnBibTimeInterLap(objJSON)
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const passage = objJSON.passage;
		
		const total_time = objJSON.total_time;
		const total_diff = total_time > 0 ? objJSON.total_diff : undefined;
		
		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
			tRanking.SetCell('Tps1'+'_inter'+String(passage), row, total_time);
			tRanking.SetCell('Diff1'+'_inter'+String(passage), row, total_diff);
			tRanking.SetRanking('Clt1_inter'+String(passage), 'Tps1'+String(passage));
			
			ReloadLap(lap);
		}
	}
}

function OnBibTimeLap(objJSON)
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const lap = objJSON.lap;
		const tps = objJSON.time;

		VerifColumnsLap(tRanking, lap);

		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
//			alert('DOSSARD OK '+bib+' / '+row);
			
			tRanking.SetCell('Tps1_lap'+String(lap), row, tps);
			SetTpsCumul(tRanking,row, lap);
			
			tRanking.SetRanking('Clt1_lap'+String(lap), 'Tps1_lap'+String(lap));
			tRanking.ComputeDiffTime('Tps1_lap'+String(lap), 'Diff1_lap'+String(lap));

			tRanking.SetRanking('Clt1_cumul'+String(lap), 'Tps1_cumul'+String(lap));
			tRanking.ComputeDiffTime('Tps1_cumul'+String(lap), 'Diff1_cumul'+String(lap));
			
			ReloadLap(lap);
		}
	}
}

function ReloadLap(lap)
{
	const elLabelLap = document.getElementById("label_lap"+String(lap));
	if (elLabelLap != null && elLabelLap != undefined && myContext.current_option == 'live' &&  myContext.container_racer != null && typeof myContext.container_racer === 'object')
	{
		const collectionLap = myContext.container_racer.querySelectorAll('.lap'+String(lap));
		for (let i=collectionLap.length-1;i>=0;i--)
		{
			const el = collectionLap[i];
			el.remove();
		}
		
		const html = myContext.OnLiveLap(lap);
		elLabelLap.insertAdjacentHTML('afterend', html);
	}
}

function VerifColumnsLap(tRanking, lap)
{
	if (tRanking.GetIndexColumn('Tps1_lap'+String(lap)) < 0)
		tRanking.AddColumn('Tps1_lap'+String(lap), adv.index_type.CHRONO);
	if (tRanking.GetIndexColumn('Clt1_lap'+String(lap)) < 0)
		tRanking.AddColumn('Clt1_lap'+String(lap), adv.index_type.RANKING);
	if (tRanking.GetIndexColumn('Diff1_lap'+String(lap)) < 0)
		tRanking.AddColumn('Diff1_lap'+String(lap), adv.index_type.CHRONO);

	if (tRanking.GetIndexColumn('Tps1_cumul'+String(lap)) < 0)
		tRanking.AddColumn('Tps1_cumul'+String(lap), adv.index_type.CHRONO);
	if (tRanking.GetIndexColumn('Clt1_cumul'+String(lap)) < 0)
		tRanking.AddColumn('Clt1_cumul'+String(lap), adv.index_type.RANKING);
	if (tRanking.GetIndexColumn('Diff1_cumul'+String(lap)) < 0)
		tRanking.AddColumn('Diff1_cumul'+String(lap), adv.index_type.CHRONO);
}

function SetTpsCumul(tRanking, row, lap)
{
	var tps_cumul = 0;
	for (let l=1;l<=lap;l++)
	{
		const tps_lap = tRanking.GetCellInt('Tps1_lap'+String(l), row, adv.chrono.KO);
		if (tps_lap <= adv.chrono.KO)
		{
			tRanking.SetCell('Tps1_cumul'+String(lap), row, tps_lap);
			return;
		}
		tps_cumul += tps_lap;
	}
	tRanking.SetCell('Tps1_cumul'+String(lap), row, tps_cumul);
}

function OnCommandBibInsert(objJSON) 
{
//	alert("OnCommandBibInsert :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnBibInsert, objJSON);
}

function OnBibInsert(objJSON) 
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const passage = objJSON.passage;
		const time = objJSON.time;
		
		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
			if (passage == adv.passage.START)
			{
				tRanking.SetCell('Heure_depart_reelle', row, time);
				ReloadStart();
			}
			else if  (passage == adv.passage.FINISH)
			{
				tRanking.SetCell('Heure_arrivee_reelle', row, time);
				ReloadFinish();
			}
		}
	}
}

function OnCommandBibDelete(objJSON) 
{
//	alert("OnOnCommandBibDelete :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnBibDelete, objJSON);
}

function OnBibDelete(objJSON) 
{
	const tRanking = GetTableContextRanking();
	if (typeof tRanking === 'object' && tRanking != null)
	{
		const bib = objJSON.bib;
		const passage = objJSON.passage;
		
		const row = tRanking.GetIndexRow('Dossard', bib);
		if (row >= 0)
		{
			if (passage == adv.passage.START)
			{
				tRanking.SetCell('Heure_depart_reelle', row, adv.chrono.KO);
				ReloadStart();
			}
			else if  (passage == adv.passage.FINISH)
			{
				tRanking.SetCell('Heure_arrivee_reelle', row, adv.chrono.KO);
			}
		}
	}
}

function OnCommandMsg(objJSON) 
{
//	alert("OnCommandMsg :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnMsg, objJSON);
}

function OnMsg(objJSON) 
{
	if (myContext.container_msg != null && typeof myContext.container_msg === 'object')
		myContext.container_msg.innerHTML = objJSON.msg;
}

function OnCommandOrder(objJSON) 
{
//	alert("OnCommandOrder :"+JSON.stringify(objJSON));
	if (objJSON != null && typeof objJSON === 'object')
		Run(OnOrder, objJSON);
}

function OnOrder(objJSON) 
{
	const action = objJSON.action;
	if (action == 'reload')
	{
		if (objJSON.data_key != null && typeof objJSON.data_key === 'string')
		{
			myContext.data_key = objJSON.data_key;
			wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
			console.log("OnOrder OK *** :"+JSON.stringify(objJSON));
			return;
		}
	}

	console.log("OnOrder KO :"+JSON.stringify(objJSON));
}

function Run(fn, param = null)
{
	if (typeof fn === 'function' && typeof fn.name === 'string')
	{
		const fn_name = fn.name;
		if (typeof myContext[fn_name] === 'function')
			myContext[fn_name](param);
		else
			fn(param);
	}
}

function wsKeepAlive()
{
	if (wsMain.websocket == null)
	{
		wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
		console.log('wsKeepAlive null');
	}
	else if (wsMain.websocket.readyState != WebSocket.OPEN)
	{
		wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
		console.log('wsKeepAlive not open ...');
	}
	else
	{
		console.log('wsKeepAlive open ...');
	}
}

////////// Variables globales et Initialisation  //////////
const myContext = {
	nb_start : 3,
	nb_oncourse : 2,
	nb_finish : 5,
	nb_ranking : -1,
	
	current_option : 'live',
	current_epreuve : 1,
	current_manche : 1,
	current_columns : [],
	delay_ranking : 0,

	container_header : document.getElementById('header'),
	container_footer : document.getElementById('footer'),
	container_main : document.getElementById('main'),
	
	data_key : '*',
	msg : '',

	screen_width_small : 576,
	screen_width_medium : 768,
	screen_width_large : 992,

	option_tv : false,
	option_start_asc : true,
	option_delay_on_course : 100,
	option_video : false,
};

const wsMain = new ws.Context(wsParams.url, wsParams.port);
const wsVideo1 = new ws.Context('ws://192.168.74.102', 8085);

function Init(paramsJSON)
{
	if (typeof InitContext === 'function')
	{
//		alert("paramsJSON :"+JSON.stringify(paramsJSON)+' / '+adv.GetDisplayWidth()+' / '+adv.GetScreenWidth());
		InitContext(paramsJSON);
	}
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	
	if (urlParams.has('data_key'))
		myContext.data_key = urlParams.get('data_key');
	
	if (urlParams.has('video'))
		myContext.video = true;
	
	if (urlParams.has('delay'))
		wsMain.delay = parseInt(urlParams.get('delay'));
	
	// Command ...
	wsMain.SetCommand('<race_load>', OnCommandRaceLoad);
	wsMain.SetCommand('<bib_time>', OnCommandBibTime);
	wsMain.SetCommand('<bib_time_lap>', OnCommandBibTimeLap);
	wsMain.SetCommand('<bib_insert>', OnCommandBibInsert);
	wsMain.SetCommand('<bib_delete>', OnCommandBibDelete);
	wsMain.SetCommand('<run_erase>', OnCommandRunErase);

	wsMain.SetCommand('<msg>', OnCommandMsg);
	wsMain.SetCommand('<on_course>', OnCommandOnCourse);
	wsMain.SetCommand('<order>', OnCommandOrder);

	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);

	if (myContext.option_tv)
		setInterval(wsKeepAlive, 5000);

	if (myContext.option_video)
	{
		wsVideo1.image_binary = 'video1';
		wsVideo1.OpenWebSocketBinary();
	}
 }
function InitContext(paramsJSON)
{
	myContext.mode = 'live_esf';
	myContext.nb_start = 3;

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

			html += '<h1>Challenge 2025&nbsp;<a href="https://technique.esf.net/resultat/page_pdf.php?type=challenge&annee=2025"><img src="./img/32x32_return.png" alt="Retour Page Challenge 2025" /></a></h1>';
			html += '<h2>'+tEvenement.GetCell('Commentaire_live', 0)+'&nbsp;</h2>';
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

	myContext.getColumnsRanking = function()
	{
		var ranking = [];

		ranking.push({ name: "Dossard", label: 'Dos.', "class": 'text-end', lg: 4 });
		ranking.push({ name: "Identite", label: 'Identité', "class": 'text-start hot', lg: 30 });
		ranking.push({ name: "Categ", label: 'Cat.', "class": 'text-center', lg: 30});
		ranking.push({ name: "Sexe", label: 'S.', "class": 'text-center', lg: 2 });
		ranking.push({ name: "Equipe", label: 'ESF', "class": 'text-start', lg: 25, fn_value2 : myContext.GetCellClub });

		const manche = ski.GetCodeManche();
		const nb_inter = ski.GetNbInter();

		if (manche == 1)
		{
			for (let inter = 1; inter <= nb_inter; inter++)
			{
				ranking.push({ name: "Inter"+String(inter), label: 'Inter'+String(inter), inter: inter, "class" : 'text-end', lg: 8, fn_value : myContext.GetCellInter  });
			}
	
			ranking.push({ name: "Tps_chrono1", label: 'Tps.M1', "class" : 'text-end hot', lg: 7 });
			ranking.push({ name: "Diff_chrono1", label: 'Ec.M1', fmt: '[DIFF]MMSSCC', "class" : 'text-end', lg: 6});
			ranking.push({ name: "Clt_chrono1", label: 'Clt.M1', "class": 'text-end hot', lg:5 });
			
		}
		else
		{
			const screen_width = adv.GetScreenWidth();

			ranking.push({ name: "Tps_chrono1", label: 'Tps.M1', "class" : 'text-end', lg: 7 });
			if (screen_width > myContext.screen_width_large)
				ranking.push({ name: "Diff_chrono1", label: 'Ec.M1', fmt: '[DIFF]MMSSCC', "class" : 'text-end', lg: 6});
			ranking.push({ name: "Clt_chrono1", label: 'Clt.M1', "class": 'text-end', lg:5 });

			ranking.push({ name: "Tps_chrono2", label: 'Tps.M2', "class" : 'text-end', lg: 7 });
			if (screen_width > myContext.screen_width_large)
				ranking.push({ name: "Diff_chrono2", label: 'Ec.M2', fmt: '[DIFF]MMSSCC', "class" : 'text-end', lg: 6});
			ranking.push({ name: "Clt_chrono2", label: 'Clt.M2', "class": 'text-end', lg:5 });

			for (let inter = 1; inter <= nb_inter; inter++)
			{
				ranking.push({ name: "Inter"+String(inter), label: 'Inter'+String(inter), inter: inter, "class" : 'text-end', lg: 8, fn_value : myContext.GetCellInter  });
			}
	
			ranking.push({ name: "Tps_chrono", label: 'Tps.Tot', "class" : 'text-end hot', lg: 7 });
			if (screen_width > myContext.screen_width_large)
				ranking.push({ name: "Diff_chrono", label: 'Ec.Tot', fmt: '[DIFF]MMSSCC', "class" : 'text-end', lg: 6});
			ranking.push({ name: "Clt_chrono", label: 'Clt.Tot', "class": 'text-end hot', lg:5 });
		}

		return ranking;
	}

	myContext.GetCellClub = function(tRanking, column, i, rowType)
	{
		const equipe = tRanking.GetCell('Equipe', i);
		const club = tRanking.GetCell('Club', i);
		if (club.length > 0)
			return club;
		else
			return equipe;
	}

	myContext.GetCellInter = function(tRanking, column, i, rowType)
	{
		const manche = ski.GetCodeManche();
		const col_inter = (manche == 1 ? String(manche)+'_inter'+String(column.inter) : '_cumul'+String(manche)+'_inter'+String(column.inter));
		const tps_inter = tRanking.GetCellFormat('Tps'+col_inter, i);
		const chrono_inter = tRanking.GetCellInt('Tps'+col_inter, i);
		if (chrono_inter < adv.chrono.OK)
			return tps_inter;

		const diff_inter = tRanking.GetCellFormat('Diff'+col_inter, i,'[DIFF]');
		if (diff_inter.length > 0)
			return tps_inter+' ['+diff_inter+']';
		else
			return tps_inter;
	}
}	

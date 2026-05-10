function InitContext(paramsJSON)
{
	myContext.mode = 'esf';
	
	myContext.OnLive2 = function()
	{
		alert('In OnLIVE : nb oncourse = '+myContext.nb_oncourse);
	}
	
	myContext.getColumnsStartlist = function()
	{
		const manche = myContext.current_manche;

		var startlist = [];
		if (manche > 1)
			startlist.push( { "name" : "Rang"+manche, "label" : 'Rang' , align : 'text-end' });

		startlist.push({ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' });
		startlist.push({ "name" : "Identite", "label" : 'Identité' , align : 'identity'});
		startlist.push({ "name" : "Categ", "label" : 'Cat.' , align : 'text-center'});
		startlist.push({ "name" : "Sexe", "label" : 'S.' , align : 'text-center'});
		startlist.push({ "name" : "Equipe", "label" : 'E.S.F.', align : 'text-start' });

		if (manche > 1)
		{
			startlist.push({ "name" : "Tps_chrono"+(manche-1).toString(), "label" : 'Tps.M'+(manche-1).toString(), align : 'text-end' });
			if (myContext.screen_width > myContext.screen_width_min)
				startlist.push({ "name" : "Diff_chrono"+(manche-1).toString(), "label" : 'Diff.M'+(manche-1).toString(), align : 'text-end', fmt : '[DIFF]' });
			startlist.push({ "name" : "Clt_chrono"+(manche-1).toString(), "label" : 'Clt.M'+(manche-1).toString(), align : 'text-end' });
		}
	
		startlist.push({ "name" : "Tps_chrono"+(manche).toString(), "label" : 'Tps.M'+(manche).toString(), align : 'text-end' });
		
		if (myContext.screen_width > myContext.screen_width_min)
			startlist.push({ "name" : "Diff_chrono"+(manche).toString(), "label" : 'Diff.M'+(manche).toString(), align : 'text-end', fmt : '[DIFF]'  });
		startlist.push({ "name" : "Clt_chrono"+(manche).toString(), "label" : 'Clt.M'+(manche).toString(), align : 'text-end' });
		
		return startlist;
	}	

	myContext.getColumnsRanking = function()
	{
		const nbManche = ski.GetNbManche();
		const manche = myContext.current_manche;

		var ranking = [];
		ranking.push({ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' });
		ranking.push({ "name" : "Identite", "label" : 'Identité' , align : 'identity'});
		ranking.push({ "name" : "Categ", "label" : 'Cat.' , align : 'text-center'});
		ranking.push({ "name" : "Sexe", "label" : 'S.' , align : 'text-center'});
		ranking.push({ "name" : "Equipe", "label" : 'E.S.F.', align : 'text-start' });

		if (manche == nbManche && nbManche > 1)
		{
			for (let m=1;m<=manche;m++)
				ranking.push({ "name" : "_manche"+m, "label" : 'M'+m });

			ranking.push({ "name" : "_total", "label" : 'Tot' });
		}
		else
		{
			ranking.push({ "name" : "_manche"+manche, "label" : 'Manche'+manche, align : 'text-end' });
		}
		
		return ranking;
	}
}	

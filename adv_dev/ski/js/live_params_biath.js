function InitContext(paramsJSON)
{
	myContext.mode = 'biath';
	
	myContext.getColumnsStartlist2 = function()
	{
		return myContext.getColumnsRanking();
	}

	myContext.getColumnsRanking = function()
	{
		var ranking = [];
		
		ranking.push({ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' });
		ranking.push({ "name" : "Identite", "label" : 'Identité' , align : 'identity'});
		ranking.push({ "name" : "Categ", "label" : 'Cat.' , align : 'text-center'});
		ranking.push({ "name" : "Sexe", "label" : 'S.' , align : 'text-center'});
		ranking.push({ "name" : "Club", "label" : 'Club', align : 'text-start' });

		ranking.push({ "name" : "Tps_chrono1", "label" : 'Chrono', align : 'text-end' });
		ranking.push({ "name" : "Penalite1", "label" : 'Pénalité', align : 'text-end' });
		ranking.push({ "name" : "Tps1", "label" : 'Tps', align : 'text-end' });
		ranking.push({ "name" : "Diff1", "label" : 'Ec.', align : 'text-end',  fn_header_value : function(column) { return 'TT';} });
		ranking.push({ "name" : "Clt1", "label" : 'Clt', align : 'text-end', fn_header : function(column) { return '<th>*'+column.name+'</th>';} });

		return ranking;
	}
	
	myContext.ranking_count_rows2 = 10;
	myContext.ranking_delay = 3000;
}	

function InitContext(paramsJSON)
{
	myContext.mode = 'esf';
	
	myContext.OnAction = function() { myContext.current_action = 'ranking'; };

	
	myContext.ranking_count_rows = 4;
	myContext.ranking_delay = 3000;

	myContext.getColumnsRanking = function()
	{
		var ranking = [];
		
		ranking.push({ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' });
		ranking.push({ "name" : "Identite", "label" : 'Identité' , align : 'identity'});
		ranking.push({ "name" : "Categ", "label" : 'Cat.' , align : 'text-center'});
		ranking.push({ "name" : "Sexe", "label" : 'S.' , align : 'text-center'});
		ranking.push({ "name" : "Equipe", "label" : 'E.S.F.', align : 'text-start' });

		ranking.push({ "name" : "Tps_chrono1", "label" : 'Chrono', align : 'text-end' });
		ranking.push({ "name" : "Tps1", "label" : 'Tps', align : 'text-end' });
		ranking.push({ "name" : "Diff1", "label" : 'Ec.', align : 'text-end',  fn_header_value : function(column) { return 'TT';} });
		ranking.push({ "name" : "Clt1", "label" : 'Clt', align : 'text-end', fn_header : function(column) { return '<th>*'+column.name+'</th>';} });

		return ranking;
	}
}	

const contextParams = {
	mode : 'eurotest' ,
	
	startlist : [
		{ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' },
		{ "name" : "Sexe", "label" : 'S.' , align : 'text-center'},
		{ "name" : "Tps_chrono1", "label" : 'Tps' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellChrono(col, row); } },
		{ "name" : "Diff_chrono1", "label" : 'Dif' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellChronoDiff(col, row); } },
		{ "name" : "Clt_chrono1", "label" : 'Clt' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellRank(col, row); }},
		{ "name" : "Niveau", "label" : 'Ok' , align : 'text-center', fn : function(tRanking, col, row) { return contextParams.IsOk(tRanking.GetCellInt('Tps_chrono1', row), tRanking.GetCell('Sexe', row)) }}
	],
	
	ranking : [
		{ "name" : "Dossard", "label" : 'Dos.' , align : 'text-end' },
		{ "name" : "Sexe", "label" : 'S.' , align : 'text-center'},
		{ "name" : "Tps_chrono1", "label" : 'Tps' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellChrono(col, row); } },
		{ "name" : "Diff_chrono1", "label" : 'Dif' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellChronoDiff(col, row); } },
		{ "name" : "Clt_chrono1", "label" : 'Clt' , align : 'text-end', fn : function(tRanking, col, row) { return tRanking.GetCellRank(col, row); }},
		{ "name" : "Niveau", "label" : 'Ok' , align : 'text-center', fn : function(tRanking, col, row) { return contextParams.IsOk(tRanking.GetCellInt('Tps_chrono1', row), tRanking.GetCell('Sexe', row)) }}
	],

	IsOk : function(tps, sexe) {
		const tps_base = contextData.tps_eurotest_base;
		if (typeof tps_base === 'number' && tps_base >= adv.chrono.OK)
		{
			/*
			if (tps >= adv.chrono.OK)
			{
				if (sexe == 'M')
				{
					if (tps <= contextData.tps_eurotest_20)
						return 'OUI';
				}
				else if (sexe == 'F')
				{
					if (tps <= contextData.tps_eurotest_25)
						return 'OUI';
				}
			}
			*/
			return '-';
		}
		return '';
	}
};
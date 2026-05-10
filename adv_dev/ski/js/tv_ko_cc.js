function OnOpenWebSocketCommand()
{
	wsContext.wsCommand.send(JSON.stringify({key:'<race_load>', key_race:'*' }));
}

function OnCommandRaceLoad(objJSON) 
{
//	alert("OnCommandRaceLoad :"+JSON.stringify(objJSON));
	ski.SetRace(objJSON);

	if (wsContext.epreuve > 0)
		wsContext.wsCommand.send(JSON.stringify({ key : '<epreuve_load>',  epreuve : wsContext.epreuve }));
	else
		wsContext.wsCommand.send(JSON.stringify({ key : '<epreuve_load>' }));
}

function OnCommandEpreuveLoad(objJSON)
{
//	alert("OnCommandEpreuveLoad :"+JSON.stringify(objJSON));
	ski.SetEpreuve(objJSON);
	
	wsContext.wsCommand.send(JSON.stringify({ key : '<duel_load>' }));
}

function OnCommandDuelLoad(objJSON)
{
//	alert("OnCommandDuelLoad :"+JSON.stringify(objJSON));

	const mode_finish = objJSON.mode_finish;
	if (wsContext.mode == 'finish' && !mode_finish)
		return;
	if (wsContext.mode == 'start' && mode_finish)
		return;
	
	HideDuel();
	
	const tDuel = adv.GetTableUnique(objJSON, 'table_duel');
	if (tDuel !== undefined)
	{
		const nb_couloir = objJSON.nb_couloir;
		const tour = objJSON.tour;
		const duel = objJSON.duel;
		const label_tour = objJSON.label_tour;
		const label_duel = objJSON.label_duel;
		
		document.querySelector('#block_title').style.display = 'block';
		
		if (mode_finish)
		{
			document.querySelector('#block_title').innerHTML = 'Arrivée '+label_tour+' : '+label_duel;
		}
		else
		{
			document.querySelector('#block_title').innerHTML = 'Départ '+label_tour+' : '+label_duel;
		}
		
		for (let i=0;i<tDuel.GetNbRows();i++)
		{
			ShowDuel(tDuel, i, mode_finish)
		}
	}
}

function HideDuel()
{
	document.querySelector('#block_title').style.display = 'none';
	for (let i=1;i<=6;i++)
	{
		document.querySelector('#block_duel'+i).style.display = 'none';
	}
}

function ShowDuel(tDuel, i, mode_finish)
{
	const blockID = (i+1).toString();
	document.querySelector('#block_duel'+blockID).style.display = 'block';
	
	document.querySelector("#block_duel"+blockID+" .bib").innerHTML = tDuel.GetCell('dossard',i);

	var identite = tDuel.GetCell("nom",i)+" "+tDuel.GetCell("prenom",i);
	identite += ' ('+ tDuel.GetCell("club",i)+')';
	document.querySelector("#block_duel"+blockID+" .identity").innerHTML = TruncateName(identite);
	document.querySelector("#block_duel"+blockID+" .nation").innerHTML = '';
	
	if (mode_finish)
	{	
		const clt = tDuel.GetCell('tps',i);
		document.querySelector("#block_duel"+blockID+" .rank").innerHTML = clt;
		
		if (clt == '1' || clt == '2')
			document.querySelector("#block_duel"+blockID+" .info").innerHTML = 'QUALIF.';
		else
			document.querySelector("#block_duel"+blockID+" .info").innerHTML = '';
	}
	else
	{
		document.querySelector("#block_duel"+blockID+" .rank").innerHTML = ' ';
		document.querySelector("#block_duel"+blockID+" .info").innerHTML = 'Couloir '+(i+1).toString();
	}
}

function TruncateName(name)
{
	if (wsContext.lengthIdentity > 0)
	{
		if (name.length > wsContext.lengthIdentity)
			return name.substring(0, wsContext.lengthIdentity)+"...";
	}
	
	return name;
}

function Init()
{
	wsContext.lang = 'en';
	wsContext.url = wsParams.url;
	wsContext.port = wsParams.port;

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	wsContext.lengthIdentity = 35;
	if (urlParams.has('length_identity'))
		wsContext.lengthIdentity = parseInt(urlParams.get('length_identity'));
	
	// mode total, finish ou start
	wsContext.mode = 'total';
	if (urlParams.has('mode'))
		wsContext.mode = urlParams.get('mode')
	
	// Command Notification
	wsContext.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsContext.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);
	wsContext.mapCommand.set('<duel_load>', OnCommandDuelLoad);
	
	// Ouverture ws 
	wsContext.OpenWebSocketCommand(OnOpenWebSocketCommand);
}


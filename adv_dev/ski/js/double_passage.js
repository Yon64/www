function OnOpenWebSocketCommand()
{
	wsContext.wsCommand.send(JSON.stringify({key : '<race_load>', key_race : wsContext.key_race }));
}

function OnCommandRaceLoad(objJSON) 
{
//	alert("OnCommandRaceLoad V2 :"+JSON.stringify(objJSON));
	ski.SetRace(objJSON);

	wsContext.bib_left = 'L';
	wsContext.bib_right = 'R';
	ShowDuel();
}

function OnCommandBibInsert(objJSON) 
{
//	alert("OnCommandBibInsert :"+JSON.stringify(objJSON));

	if (objJSON !== null)
	{
		if (objJSON.passage == adv.passage.START)
		{
			if (wsContext.src_left == objJSON.src)
			{
				wsContext.bib_left = objJSON.bib;
				wsContext.time_left = adv.chrono.KO;
				ShowDuel();
			}
			else if (wsContext.src_right == objJSON.src)
			{
				wsContext.bib_right = objJSON.bib;
				wsContext.time_right = adv.chrono.KO;
				ShowDuel();
			}
/*
			var html = document.getElementById("message").innerHTML;
			html += '<br>START BIB='+objJSON.bib+', SRC='+objJSON.src;
			document.getElementById("message").innerHTML = html;
*/
		}
	}
}

function OnCommandBibTime(objJSON) 
{
//	alert("OnCommandBibTimeLap :"+JSON.stringify(objJSON));

	if (objJSON !== null)
	{
		if (objJSON.passage == adv.passage.FINISH)
		{
			var html = document.getElementById("message").innerHTML;
			html += '<br>FINISH BIB='+objJSON.bib+' CHRONO'+objJSON.time_chrono;
//			document.getElementById("message").innerHTML = html;
		}
	}
}

function OnCommandBibTimeLap(objJSON) 
{
	if (objJSON !== null)
	{
		if (objJSON.passage == adv.passage.FINISH)
		{
			if (wsContext.src_left == objJSON.src)
			{
				wsContext.time_left = objJSON.time;
				ShowDuel();
			}
			else if (wsContext.src_right == objJSON.src)
			{
				wsContext.time_right = objJSON.time;
				ShowDuel();
			}
/*
			var html = document.getElementById("message").innerHTML;
			html += '<br>FINISH LAP Bib='+objJSON.bib+', Time='+objJSON.time+', src='+objJSON.src+', lap='+objJSON.lap;
			document.getElementById("message").innerHTML = html;
*/
		}
	}
}

function ShowDuel() 
{
	document.getElementById("bib_left").innerHTML = wsContext.bib_left;
	document.getElementById("bib_right").innerHTML = wsContext.bib_right;

	if (wsContext.time_left == adv.chrono.KO)
		document.getElementById("time_left").innerHTML = '&nbsp;';
	else
		document.getElementById("time_left").innerHTML = adv.GetChrono(wsContext.time_left);

	if (wsContext.time_right == adv.chrono.KO)
		document.getElementById("time_right").innerHTML = '&nbsp;';
	else
		document.getElementById("time_right").innerHTML = adv.GetChrono(wsContext.time_right);

	document.getElementById("diff_left").innerHTML = '&nbsp;';
	document.getElementById("diff_right").innerHTML = '&nbsp;';

	document.getElementById("winner_left").innerHTML = '&nbsp;';
	document.getElementById("winner_right").innerHTML = '&nbsp;';

	if (wsContext.time_left >= adv.chrono.OK && wsContext.time_right >= adv.chrono.OK)
	{
		const diff = wsContext.time_left - wsContext.time_right;
		document.getElementById("diff_left").innerHTML = adv.GetChronoDiff(diff);
		document.getElementById("diff_right").innerHTML = adv.GetChronoDiff(-diff);

		if (diff < 0)
			document.getElementById("winner_left").innerHTML = 'WINNER';
		else if (diff  > 0)
			document.getElementById("winner_right").innerHTML = 'WINNER';
	}
}

function Init()
{
	wsContext.lang = 'en';
	wsContext.url = wsParams.url;
	wsContext.port = wsParams.port;

	wsContext.key_race = '*';

	wsContext.src_left = '1';
	wsContext.src_right = '2';
	
	wsContext.bib_left = '';
	wsContext.bib_right = '';

	wsContext.time_left = adv.chrono.KO;
	wsContext.time_right = adv.chrono.KO;

	// Command Notification
	wsContext.mapCommand.set('<race_load>', OnCommandRaceLoad);
	wsContext.mapCommand.set('<bib_time>', OnCommandBibTime);
	wsContext.mapCommand.set('<bib_time_lap>', OnCommandBibTimeLap);
	wsContext.mapCommand.set('<bib_insert>', OnCommandBibInsert);

//	wsContext.mapCommand.set('<order>', OnCommandOrder);
	
	// Ouverture ws 
	wsContext.OpenWebSocketCommand(OnOpenWebSocketCommand);
}



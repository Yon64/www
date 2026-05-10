function OnOpenWebSocketCommand()
{
	alert('OK');
}

function test()
{
	const cmd = { key:'<order>', action:'reload', data_key: '98_3444' };
	wsMain.websocket.send(JSON.stringify(cmd));
}

const wsMain = new ws.Context(wsParams.url, wsParams.port);
function Init(paramsJSON)
{
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
 }
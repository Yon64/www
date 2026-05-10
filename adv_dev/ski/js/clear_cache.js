function OnOpenWebSocketCommand()
{
	wsMain.websocket.send(JSON.stringify({key : '<clear_cache>' }));
}

////////// Variables globales et Initialisation  //////////
const wsMain = new ws.Context(wsParams.url, wsParams.port);

function Init()
{
	// Ouverture ws 
	wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

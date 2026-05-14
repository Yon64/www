import{escapeHtml,notifyError,changerOrientation}from'./utils.js';import{SpecialStatus,DEFAULT_POLL_DELAY}from'./constants.js';import{BasePeripheriqueUI}from'./base_peripherique_ui.js';import{loadLanguage}from'./languageManager.js';class DepartUI extends BasePeripheriqueUI{constructor(){super();this.appName='depart';this.persistenceManager=null;this.container=document.getElementById('start-list-container');this.upcomingHeats=[];this.currentHeatIndex=0;this.nbSerieCache=0;this.pollingTimerId=null;this.delay=DEFAULT_POLL_DELAY;this.competitionCode=null;this.clockIntervalId=null;this.useSyncManager=true;}
async checkCurrentHeatStatus(heat){try{const result=await this.persistenceManager.getHeatStatus(heat.id);if(!result.success)return;if(result.etat>2){this.handleExternalCompletion();return;}
if(heat.etat===1&&result.etat===2){await this.fetchAndDisplayHeats();}}catch(e){console.warn("Erreur Heartbeat check:",e);}}
_configureFetchParameters(){this.fetchState='1,2';this.noHeatsMessage=window.APP_TEXTS.depart.noHeatsAvailable;}
async initialize(pass=false){await super.initialize(pass);this.startLiveClock();}
startLiveClock(){if(this.clockIntervalId){clearInterval(this.clockIntervalId);}
if(this.clockIntervalId){clearInterval(this.clockIntervalId);}
this.clockIntervalId=setInterval(()=>{const clockElement=document.getElementById('live-clock-display');if(clockElement){const now=new Date();const hours=String(now.getHours()).padStart(2,'0');const minutes=String(now.getMinutes()).padStart(2,'0');const seconds=String(now.getSeconds()).padStart(2,'0');clockElement.textContent=`${hours}:${minutes}:${seconds}`;}},1000);}
_renderTable(heat){const isEmpty=!heat.slots.some(s=>s.participant&&s.participant.id);if(heat.etat===1||isEmpty){return`
                <div class="waiting-for-qualifiers">
                <h3>⏳ ${window.APP_TEXTS.speaker.waitingForParticipants || "Série en attente de qualifiés..."}</h3>
                </div>`;}
const prioColorsClasses=['prio-red','prio-green','prio-blue','prio-yellow'];const prioLetters=['R','V','B','J'];let rowsHtml='';heat.slots.forEach(slot=>{if(!slot.participant||!slot.participant.id)return;const colorIndex=(slot.prioDepart-1)%prioColorsClasses.length;const isInitiallyDns=slot.participant.specialStatus===SpecialStatus.DNS;rowsHtml+=`
                <tr class="${isInitiallyDns ? 'is-absent' : ''}">
                    <td class="col-prio-start"><div class="couleur-box ${prioColorsClasses[colorIndex]}">${prioLetters[colorIndex]}</div></td>
                    <td class="col-bib-start">${slot.participant.bib}</td>
                    <td>${escapeHtml(slot.participant.name)}</td>
                    <td class="col-abs-start">
                        <label class="switch">
                            <input type="checkbox" data-action="toggle-absent" 
                                   data-slot-index="${slot.prioDepart}" 
                                   data-initial-dns="${isInitiallyDns}" ${isInitiallyDns ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </td>
                </tr>`;});return`
            <table class="heat-table-start">
                <thead>
                    <tr>
                        <th class="col-prio-start">${window.APP_TEXTS.headerPrio}</th>
                        <th class="col-bib-start">${window.APP_TEXTS.headerBibBref}</th>
                        <th>${window.APP_TEXTS.headerName}</th>
                        <th class="col-abs-start">${window.APP_TEXTS.depart.headerDns}</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>`;}
_getMainActionButtons(heat){return`
            <div class="action-zone-center">
                <div id="live-clock-display" class="live-clock"></div>

                <div class="main-action-wrapper">
                     <button class="btn-en-place" data-action="start-heat" data-heat-id="${heat.id}">
                        ${window.APP_TEXTS.depart.btnStartHeat}
                    </button>

                    <button class="btn-sync" data-action="refresh-data" title="${window.APP_TEXTS.jugement.btnRefresh}" style="margin-top: 10px;">
                        <span class="material-icons">sync</span>
                    </button>

                </div>
            </div>
        `;}
async initPenalty(heatId){try{const heatToStart=this.upcomingHeats.find(h=>h.id===parseInt(heatId,10));if(!heatToStart)return;const hasRoll=heatToStart.rollZoneAfterGate!==-1&&heatToStart.rollZoneAfterGate!==null;const penaltyLen=(heatToStart.gateCount||8)+(hasRoll?2:1);const penaltyUpdatePromises=heatToStart.slots.filter(slot=>slot.participant&&slot.participant.id).map(slot=>{return this.persistenceManager.updatePenalite(heatId,slot.prioDepart,'0'.repeat(penaltyLen));});await Promise.all(penaltyUpdatePromises);}catch(error){notifyError(`${window.APP_TEXTS.depart.alertErrorStartingHeat} ${error.message}`);}}
async handleStartHeatClick(heatId){const existingClock=document.getElementById('live-clock-display');if(existingClock){existingClock.remove();}
const button=this.container.querySelector('[data-action="start-heat"]');button.disabled=true;button.textContent=window.APP_TEXTS.depart.btnStartingHeat;const heatToStart=this.upcomingHeats.find(h=>h.id===parseInt(heatId,10));const heatLastModified=heatToStart?heatToStart.lastModified:null;const dnsSwitches=this.container.querySelectorAll('[data-action="toggle-absent"]');const dnsChanges=[];dnsSwitches.forEach(switchElement=>{const initialState=switchElement.dataset.initialDns==='true';const currentState=switchElement.checked;if(initialState!==currentState){const slotIndex=parseInt(switchElement.dataset.slotIndex,10);const newValue=currentState?SpecialStatus.DNS:null;const slot=heatToStart?heatToStart.slots.find(s=>s.prioDepart===slotIndex):null;dnsChanges.push({slotIndex,newValue,lastModified:slot?slot.lastModified:null});}});if(this.syncManager){dnsChanges.forEach(change=>{this.syncManager.enqueue('update_status',{code_Serie:parseInt(heatId,10),slot_Index:change.slotIndex,newStatus:change.newValue},change.lastModified);});this.syncManager.enqueue('update_heat_state',{heatInfo:parseInt(heatId,10),newState:3},heatLastModified);const gateCount=heatToStart.gateCount||8;const hasRoll=heatToStart.rollZoneAfterGate!==-1&&heatToStart.rollZoneAfterGate!==null;const penaltyLen=gateCount+(hasRoll?2:1);const zeroPenaltyString='0'.repeat(penaltyLen);heatToStart.slots.forEach(slot=>{if(slot.participant&&slot.participant.id){this.syncManager.enqueue('update_penalite',{code_Serie:parseInt(heatId,10),slot_Index:slot.prioDepart,newValue:zeroPenaltyString},null);}});this.upcomingHeats.splice(this.currentHeatIndex,1);if(this.currentHeatIndex>=this.upcomingHeats.length){this.currentHeatIndex=Math.max(0,this.upcomingHeats.length-1);}
this.renderCurrentHeat();}else{try{const updatePromises=dnsChanges.map(change=>this.persistenceManager.updateStatus(parseInt(heatId,10),change.slotIndex,change.newValue));if(updatePromises.length>0){await Promise.all(updatePromises);}
await this.persistenceManager.updateHeatState(parseInt(heatId,10),3);this.initPenalty(heatId);this.upcomingHeats.splice(this.currentHeatIndex,1);if(this.currentHeatIndex>=this.upcomingHeats.length){this.currentHeatIndex=Math.max(0,this.upcomingHeats.length-1);}
this.renderCurrentHeat();}catch(error){notifyError(`${window.APP_TEXTS.depart.alertErrorStartingHeat} ${error.message}`);button.disabled=false;button.textContent=window.APP_TEXTS.depart.btnStartHeat;if(existingClock){const newClockPlaceholder=document.getElementById('live-clock-display');if(newClockPlaceholder){newClockPlaceholder.replaceWith(existingClock);}}}finally{if(existingClock){const newClockPlaceholder=document.getElementById('live-clock-display');if(newClockPlaceholder){newClockPlaceholder.replaceWith(existingClock);}}}}}
async handleToggleAbsent(checkbox){const row=checkbox.closest('tr');if(checkbox.checked){const choice=await this.showCustomConfirm(window.APP_TEXTS.depart.confirmDnsTitle||"Confirmation d'absence",window.APP_TEXTS.depart.confirmDnsMessage||"Voulez-vous vraiment noter ce compétiteur comme absent (DNS) ?",[{text:window.APP_TEXTS.cancel,value:'cancel',class:'secondary'},{text:window.APP_TEXTS.confirm,value:'confirm',class:'danger'}]);if(choice!=='confirm'){checkbox.checked=false;return;}}
if(row){row.classList.toggle('is-absent',checkbox.checked);}}
showCustomConfirm(title,message,buttons){return new Promise((resolve)=>{const overlay=document.getElementById('custom-dialog-overlay');const titleEl=document.getElementById('dialog-title');const messageEl=document.getElementById('dialog-message');const actionsEl=document.getElementById('dialog-actions');titleEl.textContent=title;messageEl.textContent=message;actionsEl.innerHTML='';buttons.forEach(btnInfo=>{const button=document.createElement('button');button.textContent=btnInfo.text;button.dataset.value=btnInfo.value;if(btnInfo.class)button.classList.add(btnInfo.class);actionsEl.appendChild(button);});const clickHandler=(event)=>{const clickedButton=event.target.closest('button');if(clickedButton){overlay.classList.remove('visible');actionsEl.removeEventListener('click',clickHandler);resolve(clickedButton.dataset.value);}};actionsEl.addEventListener('click',clickHandler);overlay.classList.add('visible');});}}
window.onload=function(){changerOrientation('auto');};document.addEventListener('DOMContentLoaded',async()=>{await loadLanguage(['common','peripheriques']);const departApp=new DepartUI();document.body.addEventListener('click',(event)=>{const target=event.target.closest('button[data-action], input[data-action]');if(!target)return;const action=target.dataset.action;switch(action){case'start-heat':departApp.handleStartHeatClick(target.dataset.heatId);break;case'toggle-absent':departApp.handleToggleAbsent(target);break;case'next-heat':departApp.handleNextHeat();break;case'previous-heat':departApp.handlePreviousHeat();break;case'refresh-data':departApp.fetchAndDisplayHeats();break;}});window.addEventListener('beforeunload',()=>departApp.destroy());departApp.initialize();});
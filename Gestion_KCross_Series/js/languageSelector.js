import{AVAILABLE_LANGUAGES}from'./languageConfig.js';import{getLanguage}from'./languageManager.js';const UI_STATE_STORAGE_KEY='kcross_ui_state_before_lang_change';export class LanguageSelector{constructor(containerId,onBeforeChangeCallback){this.container=document.getElementById(containerId);if(!this.container){console.error(`LanguageSelector: Conteneur #${containerId} non trouvé.`);return;}
this.currentLang=getLanguage();this.onBeforeChange=onBeforeChangeCallback||(()=>null);}
init(){if(!this.container)return;this._buildHTML();this._attachEventListeners();}
_buildHTML(){const currentLangData=AVAILABLE_LANGUAGES[this.currentLang];let optionsHTML='';for(const langCode in AVAILABLE_LANGUAGES){if(langCode!==this.currentLang){const langData=AVAILABLE_LANGUAGES[langCode];optionsHTML+=`
                    <li data-lang="${langCode}">
                        <img src="${langData.flag}" alt="&nbsp;" class="language-selector-flag">
                        <span>${langData.name}</span>
                    </li>
                `;}}
const selectorHTML=`
            <div class="language-selector">
                <div class="language-selector-current" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
                    <img src="${currentLangData.flag}"  alt="&nbsp;" class="language-selector-flag">
                    <span>${currentLangData.name}</span>
                    <span class="language-selector-arrow">▼</span>
                </div>
                <ul class="language-selector-dropdown" role="menu">
                    ${optionsHTML}
                </ul>
            </div>
        `;this.container.innerHTML=selectorHTML;}
_attachEventListeners(){const currentSelector=this.container.querySelector('.language-selector-current');const dropdown=this.container.querySelector('.language-selector-dropdown');currentSelector.addEventListener('click',()=>{const isExpanded=currentSelector.getAttribute('aria-expanded')==='true';currentSelector.setAttribute('aria-expanded',!isExpanded);dropdown.classList.toggle('visible');});dropdown.addEventListener('click',(event)=>{const targetLi=event.target.closest('li');if(targetLi&&targetLi.dataset.lang){this._changeLanguage(targetLi.dataset.lang);}});document.addEventListener('click',(event)=>{if(!this.container.contains(event.target)){currentSelector.setAttribute('aria-expanded','false');dropdown.classList.remove('visible');}});}
_changeLanguage(langCode){const uiState=this.onBeforeChange();if(uiState){sessionStorage.setItem(UI_STATE_STORAGE_KEY,JSON.stringify(uiState));}
const url=new URL(window.location);url.searchParams.set('lang',langCode);window.location.href=url.toString();}}
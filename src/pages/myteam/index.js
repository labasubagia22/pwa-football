import myTeamTemplate from './index.hbs';
import Handlebars, { compile } from 'handlebars';
import { Collapsible, toast } from 'materialize-css';
import { localDate, localTime } from '../../script/util';
import { read, remove } from '../../script/db';
import { 
  DB_OBJECT_STORE_NAME, 
  PAGE_INFO_IMG_EMPTY, 
  PAGE_INFO_CONTENT_ACTION_TEXT_RELOAD 
} from '../../script/const';
import { refreshAppContent } from '../../index'
import { Info } from '../info';
import './index.scss';

// Local log
const LOG_LABEL = '[MyTeam Page]';

/**
 * MyTeam component
 * @param {Element} element 
 */
const MyTeam = async (element) => {

  // Helper
  Handlebars.registerHelper('localDate', localDate);
  Handlebars.registerHelper('localTime', localTime);

  try {

    // Get data
    const team = await getMyTeam(); 

    // Compile template
    // Team not exist
    if (!team) {
      
      // Info callback
      const callback = () => {
        location.hash = '#/';
      }
  
      // Empty Info
      await Info({
        element, 
        image: PAGE_INFO_IMG_EMPTY, 
        title: 'Favorite Empty', 
        message: 'Please select a team from standing page', 
        actionText: 'Go to standing page', 
        callback,
      });

    } 
    // Team exist
    else {

      // Team page
      element.innerHTML = compile(myTeamTemplate)({ team });

      // Manipulate DOM in init
      init(team);
    }

  } catch (error) {

    // Unknown error
    await Info({
      element,  
      title: 'Something Wrong', 
      message: 'Please check this page later', 
      actionText: `Or ${PAGE_INFO_CONTENT_ACTION_TEXT_RELOAD}`, 
      callback: refreshAppContent,
    });

    console.error(`${LOG_LABEL} ${error}`);
  }
}

/**
 * Get favorite team
 */
const getMyTeam = async () => {
  const teams = await read({ objecrStore: DB_OBJECT_STORE_NAME });
  return teams.length ? teams[0] : null;
}

/**
 * Unselect favorite team
 * @param {Int} keyPath 
 */
const unSelectMyTeam = async (keyPath) => {
  try {
    await remove({ objectStore: DB_OBJECT_STORE_NAME, keyPath });
    refreshAppContent();
    toast({html: 'Unselect team succeed'});
  } catch (error) {
    toast({html: 'Unselect team failed'});
    console.error(`${LOG_LABEL} Unselect failed ${error.message}`);
  }
}

/**
 * Init
 * @param {Object} team
 */
const init = async (team) => {

  // Init collabsible
  const elems = document.querySelectorAll('.collapsible');
  Collapsible.init(elems);

  // Unset action
  const btnUnset = document.querySelector('#btnUnset');
  btnUnset.addEventListener('click', () => {
    unSelectMyTeam(team.id);
  });

}

export default MyTeam;
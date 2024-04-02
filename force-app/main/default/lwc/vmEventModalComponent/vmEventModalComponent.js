//  * @Description: <UC-005> PC Task 3: Program (Jobs) calendar | Once user clicks on the program item, sf record should be viewed in a popup window
//                  <UC-023> PC Task 4: Open the calendar shift in a new tab | User cab see the shift detail on pop-up window and provide a link/button to open this record in a new tab
//  * @ComponentName: vmEventModelComponent
//  * @Developer: Waruna Wickramasinghe <UC-005>, Waruna Wickramasinghe <UC-023>
//  * @Date: 02/02/2024
//  **********************************************************************************************************************************************************
//  *Version                         Date                           Developer                                      Description
//   v01                             02/02/2024                     Waruna Wickramasinghe                          Initial Version
//   v02                             15/02/2024                     Waruna Wickramasinghe                          <UC-023> link to open record in a new tab         
//  **********************************************************************************************************************************************************
import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { openTab } from 'lightning/platformWorkspaceApi';
import {loadStyle} from 'lightning/platformResourceLoader';
import customModalStyles from '@salesforce/resourceUrl/customModalStyles';

export default class EventModal extends LightningModal {
    // Define the public property 'content'
    @api content;

    renderedCallback(){
        Promise.all([
            loadStyle(this, customModalStyles)
        ])
    }
    // Define the function to close the modal
    handleClose() {
        this.close('okay'); 
    }
 
    // Define the function to open the Volunteer_Shift__c in a new tab
    focusNewTab() {
        openTab({
            url: '/lightning/r/Volunteer_Shift__c/'+this.content.Id+'/view',
            label: this.content.title +' | Volunteer Shift',
            focus: true
       }).catch((error) => {
            console.log(error);
       });
       this.handleClose();
   }
}
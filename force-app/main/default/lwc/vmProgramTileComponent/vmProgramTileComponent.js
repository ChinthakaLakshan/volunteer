/**
 * @ClassName: -
 * @Description: UC-0072 - (Home page) - Create a tile for filtered program
 * @Developer: Pulsara Sandeepa
 * @Date: 03/04/2024
 /*********************************************************************************************************************************************************************
  *Version                         Date                          Developer                                                             Description
   v01                             03/04/2024                    Pulsara Sandeepa                                                      Initial Version 			      
 ***********************************************************************************************************************************************************************
 */
import { LightningElement, api } from 'lwc';
import vmImage1 from '@salesforce/resourceUrl/vm_image1';
import { NavigationMixin } from 'lightning/navigation';
import siteURL from '@salesforce/label/c.siteURL';

export default class VmProgramTileComponent extends NavigationMixin(LightningElement) {
    @api id;
    @api imageSrc =vmImage1;
    @api title;
    @api location;
    duration;
    @api startDate;
    @api endDate;
    @api volunteerType;
    @api skills;

    connectedCallback(){
        if(this.startDate && this.endDate){
            const startDateSubstring = this.startDate.substring(0, 10);
            this.duration = startDateSubstring + ' to ' + this.endDate;
        }
    }
    handleMoreInfo() {
        console.log('id',this.id);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: siteURL+'/volunteer-program/',
                recordId:this.id
            }
    })
    }
}
//  * @Description:<UC-017> - Create a component to display Volunteer programs with available shifts in Experience Cloud site
//  * @ComponentName: vmVolunteerProgramListComponent
//  * @Class Name: VM_VolunteerProgramListController
//  * @Developer: Waruna Wickramasinghe
//  * @Date: 13/03/2024
//  **********************************************************************************************************************************************************
//  *Version                         Date                           Developer                                      Description
//   v01                             13/03/2024                     Waruna Wickramasinghe                          Initial Version         
//  **********************************************************************************************************************************************************

import { LightningElement, api, track, wire } from 'lwc';
import getVolunterProgramList from '@salesforce/apex/VM_VolunteerProgramListController.getVolunterProgramList';

export default class VmVolunteerProgramListComponent extends LightningElement {
    @api No_of_Days_From_Now; // Number of Days from Today
    @api No_of_Programs; // Number of Programs to Display
    @track startDateRange; // Start Date Range
    @track endDateRange; // End Date Range
    @track volunteerProgramList = []; // Volunteer Program List

    // Fetch the Volunteer Program List
    connectedCallback() {
        let date = new Date(); // Today's Date
        this.startDateRange = new Date(); // Today's Date
        this.endDateRange = new Date(date.setDate(date.getDate() +  this.No_of_Days_From_Now)); // Today's Date + No_of_Days_From_Now

        // Fetch the Volunteer Program List
        getVolunterProgramList({startDateRange: this.startDateRange, endDateRange: this.endDateRange, lim: this.No_of_Programs})
        .then(data => {
            if (data) {
                this.volunteerProgramList = data;; // Volunteer Program List
            } else if (error) {
                console.log('error', error); // Error Message
            }
        })
        .catch(error => {
            this.error = error; // Error Message
        })
    }
}
//  * @ClassName: VM_InterviewFilterController
//  * @Description:<UC-0020> Copied from UC-0014 | Filter past interview details by status and the date range (LWC)
//  * @Developer: Waruna Wickramasinghe <UC-0020>
//  * @Date: 27/02/2024
//  *********************************************************************************************************************************
//   *Version                         Date                          Developer                                      Description
//    v01                             27/02/2024                    Waruna Wickramasinghe                          Initial Version 
//    v02                             05/03/2024                    Waruna Wickramasinghe                          Change the Picklist into Multiple Select Picklist        
//  *********************************************************************************************************************************
import getFilteredData from '@salesforce/apex/VM_InterviewFilterController.getFilteredData';
import getSkills from '@salesforce/apex/VM_InterviewFilterController.getSkills';
import { LightningElement, api, wire, track  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Define the columns for the data table
const columns = [
    { label: 'Interview ID', fieldName: 'interviewName', type: 'text' },
    { label: 'Date', fieldName: 'startdate', type: 'date' },
    { label: 'Skills', fieldName: 'skillNames', type: 'text' },
    { label: 'Status', fieldName: 'interviewStatus', type: 'text'},
    { label: 'Comments', fieldName: 'comment', type: 'text'},
];

// Define the Lightning web component
export default class VmInterviewFilterComponent extends LightningElement {
    @track startDateTime=null; // Track the start date/time
    @track endDateTime=null; // Track the end date/time
    @api recordId // The record ID
    @track skillOptions =[]; // Track the skill options
    @track selectedSkills = []; // Track the selected skills
    @track comboboxValue=null; // Track the combobox value
    @api objectApiName; // The API name of the object
    @track allSkills = []; // Track all the skills
    columns = columns; // The columns for the data table

    // Wire the getSkills function to the component
    @wire(getSkills, {recordId: '$recordId'})
    wiredSkills({error, data}) {
        if (data) {
            let skillOptions = [];
            skillOptions.push({ label: 'All Skills', value: null });
            skillOptions.push(...data.map(skillName => ({
                        label: skillName,
                        value: skillName
                    })));
                    this.skillOptions = skillOptions;
        } else if (error) {
            console.log('error', error);
        }
    }

    // Handle the reset fields event button click
    handleResetFields(){
        this.selectedSkills = [];
        this.allSkills = [];
        this.template.querySelector('lightning-formatted-text[data-id="infMsg"]').style.visibility = 'hidden';
        this.template.querySelector('lightning-input[data-id="sDate"]').value = null;
        this.template.querySelector('lightning-input[data-id="eDate"]').value = null;
        this.template.querySelector('lightning-combobox[data-id="skill"]').value = null;
    }

    // Handle the filter Interviews button click
    handleFilterInterviews(){
        // Get the start date from the input field
        let startDate = this.template.querySelector('lightning-input[data-id="sDate"]').value;
        // If a start date is provided, format it to the required format
        if(startDate){
            this.startDateTime = startDate.toString()+'T00:00:00.000+0000';
        }else{
            // If no start date is provided, set it to null
            this.startDateTime = null;
        }

        // Get the end date from the input field
        let endDate = this.template.querySelector('lightning-input[data-id="eDate"]').value;
        // If an end date is provided, format it to the required format
        if(endDate){
            this.endDateTime = endDate.toString()+'T23:59:59.000+0000';
        }else{
            // If no end date is provided, set it to null
            this.endDateTime = null;
        }
        
        // Get the selected skill from the combobox
        let comboboxValue = this.template.querySelector('lightning-combobox[data-id="skill"]').value;
        // If a skill is selected, set it as the combobox value
        if(comboboxValue){
            this.comboboxValue = comboboxValue;
        }else{
            // If no skill is selected, set the combobox value to null
            this.comboboxValue = null;
        }
        
        // Check if both start and end dates are provided and if the start date is later than the end date
        if(startDate && endDate && startDate>endDate){
            this.selectedSkills = [];
            this.template.querySelector('lightning-formatted-text[data-id="infMsg"]').style.visibility = 'hidden';
            // If the start date is later than the end date, dispatch a new ShowToastEvent
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error', // The title of the toast
                    message: 'End Date cannot be before Start Date', // The message to be displayed
                    variant: 'error' // The variant of the toast, in this case, it's an error
                })
            );
        }else{
            // Call the getFilteredData function with the selected parameters
            getFilteredData ({startDate: this.startDateTime, endDate: this.endDateTime, recordId: this.recordId, searchSkill: this.allSkills })
                .then((data) => {
                    this.selectedSkills = [];
                    this.selectedSkills.push(...data.map(row => ({
                        interviewName : row.interviewName,
                            startdate : row.startdate,
                            interviewStatus : row.interviewStatus,
                            skillNames : row.skillNames.join(', '),
                            comment : row.comment
                    })
                        ));
                    // If the function returns data, set it as the selected skills
                    //this.selectedSkills = data;
                    console.log('data', data);
                })
                .catch((error) => {
                    // If an error occurs, log it
                    this.error = error;
                })
                .finally(() => {
                    // If no skills are selected, show the information message
                    if(this.selectedSkills.length<1){
                        this.template.querySelector('lightning-formatted-text[data-id="infMsg"]').style.visibility = 'visible';
                    }else{
                        // If skills are selected, hide the information message
                        this.template.querySelector('lightning-formatted-text[data-id="infMsg"]').style.visibility = 'hidden';
                    }
                });
        }
    }

    // Hhandles the selection of skills
    handleSkillSelection(event) {
        // If the selected skill is not already in the allSkills array and it's not null
        if (!this.allSkills.includes(event.target.value) && event.target.value != null) {
            // Add the selected skill to the allSkills array
            this.allSkills.push(event.target.value);
        } else if(event.target.value == null) {
            // If the selected value is null, reset the allSkills array
            this.allSkills = [];
        }
    }

    // Handles the removal of skills
    handleRemoveSkills(event) {
        // Get the value of the skill to be removed
        const valueRemoved = event.target.name;
        // Remove the skill from the allSkills array
        this.allSkills.splice(this.allSkills.indexOf(valueRemoved), 1);

        if(this.allSkills.length < 1){
            this.template.querySelector('lightning-combobox[data-id="skill"]').value = null;
        }
    }
}
import { LightningElement, track, api } from 'lwc';

// Importing Apex methods
import getCampaign from '@salesforce/apex/VM_BulkUploadController.getCampaign';
import getVolunteerProgram from '@salesforce/apex/VM_BulkUploadController.getVolunteerProgram';
import getVolunteerShift from '@salesforce/apex/VM_BulkUploadController.getVolunteerShift';
import getStatusPicklistValues from '@salesforce/apex/VM_BulkUploadController.getStatusPicklistValues';
import saveVolunteers from '@salesforce/apex/VM_BulkUploadController.saveVolunteers';

// Importing ShowToastEvent for displaying toast messages
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class vmBulkUploadComponent extends LightningElement {
   
    // Tracked properties to trigger UI updates
    @track listOfVolunteers;
    @track campaignOptions = [];
    @track programOptions = [];
    @track shiftOptions = [];
    @track statusOptions = [];
    @track contactOptions = [];

    // Variables to hold selected values
    campaignValue;
    programValue;
    shiftValue;
    statusValue;
    shift_from;
    end_date;
    rowId;
    selectedSearchResult;
    contactValue;

    // Lifecycle hook to initialize data
    connectedCallback() {
        this.initData();
        this.getCampainList();
        this.getStatusList();
    }

    // Initialize data
    initData() {
        let listOfVolunteers = [];
        this.createRow(listOfVolunteers);
        this.listOfVolunteers = listOfVolunteers;
    }

    // Create a new row for volunteers
    createRow(listOfVolunteers) {
        let VolunteerObject = {};
        if (listOfVolunteers.length > 0) {
            VolunteerObject.index = listOfVolunteers[listOfVolunteers.length - 1].index + 1;
        } else {
            VolunteerObject.index = 1;
        }
        VolunteerObject.contact = null;
        VolunteerObject.status = null;
        VolunteerObject.hours = null;
        VolunteerObject.numberOfVolunteers = null;
        listOfVolunteers.push(VolunteerObject);
    }
    
    // Clear all fields
    clearFields(){
        this.contactValue = null;
        this.shiftValue = '';
        this.campaignValue = '';
        this.programValue = '';
        this.shift_from = '';
        this.shift_to = '';
        this.removeAllRows();
    }

    // Add a new row
    addNewRow() {
        this.createRow(this.listOfVolunteers);
    }

    // Remove a selected row
    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;

        let listOfVolunteers = [];
        for(let i = 0; i < this.listOfVolunteers.length; i++) {
            let tempRecord = Object.assign({}, this.listOfVolunteers[i]); //cloning object
            if(tempRecord.index !== toBeDeletedRowIndex) {
                listOfVolunteers.push(tempRecord);
            }
        }

        for(let i = 0; i < listOfVolunteers.length; i++) {
            listOfVolunteers[i].index = i + 1;
        }

        this.listOfVolunteers = listOfVolunteers;
    }

    // Remove all rows
    removeAllRows() {
        let listOfVolunteers = [];
        this.contactValue = null;
        this.createRow(listOfVolunteers);
        this.listOfVolunteers = listOfVolunteers;
    }

    // Fetch campaign list
    getCampainList(){
        getCampaign()
        .then(data =>{
            if (data) {
                this.campaignOptions = data.map(campaign => ({
                    label: campaign.Name,
                    value: campaign.Id
                })); 
            }
        })
        .catch(error => {
        });
    }
   
    // Handle campaign change
    handleCampaignChange(event) {
        this.campaignValue = event.detail.value;
        this.getProgramList();
    }

    // Fetch program list
    getProgramList() {
        getVolunteerProgram({ selectedCampaign: this.campaignValue })
            .then(data => {
                if (data) {
                    this.programOptions = data.map(program => ({
                        label: program.Name,
                        value: program.Id
                    }));
                }
            })
            .catch(error => {
            });
    }

    // Handle program change
    handleProgramChange(event) {
        this.programValue = event.detail.value;
        this.getShiftList();
    }

    // Fetch shift list
    getShiftList() {
        getVolunteerShift({ selectedProgram: this.programValue })
            .then(data => {
                if (data) {
                    this.shiftOptions = data.map(shift => ({
                        label: shift.Name,
                        value: shift.Id
                    }));
                }
            })
            .catch(error => {
            });
    }

    // Handle shift change
    handleShiftChange(event) {
        this.shiftValue = event.detail.value;
    }

    // Fetch status list
    getStatusList() {
        getStatusPicklistValues()
            .then(data => {
                if (data) {
                    this.statusOptions = data.map(status => ({
                        label: status,
                        value: status
                    }));
                }
            })
            .catch(error => {
            });
    }

  // Handle contact selection
handleSelectContact(event) {
    const { id, value } = event.detail;
    // Update selected contact for the volunteer
    console.log('contact-1',id);
    console.log('contact-2',value);
    this.updateSelectedValue(id, 'contact', value);
}



    // Handle status change
    handleStatusChange(event) {
        const value = event.detail.value;
        const { id,name } = event.target.dataset;
        this.updateSelectedValue(id, name, value);
    }

    // Handle number of hours change
    handleNumOfHoursChange(event) {
        const value = event.detail.value;
        const { id,name } = event.target.dataset;
        this.updateSelectedValue(id, name, value);
    }

    // Handle number of volunteers change
    handleNumOfVolunteersChange(event) {
        const value = event.detail.value;
        const { id,name } = event.target.dataset;
        this.updateSelectedValue(id, name, value);
    }

    // Handle start date change
    handleStartDateChange(event) {
        this.shift_from  = event.target.value;
    }

    // Handle end date change
    handleEndDateChange(event) {
        this.shift_to = event.target.value;
    }

    // Update selected value
    updateSelectedValue(index, fieldName, value) {
        const rowIndex = this.listOfVolunteers.findIndex((rec) => rec.index === parseInt(index));
        if (rowIndex !== -1) {
            this.listOfVolunteers[rowIndex][fieldName] = value;
        }
    }

    // Save volunteers data
    saveVolunteers() {
        const volunteerData = {
            campaign: {
                name: this.campaignValue,
                program: this.programValue,
                shift: this.shiftValue,
                shift_from: this.shift_from,
                shift_to: this.shift_to
            },
            volunteer_hours: this.listOfVolunteers.map((volunteer) => ({
                    contact: volunteer.contact,
                    status: volunteer.status,
                    hours_worked: volunteer.hours,
                    num_volunteers: volunteer.numberOfVolunteers
            }))
        };
        console.log('volunteerData',volunteerData)
        saveVolunteers({ volunteerData: JSON.stringify(volunteerData) })
            .then(result => {
                this.showToast();
                this.clearFields();
            })
            .catch(error => {
                this.showToaste();
            });
    }

    // Show success toast message
    showToast() {
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: 'Your Record details have been saved',
        });
        this.dispatchEvent(event);
    }

    // Show error toast message
    showToaste() {
        const event = new ShowToastEvent({
            variant: 'error',
            title: 'Error',
            message: 'Your Record details have not been saved',
        });
        this.dispatchEvent(event);
    }
}
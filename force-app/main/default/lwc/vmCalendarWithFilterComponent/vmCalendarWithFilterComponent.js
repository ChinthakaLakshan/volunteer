//  * @ClassName: VM_VolunteersShiftCalendar
//  * @Description:<UC-006> PC Task 1 - Program (Jobs) calendar | Calendar Component Design Color coding shifts based on the program
//                 <UC-007> PC Task 2 - Program (Jobs) calendar | Filter Program Data by Campaign and Program
//  * @Developer: Waruna Wickramasinghe <UC-006>, Janaka Bandara <UC-007>
//  * @Date: 02/02/2024
//  *********************************************************************************************************************************
//   *Version                         Date                          Developer                                      Description
//   v01                             02/02/2024                     Waruna Wickramasinghe, Janaka Bandara          Initial Version         
//  *********************************************************************************************************************************
import { LightningElement,track, wire } from 'lwc';
import EventModal from 'c/vmEventModalComponent';
import getCampaings from '@salesforce/apex/VM_VolunteersShiftCalendar.getCampaings';
import getJobs from '@salesforce/apex/VM_VolunteersShiftCalendar.getJobs';
import getEvents from '@salesforce/apex/VM_VolunteersShiftCalendar.getShifts';

export default class vmCalendarWithFilterComponent extends LightningElement {
    @track startDate=new Date();
    @track endDate;
    @track events=[];
    @track isLoad = false;
    @track selectedCamping = '';
    @track selectedJob = '';
    @track campingOptions = [];
    @track jobOptions = [];
    @track showOptions = false;
    @track hasEvents = true;
    error;
    openModal = false;  
    searchTerm = '';

    // To Get a list of campaigns according to the search term
    handleCampingChange(event) {
        this.searchTerm = event.target.value.trim().toLowerCase(); // Trim the search term
        getCampaings({ searchTerm: this.searchTerm })
            .then(data => {
                let campingOptions = [];
                // If the search term is empty or equals 'all', prepend the "All Campaigns" option
                if (!this.searchTerm || this.searchTerm === 'all') {
                    campingOptions.push({ label: 'All Campaigns', value: '' });
                }
                // Add campaign options if available
                if (data && data.length > 0) {
                    campingOptions.push(...data.map(campaign => ({
                        label: campaign.Name,
                        value: campaign.Id
                    })));
                }     
                this.campingOptions = campingOptions;
                this.error = undefined;
                this.showOptions = this.campingOptions.length > 0;
            })
            .catch(error => {
                this.campingOptions = [];
                this.error = 'Error fetching campaigns';
            });
    }
    
    // Method to show picklist options
    showPicklistOptions() {
        if (!this.campingOptions) {
            this.campingOptions = this.campingOptions;
        }
    }

    handleOptionClick(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectedCamping = selectedValue;
        this.selectedCampingName = this.campingOptions.find(option => option.value === selectedValue).label;
        this.showOptions = false; // Hide options after selection
        this.campingOptions = []; // Clear filtered options
    }

    // Method to clear search results
    clearSearchResults() {
        this.campingOptions = null;
    }

    @wire(getJobs, { selectedCampingId: '$selectedCamping' })
    wiredJobs({ data, error }) {
        if (data) {
            this.jobOptions = [
                { label: 'All Programs', value: '' }, // Special value for all jobs
                ...data.map(job => {
                    return {
                        label: job.Name,
                        value: job.Id
                    };
                })
            ];
            this.error = undefined;
        } else if (error) {
            this.jobOptions = [];
            this.error = 'Error fetching jobs';
        }
    }

    // Event handler for job selection change
    handleJobChange(event) {
        this.selectedJob = event.detail.value;
    }

    @wire(getEvents, { selectedCampingId: '$selectedCamping', selectedJobId: '$selectedJob' })
    eventObj(value) {
    const { data, error } = value;
        if (data) {
            // Check if "All Campaigns and ALL Jobs" is selected
            if (this.selectedCamping === '' && this.selectedJob === '') {
                // If the special value is selected, display all events
                this.displayAllEvents(data);
            } else {
                // Format as a full calendar event object
                let records = data.map(event => {
                    const campaignColorCode = event.Volunteer_Program__r.Campaign__r.Campaign_Color_Code__c || '#1f88d9';
                    var recurrenceSheduleTemp;
                    // Check if the 'Recurrence_Schedule__c' field is exist
                    if(event.Recurrence_Schedule__c){
                        recurrenceSheduleTemp = event.Recurrence_Schedule__r.Name; // assign the 'Name' field
                    }else{
                        recurrenceSheduleTemp = " "; // assign the string " "
                    }
                    return {
                        Id: event.Id,
                        recordId: event.detail,
                        title: event.Name,
                        start: event.Start_Date_Time__c,
                        allDay: true,
                        backgroundColor: campaignColorCode, 
                        borderColor: campaignColorCode, 
                        textColor: '#000000',
                        duration: event.Duration__c,
                        description: event.Description__c,
                        volunteerProgram: event.Volunteer_Program__r.Name,
                        totalVolunteers: event.Total_Volunteers__c,
                        numberOfVolunteersStillNeeded: event.Number_of_Volunteers_Still_Needed__c,
                        recurrenceShedule: recurrenceSheduleTemp
                    };
                });
                this.events = JSON.parse(JSON.stringify(records));
                this.error = undefined;
                this.isLoad = true;
                this.hasEvents = this.events.length > 0; // Update hasEvents based on the presence of events
            }
        } else if (error) {
            this.events = [];
            this.error = 'No events are found';
            this.hasEvents = false; // Update hasEvents since there are no events
        }else {
            // No error, but no events found
            this.events = [];
            this.error = undefined;
            this.isLoad = true;
            // Update hasEvents since there are no events
            this.hasEvents = false;
        }
    }

    // Display all shift on the calender without filtering when there are no selection
    displayAllEvents(data) {
        let records = data.map(event => {
            const campaignColorCode = event.Volunteer_Program__r.Campaign__r.Campaign_Color_Code__c || '#1f88d9';
            var recurrenceSheduleTemp;
            // Check if the 'Recurrence_Schedule__c' field is exist
            if(event.Recurrence_Schedule__c){
                recurrenceSheduleTemp = event.Recurrence_Schedule__r.Name; // assign the 'Name' field
            }else{
                recurrenceSheduleTemp = " "; // assign the string " "
            }
            return {
                Id: event.Id,
                recordId: event.detail,
                title: event.Name,
                start: event.Start_Date_Time__c,
                allDay: true,
                backgroundColor: campaignColorCode, 
                borderColor: campaignColorCode, 
                textColor: '#000000',
                duration: event.Duration__c,
                description: event.Description__c,
                volunteerProgram: event.Volunteer_Program__r.Name,
                totalVolunteers: event.Total_Volunteers__c,
                numberOfVolunteersStillNeeded: event.Number_of_Volunteers_Still_Needed__c,
                recurrenceShedule: recurrenceSheduleTemp
            };
        });
        this.events = JSON.parse(JSON.stringify(records));
        this.error = undefined;
        this.isLoad = true;
    }
    
    //Open Modal Event Handler
    async handleEvent(event) {
        var id=event.detail;
        let task = this.events.find(x=>x.Id===id);
        //Open Modal
        const eventModal = await EventModal.open({
            size: 'small', //Modal Size
            description: 'Display Event Details',
            content: task //Modal Content
        });
    }
}
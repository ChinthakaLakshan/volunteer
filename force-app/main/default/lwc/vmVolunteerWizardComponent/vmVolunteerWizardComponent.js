import { LightningElement, track } from 'lwc';
import createCampaignWizard from "@salesforce/apex/VM_WizardCampaignCreationController.createCampaignWizard";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const columns = [
    { label: 'ID', fieldName: 'id', type: 'number' },
    { label: 'Name', fieldName: 'name', type: 'text' },
    { label: 'Description', fieldName: 'description', type: 'text' },
    { label: 'Start Date', fieldName: 'startDate', type: 'date' },
    { label: 'End Date', fieldName: 'endDate', type: 'date' },
    { label: 'Recurring', fieldName: 'recurring', type: 'boolean' },
    {
        label: 'Action',
        type: 'button',
        typeAttributes: { 
            label: 'Delete', 
            variant: 'destructive', 
            name: 'delete', 
            iconName: 'utility:delete', 
            title: 'Delete' 
        }
    }
];
export default class ProgramTable extends LightningElement {
    @track columns = columns;
    @track value;
    @track allDaysofWeek = [];
    daysOfWeekOptions = [
        { label: 'Sunday', value: 'Sunday' },
        { label: 'Monday', value: 'Monday' },
        { label: 'Tuesday', value: 'Tuesday' },
        { label: 'Wednesday', value: 'Wednesday' },
        { label: 'Thursday', value: 'Thursday' },
        { label: 'Friday', value: 'Friday' },
        { label: 'Saturday', value: 'Saturday' },
    ];

    @track allOccurrences = [];
    weeklyOccurrenceOptions = [
        { label: 'Every', value: 'Every' },
        { label: 'Alternate', value: 'Alternate' },
        { label: '1st', value: '1st' },
        { label: '2nd', value: '2nd' },
        { label: '3rd', value: '3rd' },
        { label: '4th', value: '4th' },
        { label: '5th', value: '5th' },
    ]
    name = "";
    programData = [];
    description = "";
    startDate = "";
    endDate = "";
    numberOfPrograms = "";
    programName = "";
    programDescription = "";
    programSkills = "";
    programEndDate ="";
    recurring = false;
    showRecurrenceSchedule = false;
    daysOfWeek = "";
    weeklyOccurrence = "";
    startDateTime = "";
    programDuration = "";
    showProgramInformation = false;
    showProgramDetails = false;
    idCounter = 1;

    connectedCallback() {
        // Initialize visibility based on Number Of Programs
        this.checkNumberOfPrograms();
    }

    checkNumberOfPrograms() {
        // Assuming 'numberOfPrograms' is a numeric value
        if (parseInt(this.numberOfPrograms) > 0) {
            this.showProgramInformation = true;
            this.showProgramDetails = true;
        }
        else {
            this.showProgramInformation = false;
            this.showProgramDetails = false;
        }
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        if(actionName === 'delete') {
            const row = event.detail.row;
            this.handleDelete(row);
        }
    }

    handleDelete(row) {
        const recordId = row.id;
        deleteRecord({ recordId })
            .then(result => {
                // remove the record from the data array
                const index = this.programData.findIndex(item => item.id === recordId);
                if (index !== -1) {
                    this.programData = [...this.programData.slice(0, index), ...this.data.slice(index + 1)];
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Record Deleted Successfully',
                            variant: 'success'
                        })
                    );
                    return;
                }
            })
            .catch(error => {
                console.error('Error deleting record:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error Deleting the Record',
                        variant: 'error'
                    })
                );
                return;
            });
    }

    handleNameChange(event) {
        this.name = event.target.value;
        console.log('name:', this.name);


    }
    handleDescriptionChange(event) {
        this.description = event.target.value;
        console.log('description:', this.description);
    }
    handleStartDateChange(event) {
        this.startDate = event.target.value;
        console.log('Start Date:', this.startDate);
        // Check if the start date is after the end date
        if (this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
            // Reset the start date and show an error message
            this.startDate = '';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Start Date cannot be later than End Date',
                    variant: 'error'
                })
            );
        }
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
        console.log('End Date:', this.endDate);
        // Check if the end date is before the start date
        if (this.startDate && new Date(this.endDate) < new Date(this.startDate)) {
            // Reset the end date and show an error message
            this.endDate = '';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'End Date cannot be earlier than Start Date',
                    variant: 'error'
                })
            );
            return;
        }
    }

    handleNumberOfProgramsChange(event) {
        this.numberOfPrograms = event.target.value;
        console.log('Number Of Programs:', this.numberOfPrograms);
        this.checkNumberOfPrograms();
    }
    handleProgramNameChange(event) {
        this.programName = event.target.value;
        console.log('Program Name:', this.programName);
    }
    handleProgramDescriptionChange(event) {
        this.programDescription = event.target.value;
        console.log('Program Description:', this.programDescription);
    }
    handleSkillsChange(event) {
        this.programSkills = event.target.value;
        console.log('Program Skills:', this.programSkills);
    }

    handleStartDateTimeChange(event) {
        this.startDateTime = event.target.value;
        console.log('Start Date Time:', this.startDateTime);
        // Validate Start Date Time against Program End Date
        if (this.programEndDate && new Date(this.startDateTime) > new Date(this.programEndDate)) {
            // Reset the start date and show an error message
            this.startDateTime = '';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Start date time cannot be later than End Date',
                    variant: 'error'
                })
            );
            return;
        }
        // Validate Start Date Time against Campaign Start Date
        if (this.startDate && new Date(this.startDateTime) < new Date(this.startDate)) {
            // Reset the start date and show an error message
            this.startDateTime = '';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Program start Date Time cannot be earlier than Campaign Start Date',
                    variant: 'error'
                })
            );
            return;
        }
     }

    handleProgramEndDateChange(event) {
        this.programEndDate = event.target.value;
        console.log('Program End Date: ', this.programEndDate);
// Check if the end date is before the start date

if (this.startDateTime && new Date(this.programEndDate) < new Date(this.startDateTime)) {
    // Reset the end date and show an error message
    this.programEndDate = '';
    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Error',
            message: 'Program End date cannot be earlier than Program Start Date',
            variant: 'error'
        })
    );
    return;
}

// Validate End Date against Campaign End Date
if (this.programEndDate && new Date(this.endDate) < new Date(this.programEndDate)) {
    this.programEndDate = '';
    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Error',
            message: 'Program End date cannot be later than Campaign End date',
            variant: 'error'
        })
    );
    return;
}
    }


    handleRecurringChange(event) {
        this.recurring = event.target.checked;
        console.log('Recurring:', this.recurring);

        if (this.recurring) {
            this.showRecurrenceSchedule = true;
        }
        else {
            this.showRecurrenceSchedule = false;
        }
    }

    handleDaysofWeek(event) {
        if (!this.allDaysofWeek.includes(event.target.value)) {
            this.allDaysofWeek.push(event.target.value);
            console.log('all days of week', this.allDaysofWeek);

        }

    }

    handleRemove(event) {
        const valueRemoved = event.target.name;
        this.allDaysofWeek.splice(this.allDaysofWeek.indexOf(valueRemoved), 1);
        console.log('all days of week', this.allDaysofWeek);

    }
    handleWeeklyOccurrence(event) {
        if (!this.allOccurrences.includes(event.target.value)) {
            this.allOccurrences.push(event.target.value);
            console.log('all Occurrences', this.allOccurrences);

        }

    }

    handleRemoveOccurrences(event) {
        const valueRemoved = event.target.name;
        this.allOccurrences.splice(this.allOccurrences.indexOf(valueRemoved), 1);
        console.log('all days of week', this.allOccurrences);

    }
    
    handlepProgramDurationChange(event) {
        this.programDuration = event.target.value;
        console.log('Program Duration:', this.programDuration);
    }
    handleInputChange(event) {
        let field = event.target.dataset.field;
        let value = event.target.value;
        console.log('Input Data:', event.target.value);
        this.programData = [{
            ...this.programData[0],
            [field]: value
        }];
    }

    get showSaveButton() {
        const numberOfProgramsLimit = parseInt(this.numberOfPrograms);
        return this.programData.length < numberOfProgramsLimit;
    }

    handleSave() {
        // Check if programName already exists
        console.log('handle save');
        console.log('Input Data:', this.programData[0]);
        // Check if the user has reached the limit of programs
        const numberOfProgramsLimit = parseInt(this.numberOfPrograms);
        if (this.programData.length >= numberOfProgramsLimit) {
            console.log('Cannot add more programs. Limit reached!');
            return;
        }
        const newProgram = {
            id: this.idCounter++,
            name: this.programName,
            description: this.programDescription,
            skills: this.programSkills,
            recurring: this.recurring,
            startDate: this.startDate,
            endDate: this.programEndDate,
            daysOfWeek: this.allDaysofWeek,
            weeklyOccurrence: this.allOccurrences,
            startDateTime: this.startDateTime,
            duration: this.programDuration,
        };
        //add the new program to the programData array
        this.programData = [...this.programData, newProgram];
        console.table(this.programData);
        //reset form fields
        this.recurring = false;
        this.resetProgramForm();
    }

    //method to reset foem fields
    resetProgramForm() {
        this.programName = '';
        this.programDescription = '';
        this.programSkills = '';
        this.recurring = false;
        this.programEndDate ='';
        this.showRecurrenceSchedule = false;
        this.allDaysofWeek = [];
        this.allOccurrences = [];
        this.startDateTime = '';
        this.programEndDate = '';
        this.programDuration = '';
    }

    resetForm() {
        this.name = '';
        this.description = '';
        this.startDate = '';
        this.endDate = '';
        this.numberOfPrograms = '';
        this.programName = '';
        this.programDescription = '';
        this.programSkills = '';
        this.recurring = false;
        this.programEndDate ='';
        this.showRecurrenceSchedule = false;
        this.allDaysofWeek = [];
        this.allOccurrences = [];
        this.startDateTime = '';
        this.programDuration = '';
      
    }
    handleDelete(event) {
        const programId = event.target.dataset.id;
        // Find the index of the program to delete
        const indexToDelete = this.programData.findIndex(program => program.id === programId);
        if (indexToDelete !== -1) {
            // Remove the program from the programData array
            this.programData.splice(indexToDelete, 1);
            // Optionally, you can show a confirmation message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Program deleted successfully',
                    variant: 'success'
                })
            );
        }
    }
    
    handleSubmit() {
        // Validate required fields
        if (!this.name || !this.startDate || !this.endDate || !this.numberOfPrograms || this.programData.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill out all required fields',
                    variant: 'error'
                })
            );
            return;
        }
    
        // Validate date fields
        if (new Date(this.startDate) > new Date(this.endDate)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Start date cannot be later than end date',
                    variant: 'error'
                })
            );
            return;
        }
    
        // Validate program data
        for (const program of this.programData) {
            if (!program.name || !program.description || !program.startDate || !program.endDate) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please fill out all required fields for program',
                        variant: 'error'
                    })
                );
                return;
            }
        }

        // If all validations pass, proceed with submitting the data
        const campaignData = {
            campaignName: this.name,
            campaignstartDate: this.startDate,
            campaignendDate: this.endDate,
            campaignDescription: this.description,
            noOfVolunteerProgrammes: this.numberOfPrograms,
            Volunteer_Programme: this.programData.map(program => {
                return {
                    volunteerProgrammeName: program.name,
                    skills: program.skills,
                    volunteerProgrammeDescription: program.description,
                    Recurring: program.recurring,
                    Volunteer_Shift: !program.recurring
                    ? [{
                        shiftStartDate: program.startDateTime,
                        shiftDuration: program.duration,
                        shiftDescription: program.description
                    }]
                    :null,
                    Recurrence_Shedule: program.recurring
                        ? [{
                            daysOfWeek: program.daysOfWeek,
                            weeklyOccurrence: program.weeklyOccurrence,
                            startDateTime: program.startDateTime,
                            recEndDate: program.endDate,
                            Duration: program.duration
                        }]
                        : null
                };
            })
        }
    
        console.log('campaignData:', campaignData);
    
        const jsonString = JSON.stringify(campaignData);
    
        //Log the JSON string
        console.log('submit data:', jsonString);
    
        createCampaignWizard({ wrapperText: jsonString })
            .then(result => {
                console.log(result);
                this.programData = [];
                this.resetForm();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Campaign Information Submitted Successfully!',
                        variant: 'Success'
                    })
                );
                return;
            })
            .catch(error => {
                console.log(error);
            });
    }
    
}
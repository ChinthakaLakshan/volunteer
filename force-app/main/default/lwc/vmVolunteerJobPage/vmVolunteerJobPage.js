//  * @ClassName: VmVolunteerJobPage
//  * @Description:<UC-0077>  Create program web page - for both recurring and non recurring
//    @Backend class :VM_ProgrammePageController          
//  * @Developer:  Chinthaka Lakshan 
//  * @Date: 02/02/2024
//  *********************************************************************************************************************************
//   *Version                         Date                          Developer                                      Description
//   v01                             04/08/2024                     Chinthaka Lakshan                              Initial Version         
//  *********************************************************************************************************************************
import { LightningElement, track, api, wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import myResource from '@salesforce/resourceUrl/program';
import RegisterForShiftModal from 'c/vmRegisterForShiftPortal';
import getVolunteeerProgrammeDetails from  '@salesforce/apex/VM_ProgrammePageController.getVolunteeerProgrammeDetails';

export default class VmVolunteerJobPage extends LightningElement {
@api programmeName;
@api location ;
@api currentDate = '';
@api volunteerRole;
@api skills = []; 
@api description ;
@api recordId ;
@api imageUrl;

connectedCallback() {
    // Get the record Id from the URL
    const url = new URL(window.location.href);
    const rId = url.searchParams.get('recordId');
    this.recordId = rId;
}
@wire(getVolunteeerProgrammeDetails, { programmeId: '$recordId' })
wiredProgram({ error, data }) {
    if (this.recordId && data) {
        console.log('Dataaaaaa', data);
        if (Array.isArray(data) && data.length > 0) {
            // Data is returned successfully
            const programmeDetails = data[0];
            this.programmeName = programmeDetails.Name;
            this.location = programmeDetails.Location_City__c;
            this.currentDate = programmeDetails.Start_Date_Time__c ? programmeDetails.Start_Date_Time__c.substring(0, 10) : '';
            this.description=programmeDetails.Description__c;
            this.volunteerRole=programmeDetails.Volunteer_Type__c;
            if (programmeDetails.Program_Image_URL__c) {
                const htmlParser = new DOMParser().parseFromString(programmeDetails.Program_Image_URL__c, 'text/html');
                console.log('pro URL:', programmeDetails.Program_Image_URL__c);
                const imgElement = htmlParser.querySelector('img');
                if (imgElement) {
                    // Extract the 'src' attribute value from the imgElement
                    const imageUrl = imgElement.getAttribute('src');
                    this.imageUrl = imageUrl;
                    console.log('Image URL:', imageUrl);
                }
            }
            if (programmeDetails.Skills_Needed__c) {
            this.skills = programmeDetails.Skills_Needed__c.split(';'); 
        }
        } else {
            console.error('No data found or unexpected data format:', data);
        }
    } else if (error) {
        // Handle server-side error
        console.error('Error fetching data:', error);
    } else {
    
        console.error('Unknown error occurred');
    }
}

async handleRegisterEvent(event) {
//Open Modal
const eventModal = await RegisterForShiftModal.open({
size: 'small', //Modal Size
description: 'Display Event Details',
//content: task //Modal Content
});
}

}
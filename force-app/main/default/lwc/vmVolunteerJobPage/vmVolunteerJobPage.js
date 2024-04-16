//  * @ClassName: VmVolunteerJobPage
//  * @Description:<UC-0077>  Create program web page - for both recurring and non recurring
//    @Backend class :VM_ProgrammePageController          
//  * @Developer:  Chinthaka Lakshan 
//  * @Date: 02/02/2024
//  *********************************************************************************************************************************
//   *Version                         Date                          Developer                                      Description
//   v01                             04/08/2024                     Chinthaka Lakshan                              Initial Version         
//  *********************************************************************************************************************************
import { LightningElement, api} from 'lwc';
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
this.recordId = url.searchParams.get('recordId');
this.fetchProgrammeDetails();
}
fetchProgrammeDetails() {
getVolunteeerProgrammeDetails({ programmeId: this.recordId })
    .then(result => {
        if (result) {
           
            if (Array.isArray(result) && result.length > 0) {
                // Data is returned successfully
                const programmeDetails = result[0];
                this.programmeName = programmeDetails.Name;
                this.location = programmeDetails.Location_City__c;
                this.currentDate = programmeDetails.Start_Date_Time__c ? programmeDetails.Start_Date_Time__c.substring(0, 10) : '';
                this.description = programmeDetails.Description__c;
                this.volunteerRole = programmeDetails.Volunteer_Type__c;
                if (programmeDetails.Program_Image_URL__c) {
                    const htmlParser = new DOMParser().parseFromString(programmeDetails.Program_Image_URL__c, 'text/html');
                    const imgElement = htmlParser.querySelector('img');
                    if (imgElement) {
                        this.imageUrl = imgElement.src;
                    }
                }
                if (programmeDetails.Skills_Needed__c) {
                    this.skills = programmeDetails.Skills_Needed__c.split(';'); 
                }
            } else {
                console.error('No data found or unexpected data format:', result);
            }
        } else {
            console.error('Error fetching data: Result is empty');
        }
    })
    .catch(error => {
        // Handle server-side error
        console.error('Error fetching data:', error);
    });
}



}
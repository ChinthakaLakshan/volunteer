import { LightningElement, track, api, wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import myResource from '@salesforce/resourceUrl/program';
import RegisterForShiftModal from 'c/vmRegisterForShiftPortal';
import getVolunteeerProgrammeDetails from  '@salesforce/apex/VM_ProgrammePageController.getVolunteeerProgrammeDetails';

export default class VmVolunteerJobPage extends LightningElement {
    @track programmeName = 'Test Programme 1';
    @track location = 'NewYork';
    @track currentDate = '2024/03/28';
    @track volunteerRole = 'Volunteer';
    @track skills = ['Skill 1', 'Skill 2', 'Skill 3']; 
    @track imageUrl = myResource;
    @track description =  `
    **Ocean Clean Volunteer Programme**
    
    Join us in our mission to preserve and protect the world's oceans through our Ocean Clean Volunteer Programme. As a volunteer, you will have the opportunity to make a meaningful impact on marine ecosystems while engaging in rewarding and fulfilling work.
    
    **Programme Details:**
    
    - **Location:** Coastal regions and beaches worldwide.
    - **Duration:** Flexible, ranging from one-time events to ongoing projects.
    - **Activities:**
      - Beach cleanups: Remove litter and debris from shorelines to prevent harm to marine life.
      - Educational outreach: Raise awareness about the importance of ocean conservation and sustainable practices.
      - Data collection: Assist in monitoring marine debris and biodiversity to support research efforts.
      - Recycling initiatives: Organize recycling programs and promote responsible waste management.
    - **Benefits:**
      - Contributing to a cleaner and healthier environment for marine species and coastal communities.
      - Learning about marine conservation and environmental sustainability.
      - Building connections with like-minded individuals and community members.
      - Developing valuable skills in teamwork, leadership, and environmental stewardship.
    
    **How to Get Involved:**
    
    Joining our Ocean Clean Volunteer Programme is easy and rewarding. Simply sign up for upcoming events or projects through our website or contact us directly to learn more about volunteer opportunities in your area. No prior experience is required – all you need is enthusiasm and a passion for protecting our oceans.
    
    Make a difference today by becoming a part of our Ocean Clean Volunteer Programme. Together, we can create a cleaner, healthier future for our planet's oceans and marine life. Join us in making a positive impact on the environment and inspiring others to do the same!
        `;
        @track isModalOpen;
        recordId;


        @wire(CurrentPageReference)
        currentPageReferenceHandler(currentPageReference) {
            if (currentPageReference && currentPageReference.state) {
                this.recordId = currentPageReference.state.recordId;
            }
          }

          @wire(getVolunteeerProgrammeDetails ,{programmeId:'recordId'} )
          wiredProgram ({error , data}){
            if(data){
              this.programmeName=data.Name;
              this.location=data.Location_City__c;
              this.currentDate=data.Start_Date_Time__c;

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
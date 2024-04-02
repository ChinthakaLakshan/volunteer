/**
* @ClassName: VM_WizardCampaignCreationController
* @Description:<UC -0011> Volunteer campaign creation with program (recurring and non-recurring) , program and Shift [] creation Apex class is responsible for processing 
   a JSON input string, creating related  records, including Campaigns, Volunteer Programs, Recurrence Schedules, and Volunteer Shifts
* @Developer:Chinthaka Lakshan
* @Date: 1/11/2024
/**********************************************************************************************************************
*Version                         Date                          Developer                     Description
v01                             01/29/2024                     Chinthaka Lakshan         
************************************************************************************************************************/
public class VM_WizardCampaignCreationController {
    
    public class VM_WizardCampaignWrapper{
        @AuraEnabled
        public String campaignName {get;set;}
        @AuraEnabled
        public String campaignDescription {get;set;}
        @AuraEnabled
        public String campaignstartDate {get;set;}
        @AuraEnabled
        public String campaignendDate {get;set;}
        @AuraEnabled
        public String noOfVolunteerProgrammes {get;set;}        
        @AuraEnabled
        public List<VolunteerProgramme> Volunteer_Programme {get;set;}       
        @AuraEnabled
        public List<RecurrenceShedule> Recurrence_Shedule {get;set;}
        
    }
    
    public class VolunteerProgramme {
        @AuraEnabled
        public String volunteerProgrammeName {get;set;}      
        //@AuraEnabled
        // public String volunteerProgrammeStartDate {get;set;} 
        @AuraEnabled
        public String Recurring {get;set;}
        @AuraEnabled
        public String skills {get;set;} 
        //  @AuraEnabled
        //  public String volunteerProgrammeEndDate {get;set;}      
        @AuraEnabled
        public String volunteerProgrammeDescription {get;set;}        
        @AuraEnabled
        public List<VolunteerShift> Volunteer_Shift {get;set;}        
        @AuraEnabled
        public List<RecurrenceShedule> Recurrence_Shedule {get;set;}
        
    }
    
    public class VolunteerShift{
        @AuraEnabled
        public String shiftStartDate {get;set;}         
        @AuraEnabled
        public String shiftDuration {get;set;}         
        @AuraEnabled
        public String shiftDescription {get;set;} 
    }
    
    public class RecurrenceShedule{
        @AuraEnabled
        public String daysOfWeek {get;set;}         
        @AuraEnabled
        public String weeklyOccurrence {get;set;}         
        @AuraEnabled
        public String startDateTime {get;set;}         
        @AuraEnabled
        public String Duration {get;set;} 
         @AuraEnabled
        public String recEndDate {get;set;} 
    }
    
    /*  ***Function of this method***

      *Create Campaign
      *Create Volunteer Programme
      *Check Reccuring | Non Recurring
      *Create Recurring Schedule
      *Create Volunteeer Shifts

*/
    public static void createCampaignWizard(String wrapperText){

        System.debug(wrapperText);
        //[ToDO: make sure you comment the warpper text ]
        //wrapperText='{"campaignName":"Community Cleanup","campaignstartDate":"2024-10-01","campaignendDate":"2024-10-31","campaignDescription":"Beautifying the community","Volunteer_Programme":[{"volunteerProgrammeName":"Street Cleaning","skills":"Physical fitness","Volunteer_Shift":[{"shiftStartDate":"2024-10-05 09:00:00.000","shiftDuration":"4","shiftDescription":"Morning Cleanup"},{"shiftStartDate":"2024-10-15 13:00:00.000","shiftDuration":"3","shiftDescription":"Afternoon Cleanup"}]},{"volunteerProgrammeName":"Park Beautification","skills":"Gardening","Recurring":"true","Recurrence_Shedule":[{"daysOfWeek":"Wednesday;Friday","weeklyOccurrence":"1st" ,"startDateTime":"2024-01-10 10:00:00.000","Duration":"2" ,"recEndDate":"2024-01-10"}]}]}';
        List<Volunteer_Program__c> volunteerprogramme = new List<Volunteer_Program__c>();
        List<Volunteer_Shift__c> Volunteershift = new List<Volunteer_Shift__c>();
        List<Recurrence_Schedule__c> recurrenceScheduleList = new  List<Recurrence_Schedule__c>();
        Map <String , List<Recurrence_Schedule__c>> mapProgrammeNameRec = new  Map <String , List<Recurrence_Schedule__c>>();
        Map <String , List<Volunteer_Shift__c>> mapProgrammeNameShift = new  Map <String , List<Volunteer_Shift__c>>();        
        List<Volunteer_Shift__c> allShifts = new List<Volunteer_Shift__c>();
        
        try {
            VM_WizardCampaignWrapper wrapper = (VM_WizardCampaignWrapper)JSON.deserialize(wrapperText, VM_WizardCampaignWrapper.class);
           
            if(wrapper!=null){          
                Campaign campaign =new Campaign();
                campaign.Name=wrapper.campaignName;
                campaign.Description=wrapper.campaignDescription;
                Date convertedStartDate = Date.valueOf(wrapper.campaignstartDate);
                campaign.StartDate=convertedStartDate;                
                Date convertedEndDate = Date.valueOf(wrapper.campaignendDate);
                campaign.EndDate=convertedEndDate;               
                // Integer convertedNoOfProgrammes = Integer.valueOf(wrapper.noOfVolunteerProgrammes);                
                if (campaign != null) {
                    insert campaign;
                }                
                if(wrapper.Volunteer_Programme!=null){
                    System.debug('programme list'+wrapper.Volunteer_Programme);                                           
                    Recurrence_Schedule__c rs = new Recurrence_Schedule__c();
                    Datetime recurrenceScheduleDatetime;
                    Date convertedEndDateRec;
                    RecurrenceShedule firstRecurrence;
                    for(VolunteerProgramme vp:wrapper.Volunteer_Programme){
                        Volunteer_Program__c programme = new Volunteer_Program__c();                       
                        programme.Campaign__c=campaign.Id;                                             
                        programme.Name=vp.volunteerProgrammeName;
                        programme.Description__c=vp.volunteerProgrammeDescription;                                               
                        System.debug(vp.volunteerProgrammeName);                       
                        volunteerprogramme.add(programme);                      
                        if(vp.Recurring=='true' && vp.Recurrence_Shedule != null && !vp.Recurrence_Shedule.isEmpty()) {   
                            firstRecurrence = vp.Recurrence_Shedule[0];                              
                            rs.Weekly_Occurrence__c=firstRecurrence.weeklyOccurrence;                            
                            rs.Days_of_Week__c= firstRecurrence.daysOfWeek;                           
                            recurrenceScheduleDatetime = Datetime.valueOf(firstRecurrence.startDateTime);
                            rs.Schedule_Start_Date_Time__c = recurrenceScheduleDatetime;                       
                            Decimal recurrenceScheduleDuration = Decimal.valueOf(firstRecurrence.Duration);
                            rs.Duration__c=recurrenceScheduleDuration;  
                            convertedEndDateRec = Date.valueOf(firstRecurrence.recEndDate);
                            rs.Schedule_End_Date__c= convertedEndDateRec;
                            
                            recurrenceScheduleList.add(rs);
                            mapProgrammeNameRec.put(vp.volunteerProgrammeName ,recurrenceScheduleList );
                            
                        }                     
                        if(vp.Volunteer_Shift != null && !vp.Volunteer_Shift.isEmpty() ){
                            
                            Datetime myDatetime;
                            Decimal decimalValueOfShiftDuration;
                            for( VolunteerShift vs : vp.Volunteer_Shift){ 
                               Volunteer_Shift__c s = new  Volunteer_Shift__c();                                  
                                s.Description__c=vs.shiftDescription;  
                                myDatetime = Datetime.valueOf(vs.shiftStartDate);
                                s.Start_Date_Time__c=myDatetime;                               
                                decimalValueOfShiftDuration = Decimal.valueOf(vs.shiftDuration);
                                s.Duration__c = decimalValueOfShiftDuration;                                   
                                Volunteershift.add(s);
                                mapProgrammeNameShift.put(vp.volunteerProgrammeName , Volunteershift );
                            }                        
                        }      
                    }
                    
                    if (!volunteerprogramme.isEmpty()) {
                        insert volunteerprogramme;
                    }  
                    
                    for(Volunteer_Program__c c:volunteerprogramme){
                        if( mapProgrammeNameRec.keyset().contains(c.Name)){               
                            System.debug('mapProgrammeNameRec'+mapProgrammeNameRec.get(c.Name)[0]);
                            mapProgrammeNameRec.get(c.Name)[0].Volunteer_Program__c = c.Id;                            
                            System.debug(' map values'+mapProgrammeNameRec.values());  
                        }
                    }
                  
                    // Iterate over the created Volunteer Program records
                    for (Volunteer_Program__c c : volunteerprogramme) {
                        // Check if there are shifts associated with the current Volunteer Program Name
                        if (mapProgrammeNameShift.containsKey(c.Name)) {
                            // Retrieve the list of shifts for the current Volunteer Program
                            List<Volunteer_Shift__c> shifts = mapProgrammeNameShift.get(c.Name); 
                            // Iterate over all lists of shifts for different Volunteer Programs (values in the map)
                            for (List<Volunteer_Shift__c> shiftsList : mapProgrammeNameShift.values()) {
                              // Iterate over individual shifts in the list
                                    for (Volunteer_Shift__c shift : shiftsList) {
                                     
                                            shift.Volunteer_Program__c = c.Id;
                                            allShifts.add(shift);
                                        
                                }
                            }     
                        }
                    }
                    
                    if (!allShifts.isEmpty()) {
                        insert allShifts;
                    }
                    if(mapProgrammeNameRec != null && !mapProgrammeNameRec.values().isEmpty()) {
                        insert mapProgrammeNameRec.values()[0];
                        System.debug(' map values'+mapProgrammeNameRec.values().size());    
                    }    
                }
            }    
        } 
        catch (Exception e) {
           System.debug('The following exception has occurred: ' + e.getMessage());
            
        } 
    }
}
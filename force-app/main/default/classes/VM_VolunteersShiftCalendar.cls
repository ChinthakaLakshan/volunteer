/**
 * @ClassName: VM_VolunteersShiftCalendar
 * @Description:<UC-006> PC Task 1 - Program (Jobs) calendar | Calendar Component Design Color coding shifts based on the program
                <UC-007> PC Task 2 - Program (Jobs) calendar | Filter Program Data by Campaign and Program
 * @Developer: Waruna Wickramasinghe <UC-006>, Janaka Bandara <UC-007>
 * @Date: 02/02/2024
 /********************************************************************************************************************************
  *Version                         Date                          Developer                                      Description
  v01                             02/02/2024                     Waruna Wickramasinghe, Janaka Bandara          Initial Version         
 *********************************************************************************************************************************/

 public with sharing class VM_VolunteersShiftCalendar{

    // GET ALL THE CAMPGINS
    @AuraEnabled(cacheable=true)
    public static List<Campaign> getCampaings(String searchTerm){
        Datetime dtnow = Datetime.now();
        Integer offset = UserInfo.getTimezone().getOffset(dtnow);
        Datetime local = dtnow.addSeconds(offset/1000);
        List<Campaign> vCampaign; 
        String likeTerm = '%' + searchTerm + '%';
        vCampaign = [SELECT Id, Name FROM Campaign WHERE Name LIKE :likeTerm LIMIT 15];
        if (!vCampaign.isEmpty() ) {
            return vCampaign;
        } else {
            return null;
        }
    }

    // GET ALL THE JOBS RELATED TO A SINGLE CAMPING
    @AuraEnabled(cacheable=true)
    public static List<Volunteer_Program__c> getJobs(String selectedCampingId){
        Datetime dtnow = Datetime.now();
        Integer offset = UserInfo.getTimezone().getOffset(dtnow);
        Datetime local = dtnow.addSeconds(offset/1000);
        List<Volunteer_Program__c> vJobs; 
        // Check if a specific camping is selected
        if (String.isNotBlank(selectedCampingId)) {
            // fetch all the jobns for the selected camping ID
            vJobs = [SELECT Id, Name FROM Volunteer_Program__c WHERE Campaign__c = :selectedCampingId LIMIT 800];
        } else {
            // If no specific camping is selected, fetch all jobs
            vJobs = [SELECT Id, Name FROM Volunteer_Program__c LIMIT 800];
        }
        if (!vJobs.isEmpty()) {
            return vJobs;
        } else {
            return null;
        }
    }

    // GET SHIFT RELATED TO A SINGLE JOB
    @AuraEnabled(cacheable=true)
    public static List<Volunteer_Shift__c> getShifts(String selectedCampingId, String selectedJobId){
        Datetime dtnow = Datetime.now();
        Integer offset = UserInfo.getTimezone().getOffset(dtnow);
        Datetime local = dtnow.addSeconds(offset/1000);
        List<Volunteer_Shift__c> vShifts; 
        // Construct the base query
        String query = 'SELECT Id, Name, Duration__c, Description__c, Start_Date_Time__c, Volunteer_Program__r.Campaign__r.Campaign_Color_Code__c FROM Volunteer_Shift__c ';
        // Check if a specific camping is selected
        if (String.isNotBlank(selectedCampingId)) {
            query += ' WHERE Volunteer_Program__r.Campaign__c = \'' + selectedCampingId + '\'';
        }
        // Check if a specific job is selected
        if (String.isNotBlank(selectedJobId)) {
            if (query.contains('WHERE')) {
                query += ' AND ';
            } else {
                query += ' WHERE ';
            }
            query += 'Volunteer_Program__c = \'' + selectedJobId + '\'';
        }
        // Complete the query
        query += ' ORDER BY Start_Date_Time__c LIMIT 800';
        // Execute the query
        vShifts = Database.query(query);
        if (!vShifts.isEmpty()) {
            return vShifts;
        } else {
            return null;
        }
    }
}
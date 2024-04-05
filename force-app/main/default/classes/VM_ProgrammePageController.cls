public class VM_ProgrammePageController {
    public static List<Volunteer_Shift__c> getVolunteeerShifts(String programmeId){
         List<Volunteer_Shift__c> shiftList =[SELECT  Name , Duration__c ,Description__c , Volunteer_Program__r.Name ,Shift_Name__c  FROM Volunteer_Shift__c WHERE Volunteer_Program__c =: programmeId ];
        return shiftList;
    }
    public static List<String> getVolunteeerSkills(String programmeId){
        List<Volunteer_Program__c> programmeList = [SELECT Skills_Needed__c FROM Volunteer_Program__c WHERE Id = :programmeId];
        List<String> skillList = new List<String>();
         for(Volunteer_Program__c programme : programmeList){
        skillList.add(programme.Skills_Needed__c);
    }
    return skillList;
    }
     public static List<Volunteer_Program__c> getVolunteeerProgrammeDetails(String programmeId){
         List<Volunteer_Program__c> programDetails =[SELECT  Name ,Location_City__c, Description__c,Skills_Needed__c ,Volunteer_Type__c ,Start_Date_Time__c  FROM Volunteer_Program__c WHERE Id =: programmeId ];
       System.debug('Skills: ' + programDetails);
         return programDetails;
    }
    
}
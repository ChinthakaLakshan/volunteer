public with sharing class VM_InterviewFilterController {
   
    
    
    @AuraEnabled
    public static List<String> getSkills(Id  recordId ) {
       List<String> skillList = new  List<String>();
        for(Contribution_Skill__c c :[SELECT Id , Skill_Name__c from Contribution_Skill__c Where Interview__c =: recordId ]){
                skillList.add(c.Skill_Name__c);
        }
        System.debug(skillList);
        return skillList;
    }
    
    @AuraEnabled(cacheable=true) 
    public static List<Interview__c> getFilteredData(Datetime startDate, Datetime endDate, String skills ,String volunteerId ) {
        List<Interview__c> retunList = new List<Interview__c>();
        String query = 'SELECT Id, Interview_Start_Date__c, Interview_Status__c, Volunteer_Name__c, Name FROM Interview__c WHERE';
    
       if (startDate != null) {
            query += ' Interview_Start_Date__c >= :startDate ';
        }

        if (endDate != null) {
            query += 'AND Interview_Start_Date__c < :endDate ';
        }
        //add status filter 
      
        if (volunteerId != null) {
            query += ' Volunteer_Name__c = \'' + volunteerId + '\' AND';
        }
        
    System.debug(query );
 
        //retunList = Database.query(query);
        System.debug(retunList.size());
        Map<Id, Interview__c> interviewMap = new Map<Id, Interview__c>((List<Interview__c>)Database.query(query));
        System.debug(interviewMap.values());
       
        
        if(skills != null){
            //concat skills into set fromat 
            Set<String> serchskillsSet = new Set<String>();
            serchskillsSet.add('Landscaping');
             serchskillsSet.add('Communication');
           Set<Id> interviewIdsToRemove = new Set<Id>();
            for(Contribution_Skill__c sc: [Select Id, Interview__c from Contribution_Skill__c Where Skill_Name__c IN : serchskillsSet AND Interview__c IN :interviewMap.keySet() ]) {
              System.debug(sc.Interview__c);
                 System.debug(sc.Id);
                
                 System.debug(interviewMap.keyset());
               
              interviewIdsToRemove.add(sc.Interview__c);
                
              
                
            }
            interviewMap.keySet().retainAll(interviewIdsToRemove);
            
            System.debug('Remaining interviews in the map: ' + interviewMap.values());
            System.debug('Remaining interviews count: ' + interviewMap.size());
        }
        
           
        return interviewMap.values();
         
    }
    
    
    
}
import { LightningElement, track,wire } from 'lwc';
import getrecentProg from '@salesforce/apex/vmProgramHandler.recentProgram';
import { NavigationMixin } from "lightning/navigation";
const columns = [
    {
        label: "Recent Programs",
        type: "button",
        typeAttributes: { label: { fieldName: "Name" }, variant: "base" ,cellAttributes: { alignment: 'left' } }
    },
];
export default class VmRecentProgram extends NavigationMixin(LightningElement) {
    @track Program;

    @wire(getrecentProg)
    Program;

    get columns() {
        return columns;
    }
    navigateToRecordViewPage(event){
        const row = event.detail.row;
        console.log(JSON.parse(JSON.stringify(row.Id)));
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                actionName: 'view'  
            }
        });
    } 
}
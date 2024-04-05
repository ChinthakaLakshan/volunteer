import { LightningElement, api,track} from 'lwc';

export default class VmProgramsOnHomeWebPortal extends LightningElement {
    recordList = []; // Array of all recordList
    displayedTiles = []; // Array of recordList to display
    currentPage = 1;
    pageSize = 6;
    totalRecords = 30;
    recCountOfDisplayList = 0;
    
    // Getter and setter the value of programDataList
    @api get programDataList() {
        return this.recordList;
    }
    set programDataList(value){
        this.recordList = value;
        this.totalRecords = this.recordList.length;
        console.log('total='+this.totalRecords);
        this.displayTiles(value);
    }
    /**
     * Set data at Init of the Home page 
     * @param {*} value record list
     */
    displayTiles(value) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.displayedTiles = value.slice(startIndex, endIndex);
        if (this.displayedTiles.length > 0) this.recCountOfDisplayList = this.pageSize - this.displayedTiles.length;
    }
   /**Invoke this function from vm-pagination-web-portal child components upon Navigation button click
    * @param: event
   */
    handlePagination(event){
        const start = (event.detail-1)*this.pageSize;
        const end = this.pageSize*event.detail;
        //console.log(start,end);
        this.displayedTiles = this.recordList.slice(start, end);
        if (this.displayedTiles.length > 0) this.recCountOfDisplayList = this.pageSize - this.displayedTiles.length;
    }
}
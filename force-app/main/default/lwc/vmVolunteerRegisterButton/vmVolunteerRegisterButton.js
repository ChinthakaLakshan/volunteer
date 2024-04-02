
import uId from '@salesforce/user/Id';
import { LightningElement, track, api, wire} from 'lwc';
import getLoginUserDetails from '@salesforce/apex/VM_ShiftRegisterButtonController.getLoginUser'
import uploadFiles from '@salesforce/apex/VM_ShiftRegisterButtonController.uploadFile';
import createContributionHour from '@salesforce/apex/VM_ShiftRegisterButtonController.createContributionHour';
import { createRecord, getRecord } from 'lightning/uiRecordApi';

export default class VmVolunteerRegisterButton extends LightningElement {
    
    @api userId = uId;
    @api shiftId;


    @track isModalOpen = false;
    @track isCommUser = false;
     @track isAdminUser = false;
     @track fileData;
     @track isSuccess;
     @track isError;
     @track btnDisabled = false;
     username;
     useremail;
     userCont;


    signup(event){
        if(uId) {
          
            this.isModalOpen = true;
            //shift id > programme > skill req> 

        } else {
            window.open('https://evonsys2-dev-ed.develop.my.site.com/s/login/SelfRegister');
        }
        
    }
    @wire(getLoginUserDetails, { uId: '$userId' })
    wiredUser({ error, data }) {
        if (data) {
            console.log('user Id wired='+JSON.stringify(data));
            this.username = data.uname;
            this.useremail = data.uemail;
            this.userCont = data.ucontact;
            if(data.ucontact) {
                this.isCommUser = true;
            } else{
                this.isAdminUser =false;
            }
            
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.log('1sError='+error.body.message);
        }
    }
    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        alert('No. of files uploaded : ' + uploadedFiles.length);
    }
    handleFNameChange(event) {
        this.fname = event.target.value;
    }

    handleLNameChange(event) {
        this.lname = event.target.value;
    }

    handleEmailChange(event) {
        this.cemail = event.target.value;
    }

    handleCommentChange(event){
        this.comment = event.target.value;
    }
    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.userCont
            }
            console.log(this.fileData)
            this.saveFile();
        }
        reader.readAsDataURL(file)
    }
    onclickRegister(){
        if(this.userCont) {
            this.btnDisabled = true;
            this.registerForShift();
            
        } else {
           this.handleSubmit();
        }
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
        this.dispatchEvent(new CustomEvent('closemodel', {
           detail: {
               close: false
           }
       }));
   }
   registerForShift(){
    this.msg ='';
    this.showSpinner = true;
    createContributionHour({ contactId:this.userCont, shiftId:this.shiftId})
    .then(result=>{
        console.log('after save' + result);
        this.msg ='Successfully signed up for the event!';
        this.isSuccess = true;
     
        this.toastEventFire('Success','Registered for the event!','success') ;
    })
    .catch(error=>{
       this.error=error.message;
       this.isError = true;
       this.msg = 'Error occured! '+error.body.message;
       console.log('is Error='+error.body.message);
       this.toastEventFire('Error creating record', error.body.message,'error') ;
    });
  }

saveFile(){
    console.log('save File call'+this.userCont);
    const {base64, filename, recordId} = this.fileData
    uploadFiles({ base64:base64, filename:this.fileName, recordId:this.userCont })
    .then(result=>{
        this.fileData = null;
        console.log('file upload success');
        //let title = `${filename} uploaded successfully!!`
    })
    .catch(error=>{
        console.log('file Error='+error.body.message);
    });

}
@api
   get acceptedFormats() {
    return ['.pdf','.png','.jpg', '.doc'];
}

}
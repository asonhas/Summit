import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';


export default class Utils{
    static customAlert(title: string, text: string, icon: SweetAlertIcon, confirmButtonText: string){
        Swal.fire({ title, text, icon, confirmButtonText });
    }

    static customAlert2Fa(): Promise<SweetAlertResult<string>>{
        return Swal.fire({
            title:'Enter summit token',
            input: 'text',
            inputPlaceholder: 'Summit token',
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter a code!';
                }
            }
        });
    }

    static async uploadFile(): Promise<File> {
        const result = await Swal.fire({
            title: 'Upload a file',
            input: 'file',
            inputAttributes: {
                accept: '*/*', // Adjust for specific file types
                'aria-label': 'Upload your file',
            },
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed && result.value instanceof File) {
            return result.value;
        } else {
            return Promise.reject(new Error('No file selected or operation cancelled.'));
        }
    };

    static customAlertWithImage(
        title: string, 
        text: string, 
        imageUrl: string, 
        confirmButtonText: string,
        imageWidth?: string | number,
        imageHeight?: string | number,
        imageAlt?: string,
    ){
        Swal.fire({
            title,
            text,
            imageUrl, // Replace with your image URL
            imageWidth: imageWidth ?? 150,
            imageHeight: imageHeight ?? 150,
            imageAlt: imageAlt ?? undefined,
            confirmButtonText,
        });
    }



    static parseJwt (token: string) { 
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) { 
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        return JSON.parse(jsonPayload);
        } catch (error) {
            return error;
        }
        
    }


    static formatDate(dateString: string | number): string {
        let date;
        if(typeof dateString === 'number'){
            date = new Date(dateString);
        }else{
            date = new Date(dateString);
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const result = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        if(result.includes('NaN')){
            return '';
        }
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    static getTimestamp(date: string): number{
        // Convert to timestamp
        const [day, month, year, time] = date.split(/[/ ]/);
        const timestamp = new Date(`${year}-${month}-${day}T${time}`).getTime();
        return timestamp;
    }

    static validateEmail (value: unknown): boolean {
        if (typeof value == 'string') {
          const isMatch = value
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
          this.customAlert('Invalid email', 'Check that the email address is valid.','error','Close');
          return !!isMatch;
        }
        return false;
    };
}

 
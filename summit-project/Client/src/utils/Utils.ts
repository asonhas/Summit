import Swal, { SweetAlertIcon } from 'sweetalert2';

export default class Utils{
    static customAlert(title: string, text: string, icon: SweetAlertIcon, confirmButtonText: string){
        Swal.fire({ title, text, icon, confirmButtonText });
    }
}
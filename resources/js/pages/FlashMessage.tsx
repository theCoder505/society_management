import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface FlashProps {
    success?: string;
    error?: string;
    warning?: string;
}

interface PageProps {
    flash: FlashProps;
    [key: string]: unknown;
}

export default function FlashMessage() {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            Swal.fire({
                icon: 'success',
                text: flash.success,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                showClass: {
                    popup: 'animate__animated animate__fadeInRight',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutRight',
                },
            });
        }

        if (flash.error) {
            Swal.fire({
                icon: 'error',
                text: flash.error,
                timer: 4000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }

        if (flash.warning) {
            Swal.fire({
                icon: 'warning',
                text: flash.warning,
                timer: 4000,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }
    }, [flash]);

    return null;
}
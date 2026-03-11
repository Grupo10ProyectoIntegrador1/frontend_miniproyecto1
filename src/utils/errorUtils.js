export const parseOverloadError = (error, defaultMessage = 'Ha ocurrido un error al actualizar.') => {
    let errorMessage = defaultMessage;
    let isOverloadConflict = false;
    let conflictMessage = "";

    if (error.response?.data) {
        const data = error.response.data;

        // El backend puede mandar el error envuelto o en la raíz
        if (data.overload_conflict) {
            isOverloadConflict = true;
            conflictMessage = data.overload_conflict.message || JSON.stringify(data.overload_conflict);
        } else if (data.limit_hours !== undefined || data.exceeds_by !== undefined) {
            isOverloadConflict = true;
            conflictMessage = data.message || JSON.stringify(data);
        }

        if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : data.detail[0];
        } else if (data.message) {
            errorMessage = typeof data.message === 'string' ? data.message : data.message[0];
        } else if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : data.error[0];
        } else if (data.target_date) {
            errorMessage = data.target_date[0];
        } else if (data.non_field_errors) {
            errorMessage = data.non_field_errors[0];
        }

        if (!isOverloadConflict) {
            const lowerError = errorMessage.toLowerCase();
            if (lowerError.includes("6 horas") ||
                lowerError.includes("horas e intentas") ||
                lowerError.includes("quedarías con") ||
                lowerError.includes("límite") ||
                lowerError.includes("planificadas")
            ) {
                isOverloadConflict = true;
                conflictMessage = errorMessage;
            }
        }
    } else if (error.message) {
        errorMessage = error.message;
    }

    return {
        isOverloadConflict,
        conflictMessage,
        errorMessage
    };
};

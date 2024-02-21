// Importación de funciones de formato y establecimiento de tipo desde un módulo llamado "formatter"
import { format, setType } from "../modules/formatter";

// Definición de la clase BedrockSystem
class BedrockSystem {
    constructor() {} // Constructor vacío

    // Método para registrar mensajes de log
    log(message, ...optionalParams) {
        setType('r'); // Establece el tipo de mensaje a "r" (normal)
        // Verifica si el mensaje es un objeto JSON
        if (isJSON(message)) {
            // Formatea los parámetros opcionales si son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element));
            });
            // Imprime el mensaje formateado con los parámetros opcionales
            console.warn(format(message), ...optionalParamsFormat);
        } else {
            // Formatea los parámetros opcionales si no son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                if (isJSON(element)) {
                    optionalParamsFormat.push(format(element));
                } else {
                    optionalParamsFormat.push(element);
                }
            });
            // Imprime el mensaje con los parámetros opcionales formateados
            console.warn(message, ...optionalParamsFormat);
        }
    }

    // Método para registrar mensajes de advertencia
    warn(message, ...optionalParams) {
        setType('6'); // Establece el tipo de mensaje a "6" (advertencia)
        // Verifica si el mensaje es un objeto JSON
        if (isJSON(message)) {
            // Formatea los parámetros opcionales si son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element));
            });
            // Imprime el mensaje de advertencia formateado con los parámetros opcionales
            console.warn(format(message), ...optionalParamsFormat);
        } else {
            // Formatea los parámetros opcionales si no son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                if (isJSON(element)) {
                    optionalParamsFormat.push(format(element));
                } else {
                    optionalParamsFormat.push(`§6${element}`);
                }
            });
            // Imprime el mensaje de advertencia con los parámetros opcionales formateados
            console.warn(`§6${message}`, ...optionalParamsFormat);
        }
    }

    // Método para registrar mensajes de error
    error(message, ...optionalParams) {
        setType('4'); // Establece el tipo de mensaje a "4" (error)
        // Verifica si el mensaje es un objeto JSON
        if (isJSON(message)) {
            // Formatea los parámetros opcionales si son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element));
            });
            // Imprime el mensaje de error formateado con los parámetros opcionales
            console.warn(format(message), ...optionalParamsFormat);
        } else {
            // Formatea los parámetros opcionales si no son JSON
            const optionalParamsFormat = [];
            optionalParams.forEach(element => {
                if (isJSON(element)) {
                    optionalParamsFormat.push(format(element));
                } else {
                    optionalParamsFormat.push(`§4${element}`);
                }
            });
            // Imprime el mensaje de error con los parámetros opcionales formateados
            console.warn(`§4${message}`, ...optionalParamsFormat);
        }
    }
}

// Función para verificar si una cadena es un objeto JSON válido
const isJSON = (output) => {
    // Si el tipo de salida no es una cadena, se considera un JSON válido
    if (typeof(output) != "string") {
        return true; // La cadena es un JSON válido
    } else {
        return false; // La cadena no es un JSON válido
    }
};

// Exporta una instancia de la clase BedrockSystem llamada "shell"
export const shell = new BedrockSystem();
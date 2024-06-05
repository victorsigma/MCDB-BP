// Importación de funciones de formato y establecimiento de tipo desde un módulo llamado "formatter"
import { format, setType } from "../modules/formatter";

// Definición de la clase BedrockSystem
class BedrockSystem {
    constructor() {} // Constructor vacío

    // Método para registrar mensajes de log
    log(...data) {
        // Establece el tipo de mensaje a "r" (normal)
        setType('r')
        const dataFormat = []
        // Formatea los parámetros si son JSON
        data.forEach(element => {
            if (isJSON(element)) {
                dataFormat.push(format(element))
            } else {
                dataFormat.push(element)
            }
        });
        
        // Imprime el mensaje
        console.warn(...dataFormat)
    }

    // Método para registrar mensajes de advertencia
    warn(...data) {
        setType('r§6'); // Establece el tipo de mensaje a "r§6" (advertencia)
        const dataFormat = []
        // Formatea los parámetros si no son JSON
        data.forEach(element => {
            if (isJSON(element)) {
                dataFormat.push(format(element))
            } else {
                dataFormat.push(`§6${element}`)
            }
        });

        // Imprime el mensaje de advertencia
        console.warn(...dataFormat)
    }


    // Método para registrar mensajes de error
    error(...data) {
        setType('r§4') // Establece el tipo de mensaje a "r§4" (error)
        const dataFormat = []
        // Formatea los parámetros si no son JSON
        data.forEach(element => {
            if (isJSON(element)) {
                dataFormat.push(format(element))
            } else {
                dataFormat.push(`§4${element}`)
            }
        });
        // Imprime el mensaje de error
        console.warn(...dataFormat)
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
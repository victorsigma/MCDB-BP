import { format, setType } from "../modules/formatter"

class BedrockSystem {
    constructor() {}
    log(message, ...optionalParams) {
        setType('r')
        if(isJSON(message)) {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element))
            });
            console.warn(format(message), ...optionalParamsFormat)
        } else {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                if(isJSON(element)) {
                    optionalParamsFormat.push(format(element))
                } else {
                    optionalParamsFormat.push(element)
                }
            });
            console.warn(message, ...optionalParamsFormat)
        }
    }

    warn(message, ...optionalParams) {
        setType('6')
        if(isJSON(message)) {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element))
            });
            console.warn(format(message), ...optionalParamsFormat)
        } else {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                if(isJSON(element)) {
                    optionalParamsFormat.push(format(element))
                } else {
                    optionalParamsFormat.push(`§6${element}`)
                }
            });
            console.warn(`§6${message}`, ...optionalParamsFormat)
        }
    }

    error(message, ...optionalParams) {
        setType('4')
        if(isJSON(message)) {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                optionalParamsFormat.push(format(element))
            });
            console.warn(format(message), ...optionalParamsFormat)
        } else {
            const optionalParamsFormat = []
            optionalParams.forEach(element => {
                if(isJSON(element)) {
                    optionalParamsFormat.push(format(element))
                } else {
                    optionalParamsFormat.push(`§4${element}`)
                }
            });
            console.warn(`§4${message}`, ...optionalParamsFormat)
        }
    }
}


const isJSON = (output) => {
    if (typeof(output) != "string") {
        return true; // La cadena es un JSON válido
    } else {
        return false; // La cadena no es un JSON válido
    }
}



export const shell = new BedrockSystem()
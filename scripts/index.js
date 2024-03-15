// Importaciones de módulos necesarios desde diferentes archivos o librerías
import { world, system } from "@minecraft/server";
import { determineQuery, queryCommanValidation } from "./libs/verificatios";
import { format } from "./libs/formatter";
import { isJSON } from "./libs/configQuerys";
import { shell } from './libs/bedrockSystem'

// Suscripción a un evento que se activa antes de que se envíe un mensaje en el chat del mundo virtual
world.beforeEvents.chatSend.subscribe((data) => {
    // Extracción de datos importantes del mensaje y el remitente
    const { message, sender } = data;
    
    // Validación del comando del mensaje
    if (queryCommanValidation(message)) {
        // Verificación si el remitente tiene una etiqueta específica para ocultar los comandos
        if (sender.hasTag("config:showquery:false")) data.cancel = true;
        
        // Ejecución de un bloque de código en el sistema de Minecraft
        system.run(() => {
            // Determinación de la consulta a realizar a partir del mensaje y el remitente
            const output = determineQuery(message, sender);
            
            // Verificación si la salida es un objeto JSON
            if (isJSON(output)) {
                // Formateo de la salida JSON
                const form = format(JSON.parse(output));
                //shell.log("Output", output, 1)

                // Envío del mensaje formateado al remitente dentro del mismo contexto de dimensión
                sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${form}`);
            } else {
                // Si no es JSON, envía la salida directamente al remitente dentro del mismo contexto de dimensión
                sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${output}`);
            }
        });
    }
});
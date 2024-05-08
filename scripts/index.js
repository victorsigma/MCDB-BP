// Importaciones de módulos necesarios desde diferentes archivos o librerías
import { world, system, Player } from "@minecraft/server";
import { determineQuery, loginQuery, queryCommanValidation } from "./libs/verificatios";
import { HttpRequest, HttpHeader, HttpRequestMethod, http } from '@minecraft/server-net';
import { format } from "./libs/formatter";
import { isJSON } from "./libs/databaseUtils";
import { shell } from './libs/bedrockSystem'


// Suscripción a un evento que se activa antes de que se envíe un mensaje en el chat del mundo virtual
world.beforeEvents.chatSend.subscribe((data) => {
    // Extracción de datos importantes del mensaje y el remitente
    const { message, sender } = data;
    
    // Validación del comando del mensaje
    if (queryCommanValidation(message)) {
        const isSecurity = sender.hasTag("config:enablesecurity:true");
        // Verificación si el remitente tiene una etiqueta específica para ocultar los comandos
        if (sender.hasTag("config:showquery:false")) data.cancel = true;

        // Ejecución de un bloque de código en el sistema de Minecraft
        system.run(async () => {
            if (!isSecurity) {
                // Determinación de la consulta a realizar a partir del mensaje y el remitente
                const output = await determineQuery(message, sender);

                // Verificación si la salida es un objeto JSON
                try {
                    // Si no es JSON, envía la salida directamente al remitente dentro del mismo contexto de dimensión
                    if (!isJSON(output)) return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${output}`);

                    const json = JSON.parse(output);

                    shell.error(json);
                    shell.log(json);
                    shell.warn(json);

                    // Envío del mensaje formateado al remitente dentro del mismo contexto de dimensión
                    sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: \n§l§7Array(${json.length}) §r§e[`);
                    for(let i = 0; i < json.length; i++) {
                        const form = format(json[i]);
                        const command = i < json.length-1 ? `tell ${sender.name} >\n§r${i}: ${form}` : `tell ${sender.name} >\n§r${i}: ${form}\n§r§e]`
                        sender.dimension.runCommandAsync(command);
                    }

                } catch (error) {
                    return shell.log(error)
                }
            } else {
                const tokens = sender.getTags().filter(filter => filter.startsWith('token:'));

                if (!tokens.length) {
                    const output = await loginQuery(message, sender);

                    // Si no es JSON, envía la salida directamente al remitente dentro del mismo contexto de dimensión
                    if (!message.startsWith('&login')) return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: Log in to continue`);

                    if (!isJSON(output)) return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${output}`);

                    // Formateo de la salida JSON
                    const form = format(JSON.parse(output));

                    // Envío del mensaje formateado al remitente dentro del mismo contexto de dimensión
                    return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${form}`);
                } else {
                    const verification = await getVerification(sender);
                    if(verification) {
                        const output = await determineQuery(message, sender);

                        // Verificación si la salida es un objeto JSON
                        try {
                            // Si no es JSON, envía la salida directamente al remitente dentro del mismo contexto de dimensión
                            if (!isJSON(output)) return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: ${output}`);

                            const json = JSON.parse(output);

                            // Envío del mensaje formateado al remitente dentro del mismo contexto de dimensión
                            sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: \n§l§7Array(${json.length}) §r§e[`);
                            for(let i = 0; i < json.length; i++) {
                                const form = format(json[i]);
                                const command = i < json.length-1 ? `tell ${sender.name} >\n§r${i}: ${form}` : `tell ${sender.name} >\n§r${i}: ${form}\n§r§e]`
                                sender.dimension.runCommandAsync(command);
                            }

                            return 
                        } catch (error) {
                            return shell.log(error)
                        }
                    } else{ 
                        return sender.dimension.runCommandAsync(`tell ${sender.name} >\n§rMCDB-Server: §4Session successfully closed`);
                    }
                }
            }
        });
    }
});

/**
 * Envia la peticion de login al back-end
 * @param {Player} player
 * @returns {Promise<boolean>}
 */
const getVerification = async (player) => {
    const req = new HttpRequest('http://localhost:3000/api/security/verification');

    const tags = player.getTags().filter(value => {
        return value.startsWith('token:');
    })

    const token = tags[0].replace('token:', '');
    
    req.method = HttpRequestMethod.Get;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
        new HttpHeader('Authorization', `Bearer ${token}`)
    ];

    const response = await http.request(req);

    const verification = response.status == 200 ? true : false;

    if(!verification) {
        const tags = player.getTags().filter(value => {
            return value.startsWith('token:');
        })

        tags.forEach(value => {
            player.removeTag(value);
        })
    }

    return verification
}
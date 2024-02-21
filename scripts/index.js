import { world, system } from "@minecraft/server";
import { determineQuery, queryCommanValidation } from "./libs/verificatios";
import { format } from "./libs/formatter";
import { isJSON } from "./libs/configQuerys";
import { shell } from './libs/bedrockSystem'


world.beforeEvents.chatSend.subscribe((data) => {
    const {message, sender} = data;
    if(queryCommanValidation(message)) {
        if(sender.hasTag("config:showquery:false")) data.cancel = true;
        system.run(() => {
            const output = determineQuery(message, sender);
            //shell.log("Output", output, 1)
            if(isJSON(output)) {
                const form = format(JSON.parse(output))
                sender.dimension.runCommandAsync(`tell ${sender.name} >\n§r${form}`)
            } else {
                sender.dimension.runCommandAsync(`tell ${sender.name} >\n§r${output}`)
            }
        })
    }
})
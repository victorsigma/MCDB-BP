import { world, system } from "@minecraft/server";
import { determineQuery, queryCommanValidation } from "./libs/verificatios";

world.beforeEvents.chatSend.subscribe((data) => {
    const {message, sender} = data;
    if(queryCommanValidation(message)) {
        if(sender.hasTag("config:showquery:false")) data.cancel = true;
        system.run(() => {
            const output = determineQuery(message, sender);
            sender.dimension.runCommandAsync(`tell ${sender.name} >\n§r${output}`)
        })
    }
})
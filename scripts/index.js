import { world } from "@minecraft/server";
import { determineQuery, queryCommanValidation } from "./libs/verificatios";

world.afterEvents.chatSend.subscribe(({message, sender}) => {
    if(queryCommanValidation(message)) {
        const output = determineQuery(message, sender);
        sender.dimension.runCommandAsync(`tell ${sender.name} >\n§r${output}`)
    }
})
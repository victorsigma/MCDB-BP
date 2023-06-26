import { Player } from "@minecraft/server"
import { alter, create, drop } from "./ddlQuerys";
import { delet, insert, update } from "./dmlQuerys";
import { DDL, DML, DQL, DUL } from "./commonResponses";
import { select } from "./dqlQuerys";
import { getDatabases, getTables } from "./databaseUtils";


const dmlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&insert": (query, player) => { return insert(query, player)},
    "&update": (query, player) => { return update(query, player)},
    "&delete": (query, player) => { return delet(query, player)}
}
Object.freeze(dmlCommandsQuerys);
const dqlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&select": (query, player) => { return select(query, player)}/* ,
    "&join": (query, player) => { return join(query, player)} */
}
Object.freeze(dqlCommandsQuerys);
const ddlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&create": (query, player) => { return create(query, player)},
    "&alter": (query, player) => { return alter(query, player)},
    "&drop": (query, player) => { return drop(query, player)}
}
Object.freeze(ddlCommandsQuerys);
const helpCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&dml": () => { return DML},
    "&dql": () => { return DQL},
    "&ddl": () => { return DDL},
    "&dul": () => { return DUL}
}
Object.freeze(helpCommandsQuerys);

const utilsCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&databases": (_query, player) => {return getDatabases(player)},
    "&tables": (query, player) => { return getTables(query, player)}
}
Object.freeze(helpCommandsQuerys);




export const queryCommanValidation = (query) => {
    return query.startsWith('&')
}

export const determineQuery = (query, player) => {
    const dmlCommands = ["&insert", "&update", "&delete"];
    const dqlCommands = ["&select"/* , "&join" */];
    const ddlCommands = ["&create", "&alter", "&drop"];
    const helpCommands = ["&dml", "&dql", "&ddl", "&dul"];
    const utilsCommands = ['&databases', "&tables"]

    const command = query.split(" ")[0]; // Get the first command in the text

    if (dmlCommands.includes(command)) {
        return dmlCommandsQuerys[command](query, player);
    } else if (dqlCommands.includes(command)) {
        return dqlCommandsQuerys[command](query, player);
    } else if (ddlCommands.includes(command)) {
        return ddlCommandsQuerys[command](query, player);
    } else if (helpCommands.includes(command)) {
        return helpCommandsQuerys[command]();
    } else if (utilsCommands.includes(command)) {
        return utilsCommandsQuerys[command](query, player)
    } else {
        return "§2Unknown class";
    }
}



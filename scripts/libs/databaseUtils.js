import { DB, INVALID_DB } from "./commonResponses";

// Obtener las bases de datos existentes
export const getDatabases = (player) => {
    const databaseTags = player.getTags().filter((tag) => tag.startsWith("db:"));
    const databasesSet = new Set(databaseTags.map((tag) => tag.split("-tbl:")[0].substring(3)));
    const databases = [...databasesSet];
    return `§aDatabases: \n§d${databases.join("\n")}`;
};

export const getTables = (query, player) => {
    const querySplit = query.split(" ");
    const dbName = querySplit[1];
    if (player.hasTag(`db:${dbName}`)) {
        const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:`) && !tag.includes("-value:"));
        const tablesSet = new Set(tableTags.map((tag) => tag.split("-tbl:")[1]));
        const tables = [...tablesSet];
        if (tables.length > 0) {
            return `§aTables: \n§d${tables.join("\n")}`;
        } else {
            return NO_MATCH;
        }
    } else {
        return INVALID_DB;
    }
};


const extractJsons = (query) => {
    const jsonRegex = /({[^{}]+})/g;
    const jsons = query.match(jsonRegex);
    const modifiedQuery = query.replace(jsonRegex, '###'); // Reemplazar los JSON con un marcador ###

    return {
        modifiedQuery,
        jsons
    };
};

export const querySplits = (query) => {
    const { modifiedQuery, jsons } = extractJsons(query);
    const split = modifiedQuery.split(' ');

    // Restaurar los JSON reemplazados en la lista dividida
    const finalSplit = split.map((item) => (item === '###' ? jsons.shift() : item));

    return finalSplit;
};
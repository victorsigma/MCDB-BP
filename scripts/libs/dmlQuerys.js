import { INVALID_QUERY, INVALID_DB } from './commonResponses';
import { querySplits } from './databaseUtils';
import { tableExists } from "./ddlQuerys";

export const insert = (query, player) => {
    //&insert dbName tableName value
    const querySplit = querySplits(query);
    if (querySplit.length > 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const rawValue = querySplit[3];
        const value = rawValue;

        if (tableExists(dbName, tableName, player)) {
            const tableProperties = getTableProperties(dbName, tableName, player);
            if (tableProperties) {
                if (validateValue(value, tableProperties)) {
                    // Insertar el valor en la tabla
                    const table = `db:${dbName}-tbl:${tableName}-value:${value}`;
                    if (player.hasTag(table)) return "§6Duplicate data";
                    player.addTag(table);
                    return "§aValue inserted";
                } else {
                    return "§4Invalid value for table properties";
                }
            } else {
                return "§4Table properties not found";
            }
        } else {
            return INVALID_DB;
        }
    } else {
        return INVALID_QUERY;
    }
}

const getTableProperties = (dbName, tableName, player) => {
    const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-properties:`));
    if (tableTags.length > 0) {
        const propertiesTag = tableTags[0];
        const propertiesStartIndex = propertiesTag.indexOf("-properties:") + 12;
        const propertiesJson = propertiesTag.substring(propertiesStartIndex);
        try {
            return JSON.parse(propertiesJson);
        } catch (error) {
            return null;
        }
    }
    return null;
}

const validateValue = (value, tableProperties) => {
    try {
        const parsedValue = JSON.parse(value);
        for (const prop in parsedValue) {
            if (!(prop in tableProperties)) {
                return false;
            }
            const propType = tableProperties[prop];
            const valueType = typeof parsedValue[prop];
            if (valueType !== propType) {
                return false;
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}


export const update = (query, player) => {
    // &update dbName tableName conditions newValues
    const querySplit = querySplits(query);
    if (querySplit.length > 4) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const conditions = JSON.parse(querySplit[3]);
        const newValues = JSON.parse(querySplit[4]);

        if (tableExists(dbName, tableName, player)) {
            const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));
            let updatedCount = 0;

            tableTags.forEach((tableTag) => {
                try {
                    const tableValue = tableTag.split("-value:")[1];
                    const json = JSON.parse(tableValue);
                    if (compareJSON(json, conditions)) {
                        const newJson = updateJSON(json, newValues);

                        if (newJson === INVALID_QUERY) {
                            return INVALID_QUERY;
                        }
                        player.removeTag(tableTag);
                        player.addTag(`db:${dbName}-tbl:${tableName}-value:${JSON.stringify(newJson)}`);
                        updatedCount++;
                    }
                } catch (error) {
                    return INVALID_QUERY;
                }
            });
            if (updatedCount > 0) {
                return `§a${updatedCount} value(s) updated`;
            } else {
                return NO_MATCH;
            }
        } else {
            return INVALID_DB;
        }
    } else {
        return INVALID_QUERY;
    }
};


const updateJSON = (json1, json2) => {
    const keys1 = Object.keys(json1);
    const keys2 = Object.keys(json2);

    // Verificar si el nuevo JSON tiene más propiedades
    if (keys2.length > keys1.length) {
        return "INVALID_QUERY";
    }

    // Actualizar las propiedades coincidentes del JSON anterior con el nuevo JSON
    for (const key of keys1) {
        if (key in json2) {
            json1[key] = json2[key];
        }
    }

    return json1;
};

export const delet = (query, player) => {
    //&delete dbName tableName datos
    const querySplit = querySplits(query);
    if (querySplit.length > 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const rawValues = querySplit.slice(3);
        const values = rawValues.map((rawValue) => rawValue);

        if (tableExists(dbName, tableName, player)) {
            let deletedCount = 0;
            const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));
            values.forEach((value) => {
                tableTags.forEach((tableTag) => {
                    try {
                        const tableValue = tableTag.split("-value:")[1];
                        const json1 = JSON.parse(tableValue);
                        const json2 = JSON.parse(value)
                        if (compareJSON(json1, json2)) {
                            player.removeTag(tableTag);
                            deletedCount++;
                        }
                    } catch (error) {
                        return INVALID_QUERY;
                    }
                });
            });

            if (deletedCount > 0) {
                return `§a${deletedCount} value(s) deleted`;
            } else {
                return NO_MATCH;
            }
        } else {
            return INVALID_DB;
        }
    } else {
        return INVALID_QUERY;
    }
};


export const compareJSON = (json1, json2) => {
    const keys1 = Object.keys(json1);
    const keys2 = Object.keys(json2);

    let count = 0; // Contador de coincidencias

    for (const key of keys1) {
        const value1 = json1[key];
        const value2 = json2[key];

        if (value1 === value2) {
            count++;
        }
    }

    // Verificar si el contador es igual a la cantidad de propiedades en json2
    return count === keys2.length;
};
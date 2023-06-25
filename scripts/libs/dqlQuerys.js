import { INVALID_QUERY, INVALID_DB } from './commonResponses';
import { tableExists } from "./ddlQuerys";
import { compareJSON } from './dmlQuerys';

export const select = (query, player) => {
    // &select dbName tableName conditions projection
    const querySplit = query.split(" ");
    if (querySplit.length >= 3) {
        try {
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const conditions = querySplit.length >= 4 ? JSON.parse(querySplit[3].replace(/_/g, " ")) : {};
            const projection = querySplit.length >= 5 ? JSON.parse(querySplit[4].replace(/_/g, " ")) : {};
    
            if (tableExists(dbName, tableName, player)) {
                const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));
    
                const results = [];
                tableTags.forEach((tableTag) => {
                    try {
                        const tableValue = tableTag.split("-value:")[1];
                        const json = JSON.parse(tableValue);
                        if (compareJSON(json, conditions)) {
                            const projectedJson = projectJSON(json, projection);
                            results.push(projectedJson);
                        }
                    } catch (error) {
                        return INVALID_QUERY;
                    }
                });
    
                if (results.length > 0) {
                    return `§a${JSON.stringify(results)}`;
                } else {
                    return NO_MATCH;
                }
            } else {
                return INVALID_DB;
            }
        } catch (error) {
            return INVALID_QUERY;
        }
    } else {
        return INVALID_QUERY;
    }
};

const projectJSON = (json, projection) => {
    if (!projection || projection.all || Object.keys(projection).length === 0) {
        return json;
    } else {
        const projectedJson = {};
        for (const prop in projection) {
            if (projection[prop]) {
                if (json.hasOwnProperty(prop)) {
                    projectedJson[prop] = json[prop];
                }
            }
        }
        return projectedJson;
    }
};
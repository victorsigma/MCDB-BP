import { INVALID_QUERY, INVALID_DB } from './commonResponses';
import { querySplits } from './databaseUtils';
import { tableExists } from "./ddlQuerys";
import { compareJSON } from './dmlQuerys';

export const select = (query, player) => {
    // &select dbName tableName conditions projection sort
    const querySplit = querySplits(query)
    if (querySplit.length >= 3) {
        try {
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const conditions = querySplit.length >= 4 ? JSON.parse(querySplit[3]) : {};
            const projection = querySplit.length >= 5 ? JSON.parse(querySplit[4]) : {};
            const sort = querySplit.length >= 6 ? JSON.parse(querySplit[5]) : {};

            if (tableExists(dbName, tableName, player)) {
                const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));

                const results = [];
                tableTags.forEach((tableTag) => {
                    try {
                        const tableValue = tableTag.split("-value:")[1];
                        const json = JSON.parse(tableValue);
                        if (compareJSON(json, conditions)) {
                            results.push(json);
                        }
                    } catch (error) {
                        return INVALID_QUERY;
                    }
                });

                if (results.length > 0) {
                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)
                    if (Object.keys(sort).length > 0) {
                        results.sort((a, b) => {
                            for (const prop in sort) {
                                const sortOrder = sort[prop];
                                if (a[prop] < b[prop]) {
                                    return sortOrder === "asc" ? -1 : 1;
                                }
                                if (a[prop] > b[prop]) {
                                    return sortOrder === "asc" ? 1 : -1;
                                }
                            }
                            return 0;
                        });
                    }

                    // Aplicar la proyección a los resultados
                    const projectedResults = results.map((result) => projectJSON(result, projection));

                    return `§a${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found";
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
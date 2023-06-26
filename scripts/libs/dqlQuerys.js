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
                    sortJSON(results, sort);

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


const sortJSON = (json, sort) => {
    if (Object.keys(sort).length > 0) {
        return json.sort((a, b) => {
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
}

// export const join = (query, player) => {
//     // &join dbName tableName1 tableName2 union conditions projection sort
//     const querySplit = query.split(" ");
//     if (querySplit.length >= 6) {
//         try {
//             const dbName = querySplit[1];
//             const tableName1 = querySplit[2];
//             const tableName2 = querySplit[3];
//             const union = querySplit[4];
//             const conditions = JSON.parse(querySplit[5].replace(/_/g, " "));
//             const projection = querySplit.length >= 7 ? JSON.parse(querySplit[6].replace(/_/g, " ")) : {};
//             const sort = querySplit.length >= 8 ? JSON.parse(querySplit[7].replace(/_/g, " ")) : {};

//             if (tableExists(dbName, tableName1, player) && tableExists(dbName, tableName2, player)) {
//                 const tableTags1 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName1}-value:`));
//                 const tableTags2 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName2}-value:`));

//                 const results = [];
//                 tableTags1.forEach((tableTag1) => {
//                     try {
//                         const tableValue1 = tableTag1.split("-value:")[1];
//                         const json1 = JSON.parse(tableValue1);

//                         tableTags2.forEach((tableTag2) => {
//                             try {
//                                 const tableValue2 = tableTag2.split("-value:")[1];
//                                 const json2 = JSON.parse(tableValue2);

//                                 if (compareJSON(json1, conditions) && compareJSON(json2, conditions)) {
//                                     const joinedJson = { ...json1, ...json2 };
//                                     const projectedJson = projectJSON(joinedJson, projection);
//                                     results.push(projectedJson);
//                                 }
//                             } catch (error) {
//                                 return INVALID_QUERY;
//                             }
//                         });
//                     } catch (error) {
//                         return INVALID_QUERY;
//                     }
//                 });

//                 if (results.length > 0) {
//                     if (Object.keys(sort).length > 0) {
//                         results.sort((a, b) => {
//                             for (const prop in sort) {
//                                 const sortOrder = sort[prop];
//                                 if (a[prop] < b[prop]) {
//                                     return sortOrder === "asc" ? -1 : 1;
//                                 }
//                                 if (a[prop] > b[prop]) {
//                                     return sortOrder === "asc" ? 1 : -1;
//                                 }
//                             }
//                             return 0;
//                         });
//                     }
//                     return `§a${JSON.stringify(results)}`;
//                 } else {
//                     return "§6No matching values found";
//                 }
//             } else {
//                 return INVALID_DB;
//             }
//         } catch (error) {
//             return INVALID_QUERY;
//         }
//     } else {
//         return INVALID_QUERY;
//     }
// };
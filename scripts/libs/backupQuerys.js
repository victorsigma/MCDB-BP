import { HttpRequest, HttpHeader, HttpRequestMethod, http } from '@minecraft/server-net';
import { INVALID_QUERY, INVALID_DB, INVALID_TABLE, INVALID_JOIN } from './commonResponses'; // Importar respuestas de consulta no válidas
import { querySplits } from './databaseUtils'; // Importar función de división de consulta
import { tableExists } from "./ddlQuerys"; // Importar función de verificación de existencia de tabla en la base de datos
import { compareJSON, insert } from './dmlQuerys'; // Importar función de comparación de objetos JSON
import { projectJSON, sortJSON } from './dqlQuerys';
import { shell } from './bedrockSystem';


export const exportTable = (query, player) => {
    // &csv/json/xml dbName tableName conditions projection sort
    // Dividir la consulta en partes
    const querySplit = querySplits(query)
    // Verificar si hay suficientes partes en la consulta
    if (querySplit.length >= 3) {
        try {
            // Obtener el nombre de la base de datos, el nombre de la tabla, las condiciones, la proyección y la clasificación de la consulta
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const conditions = querySplit.length >= 4 ? JSON.parse(querySplit[3]) : {};
            const projection = querySplit.length >= 5 ? JSON.parse(querySplit[4]) : {};
            const sort = querySplit.length >= 6 ? JSON.parse(querySplit[5]) : {};

            // Verificar si la tabla especificada existe en la base de datos
            if (tableExists(dbName, tableName, player)) {
                // Obtener las etiquetas de valores de la tabla
                const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));

                const results = []; // Array para almacenar los resultados de la consulta

                // Iterar sobre las etiquetas de valores de la tabla
                tableTags.forEach((tableTag) => {
                    try {
                        // Obtener el valor de la etiqueta y analizarlo como JSON
                        const tableValue = tableTag.split("-value:")[1];
                        const json = JSON.parse(tableValue);
                        // Verificar si el valor cumple con las condiciones de la consulta y agregarlo a los resultados si es así
                        if (compareJSON(json, conditions)) {
                            results.push(json);
                        }
                    } catch (error) {
                        return INVALID_QUERY; // Devolver mensaje de consulta no válida si ocurre un error al analizar el valor
                    }
                });

                // Verificar si se encontraron resultados
                if (results.length > 0) {
                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)


                    // Aplicar la proyección a los resultados
                    const projectedResults = results.map((result) => projectJSON(result, projection));

                    // Ordenar los resultados proyectados
                    sortJSON(projectedResults, sort);


                    switch (querySplit[0]) {
                        case "&csv":
                            csvExport(projectedResults)
                            break;
                        case "&json":
                            jsonExport(projectedResults)
                            break;
                        case "&xml":
                            xmlExport(projectedResults)
                            break;
                    }
                    // Devolver los resultados proyectados como una cadena JSON
                    return `${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found"; // Devolver mensaje si no se encontraron valores coincidentes
                }
            } else {
                return INVALID_DB; // Devolver mensaje si la base de datos no existe
            }
        } catch (error) {
            return INVALID_QUERY; // Devolver mensaje si ocurre un error al analizar la consulta
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no tiene suficientes partes
    }
};

export const importTableValues = async (query, player) => {
    // &import database_owner_name table_name file=export/json/1710625642341.json filetype=json
    // Dividir la consulta en partes
    const querySplit = querySplits(query)
    // Verificar si hay suficientes partes en la consulta
    if (querySplit.length >= 5) {
        try {
            // Obtener el nombre de la base de datos, el nombre de la tabla, las condiciones, la proyección y la clasificación de la consulta
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const file = querySplit[3].replace('file=', '');
            const fileType = querySplit[4].replace('filetype=', '');

            // Verificar si la tabla especificada existe en la base de datos
            if (tableExists(dbName, tableName, player)) {
                // Crear objeto para la petición del servido backup
                const body = {
                    file: file,
                    file_type: fileType
                }

                const response = await importValues(body);

                if(Array.isArray(JSON.parse(response))) {
                    const values = JSON.parse(response);
                    let count = 0;
                    values.forEach((value) => {
                        const insertValue = `&insert ${dbName} ${tableName} ${JSON.stringify(value)}`
                        if(insert(insertValue, player) === '§aValue inserted') {
                            count++;
                        }
                    })

                    return `§a${count} value(s) inserted`
                } else {
                    shell.log(`no valid value`)
                }
                return 'ok';
            } else {
                return INVALID_DB; // Devolver mensaje si la base de datos no existe
            }
        } catch (error) {
            shell.log(error);
            return INVALID_QUERY; // Devolver mensaje si ocurre un error al analizar la consulta
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no tiene suficientes partes
    }
};



const csvExport = async (body) => {
    const req = new HttpRequest('http://localhost:3000/api/export/csv');


    req.setBody(JSON.stringify(body));

    req.method = HttpRequestMethod.Post;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);
}

const jsonExport = async (body) => {
    const req = new HttpRequest('http://localhost:3000/api/export/json');


    req.setBody(JSON.stringify(body));

    req.method = HttpRequestMethod.Post;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);
}

const xmlExport = async (body) => {
    const req = new HttpRequest('http://localhost:3000/api/export/xml');


    req.setBody(JSON.stringify(body));

    req.method = HttpRequestMethod.Post;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);
}

const importValues = async (body) => {
    const req = new HttpRequest('http://localhost:3000/api/import');


    req.setBody(JSON.stringify(body));

    req.method = HttpRequestMethod.Post;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);

    return response.body;
}
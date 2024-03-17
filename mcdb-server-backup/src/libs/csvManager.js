// Convertir datos de formato CSV a formato JSON
export const csvToJson = (csvData) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const jsonArray = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            let parsedValue = values[j].trim();
            // Verificar si el valor está entre comillas dobles
            const hasQuotes = parsedValue.startsWith('"') && parsedValue.endsWith('"');
            // Eliminar comillas si el valor original no las tenía
            if (!hasQuotes) {
                parsedValue = parsedValue.replace(/"/g, '');
            }
            // Convertir a booleano si es "true" o "false"
            if (parsedValue === 'true') {
                parsedValue = true;
            } else if (parsedValue === 'false') {
                parsedValue = false;
            } else {
                // Mantener el valor como string si es un número entre comillas dobles
                if (hasQuotes && !isNaN(parsedValue)) {
                    parsedValue = parsedValue;
                } else {
                    // Convertir a número si no está entre comillas dobles
                    parsedValue = isNaN(parsedValue) ? parsedValue : parseFloat(parsedValue);
                }
            }
            // Eliminar las comillas dobles después de poner las comillas simples
            if (typeof parsedValue === 'string') {
                parsedValue = parsedValue.replace(/"/g, '');
            }
            entry[headers[j]] = parsedValue;
        }
        jsonArray.push(entry);
    }

    return jsonArray;
};

// Convertir datos de formato JSON a formato CSV
export const jsonToCsv = (jsonData) => {
    const headers = Object.keys(jsonData[0]).join(',');
    const rows = jsonData.map(entry => Object.values(entry).join(',')).join('\n');
    return `${headers}\n${rows}`;
};
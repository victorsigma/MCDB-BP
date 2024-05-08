import { parseFromString } from 'dom-parser';

export const jsonToXml = (jsonData) => {
    let xmlData = '';
    for (const obj of jsonData) {
        xmlData += '<row>\n';
        for (const [key, value] of Object.entries(obj)) {
            xmlData += `    <${key}>${typeof value === 'string' ? `"${value}"` : value}</${key}>\n`;
        }
        xmlData += '</row>\n';
    }
    return xmlData;
}

export const xmlToJson = (xmlData) => {
    const xmlDoc = parseFromString(xmlData);
    const jsonArray = [];

    console.log(xmlDoc)

    const rows = xmlDoc.getElementsByTagName('row');
    for (const row of rows) {
        const obj = {};
        const children = row.childNodes;
        for (const child of children) {
            if (child.nodeName === '#text') continue; // Saltar nodos de texto
            const key = child.nodeName;
            const value = child.textContent.trim();
            obj[key] = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : (isNaN(value) ? (value === 'true' ? true : (value === 'false' ? false : value)) : parseFloat(value));
        }
        jsonArray.push(obj);
    }

    console.log(jsonArray);

    return jsonArray;
}
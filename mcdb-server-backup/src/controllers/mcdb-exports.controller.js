import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { jsonToXml } from '../libs/xmlManager';

export const exportCsv = async (req, res) => {
    try {
        const json = req.body;
        const parser = new Parser();
        const csv = parser.parse(json);
        console.log(csv)

        const dir = 'exports/csv';
        // Crear el directorio si no existe
        dir.split(path.sep).reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder, path.sep);
            if (!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath, { recursive: true });
            }
            return currentPath;
        }, '');

        const filename = path.join(dir, Date.now() + '.csv');
        fs.writeFileSync(filename, csv);

        res.status(200).send({ 'message': 'Archivo CSV guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ 'message': 'Error al transformar JSON a CSV y guardar el archivo' });
    }
};


export const exportJson = async (req, res) => {
    try {
        const json = req.body;
        console.log(json);

        const dir = 'exports/json';
        // Crear el directorio si no existe
        dir.split(path.sep).reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder, path.sep);
            if (!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath, { recursive: true });
            }
            return currentPath;
        }, '');

        const filename = path.join(dir, Date.now() + '.json');
        fs.writeFileSync(filename, JSON.stringify(json, null, 2));

        res.status(200).send({ 'message': 'Archivo JSON guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ 'message': 'Error al guardar el archivo' });
    }
};


export const exportXml = async (req, res) => {
    try {
        const json = req.body;
        const xml = jsonToXml(json);
        console.log(xml);

        const dir = 'exports/xml';
        // Crear el directorio si no existe
        dir.split(path.sep).reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder, path.sep);
            if (!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath, { recursive: true });
            }
            return currentPath;
        }, '');

        const filename = path.join(dir, Date.now() + '.xml');
        fs.writeFileSync(filename, xml);

        res.status(200).send({ 'message': 'Archivo XML guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ 'message': 'Error al transformar JSON a XML y guardar el archivo' });
    }
};
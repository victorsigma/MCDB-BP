import fs from 'fs';
import path from 'path';
import { csvToJson } from '../libs/csvManager';

export const importTableValues = async (req, res) => {
    const { file, file_type } = req.body;

    // Ruta del archivo en la raíz del servidor
    const filePath = path.join(__dirname, '..', '..', file);

    try {
        // Verificar si el archivo existe
        fs.accessSync(filePath, fs.constants.R_OK);

        // El archivo existe, leer su contenido
        console.log(`File found: ${file}`);
        console.log(`File type: ${file_type}`);

        if (file_type === 'json') {
            // Leer el contenido del archivo JSON
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            console.log(JSON.parse(fileContent));

            return res.status(200).json(JSON.parse(fileContent));
        } else if (file_type === 'csv') {
            // Leer el contenido del archivo CSV
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            console.log(csvToJson(fileContent));

            return res.status(200).json(csvToJson(fileContent));
        } else if (file_type === 'xml') {
            // Leer el contenido del archivo XML
            return res.status(200).json( { message: 'Importing from XML files is not currently supported.' })
        } else {
            return res.status(200).json({ message: 'File found' });
        }

        // Aquí puedes realizar las operaciones necesarias con el contenido del archivo

        res.status(200).json({ message: 'File found' });
    } catch (error) {
        // El archivo no existe o no se puede acceder
        //console.error(`Error accessing file: ${file}`, error);
        res.status(404).json({ message: 'File not found or inaccessible' });
    }
}
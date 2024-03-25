import fs from 'fs';
import path from 'path';

export const backupDatabase = async (req, res) => {
    const backup = req.body;

    try {
        const dir = 'backups/';
        backup.tables.forEach((table, index) => {
            table.properties = JSON.parse(table.properties);
            table.values.forEach((value, index) => {
                table.values[index] = JSON.parse(value);
            });
            backup.tables[index] = table;
        });

        console.log(backup.tables[0].values);

        // Crear el directorio si no existe
        dir.split(path.sep).reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder, path.sep);
            if (!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath, { recursive: true });
            }
            return currentPath;
        }, '');

        const filename = path.join(dir, Date.now() + '.mcbak');
        fs.writeFileSync(filename, JSON.stringify(backup, null, 2));

        res.status(200).send({ 'message': 'Archivo Backup guardado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ 'message': 'Error al guardar el archivo' });
    }
}
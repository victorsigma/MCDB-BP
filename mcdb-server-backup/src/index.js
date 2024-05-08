import app from './app'



console.time('Running');

app.listen(app.get('port'));
console.log("Server on port", app.get('port'))

console.timeEnd('Running');
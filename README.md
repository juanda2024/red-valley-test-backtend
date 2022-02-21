# red-valley-test-backend

para inicializar el repo en local: 

npm i

npm start

## En ambiente local: 

Va a correr en: http://localhost:3000/

para verificar que esté corriendo en local, debe decir BACK RUNNNING. 

OJO es necesario crear archivo .env con la URI de mongo, y el token de autorización de JWT. (esta información me la pueden solicitar personalmente, puesto que es buena practica de desarrollo no dejar información de conexiones a BD y por supuesto la info del token de JWT). 

## Desplegado: 

(link del back desplegado en heroku)
https://intense-basin-05348.herokuapp.com/

El ya tiene configurada las variables de QA, por lo que funciona sin configuraciones adicionales. 

Nota: Adjunto en el proyecto, el la carpeta Collections/, pueden encontrar un archivo con las 20 peticiones que soporta el back, ya con body headers y urls configuradas. (no olvidar que para las peticiones que requieren autenticación y autorización, se debe enviar el token JWT por el header de la petición)

David M. 

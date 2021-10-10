
import express from 'express';
import { SERVER_PORT } from '../global/enviroment';
import socketIO from 'socket.io';
import http from 'http';

import * as socket from '../sockets/socket'

export default class Server{

    private static _instance: Server;

    public app: express.Application;
    public port:number;

    public io: socketIO.Server;
    private httpServer: http.Server;

    
    private constructor(){
        this.app = express();
        this.port = SERVER_PORT; 

        this.httpServer = new http.Server(this.app)
        this.io = new socketIO.Server( this.httpServer, { cors: { origin: true, credentials: true } } );
    
        this.escucharSockets();
    }

    
    public static get instance () {
        return this._instance || (this._instance = new this());
    }


    private escucharSockets() {

        console.log("Escuchar conexiones - Sockets");

        this.io.on('connection', cliente =>{
        
            //Conectar Cliente
            socket.conectarCliente(cliente , this.io);

            //Configurar Mapa
            socket.mapaSockets(cliente , this.io);

            //Configurar Usuario
            socket.configurarUsuario (cliente , this.io);
         
            
            //Obtener Usuarios Activos
            socket.obtenerUsuarios (cliente , this.io);
         

            //Mostrar conexión Usuario-Id
            //console.log("Cliente conectado"); 
            //console.log(cliente.id); 
        

            //Mensajes
            socket.mensaje (cliente , this.io);
         

            //Desconectar
            socket.desconectar (cliente , this.io);
         
        })
    }

    //start(callback: any){
    //  this.app.listen(this.port, callback);
    // }

    start(callback : Function){
        this.httpServer.listen(this.port, callback());
        //this.app.listen(this.port, callback());
    }
}
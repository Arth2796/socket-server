

import { Router, Request, Response } from "express";
import { GraficaData } from "../classes/grafica";
import Server from "../classes/server";
import { usuariosConectados , mapa } from "../sockets/socket";

const router = Router();



//Mapa


router.get('/mapa', (req : Request, res : Response) => {
    
    res.json( mapa.getMarcadores() );

})






//Clase Grafica
const grafica = new GraficaData();


router.get('/grafica', (req : Request, res : Response) => {
    
    res.json( grafica.getDataGrafica() );

})


router.post('/grafica', (req : Request, res : Response) => {
    const mes = req.body.mes;
    const valor = Number( req.body.valor );
    
    grafica.incrementarValor ( mes , valor); 

    const server = Server.instance;
    server.io.emit('cambio-grafica' , grafica.getDataGrafica());

    res.json( grafica.getDataGrafica() );
})

router.post('/mensajes/:id', (req : Request, res : Response) => {
    
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    const id = req.params.id;

    const payload = {
        de,
        cuerpo
    }

    const server = Server.instance;

    //Sin el .in(id) se envia a todos
    server.io.in(id).emit('mensaje-privado' , payload);
   


    res.json({
        ok : true,
        cuerpo,
        de,
        id,
        //mensajes: 'Ta malo'
    });
});


//Servicio para obtener id usuarios
router.get('/usuarios', (req : Request, res : Response) => {
    
    const server = Server.instance;

    server.io.allSockets().then( (clientes) => {
       
        res.json({
            ok:true,
           // clientes
            clientes: Array.from(clientes)
        });

    }).catch( (err) => {

        res.json({
            ok:false,
            err
            
        })
    });
})


//Servicio para obtener usuarios y nombres
router.get('/usuarios/detalle', (req : Request, res : Response) => {
    
   
        res.json({
            ok:true,
           // clientes
            clientes: usuariosConectados.getLista()
        });

    
})

export default router;
import { Component, OnInit } from '@angular/core';
import { Lugar } from '../../interfaces/interfaces';

import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from 'src/app/services/websocket.service';

interface RespMarcadores{
   
  [ key: string ]: Lugar  
  
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  mapa!: mapboxgl.Map;

  lugares: RespMarcadores = {
  
  /*Lugar[] = [
    {
    id: '1',
    nombre: 'Fernando',
    lng: -75.75512993582937,
    lat: 45.349977429009954,
    color: '#dd8fee'
  },
  {
    id: '2',
    nombre: 'Amy',
    lng: -75.75195645527508, 
    lat: 45.351584045823756,
    color: '#790af0'
  },
  {
    id: '3',
    nombre: 'Orlando',
    lng: -75.75900589557777, 
    lat: 45.34794635758547,
    color: '#19884b'
  }]*/
  };


  markersMapbox: { [id: string] : mapboxgl.Marker } = {};

  constructor( private http: HttpClient,
                private wsService: WebsocketService) { }

  ngOnInit() {
  
    this.http.get<RespMarcadores>('http://localhost:5000/mapa')
    .subscribe( lugares => {

      //console.log(lugares);

      this.lugares = lugares;

      this.crearMapa();

    });

   
    this.escucharSockets();
  
  }
  
  escucharSockets() { 

    //marcador-nuevo 
    this.wsService.listen( 'marcador-nuevo' )
    .subscribe(  (marcador: any)   => this.agregarMarcador( marcador ));
    //{

      //console.log( 'Socket' );
      //console.log( marcador );
      //this.agregarMarcador( marcador );

    //})
    //marcador-mover
    this.wsService.listen( 'marcador-mover' )
    .subscribe(  (marcador: any)   => {
    
      this.markersMapbox[marcador.id].setLngLat([ marcador.lng, marcador.lat]);
     
    
    });


    //marcador-borrar 
    this.wsService.listen( 'marcador-borrar' )
    .subscribe(  (id: any)   => {
    
      this.markersMapbox[id].remove();
      delete this.markersMapbox[id];
    
    });
    

  }

  crearMapa() { 
    
    ( mapboxgl as any ).accessToken = 'pk.eyJ1IjoiYXJ0aDI3OTYiLCJhIjoiY2t0dGQ3Z3FwMXBmcDJubnVnNjB6M3o1ayJ9.KPZsjSoj6UPU3SUwfwHG_Q';

    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-75.75512993582937, 45.349977429009954],
      zoom: 15.8
    });

    for (const [ id , marcador ] of Object.entries( this.lugares )) {
      
      this.agregarMarcador( marcador );
      //this.agregarMarcador( marcador );
      
    }

  }


  agregarMarcador( marcador: Lugar ) { 
   
    //const html = `<h2>${marcador.nombre}</h2>
    //            <br>
    //          <button>Borrar</button>`;

    const h2 = document.createElement('h2');
    h2.innerText = marcador.nombre;

    const btnBorrar = document.createElement('button');
    btnBorrar.innerText = 'Borrar';

    const div = document.createElement('div');
    div.append(h2 , btnBorrar);

    const customPopup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: false
    }).setDOMContent( div );
    // .setHTML( html );

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: marcador.color
    })
    .setLngLat( [marcador.lng, marcador.lat ])
    .setPopup( customPopup )
    .addTo( this.mapa );


    marker.on( 'drag' , () => {

      const lnglat = marker.getLngLat();
      //console.log(lnglat);

      //Evento para emitir coordenadas

      const nuevoMarcador = {
        id: marcador.id,
        ... lnglat
      }

      this.wsService.emit ('marcador-mover', nuevoMarcador);


    });

    btnBorrar.addEventListener('click', () => {

      marker.remove();

      //Eliminar marcador mediante sockets

      this.wsService.emit ('marcador-borrar', marcador.id);

    });

    this.markersMapbox[ marcador.id ] = marker;
    //console.log(this.markersMapbox);

  }

  crearMarcador(){

    const customMarker: Lugar = {
      id:   new Date().toISOString(),
      lng:  -75.75512993582937, 
      lat:  45.349977429009954, 
      nombre: 'Sin nombre',
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }

    this.agregarMarcador( customMarker );

    //Emitir marcador nuevo
    this.wsService.emit( 'marcador-nuevo' , customMarker );

  }

}
function complete(complete: any, arg1: (marcador: Lugar) => any, arg2: { console: Console; "": any; this: any; }) {
  throw new Error('Function not implemented.');
}


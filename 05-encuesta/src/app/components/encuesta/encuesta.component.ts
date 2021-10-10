import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
})
export class EncuestaComponent implements OnInit {

  public lineChartData: ChartDataSets[] = [
    { data: [0 , 0 , 0 , 0], label: 'Preguntas' },
  ];

  public lineChartLabels: Label[] = ['Pregunta 1', 'Pregunta 2', 'Pregunta 3', 'Pregunta 4'];



  constructor(

    private http: HttpClient,
    public wsService : WebsocketService

  ) { }

  ngOnInit(): void {

    this.getData();
    this.escucharSocket();

  }


  getData(){
      this.http.get('http://localhost:5000/grafica')
  
      .subscribe ( (data : any) => this.lineChartData = data

      );

    }

    
  escucharSocket(){
    
    this.wsService.listen('cambio-grafica')
    .subscribe ( (data : any) => {

      console.log('socket' , data);
      this.lineChartData = data;

    })

  }

}

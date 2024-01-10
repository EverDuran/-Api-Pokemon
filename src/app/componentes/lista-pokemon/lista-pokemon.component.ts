import { Component, OnInit, ViewChild } from '@angular/core';
import { PokemonService } from '../../servicios/pokemon.service';
import { IPokemons } from '../../interfaces/lista-pokemon.interface';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { IPokemon } from '../../interfaces/detalle-pokemon.interface';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lista-pokemon',
  templateUrl: './lista-pokemon.component.html',
  styleUrls: ['./lista-pokemon.component.scss']
})
export class ListaPokemonComponent implements OnInit {

  displayedColumns = ['order', 'image', 'name', 'weight', 'height', 'delete'];
  dataSource = new MatTableDataSource([]);
  dataSourceCopy = new MatTableDataSource([]);

  pokemons: IPokemons = {
    count: 0,
    next: null,
    previous: null,
    results: []
  };

  orders: Object[] = [
    { value: '', text: 'Ninguno' },
    { value: 'order asc', text: 'Número ASC' },
    { value: 'order desc', text: 'Número DESC' },
    { value: 'name asc', text: 'Nombre ASC' },
    { value: 'name desc', text: 'Nombre DESC' }
  ]

  orderByValue: string = "";

  pageIndex: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  //Almacenar en memoria pokemones eliminados
  pokemonsDeleted: { pageIndex: number, id: number }[] = [];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.listenAddParam();
  }

  listenAddParam() {
    this.route.queryParamMap.subscribe(p => {
      const text = p.get('text');
      if (!text) {
        this.getPokemons();
      } else {
        this.searchPokemon(text);
      }
    });
  }

  getPokemons(url: string = "") {
    this.pokemonService.getPokemons(url, this.pageSize).subscribe(response => {
      this.pokemons = response;
      this.getDataPokemon();
    })
  }

  getDataPokemon() {
    const urlsPokemon$ = this.pokemons.results.map(pokemon => this.pokemonService.getDataPokemon(pokemon.url));
    forkJoin(urlsPokemon$).subscribe(response => {
      this.dataSource = new MatTableDataSource(this.ignorePokemons(response));
      this.dataSourceCopy = this.dataSource;
      this.addSort();
    })
  }

  searchPokemon(text: string) {
    this.pokemonService.searchPokemon(text).subscribe(response => {
      this.pokemons = {
        count: 1,
        next: null,
        previous: null,
        results: []
      };
      this.pageIndex = 0;
      this.dataSource = new MatTableDataSource(this.ignorePokemons([response]));
      this.dataSourceCopy = this.dataSource;
      this.addSort();
    })
  }

  onChangePagination(event: PageEvent) {
    const currentIndex = this.pageIndex;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (currentIndex < event.pageIndex) {
      this.getPokemons(this.pokemons.next);
    } else {
      this.getPokemons(this.pokemons.previous);
    }
  }

  deletePokemon(element: IPokemon) {
    this.showDialog(`¿Desea eliminar pokemón "${element.name}"?`).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          const index = this.dataSource.data.findIndex(pokemon => pokemon.id === element.id);
          this.dataSource.data.splice(index, 1);
          this.dataSource = new MatTableDataSource([...this.dataSource.data]);
          this.dataSourceCopy = this.dataSource;
          this.addSort();
          // Agregar a la lista el pokemon eliminado
          this.pokemonsDeleted.push({ pageIndex: this.pageIndex, id: element.id });
        }
      });
  }

  ignorePokemons(pokemons: IPokemon[]) {
    const pokemonsDeleted = this.pokemonsDeleted.filter(pokemon => pokemon.pageIndex === this.pageIndex).map(pokemon => pokemon.id);
    return pokemons.filter(pokemon => !pokemonsDeleted.includes(pokemon.id));
  }

  showDialog(mensaje: string) {
    return this.dialog
      .open(DialogoConfirmacionComponent, {
        data: mensaje
      })
  }

  addSort() {
    this.dataSource.sort = this.sort;
  }

  orderData() {
    console.log(this.orderByValue)
    const data = this.orderByData();
    this.dataSource = new MatTableDataSource(data);
  }

  orderByData() {
    const data = this.dataSourceCopy.data;
    if (!this.orderByValue) {
      // Si no se selecciona ningún orden, mostrar los datos sin orden
      return data;
    } else {
      let orderByField = this.orderByValue.split(' ')[0]; // Obtener el campo para ordenar
      let orderByDirection = this.orderByValue.split(' ')[1]; // Obtener la dirección de orden

      return data.slice(0).sort((a, b) => {
        const x = orderByDirection === 'asc' ? a[orderByField] : b[orderByField];
        const y = orderByDirection === 'asc' ? b[orderByField] : a[orderByField];

        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
    }
  }
}
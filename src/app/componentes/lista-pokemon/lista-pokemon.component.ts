import { Component, OnInit, ViewChild } from '@angular/core';
import { PokemonService } from '../../servicios/pokemon.service';
import { IPokemons } from '../../interfaces/lista-pokemon.interface';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { IPokemon } from '../../interfaces/detalle-pokemon.interface';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, PageEvent, Sort } from '@angular/material';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-pokemon',
  templateUrl: './lista-pokemon.component.html',
  styleUrls: ['./lista-pokemon.component.scss']
})
export class ListaPokemonComponent implements OnInit {

  value: string = "";

  displayedColumns = ['order', 'image', 'name', 'weight', 'height', 'delete'];
  dataSource = new MatTableDataSource([]);
  dataSourceCopy = new MatTableDataSource([]);

  pokemons: IPokemons = {
    count: 0,
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
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.listenAddParam();
  }

  searchPokemones() {
    this.router.navigate(['/pokemons'], { queryParams: { text: this.value } });
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
    this.pokemonService.getPokemons(url).subscribe(response => {
      this.pokemons = {
        count: 151,
        results: response.results
      };
      this.getDataPokemon();
    })
  }

  getDataPokemon() {
    const urlsPokemon$ = this.pokemons.results.map(pokemon => this.pokemonService.getDataPokemon(pokemon.url));
    forkJoin(urlsPokemon$).subscribe(response => {
      this.dataSource = new MatTableDataSource(this.ignorePokemons(response));
      this.dataSourceCopy = this.dataSource;
    })
  }

  searchPokemon(text: string) {
    this.pokemonService.searchPokemon(text).subscribe(response => {
      this.pokemons = {
        count: 1,
        results: []
      };
      this.pageIndex = 0;
      this.dataSource = new MatTableDataSource(this.ignorePokemons([response]));
      this.dataSourceCopy = this.dataSource;
    })
  }

  onChangePagination(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  deletePokemon(element: IPokemon) {
    this.showDialog(`¿Desea eliminar pokemón "${element.name}"?`).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          const index = this.dataSource.data.findIndex(pokemon => pokemon.id === element.id);
          this.dataSource.data.splice(index, 1);
          this.dataSource = new MatTableDataSource([...this.dataSource.data]);
          this.dataSourceCopy = this.dataSource;
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
  
  sortData(sort: Sort) {
    const data = this.dataSourceCopy.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = new MatTableDataSource(data);
      return;
    }

    const newData = data.sort((a: IPokemon, b: IPokemon) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'order':
          return compare(a.order, b.order, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        default:
          return 0;
      }
    });

    this.dataSource = new MatTableDataSource(newData);
  }

  orderData() {
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

  get pokemonsDatasource() {
    const indiceInicial = this.pageIndex * this.pageSize;
    const indiceFinal = indiceInicial + this.pageSize;
    return this.dataSource.data.slice(indiceInicial, indiceFinal);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
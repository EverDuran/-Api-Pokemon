import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-busqueda',
  templateUrl: './menu-busqueda.component.html',
  styleUrls: ['./menu-busqueda.component.scss']
})
export class MenuBusquedaComponent implements OnInit {

  value: string = "";

  constructor(private router: Router) { }

  ngOnInit() {
  }

  searchPokemon() {
    this.router.navigate(['/pokemons'], { queryParams: { text: this.value }});
  }
}

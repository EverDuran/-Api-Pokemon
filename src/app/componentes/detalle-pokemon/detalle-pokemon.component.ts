import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../servicios/pokemon.service';
import { IPokemon } from '../../interfaces/detalle-pokemon.interface';

@Component({
  selector: 'app-detalle-pokemon',
  templateUrl: './detalle-pokemon.component.html',
  styleUrls: ['./detalle-pokemon.component.scss']
})
export class DetallePokemonComponent implements OnInit {

  pokemon: IPokemon;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.searchPokemon(id);
    });
  }

  searchPokemon(text: string) {
    this.pokemonService.searchPokemon(text).subscribe(response => {
      console.log(response);
      this.pokemon = response;
    })
  }
}

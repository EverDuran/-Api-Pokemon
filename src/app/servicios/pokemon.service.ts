import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_API } from '../constantes/url.constante';
import { IPokemons } from '../interfaces/lista-pokemon.interface';
import { IPokemon } from '../interfaces/detalle-pokemon.interface';

@Injectable()
export class PokemonService {

  constructor(private http: HttpClient) { }

  getPokemons(url: string = "", limit: number = 10) {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());
    return this.http.get<IPokemons>(url || URL_API.LISTA_POKEMON, { params });
  }

  getDataPokemon(url: string) {
    return this.http.get<IPokemon>(url);
  }

  searchPokemon(text: string) {
    return this.http.get<IPokemon>(`${URL_API.LISTA_POKEMON}/${text}`);
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaPokemonComponent } from './componentes/lista-pokemon/lista-pokemon.component';
import { DetallePokemonComponent } from './componentes/detalle-pokemon/detalle-pokemon.component';

const routes: Routes = [
  { path: '', redirectTo: '/pokemons', pathMatch: 'full' },
  { path: 'pokemons', component: ListaPokemonComponent },
  { path: 'pokemon/:id', component: DetallePokemonComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
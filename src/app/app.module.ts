import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ListaPokemonComponent } from './componentes/lista-pokemon/lista-pokemon.component';
import { DetallePokemonComponent } from './componentes/detalle-pokemon/detalle-pokemon.component';
import { MenuBusquedaComponent } from './componentes/menu-busqueda/menu-busqueda.component';
import { AppRoutingModule } from './app-routing.module';
import { PokemonService } from './servicios/pokemon.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogoConfirmacionComponent } from './componentes/dialogo-confirmacion/dialogo-confirmacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module'

@NgModule({
  declarations: [
    AppComponent,
    ListaPokemonComponent,
    DetallePokemonComponent,
    MenuBusquedaComponent,
    DialogoConfirmacionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [PokemonService],
  bootstrap: [AppComponent],
  entryComponents: [DialogoConfirmacionComponent]
})
export class AppModule { }

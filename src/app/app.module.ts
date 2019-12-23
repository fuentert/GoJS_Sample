'use strict';

import angular = require('angular');
import 'bootstrap/dist/css/bootstrap.css';

import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { downgradeComponent } from '@angular/upgrade/static';
import { UIRouterModule } from '@uirouter/angular';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { NewMapComponent } from './new/newMap/newMap.component';
import { MolecularStrategyComponent } from './new/molecularStrategy/molecularStrategy.component';

import { DataService } from './services/data.service';

// import { ProductListComponent } from './product-list/product-list.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    NewMapComponent,
    MolecularStrategyComponent
  ],
  exports: [],
  imports: [
    BrowserModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})

export class AppModule { }

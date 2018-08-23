import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NxModule } from '@nrwl/nx';
import { Lib1Module } from '@nx-extra-tools-playground/lib1'
import { Lib2Module } from '../../../../libs/lib2/src'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NxModule.forRoot(), Lib1Module, Lib2Module],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

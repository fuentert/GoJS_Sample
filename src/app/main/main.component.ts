import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { StateService, Transition } from '@uirouter/angular';
import {trigger, state, style, transition, animate} from '@angular/animations';

import {Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';

import * as _ from 'lodash';
import * as go from 'gojs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

const BLACKBOARD_LINK = 'https://blackboard.ncats.io/ks/semmed/';

@Component({
    selector: 'main-component',
    //template: require('./main.component.html').toString(),
    templateUrl: './main.component.html',
    styles: [require('./main.component.css').toString()],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0%, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(-180%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})

export class MainComponent implements OnInit {

    @Input() userProfile;
    @Input() localContent;

    public neoData: Array<Object> = [];
    private linkData: Array<Object> = [];
    private localContentProcessed: Array<Object> = [];
    private mapSelection;
    private view: string = "circle";

    @Input() mapdata;

    public getMapSelection() {
        return this.mapSelection;
    }

    public changeView() {
      if(this.view === "circle") {
        this.view = "flow";
        console.log(this.view);
      } else {
        this.view = "circle";
      }
    }

    constructor () {

    }

    ngOnInit () {
        // call function to process local content data

    }
}

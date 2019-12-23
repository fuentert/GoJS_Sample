import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {

    private myDiagramSource = new BehaviorSubject({});
    myDiagram = this.myDiagramSource.asObservable();

    private myPaletteSource = new BehaviorSubject({});
    myPalette = this.myPaletteSource.asObservable();

    constructor() { }

    setMyDiagram(myDiagram: Object) {
        this.myDiagramSource.next(myDiagram);
    }

    setMyPalette(myPalette: Object) {
        this.myPaletteSource.next(myPalette);
    }

}

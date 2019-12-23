import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Transition, StateService } from '@uirouter/angular';
import { DataService } from '../../services/data.service';
import * as go from 'gojs';
const icons = require('./icons.json');
const data = require('./model.json');
// const data = require('./data.json').data;
import _ = require('lodash');

declare var tempNode: any;

@Component({
    selector: 'new-map-container',
    //template: require('./newMap.component.html').toString(),
    templateUrl: './newMap.component.html',
    styles: [require('./newMap.component.css').toString()]
})

export class NewMapComponent implements OnInit {

    @Input() mapdata;

    @Output()
    nodeSelected = new EventEmitter<go.Node | null>();

    public userPosition;
    public data;
    public funcImagePath;
    public localContentIcon = icons.localContent;
    public hasLocalContent = false;
    public toolTipNodeName;
    private hold = true;
    private nodeDetails;
    private directionTrigger;
    private directionsCount;
    private localContentProcessed: Array<Object> = [];

    private colors = {
        'Basic Science Research': '#d32f2f',
        'Biomarker Development': '#c64e00',
        'Lead Identification': '#401900',
        'Lead Optimization': '#517482',
        'Clinical Research': '#028475',
        'Regulatory Review': '#477700',
        'Post Marketing': '#07534d',
        'Medical Landscape': '#174da3',
        'Patients': '#471579',
        'Organization': '#7b1fa2',
        'Devices': '#af0360',
        'Translation Science': '#dbdbdb'
    };

    private mapSelection;
    private focusNeighbour = {};
    private glossaryOpen;
    private view;
    private rootNode = {
        'tm': 265,
        'sm': 116,
        'bm': 117
    };
    private nodeData = [];
    private linkData = [];
    public linkToggle;
    private directionsActivated;
    private submapDiagram;
    private submapPalette;

    private diagram = null;

    public getMapSelection() {
        return this.mapSelection;
    }

    public openModal() {
        const modal = document.getElementById('submapModal');
        modal.style.display = 'block';

        // const temp = document.getElementById('test-content');
        // temp.style.display = 'none';

        this.submapDiagram.requestUpdate();
        this.submapPalette.requestUpdate();
    }

    public modalSpanClose() {
        const span = document.getElementsByClassName('close')[0];

        const modal = document.getElementById('submapModal');
        modal.style.display = 'none';
    }

    constructor(private dataService: DataService) {
        const me = this;

        this.dataService.myDiagram.subscribe(myDiagram => this.submapDiagram = myDiagram);
        this.dataService.myPalette.subscribe(myPalette => this.submapPalette = myPalette);
    }

    ngOnInit() {
        let nodeName = null;
        const $ = go.GraphObject.make;

        const myToolTip = $(go.HTMLInfo, {
            show: showToolTip.bind(this),
            hide: hideToolTip
          }
        );

            this.diagram = new go.Diagram();

            go.GraphObject.defineBuilder('TreeExpanderButtonCustom', function (args) {
                const button = /** @type {Panel} */ (
                    go.GraphObject.make('Button',
                        { // set these values for the isTreeExpanded binding conversion
                            'ButtonBorder.spot1': go.Spot.TopLeft,
                            'ButtonBorder.spot2': go.Spot.BottomRight,
                            'ButtonBorder.figure': 'Circle',
                            'ButtonBorder.fill': 'white',
                            '_buttonFillOver': 'white',
                            '_buttonFillDisabled': false
                        },
                        new go.Binding('_buttonStrokeOver', 'color'),
                        new go.Binding('ButtonBorder.stroke', 'color'),
                        go.GraphObject.make(
                            go.Shape,  // the icon
                            {
                                geometryString: icons['minus'],
                                strokeWidth: 2,
                                desiredSize: new go.Size(40, 40)
                            },
                            new go.Binding('fill', 'color'),
                            new go.Binding('stroke', 'color'),
                            // bind the Shape.figure to the Node.isTreeExpanded value using this converter:
                            new go.Binding('geometryString', 'isTreeExpanded',
                                function (exp, shape) {
                                    return exp ? icons['minus'] : icons['plus'];
                                }
                            ).ofObject()
                        ),
                        // assume initially not visible because there are no links coming out
                        { visible: false },
                        // bind the button visibility to whether it's not a leaf node
                        new go.Binding('visible', 'isTreeLeaf',
                            function (leaf) { return !leaf; }
                        ).ofObject()
                    )
                );

                return button;
            });

            this.diagram.animationManager.isEnabled = true;

            this.diagram.initialContentAlignment = go.Spot.Center;
            this.diagram.addDiagramListener('InitialLayoutCompleted', (e) => {
                const diagram = e.diagram;
                // recursively collapse nodes in the tree
                function recursiveCollapse(node) {
                    if (node) {
                        node.findObject('TREEBUTTON').visible = !!node.findTreeChildrenNodes().count;
                        node.findTreeChildrenNodes().each((ch) => {
                            recursiveCollapse(ch);
                            ch.collapseTree();
                        });
                    }
                }
                recursiveCollapse(diagram.findNodeForKey(this.rootNode[this.mapSelection]));
                // hide treebutton for first node
                diagram.findNodeForKey(this.rootNode[this.mapSelection]).findObject('TREEBUTTON').visible = false;
                diagram.zoomToFit();
                diagram.scale = 0.57;
                // if coming from landing page, use focusNeighbour toggleKey value to expand the neighbourhood
            });

            const childTemplate =
                $(go.Node, 'Spot',
                    {
                        selectionObjectName: 'PANEL',
                        isTreeExpanded: true,
                        isTreeLeaf: false
                        // hasLocContent: false
                    },
                    // Inner white ring
                    $(go.Shape, 'Ellipse',
                        {
                            width: 140,
                            height: 140,
                            strokeWidth: 7,
                            portId: ''
                        },
                        new go.Binding('fill', 'color'),
                        new go.Binding('stroke', 'color')
                    ),
                    $(go.TextBlock,
                        {
                            width: 130,
                            textAlign: 'center',
                            stroke: 'white',
                            font: '14pt sans-serif'
                        },
                        new go.Binding('text', 'name')
                    ),

                    {
                        toolTip: myToolTip
                    },
                    // the expand/collapse button, at the top-right corner
                    $('TreeExpanderButtonCustom',
                        {
                            name: 'TREEBUTTON',
                            // width: 40, height: 40,
                            alignment: go.Spot.TopRight,
                            alignmentFocus: new go.Spot(1, 0, 5, -5)
                        }
                    ),  // end TreeExpanderButtonCustom
                );  // end Node

            const parentTemplate =
                $(go.Node, 'Spot',
                    {
                        selectionObjectName: 'PANEL',
                        isTreeExpanded: true,
                        isTreeLeaf: false
                    // hasLocContent: false
                    },
                    // Colored circle
                    $(go.Shape, 'Ellipse',
                        {
                            width: 220,
                            height: 220,
                            strokeWidth: 0
                        },
                        // Shape.fill is bound to Node.data.color
                        new go.Binding('fill', 'color')),
                    // Inner white ring
                    $(go.Shape, 'Ellipse',
                        {
                            width: 180,
                            height: 180,
                            strokeWidth: 7,
                            stroke: 'white',
                            fill: null
                        }
                    ),
                    $(go.TextBlock,
                        {
                            width: 170,
                            textAlign: 'center',
                            // stroke: 'white',
                            font: '14pt sans-serif'
                        },
                        new go.Binding('text', 'name'),
                        new go.Binding('stroke', 'name', (name) => {
                            return (name === 'Translational Science Map') ? 'black' : 'white';
                        })
                    ),
                    {
                        toolTip: myToolTip
                    },
                    // the expand/collapse button, at the top-right corner
                    $('TreeExpanderButtonCustom',
                        {
                            name: 'TREEBUTTON',
                            // width: 40, height: 40,
                            alignment: go.Spot.TopRight,
                            alignmentFocus: new go.Spot(1, 0, 5, -5)
                        }
                    ),  // end TreeExpanderButtonCustom
                );  // end Node

            this.diagram.linkTemplateMap.add('linkType',
                    $(go.Link,
                        {
                            curve: go.Link.Bezier,
                            isTreeLink: false,
                            opacity: 0
                        },
                        $(go.Shape, {name: 'OBJSHAPE', visible: true, stroke: 'blue'}),
                        $(go.Shape, { name: 'ARWSHAPE', visible: true, stroke: 'blue', fill: 'blue', toArrow: 'Standard'})
                    ));

            this.diagram.linkTemplateMap.add('parentChild',
                $(go.Link,
                    $(go.Shape)
                ));

            // create the nodeTemplateMap, holding three node templates:
            const templmap = new go.Map(); // In TypeScript you could write: new go.Map<string, go.Node>();
            // for each of the node categories, specify which template to use
            templmap.add('', childTemplate);
            templmap.add('parent', parentTemplate);


            this.diagram.nodeTemplateMap = templmap;

            this.diagram.model = go.Model.fromJson(data);

            console.log(this.diagram);

        function showToolTip(obj, diagram, tool) {
            this.hasLocalContent = this.checkLocalContent(obj);
            const toolTipDIV = document.getElementById('toolTipDIV');
            const pt = diagram.lastInput.viewPoint;

            toolTipDIV.style.left = (pt.x + 10) + 'px';
            toolTipDIV.style.top = (pt.y + 10) + 'px';

            this.toolTipNodeName = obj.data.name;
            toolTipDIV.style.display = 'block';
            this.funcImagePath = icons[obj.data.function.toString().toLowerCase()];
          }

        function hideToolTip(diagram, tool) {
           const toolTipDIV = document.getElementById('toolTipDIV');
           toolTipDIV.style.display = 'none';
          }
    }
}

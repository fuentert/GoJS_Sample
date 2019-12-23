import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Transition, StateService } from '@uirouter/angular';
import { DataService } from '../../services/data.service';
import * as go from 'gojs';
const data = require('./model.json');
import _ = require('lodash');



@Component({
    selector: 'molecular-strategy-container',
    //template: require('./molecularStrategy.component.html').toString(),
    templateUrl: './molecularStrategy.component.html',
    styles: [require('./molecularStrategy.component.css').toString()]
})

export class MolecularStrategyComponent implements OnInit {
    @Input() mapdata;

    private myDiagram = null;
    private myPalette = null;

    constructor(private dataService: DataService) {
        // go.licenseKey = ngCoreConfig.config['ng-maps'].goJsLicenseKey;
    }

    // Make link labels visible if coming out of a 'conditional' node.
    // This listener is called by the 'LinkDrawn' and 'LinkRelinked' DiagramEvents.
    private showLinkLabel(e) {
        const label = e.subject.findObject('LABEL');
        if (label !== null) { label.visible = (e.subject.fromNode.data.category === 'Conditional'); }
    }

    ngOnInit() {
        const $ = go.GraphObject.make;  // for conciseness in defining templates

        this.myDiagram =
          $(go.Diagram, 'molecularStrategyDiv',  // must name or refer to the DIV HTML element
            {
              'LinkDrawn': this.showLinkLabel,  // this DiagramEvent listener is defined below
              'LinkRelinked': this.showLinkLabel,
              'undoManager.isEnabled': true  // enable undo & redo
            }
        );

        const templmap = new go.Map();

        const defaultStyle = // name is ''
            $(go.Node, 'Table', nodeStyle(),
                $(go.Panel, 'Auto',
                    $(go.Shape, 'Rectangle',
                        { fill: '#00A9C9', strokeWidth: 0 },
                        new go.Binding('figure', 'figure')),
                    $(go.TextBlock, textStyle(),
                        {
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: true
                        },
                        new go.Binding('text').makeTwoWay()
                    )
                ),
            // four named ports, one on each side:
            makePort('T', go.Spot.Top, go.Spot.TopSide, false, true, 'default'),
            makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true, 'default'),
            makePort('R', go.Spot.Right, go.Spot.RightSide, true, true, 'default'),
            makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, false, 'default')
            );

        const conditionalStyle = // name is 'Conditional'
            $(go.Node, 'Table', nodeStyle(),
                // the main object is a Panel that surrounds a TextBlock with a Diamond Shape
                $(go.Panel, 'Auto',
                $(go.Shape, 'Diamond',
                    { fill: '#00A9C9', strokeWidth: 0 },
                    new go.Binding('figure', 'figure')),
                $(go.TextBlock, textStyle(),
                    {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true
                    },
                    new go.Binding('text').makeTwoWay())
                ),

                // four named ports, one on each side:
                makePort('T', go.Spot.Top, go.Spot.Top, false, true, 'conditional'),
                makePort('L', go.Spot.Left, go.Spot.Left, true, true, 'conditional'),
                makePort('R', go.Spot.Right, go.Spot.Right, true, true, 'conditional'),
                makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false, 'conditional')
            );

        const startStyle = // name is 'Start'
            $(go.Node, 'Table', nodeStyle(),
                $(go.Panel, 'Auto',
                $(go.Shape, 'Circle',
                    { minSize: new go.Size(40, 40), fill: '#79C900', strokeWidth: 0 }),
                $(go.TextBlock, 'Start', textStyle(),
                    new go.Binding('text'))
                ),

                // three named ports, one on each side except the top, all output only:
                makePort('L', go.Spot.Left, go.Spot.Left, true, false, 'start'),
                makePort('R', go.Spot.Right, go.Spot.Right, true, false, 'start'),
                makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false, 'start')
            );

        const endStyle = // name is 'End'
            $(go.Node, 'Table', nodeStyle(),
                $(go.Panel, 'Auto',
                $(go.Shape, 'Circle',
                    { minSize: new go.Size(40, 40), fill: '#DC3C00', strokeWidth: 0 }),
                $(go.TextBlock, 'End', textStyle(),
                    new go.Binding('text'))
                ),

                // three named ports, one on each side except the bottom, all input only:
                makePort('T', go.Spot.Top, go.Spot.Top, false, true, 'end'),
                makePort('L', go.Spot.Left, go.Spot.Left, false, true, 'end'),
                makePort('R', go.Spot.Right, go.Spot.Right, false, true, 'end')
            );

        // taken from ../extensions/Figures.js:
        go.Shape.defineFigureGenerator('File', function(shape, w, h) {
            const geo = new go.Geometry();
            const fig = new go.PathFigure(0, 0, true); // starting point

            geo.add(fig);
            fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
            fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
            fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
            fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());

            const fig2 = new go.PathFigure(.75 * w, 0, false);
            geo.add(fig2);

            // The Fold
            fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
            geo.spot1 = new go.Spot(0, .25);
            geo.spot2 = go.Spot.BottomRight;

            return geo;
        });

        const commentStyle = // name is 'Comment'
            $(go.Node, 'Auto', nodeStyle(),
                $(go.Shape, 'File',
                { fill: '#DEE0A3', strokeWidth: 0 }),
                $(go.TextBlock, textStyle(),
                {
                    margin: 5,
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: 'center',
                    editable: true,
                    font: 'bold 12pt Helvetica, Arial, sans-serif',
                    stroke: '#454545'
                },
                new go.Binding('text').makeTwoWay())
                // no ports, because no links are allowed to connect with a comment
            );

        go.Shape.defineFigureGenerator('Database', function(shape, w, h) {
            const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
            const geo = new go.Geometry();
            const cpxOffset = KAPPA * .5;
            const cpyOffset = KAPPA * .1;

            const fig = new go.PathFigure(w, .1 * h, true);
            geo.add(fig);

            // Body
            fig.add(new go.PathSegment(go.PathSegment.Line, w, .9 * h));
            fig.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, h, w, (.9 + cpyOffset) * h, (.5 + cpxOffset) * w, h));
            fig.add(new go.PathSegment(go.PathSegment.Bezier, 0, .9 * h, (.5 - cpxOffset) * w, h, 0, (.9 + cpyOffset) * h));
            fig.add(new go.PathSegment(go.PathSegment.Line, 0, .1 * h));
            fig.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, 0, 0, (.1 - cpyOffset) * h, (.5 - cpxOffset) * w, 0));
            fig.add(new go.PathSegment(go.PathSegment.Bezier, w, .1 * h, (.5 + cpxOffset) * w, 0, w, (.1 - cpyOffset) * h));

            const fig2 = new go.PathFigure(w, .1 * h, false);
            geo.add(fig2);

            // Rings
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .2 * h, w, (.1 + cpyOffset) * h, (.5 + cpxOffset) * w, .2 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .1 * h, (.5 - cpxOffset) * w, .2 * h, 0, (.1 + cpyOffset) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Move, w, .2 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .3 * h, w, (.2 + cpyOffset) * h, (.5 + cpxOffset) * w, .3 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .2 * h, (.5 - cpxOffset) * w, .3 * h, 0, (.2 + cpyOffset) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Move, w, .3 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .4 * h, w, (.3 + cpyOffset) * h, (.5 + cpxOffset) * w, .4 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .3 * h, (.5 - cpxOffset) * w, .4 * h, 0, (.3 + cpyOffset) * h));

            geo.spot1 = new go.Spot(0, .4);
            geo.spot2 = new go.Spot(1, .9);

            return geo;
        });

        const databaseStyle = // name is 'Comment'
            $(go.Node, 'Auto', nodeStyle(),
                $(go.Shape, 'Database',
                { fill: '#00A9C9', strokeWidth: 1 }),
                $(go.TextBlock, textStyle(),
                {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: 'center',
                    editable: true
                },
                new go.Binding('text').makeTwoWay()),

                // four named ports, one on each side:
                makePort('T', go.Spot.Top, go.Spot.Top, false, true, 'database'),
                makePort('L', go.Spot.Left, go.Spot.Left, true, true, 'database'),
                makePort('R', go.Spot.Right, go.Spot.Right, true, true, 'database'),
                makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false, 'database')
            );

        templmap.add('', defaultStyle);
        templmap.add('Conditional', conditionalStyle);
        templmap.add('Start', startStyle);
        templmap.add('End', endStyle);
        templmap.add('Comment', commentStyle);
        templmap.add('Database', databaseStyle);

        this.myDiagram.nodeTemplateMap = templmap;

        // replace the default Link template in the linkTemplateMap
        this.myDiagram.linkTemplate =
            $(go.Link,  // the whole link panel
                {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5, toShortLength: 4,
                relinkableFrom: true,
                relinkableTo: true,
                reshapable: true,
                resegmentable: true,
                // mouse-overs subtly highlight links:
                selectionAdorned: false
                },
                new go.Binding('points').makeTwoWay(),
                $(go.Shape,  // the highlight shape, normally transparent
                    { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHLIGHT' }
                ),
                $(go.Shape,  // the link path shape
                    { isPanelMain: true, stroke: 'gray', strokeWidth: 2 },
                    new go.Binding('stroke', 'isSelected', function(sel) { return sel ? 'dodgerblue' : 'gray'; }).ofObject()
                ),
                $(go.Shape,  // the arrowhead
                    { toArrow: 'standard', strokeWidth: 0, fill: 'gray' }
                ),
                $(go.Panel, 'Auto',  // the link label, normally not visible
                    { visible: false, name: 'LABEL', segmentIndex: 2, segmentFraction: 0.5 },
                    new go.Binding('visible', 'visible').makeTwoWay(),
                    $(go.Shape, 'RoundedRectangle',  // the label shape
                        { fill: '#F8F8F8', strokeWidth: 0 }
                    ),
                    $(go.TextBlock, 'Yes',  // the label
                        {
                        textAlign: 'center',
                        font: '10pt helvetica, arial, sans-serif',
                        stroke: '#333333',
                        editable: true
                        },
                        new go.Binding('text').makeTwoWay()
                    )
                )
            )
        ;

        this.myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
        this.myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

        // load an initial diagram from some JSON text
        this.myDiagram.model = go.Model.fromJson(data);

        this.myDiagram.initialAutoScale = go.Diagram.Uniform;
        this.myDiagram.initialContentAlignment = go.Spot.Top;

        // initialize the Palette that is on the left side of the page
        this.myPalette =
            $(go.Palette, 'myPaletteDiv',  // must name or refer to the DIV HTML element
                {
                    nodeTemplateMap: this.myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
                    model: new go.GraphLinksModel([  // specify the contents of the Palette
                    { category: 'Start', text: 'Start' },
                    { text: 'Step' },
                    { category: 'Conditional', text: '???' },
                    { category: 'End', text: 'End' },
                    { category: 'Comment', text: 'Comment' },
                    { category: 'Database', text: 'Database' }
                    ])
                }
            );

        const result = [ { 'columns': ['f.objectId', 't.objectId', 'r.Label', 'visible'], 'data': [
                { 'row': ['1186', '1118', null, false], 'meta': [null, null, null, null] },
                { 'row': ['1118', '1119', 'Yes', true], 'meta': [null, null, null, null] },
                { 'row': ['1119', '1120', 'Yes', true], 'meta': [null, null, null, null] },
                { 'row': ['1120', '1121', null, false], 'meta': [null, null, null, null] },
                { 'row': ['1121', '1122', 'No', true], 'meta': [null, null, null, null] },
                { 'row': ['1122', '1123', 'Yes', true], 'meta': [null, null, null, null] },
                { 'row': ['1123', '1124', null, false], 'meta': [ null, null, null, null] },
                { 'row': ['1122', '1125', 'No', true], 'meta': [null, null, null, null] },
                { 'row': ['1121', '1125', 'Yes', true], 'meta': [null, null, null, null] },
                { 'row': ['1119', '1127', 'No', true], 'meta': [null, null, null, null] },
                { 'row': ['1129', '1128', 'Yes', true], 'meta': [null, null, null, null] },
                { 'row': ['1127', '1129', null, false], 'meta': [null, null, null, null] },
                { 'row': ['1129', '1130', 'No', true], 'meta': [null, null, null, null] },
                { 'row': ['1192', '1186', null, false], 'meta': [null, null, null, null] },
                { 'row': ['1118', '1191', 'No', true], 'meta': [null, null, null, null] }
            ]
        }];

        const linkData = [];
        result[0].data.forEach(function(x) {
            linkData.push({ from: x.row[0], to: x.row[1], label: x.row[2], visible: x.row[3] });
        });

        function nodeStyle() {
            return [
                // The Node.location comes from the 'loc' property of the node data,
                // converted by the Point.parse static method.
                // If the Node.location is changed, it updates the 'loc' property of the node data,
                // converting back using the Point.stringify static method.
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                {
                  // the Node.location is at the center of each node
                  locationSpot: go.Spot.Center
                }
              ];
        }

        // Define a function for creating a 'port' that is normally transparent.
        // The 'name' is used as the GraphObject.portId,
        // the 'align' is used to determine where to position the port relative to the body of the node,
        // the 'spot' is used to control how links connect with the port and whether the port
        // stretches along the side of the node,
        // and the boolean 'output' and 'input' arguments control whether the user can draw links from or to the port.
        function makePort(name, align, spot, output, input, shape) {
            const horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
            // the port is basically just a transparent rectangle that stretches along the side of the node,
            // and becomes colored when the mouse passes over it

            const db = shape === 'database';
            const topDb = (name === 'T') && db;

            return $(go.Shape, {
                fill: 'transparent',  // changed to a color in the mouseEnter event handler
                strokeWidth: 0,  // no stroke
                width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
                height: db ? 2 : (!horizontal ? NaN : 8), // if not stretching vertically, just 8 tall
                alignment: topDb ? new go.Spot(0, .5, 0, -40) : align,  // align the port on the main Shape
                stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
                portId: name,  // declare this object to be a 'port'
                fromSpot: spot,  // declare where links may connect at this port
                fromLinkable: output,  // declare whether the user may draw links from here
                toSpot: spot,  // declare where links may connect at this port
                toLinkable: input,  // declare whether the user may draw links to here
                cursor: 'pointer',  // show a different cursor to indicate potential link point
                mouseEnter: function(e, port) {  // the PORT argument will be this Shape
                    if (!e.diagram.isReadOnly) { port.fill = 'rgba(255,0,255,0.5)'; }
                },
                mouseLeave: function(e, port) {
                    port.fill = 'transparent';
                }
            });
        }

        function textStyle() {
            return {
                font: 'bold 11pt Helvetica, Arial, sans-serif',
                stroke: 'whitesmoke'
            };
        }

        this.dataService.setMyDiagram(this.myDiagram);
        this.dataService.setMyPalette(this.myPalette);

        // console.log(this.myDiagram);
    } // end init
}

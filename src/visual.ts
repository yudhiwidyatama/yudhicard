/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private textNodeLeft: Text;
    private textNodeRight: Text;
    private host: IVisualHost;
    private leftDiv: HTMLElement;
    private rightDiv: HTMLElement;
    private measureDiv: HTMLElement;
    private the_p: HTMLElement;
    private the_em: HTMLElement;
    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        this.host = options.host;
        this.updateCount = 0;
        if (document) {
            const new_p: HTMLElement = document.createElement("p");
            this.textNode = document.createTextNode("value");
            this.textNodeLeft = document.createTextNode("left");
            this.textNodeRight = document.createTextNode("right");
            this.leftDiv = document.createElement("div");
            this.leftDiv.appendChild(this.textNodeLeft);
            this.measureDiv = document.createElement("div");
            this.measureDiv.className = "measurediv";
            //this.measureDiv.appendChild(document.createTextNode("["));
            const new_em: HTMLElement = document.createElement("span");
            this.measureDiv.appendChild(this.textNode);
            //this.measureDiv.appendChild(document.createTextNode("]"));
            this.rightDiv = document.createElement("div");
            this.rightDiv.className = "rightdiv";
            this.rightDiv.appendChild(this.textNodeRight);
            new_p.className = "grid-container";
            new_p.appendChild(this.measureDiv);
            new_p.appendChild(this.leftDiv);
            new_p.appendChild(this.rightDiv);
            this.the_p = new_p;
            this.the_em = new_em;
            this.target.appendChild(new_p);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Checking #1 update', options);
        if (this.textNode) {
            console.log('Textnode exists');
            console.log(this.settings );
            if (options.dataViews)
            {
              if (options.dataViews[0])
              {
                  console.log('dataviews zero exist');
                  var dv0 = options.dataViews[0];
                  var row0 = dv0.table.rows[0];
                  var colMeasure = 0, colLeftsubtitle = '', colRightsubtitle = '', colRightcolor = '';
                  dv0.table.columns.forEach(
                    (col,idx) => {
                        if (col.roles.measure)
                            colMeasure = row0[idx] as number;
                        if (col.roles.rightsubtitle)
                            colRightsubtitle = row0[idx] as string;
                        if (col.roles.leftsubtitle)
                            colLeftsubtitle = row0[idx] as string;
                        if (col.roles.rightcolor)
                            colRightcolor = row0[idx] as string;
                    }
                );
                  
                  var formatter = valueFormatter.create({  format: "#,0",
                    precision: this.settings.dataPoint.setPrecision, cultureSelector: this.host.locale});
                  this.rightDiv.style.color = colRightcolor;
                  this.leftDiv.className = "leftdiv";
                  this.leftDiv.style.color = this.settings.dataPoint.subtitleColor;
                  var fontSize = this.settings.dataPoint.fontSize.toString();
                  //this.the_em.setAttribute('style','font-size: ' + fontSize+'px');
                  this.measureDiv.style.fontSize = fontSize +'px';
                  this.measureDiv.style.color = this.settings.dataPoint.defaultColor;
                  this.measureDiv.style.fontFamily= this.settings.dataPoint.fontFamily;
                  console.log(this.the_em.style);
                  //var val1 = v0[0].values[1]; // 
                  this.textNode.textContent = formatter.format(colMeasure);
                  this.textNodeLeft.textContent = colLeftsubtitle;
                  
                  this.textNodeRight.textContent = colRightsubtitle;
                  console.log(" updated to ", colMeasure);
              } else {
                console.log('dataviews zero not exist');
              }
            } else {
                console.log('dataviews not exist');
            }
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}
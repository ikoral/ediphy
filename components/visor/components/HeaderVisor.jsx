import React, {Component} from 'react';
import {Tooltip, OverlayTrigger,Breadcrumb, BreadcrumbItem, Button} from 'react-bootstrap';
import i18n from 'i18next';

export default class HeaderVisor extends Component {

    /*
     * This method is used to calculate actual position for title indexes
     * It is used the array of titles, the actual position in the iteration, and the level stored in nav properties
     */
    getActualIndex(size = 1, level = 0) {
        // Default values are stored in this variables
        let actual_parent = this.props.navItems[this.props.navItem.parent];
        let actual_level = this.props.navItem;
        //Equal size to the index of level
        size = size - 1;


        if (size === undefined || level === undefined || this.props.titles.length === 0) {
            //This happens when you are in a root element

            return "";

        } else if (size === level) {
            //This happens when you are in the first level
            let actual_index = (actual_parent.children.indexOf(actual_level.id));
            if (actual_index !== -1) {
                return (actual_index + 1) + ". ";
            }
        } else {
            //This happens when you have several sections in the array
            //You iterate inversely in the array until you get to the level stored in nav properties
            let actual_index;
            let interating_level = level + 1;

            for (let n = actual_level.level; interating_level < n; n--) {
                actual_level = actual_parent;
                actual_parent = this.props.navItems[actual_level.parent];
            }

            let final_level = actual_parent.children.indexOf(actual_level.id) + 1;
            if (actual_parent !== undefined && actual_parent.children !== undefined) {
                return final_level + ". ";
            } else {
                return "";
            }
        }
    }

    render() {
        let titles = this.props.titles;
        let currentStatus = this.props.titleMode;
        let unidad = titles[0];

        return (
            /* jshint ignore:start */

                <div className="title" onClick={(e) => {
                                        this.props.onShowTitle();
                                        e.stopPropagation(); }}>
                    <div style={{backgroundColor:'white', display:(titles.length !== 0)? 'initial' : 'none' }}>
                    <div className={this.props.showButtons ?  "caja selectedTitle selectedBox":"caja"}>
                        <div className="cab"
                            style={{backgroundColor: 'transparent',  visibility:(currentStatus == 'hidden') ? 'hidden' : 'inherit'}}>
                            <div className="cabtabla_numero"
                                contentEditable={this.props.navItem.parent === 0}
                                suppressContentEditableWarning
                                onBlur={e => {
                                        this.props.onUnitNumberChanged(this.props.navItem.id, parseInt(e.target.innerText, 10));
                                }}
                            >{this.props.navItem.unitNumber}</div>
                            <div className="tit_ud_cap">
                                <h1>{this.props.courseTitle}</h1>
                                <h2>{unidad}</h2>
                            </div>
                             {/* <div className="cabtabla_lapiz">
                                <img style={{display: 'none', visibility: 'inherit'}}
                                    src="images/ico_alumno.gif" alt="Alumno"/>
                                <div style={{display: 'none'}} id="alumno2"> Alumno</div>
                            </div>*/}
                            <div style={{display: 'none'}} className="clear"></div>
                        </div>
                    </div>
                    <br style={{clear:'both',  visibility: 'inherit'}}/>
                </div>
            </div>
            /* jshint ignore:end */
        );
    }

}
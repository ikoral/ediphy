import React from 'react';
import Ediphy from "../../../../core/editor/main";
import ErrorBoundary from "../../../containers/ErrorBoundary";
let html2json = require('html2json').html2json;

/* eslint-disable react/prop-types */

export default class Image extends React.Component {
    render() {
        let content = Ediphy.Plugins.get(this.props.toolbar.pluginId).getRenderTemplate(this.props.toolbar.state, this.props.props);
        // try {
        //     content = Ediphy.Plugins.get(this.props.toolbar.pluginId).getRenderTemplate(this.props.toolbar.state, this.props.props)
        // } catch(e) {
        //     content = <p>ERROR</p>;
        // }
        return this.props.config.flavor === "react" ? (
            <div style={this.props.style} className={"boxStyle " + this.props.classNames} ref={"content"}>
                {content}
            </div>
        ) : (
            <div style={this.props.style} className={"boxStyle " + this.props.classNames} ref={"content"}>
                {this.props.renderChildren(html2json(Ediphy.Plugins.get(this.props.toolbar.pluginId).getRenderTemplate(this.props.toolbar.state, this.props.props)))}
            </div>
        );
    }
}

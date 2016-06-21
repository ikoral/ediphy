import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Input,Button} from 'react-bootstrap';
import interact from 'interact.js';
import PluginPlaceholder from '../components/PluginPlaceholder';
import {BOX_TYPES, ID_PREFIX_BOX, ID_PREFIX_PAGE, ID_PREFIX_SECTION, ID_PREFIX_SORTABLE_BOX, ID_PREFIX_SORTABLE_CONTAINER} from '../constants';

export default class DaliBox extends Component {
    render() {
        let borderSize = 2;
        let cornerSize = 15;

        let box = this.props.boxes[this.props.id];
        let toolbar = this.props.toolbars[this.props.id];
        let vis = ((this.props.boxSelected === this.props.id) && box.type !== BOX_TYPES.SORTABLE)
        let style = {
            width: '100%',
            height: '100%',
            position: 'relative',
            wordWrap: 'break-word',
            visibility: (toolbar.showTextEditor ? 'hidden' : 'visible')
        };

        let textareaStyle = {
            width: '100%',
            height: '100%',
            top: 0,
            position: (toolbar.showTextEditor ? '' : 'absolute'),
            resize: 'none',
            visibility: (toolbar.showTextEditor ? 'visible' : 'hidden')
        }
        let attrs = {};

        for (var tabKey in toolbar.controls) {
            for (var accordionKey in toolbar.controls[tabKey].accordions) {
                for (var buttonKey in toolbar.controls[tabKey].accordions[accordionKey].buttons) {
                    var button = toolbar.controls[tabKey].accordions[accordionKey].buttons[buttonKey];
                    if (button.autoManaged) {
                        if (!button.isAttribute) {
                            if (buttonKey !== 'width' && buttonKey !== 'height') {
                                style[buttonKey] = button.value;
                                if (button.units) {
                                    style[buttonKey] += button.units;
                                }
                            }
                        } else {
                            attrs['data-' + buttonKey] = button.value;
                        }
                    }
                    if (buttonKey === 'fontSize') {
                        textareaStyle['fontSize'] = button.value;
                        if (button.units)
                            textareaStyle['fontSize'] += button.units;
                    } else if (buttonKey === 'color') {
                        textareaStyle['color'] = button.value;
                    }
                }
                if (toolbar.controls[tabKey].accordions[accordionKey].accordions) {
                    for (var accordionKey2 in toolbar.controls[tabKey].accordions[accordionKey].accordions) {
                        for (buttonKey in toolbar.controls[tabKey].accordions[accordionKey].accordions[accordionKey2].buttons) {
                            button = toolbar.controls[tabKey].accordions[accordionKey].accordions[accordionKey2].buttons[buttonKey];
                            if (button.autoManaged) {
                                if (!button.isAttribute) {
                                    if (buttonKey !== 'width' && buttonKey !== 'height') {
                                        style[buttonKey] = button.value;
                                        if (button.units) {
                                            style[buttonKey] += button.units;
                                        }
                                    }
                                } else {
                                    attrs['data-' + buttonKey] = button.value;
                                }
                            }
                            if (buttonKey === 'fontSize') {
                                textareaStyle['fontSize'] = button.value;
                                if (button.units)
                                    textareaStyle['fontSize'] += button.units;
                            } else if (buttonKey === 'color') {
                                textareaStyle['color'] = button.value;
                            }
                        }
                    }
                }
            }
        }

        let content = toolbar.state.__text ?
            (<div style={style} {...attrs} dangerouslySetInnerHTML={{__html: toolbar.state.__text}}></div>) :
            (<div style={style} {...attrs}>
                {this.renderChildren(box.content)}
            </div>);

        let helpersResizable;
        if (box.container === 0) {
            helpersResizable = (
                <div>
                    <div className="helpersResizable"
                        style={{position: 'absolute', left:  -cornerSize/2, top: -cornerSize/2, width: cornerSize, height: cornerSize, cursor: (box.container === 0 ? 'nw-resize' : 'move')}}></div>
                    <div className="helpersResizable"
                        style={{position: 'absolute', right: -cornerSize/2, top: -cornerSize/2, width: cornerSize, height: cornerSize, cursor: (box.container === 0 ? 'ne-resize' : 'move')}}></div>
                    <div className="helpersResizable"
                        style={{position: 'absolute', left:  -cornerSize/2, bottom: -cornerSize/2, width: cornerSize, height: cornerSize, cursor: (box.container === 0 ? 'sw-resize' : 'move')}}></div>
                    <div className="helpersResizable"
                        style={{position: 'absolute', right: -cornerSize/2, bottom: -cornerSize/2, width: cornerSize, height: cornerSize, cursor: (box.container === 0 ? 'se-resize' : 'move')}}></div>
                </div>
            );
        } else {
            helpersResizable = (<div></div>);
        }

        let border = (
            <div style={{visibility: (vis ? 'visible' : 'hidden')}}>
                <div style={{
                    position: 'absolute',
                    top: -(borderSize),
                    left: -(borderSize),
                    width: '100%',
                    height: '100%',
                    border: (borderSize + "px dashed #555"),
                    boxSizing: 'content-box'
                }}>
                </div>
                {helpersResizable}
            </div>);

        let classes = "wholebox";
        if (box.container) {
            classes += " dnd" + box.container;
        }

        let showOverlay;
        if (this.props.boxLevelSelected > box.level && box.children.length === 0) {
            showOverlay = "visible";
        } else if (this.props.boxLevelSelected === box.level && box.level !== 0 && !this.isAncestorOrSibling(this.props.boxSelected, this.props.id)) {
            showOverlay = "visible";
        } else {
            showOverlay = "hidden";
        }
        return (
            <div className={classes}
                 onClick={e => {
                    if(this.props.boxSelected != -1 && box.level == 0 && !this.sameLastParent(box, this.props.boxes[this.props.boxSelected])){
                         this.props.onBoxSelected(-1);
                         this.props.onBoxSelected(this.props.id);
                    } else if(this.props.boxLevelSelected === box.level){
                        if(this.props.boxLevelSelected > 0){
                            this.props.onBoxSelected(this.props.id);
                        }else{
                            this.props.onBoxSelected(this.props.id);
                        }
                    }
                    if(box.parent.indexOf(ID_PREFIX_PAGE) !== -1 ||
                        box.parent.indexOf(ID_PREFIX_SECTION) !== -1 ||
                        box.parent.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1){
                        e.stopPropagation();
                    }
                 }}
                 onDoubleClick={(e)=> {
                    if(this.props.boxLevelSelected === box.level && box.children.length !== 0){
                        this.props.onBoxLevelIncreased();
                    }
                    /*
                    if(toolbar.config && toolbar.config.needsTextEdition){
                        this.props.onTextEditorToggled(this.props.id, true);
                        this.refs.textarea.focus();
                    }*/
                 }}
                 style={{
                    position: (box.container !== 0 ? '' : 'absolute'),
                    left: box.position.x,
                    top: box.position.y,
                    width: box.width ,
                    height: box.height,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    touchAction: 'none',
                    msTouchAction: 'none',
                    cursor: vis ? 'inherit': 'default' //esto evita que aparezcan los cursores de move y resize cuando la caja no está seleccionada
                }}>

                {border}
                {content}
                {toolbar.state.__text ? <div contentEditable={true} id={box.id} ref={"textarea"} style={textareaStyle} /> : ""}
                <div style={{
                    width: "100%",
                    background: "black",
                    top: 0,
                    bottom:0,
                    position: "absolute",
                    opacity: 0.4,
                    visibility: showOverlay,
                }}></div>
            </div>);
    }
    sameLastParent(clickedBox, currentBox){
        if (currentBox.parent.indexOf(ID_PREFIX_BOX) == -1){
            return currentBox == clickedBox;
        } else {
            return this.sameLastParent(clickedBox, this.props.boxes[currentBox.parent]);
        }
    }
    isAncestorOrSibling(searchingId, actualId) {
        if (searchingId === actualId) {
            return true;
        }
        let parentId = this.props.boxes[actualId].parent;
        if (parentId === searchingId) {
            return true;
        }
        if (parentId.indexOf(ID_PREFIX_PAGE) !== -1 || parentId.indexOf(ID_PREFIX_SECTION) !== -1) {
            return false;
        }

        if (parentId.indexOf(ID_PREFIX_SORTABLE_BOX) === -1) {
            let parentContainers = this.props.boxes[parentId].children;
            if (parentContainers.length !== 0) {
                for (let i = 0; i < parentContainers.length; i++) {
                    let containerChildren = this.props.boxes[parentId].sortableContainers[parentContainers[i]].children;
                    for (let j = 0; j < containerChildren.length; j++) {
                        if (containerChildren[j] === searchingId) {
                            return true;
                        }
                    }
                }
            }
        }

        return this.isAncestorOrSibling(searchingId, parentId);
    }

    renderChildren(markup, key) {
        let component;
        let props = {};
        let children;
        switch (markup.node) {
            case 'element':
                if (markup.attr) {
                    props = markup.attr;
                }
                props.key = key;
                if (markup.tag === 'plugin') {
                    component = PluginPlaceholder;
                    let resizable = markup.attr.hasOwnProperty("plugin-data-resizable");
                    props = Object.assign({}, props, {
                        pluginContainer: markup.attr["plugin-data-id"],
                        resizable: resizable,
                        parentBox: this.props.boxes[this.props.id],
                        boxes: this.props.boxes,
                        boxSelected: this.props.boxSelected,
                        boxLevelSelected: this.props.boxLevelSelected,
                        toolbars: this.props.toolbars,
                        onBoxSelected: this.props.onBoxSelected,
                        onBoxLevelIncreased: this.props.onBoxLevelIncreased,
                        onBoxMoved: this.props.onBoxMoved,
                        onBoxResized: this.props.onBoxResized,
                        onSortableContainerResized: this.props.onSortableContainerResized,
                        onBoxDeleted: this.props.onBoxDeleted,
                        onBoxDropped: this.props.onBoxDropped,
                        onBoxModalToggled: this.props.onBoxModalToggled,
                        onTextEditorToggled: this.props.onTextEditorToggled
                    });
                } else {
                    component = markup.tag;
                }
                break;
            case 'text':
                component = "span";
                props = {key: key};
                children = [markup.text];
                break;
            case 'root':
                component = "div";
                props = {style: {width: '100%', height: '100%'}};
                break;
        }

        Object.keys(props).forEach(prop => {
            if (prop.startsWith("on")) {
                let value = props[prop];
                if (typeof value === "string") {
                    props[prop] = function () {
                    };
                }
            }
        });

        if (markup.child) {
            children = [];
            markup.child.forEach((child, index) => {
                children.push(this.renderChildren(child, index))
            });
        }
        return React.createElement(component, props, children);
    }

    blurTextarea() {
        this.props.onTextEditorToggled(this.props.id, false);
        let state = this.props.toolbars[this.props.id].state;
        state.__text = CKEDITOR.instances[this.props.id].getData();
        Dali.Plugins.get(this.props.toolbars[this.props.id].config.name).forceUpdate(state, this.props.id);
    }

    componentWillUpdate(nextProps, nextState) {
        if ((this.props.boxSelected === this.props.id) && (nextProps.boxSelected !== this.props.id) && this.props.toolbars[this.props.id].showTextEditor) {
            CKEDITOR.instances[this.props.id].focusManager.blur(true);
        }
    }

    checkAspectRatio() {
        let toolbar = this.props.toolbars[this.props.id];

        if (toolbar.config.aspectRatioButtonConfig) {
            let arb = toolbar.config.aspectRatioButtonConfig;
            if (arb.location.length == 2) {
                let comp = toolbar.controls[arb.location[0]].accordions[arb.location[1]].buttons.__aspectRatio;
                if (comp){
                    return (comp.value === "checked");       
                } else {
                    return false;
                }
            
            } else {
                let comp = toolbar.controls[arb.location[0]].accordions[arb.location[1]].accordions[arb.location[2]].buttons.__aspectRatio;
                if (comp) {
                    return comp.value === "checked";
                } else {
                    return false;
                }
            }
        }

        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        let toolbar = this.props.toolbars[this.props.id];
        let node = ReactDOM.findDOMNode(this);

        if (toolbar.showTextEditor) {
            this.refs.textarea.focus();

        }
        if ((toolbar.showTextEditor !== prevProps.toolbars[this.props.id].showTextEditor) && this.props.boxes[this.props.id].draggable) {
            interact(node).draggable(!toolbar.showTextEditor);
        }

        interact(node).resizable({preserveAspectRatio: this.checkAspectRatio()});
        
        if (this.props.boxes[this.props.id].level > this.props.boxLevelSelected) {
            interact(node).draggable({enabled: false});
        } else {
            interact(node).draggable({enabled: (this.draggable)});
        }
    }

    componentDidMount() {
        let toolbar = this.props.toolbars[this.props.id];
        let box = this.props.boxes[this.props.id];
        if (toolbar.config && toolbar.config.needsTextEdition) {
            CKEDITOR.disableAutoInline = true;
            let editor = CKEDITOR.inline(this.refs.textarea);
            editor.on("blur", function (e) {
                this.blurTextarea();
            }.bind(this));
            if (toolbar.state.__text) {
                editor.setData(toolbar.state.__text);
            }
        }

        let dragRestrictionSelector = (box.container !== 0) ? ".daliBoxSortableContainer, .drg" + box.container : "parent";
        interact(ReactDOM.findDOMNode(this))
            .draggable({
                enabled: (box.draggable && (this.props.boxLevelSelected <= box.level)),
                restrict: {
                    restriction: dragRestrictionSelector,
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                },
                autoScroll: true,
                onstart: (event) => {
                    if(box.container !== 0) {
                        let original = event.target;
                        let parent = original;
                        let iterate = true;
                        while (iterate) {
                            parent = parent.parentNode;
                            if (parent.className && (parent.className.indexOf("daliBoxSortableContainer") !== -1 || parent.className.indexOf("drg" + box.container) !== -1)) {
                                iterate = false;
                            }
                        }
                        let clone = original.cloneNode(true);
                        let originalRect = original.getBoundingClientRect();
                        let parentRect = parent.getBoundingClientRect();
                        let x = originalRect.left - parentRect.left;
                        let y = originalRect.top - parentRect.top;

                        clone.setAttribute("id", "clone");
                        clone.setAttribute('data-x', x);
                        clone.setAttribute('data-y', y);
                        parent.appendChild(clone);
                        // translate the element
                        clone.style.webkitTransform =
                            clone.style.transform =
                                'translate(' + (x) + 'px, ' + (y) + 'px)';

                        clone.style.height = originalRect.height + "px";
                        clone.style.width = originalRect.width + "px";
                        original.style.opacity = 0;
                    }
                },
                onmove: (event) => {
                    if (this.props.boxSelected !== this.props.id) {
                        this.props.onBoxSelected(this.props.id);
                    }

                    if ((box.level - this.props.boxLevelSelected) === 0) {
                        if(box.container === 0) {
                            let target = event.target;
                            target.style.left = (parseInt(target.style.left) || 0) + event.dx + 'px';
                            target.style.top = (parseInt(target.style.top) || 0) + event.dy + 'px';
                            target.style.zIndex = '9999';
                        }else {
                            let target = document.getElementById('clone'),
                                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                            // translate the element
                            target.style.webkitTransform =
                                target.style.transform =
                                    'translate(' + (x) + 'px, ' + (y) + 'px)';
                            target.style.zIndex = '9999';

                            // update the position attributes
                            target.setAttribute('data-x', x);
                            target.setAttribute('data-y', y);
                        }
                    }
                },
                onend: (event) => {
                    if (this.props.boxSelected !== this.props.id) {
                        return;
                    }

                    let target = event.target;
                    if (!target.parentElement) {
                        return;
                    }

                    let left = Math.max(Math.min(Math.floor(parseInt(target.style.left) / target.parentElement.offsetWidth * 100), 100), 0) + '%';
                    let top = Math.max(Math.min(Math.floor(parseInt(target.style.top) / target.parentElement.offsetHeight * 100), 100), 0) + '%';

                    target.style.left = box.container !== 0 ? left : target.style.left;
                    target.style.top = box.container !== 0 ? top : target.style.top;
                    target.style.zIndex = 'initial';

                    let clone = document.getElementById('clone');
                    if(clone) {
                        clone.parentElement.removeChild(clone);
                    }
                    this.props.onBoxMoved(
                        this.props.id,
                        box.container !== 0 ? left : Math.max(parseInt(target.style.left), 0),
                        box.container !== 0 ? top : Math.max(parseInt(target.style.top), 0));
                    event.stopPropagation();
                }
            })
            .ignoreFrom('input, textarea, a')
            .resizable({
                preserveAspectRatio: this.checkAspectRatio(),
                enabled: (box.resizable),
                restrict: {
                    restriction: "parent",
                    //endOnly: true,
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                },
                edges: {left: true, right: true, bottom: true, top: true},
                onstart: (event) => {
                    console.log("resize");
                },
                onmove: (event) => {
                    if (this.props.boxSelected !== this.props.id) {
                        return;
                    }
                    /*BOX-RESIZE*/
                    let target = event.target;
                    if (event.edges.bottom) { //Abajo
                        target.style.top = (parseInt(target.style.top) || 0);
                    }
                    if (event.edges.left) { //Izquierda
                        target.style.left = (parseInt(target.style.left) || 0) + event.dx + 'px';
                    }
                    if (event.edges.right) { //Derecha
                        target.style.left = (parseInt(target.style.left) || 0);
                    }
                    if (event.edges.top) { //Arriba
                        target.style.top = (parseInt(target.style.top) || 0) + event.dy + 'px';
                    }

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    /*
                     if(event.restrict){
                     if (event.edges.top && event.restrict.dy < 0) {
                     target.style.height = parseInt(target.style.height) + event.restrict.dy + 'px';
                     }
                     if (event.edges.bottom && event.restrict.dy > 0) {
                     target.style.height = parseInt(target.style.height) - event.restrict.dy + 'px';
                     }
                     if(event.edges.left && event.restrict.dx < 0){
                     target.style.width = parseInt(target.style.width) + event.restrict.dx + 'px';
                     }
                     if(event.edges.right && event.restrict.dx > 0){
                     target.style.width = parseInt(target.style.width) - event.restrict.dx + 'px';
                     }
                     }
                     */
                },
                onend: (event) => {
                    if (this.props.boxSelected !== this.props.id) {
                        return;
                    }

                    let target = event.target;
                    let width = Math.min(Math.floor(parseInt(target.style.width) / target.parentElement.offsetWidth * 100), 100) + '%';
                    let height = Math.min(Math.floor(parseInt(target.style.height) / target.parentElement.offsetHeight * 100), 100) + '%';

                    this.props.onBoxResized(
                        this.props.id,
                        box.container !== 0 ? width : parseInt(target.style.width),
                        box.container !== 0 ? height : parseInt(target.style.height));
                    this.props.onBoxMoved(this.props.id, parseInt(target.style.left), parseInt(target.style.top));
                    event.stopPropagation();
                }
            });
    }

    componentWillUnmount() {
        interact(ReactDOM.findDOMNode(this)).unset();
        if (CKEDITOR.instances[this.props.id])
            CKEDITOR.instances[this.props.id].destroy();
    }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import interact from 'interactjs';
import Alert from './../../common/alert/Alert';
import EditorBox from '../editor_box/EditorBox';
import { RESIZE_SORTABLE_CONTAINER, ADD_BOX } from '../../../../common/actions';
import { isAncestorOrSibling, isBox, isSortableContainer } from '../../../../common/utils';
import Ediphy from '../../../../core/editor/main';
import i18n from 'i18next';
import './_pluginPlaceHolder.scss';
import { ID_PREFIX_BOX, ID_PREFIX_SORTABLE_CONTAINER } from '../../../../common/constants';
import { instanceExists, releaseClick, findBox, createBox } from '../../../../common/common_tools';

export default class PluginPlaceholder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alert: null,
        };
    }
    render() {
        let container = this.props.parentBox.sortableContainers[this.idConvert(this.props.pluginContainer)] || {};
        let className = "drg" + this.idConvert(this.props.pluginContainer);
        /* if(this.props.boxLevelSelected - this.props.parentBox.level === 1 &&
           isAncestorOrSibling(this.props.parentBox.id, this.props.boxSelected, this.props.boxes)) {
            className += " childBoxSelected";
        }*/
        container.style = container.style || {};
        return (
            <div style={
                Object.assign({}, {
                    width: "100%",
                    height: container.height ? (container.height === 'auto' ? container.height : container.height + 'px') : "",
                    minHeight: '35px',
                    textAlign: 'center',
                    lineHeight: '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    display: 'table',
                }, container.style)
            }
            id={this.idConvert(this.props.pluginContainer)}
            className={className}>
                {container.colDistribution ? container.colDistribution.map((col, i) => {
                    if (container.cols[i]) {
                        return (<div key={i}
                            style={{ width: col + "%", height: '100%', display: "table-cell", verticalAlign: "top" }}>
                            {container.cols[i].map((row, j) => {
                                return (<div key={j}
                                    style={{ width: "100%", height: row + "%", position: 'relative' }}
                                    ref={e => {
                                        if(e !== null) {
                                            this.configureDropZone(
                                                ReactDOM.findDOMNode(e),
                                                ".rib, .dnd" /* + this.idConvert(this.props.pluginContainer)*/,
                                                {
                                                    i: i,
                                                    j: j,
                                                }
                                            );
                                        }
                                    }}>
                                    {this.state.alert}
                                    {container.children.map((idBox, index) => {
                                        if (this.props.boxes[idBox].col === i && this.props.boxes[idBox].row === j) {
                                            return (<EditorBox id={idBox}
                                                key={index}
                                                boxes={this.props.boxes}
                                                boxSelected={this.props.boxSelected}
                                                boxLevelSelected={this.props.boxLevelSelected}
                                                containedViewSelected={this.props.containedViewSelected}
                                                pluginToolbars={this.props.pluginToolbars}
                                                lastActionDispatched={this.props.lastActionDispatched}
                                                markCreatorId={this.props.markCreatorId}
                                                onRichMarksModalToggled={this.props.onRichMarksModalToggled}
                                                addMarkShortcut={this.props.addMarkShortcut}
                                                deleteMarkCreator={this.props.deleteMarkCreator}
                                                onBoxSelected={this.props.onBoxSelected}
                                                onBoxLevelIncreased={this.props.onBoxLevelIncreased}
                                                onBoxMoved={this.props.onBoxMoved}
                                                onRichMarkMoved={this.props.onRichMarkMoved}
                                                onBoxResized={this.props.onBoxResized}
                                                onBoxesInsideSortableReorder={this.props.onBoxesInsideSortableReorder}
                                                onSortableContainerResized={this.props.onSortableContainerResized}
                                                onBoxAdded={this.props.onBoxAdded}
                                                page={this.props.page}
                                                pageType={this.props.pageType}
                                                marks={this.props.allMarks}
                                                containedViews={this.props.containedViews}
                                                onBoxDropped={this.props.onBoxDropped}
                                                onRichMarkUpdated={this.props.onRichMarkUpdated}
                                                onVerticallyAlignBox={this.props.onVerticallyAlignBox}
                                                setCorrectAnswer={this.props.setCorrectAnswer}
                                                onTextEditorToggled={this.props.onTextEditorToggled}/>);
                                        } else if (index === container.children.length - 1) {
                                            return (<span><br/><br/></span>);
                                        }
                                        return null;
                                    })}
                                    {container.children.length === 0 ? (<span><br/><br/></span>) : ""}
                                </div>);
                            })}
                        </div>);
                    }
                    return null;
                }) : <div/>}
            </div>
        );
    }
    isComplex(pluginName) {
        return Ediphy.Plugins.get(pluginName).getConfig().isComplex;
    }
    configureDropZone(node, selector, extraParams) {
        let alert = (msg)=>{return (<Alert className="pageModal"
            show
            hasHeader
            backdrop={false}
            title={ <span><i className="material-icons" style={{ fontSize: '14px', marginRight: '5px', color: 'yellow' }}>warning</i>{ i18n.t("messages.alert") }</span> }
            closeButton onClose={()=>{this.setState({ alert: null });}}>
            <span> {msg} </span>
        </Alert>);};
        interact(node).dropzone({
            accept: selector,
            overlap: 'pointer',
            ondropactivate: (e) => {

                let pluginDraggingFromRibbonIsNotComplex = e.relatedTarget.className.indexOf("rib") === -1 || !e.relatedTarget.getAttribute("name") ||
                  !this.isComplex(e.relatedTarget.getAttribute("name"));
                let pluginDraggingFromCanvasIsNotComplex = e.relatedTarget.className.indexOf("rib") !== -1 || (this.props.pluginToolbars[this.props.boxSelected ] &&
                  this.props.pluginToolbars[this.props.boxSelected ].pluginId &&
                  !this.isComplex(this.props.pluginToolbars[this.props.boxSelected ].pluginId));
                let notYourself = e.relatedTarget.className.indexOf("rib") !== -1 || this.props.parentBox.id !== this.props.boxSelected;

                if (notYourself && pluginDraggingFromRibbonIsNotComplex && pluginDraggingFromCanvasIsNotComplex) {
                    e.target.classList.add('drop-active');
                }
            },
            ondragenter: function(e) {
                e.target.classList.add("drop-target");
            },
            ondragleave: function(e) {
                e.target.classList.remove("drop-target");
            },
            ondrop: function(e) {
                e.dragEvent.stopPropagation();

                let clone = document.getElementById('clone');
                if (clone) {
                    clone.parentNode.removeChild(clone);
                }
                // If element dragged is coming from PluginRibbon, create a new EditorBox
                let draggingFromRibbon = e.relatedTarget.className.indexOf("rib") !== -1;
                let name = (draggingFromRibbon) ? e.relatedTarget.getAttribute("name") : this.props.pluginToolbars[this.props.boxSelected].pluginId;
                let parent = forbidden ? this.props.parentBox.parent : this.props.parentBox.id;
                let container = forbidden ? this.props.parentBox.container : this.idConvert(this.props.pluginContainer);
                let config = Ediphy.Plugins.get(name).getConfig();
                let forbidden = isBox(parent) && config.isComplex; // && (parent !== this.props.boxSelected);

                let initialParams = {
                    parent: forbidden ? this.props.parentBox.parent : parent,
                    container: forbidden ? this.props.parentBox.container : container,
                    col: forbidden ? 0 : extraParams.i,
                    row: forbidden ? 0 : extraParams.j,
                    page: this.props.page,
                    id: ID_PREFIX_BOX + Date.now(),
                };
                let newInd = initialParams.container === 0 ? undefined : this.getIndex(this.props.boxes, initialParams.parent, initialParams.container, e.dragEvent.clientX, e.dragEvent.clientY, forbidden, this.props.parentBox.id);
                initialParams.index = newInd;
                if (draggingFromRibbon) {
                    if (config.limitToOneInstance && instanceExists(config.name)) {
                        this.setState({ alert: alert(i18n.t('messages.instance_limit')) });
                        return;
                    }
                    createBox(initialParams, name, false, this.props.onBoxAdded, this.props.boxes);

                } else {

                    let boxDragged = this.props.boxes[this.props.boxSelected];
                    // If box being dragged is dropped in a different column or row, change its value
                    if (this.props.parentBox.id !== this.props.boxSelected) {
                        initialParams.position = { type: 'relative', x: 0, y: 0 };
                        this.props.onBoxDropped(boxDragged.id, initialParams.row, initialParams.col, initialParams.parent,
                            initialParams.container, boxDragged.parent, boxDragged.container, initialParams.position, newInd);
                        return;
                    }
                }

            }.bind(this),
            ondropdeactivate: function(e) {
                e.target.classList.remove('drop-active');
                e.target.classList.remove("drop-target");
            },
        });
    }
    componentWillUnmount() {
        interact(ReactDOM.findDOMNode(this)).unset();
        interact(".editorBoxSortableContainer").unset();

    }
    componentDidMount() {
        interact(ReactDOM.findDOMNode(this))
            .resizable({
                enabled: false, // this.props.resizable,
                edges: { left: false, right: false, bottom: true, top: false },
                onmove: (event) => {
                    event.target.style.height = event.rect.height + 'px';
                },
                onend: (event) => {
                    // TODO Revew how to resize sortable containers
                    let toolbar = this.props.pluginToolbars[this.props.parentBox.id];
                    this.props.onSortableContainerResized(this.idConvert(this.props.pluginContainer), this.props.parentBox.id, parseInt(event.target.style.height, 10));
                    Ediphy.Plugins.get(toolbar.pluginId).forceUpdate(toolbar.state, this.props.parentBox.id, RESIZE_SORTABLE_CONTAINER);
                },
            });
    }

    getIndex(boxes, parent, container, x, y, forbidden, currentBox) {

        let rc = document.elementFromPoint(x, y);
        let children = boxes[parent].sortableContainers[container].children;
        let bid = releaseClick(rc, 'box-');
        let newInd = children.indexOf(bid);
        if (forbidden) {
            newInd = children.indexOf(currentBox);
        }
        return newInd === 0 ? 1 : ((newInd === -1 || newInd >= children.length) ? (children.length) : newInd);

    }
    idConvert(id) {
        if (isSortableContainer(id)) {
            return id;
        }
        return ID_PREFIX_SORTABLE_CONTAINER + id;

    }
}

PluginPlaceholder.propTypes = {
    /**
     * Nombre del contenedor de plugins
     */
    pluginContainer: PropTypes.string,
    /**
     * Identificador único de la caja padre
     */
    parentBox: PropTypes.any,
    /**
     * Diccionario que contiene todas las cajas creadas, accesibles por su *id*
     */
    boxes: PropTypes.object,
    /**
     * Caja seleccionada
     */
    boxSelected: PropTypes.any,
    /**
     * Nivel de caja seleccionado
     */
    boxLevelSelected: PropTypes.any,
    /**
     * Diccionario que contiene todos los valores de cajas, accesibles por su *id*
     */
    pluginToolbars: PropTypes.object.isRequired,

    /**
     * Última acción de Redux realizada
     */
    lastActionDispatched: PropTypes.any,
    /**
     * Selecciona una caja
     */
    onBoxSelected: PropTypes.func,
    /**
     * Aumenta de nivel de profundidad de selección (plugins dentro de plugins)
     */
    onBoxLevelIncreased: PropTypes.func,
    /**
     * Vista contenida seleccionanda
     */
    containedViewSelected: PropTypes.any,
    /**
     * Mueve una caja
     */
    onBoxMoved: PropTypes.func,
    /**
     * Redimensiona una caja
     */
    onBoxResized: PropTypes.func,
    /**
     * Redimensiona contenedor sortable
     */
    onSortableContainerResized: PropTypes.func,
    /**
     * Suelta caja
     */
    onBoxDropped: PropTypes.func,
    /**
     * Alinea verticalmente una caja
     */
    onVerticallyAlignBox: PropTypes.func,
    /**
     * Reordena las cajas de un contenedor
     */
    onBoxesInsideSortableReorder: PropTypes.func,
    /**
     * Activa/Desactiva la edición de texto
     */
    onTextEditorToggled: PropTypes.func,
    /**
      * Identificador de la caja en la que se va a crear una marca
      */
    markCreatorId: PropTypes.any,
    /**
      * Añade una marca a la caja
      */
    addMarkShortcut: PropTypes.func,
    /**
       * Función que oculta el overlay de creación de marcas
       */
    deleteMarkCreator: PropTypes.func,
    /**
      * Añade una caja
      */
    onBoxAdded: PropTypes.func,
    /**
       * Indica el tipo de página en el que se encuentra la caja
       */
    pageType: PropTypes.string,
    /**
     * Diccionario que contiene todas las vistas contenidas, accesibles por su *id*
     */
    containedViews: PropTypes.object,
    /**
    * Hace aparecer/desaparecer el modal de configuración de marcas
    */
    onRichMarksModalToggled: PropTypes.func,
    /**
    * Actualiza marca
     */
    onRichMarkUpdated: PropTypes.func,
    /**
     * Sets the correct answer of an exercise
     */
    setCorrectAnswer: PropTypes.func,
    /**
     * Current page
     */
    page: PropTypes.any,
};

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Grid, Row, Col, Button} from 'react-bootstrap';
import CanvasVisor from './components/CanvasVisor';
import ContainedCanvasVisor from './components/ContainedCanvasVisor';
import SideNavVisor from './components/SideNavVisor';
import VisorPlayer from './components/VisorPlayer';
import i18n from './../../i18n';
import {isContainedView, isPage, isSection} from './../../utils';
import {aspectRatio} from '../../common_tools';
import Config from './../../core/config';
import * as API from './../../core/scorm/scorm_utils';
require('es6-promise').polyfill();
require('./../../sass/style.scss');
require('./../../core/visor_entrypoint');

//TODO: define actions for visor?

export default class Visor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentView: [this.getCurrentView(Dali.State.navItemSelected, Dali.State.containedViewSelected)],  /*This is the actual view rendering*/
            triggeredMarks: [],
            richElementState: {},
            backupElementStates: {},
            toggledSidebar : true,
            navItemSelected: Dali.State.navItemSelected,
            containedViewSelected: Dali.State.containedViewSelected,
            fromScorm : Dali.State.fromScorm

        };

    }

    componentWillMount(){
        //Get the event received check if exist and modify the state
        // Add a queue of marks fired [{id: value, CurrentState: PENDING, TRIGGERED, DONE}] or array
        // Whenever the mark is ready trigger it
        this.mountFunction();
    }

    mountFunction(){
        
        let richElementsState = this.state.richElementState;
        let marks = this.getAllMarks();

        // Marks Global Listener
        Dali.API_Private.listenEmission(Dali.API_Private.events.markTriggered, e=>{

            let triggered_event = e.detail;
            let triggered_marks = this.getTriggeredMarks(marks,triggered_event);

            //clearMark | If actual Triggered Mark have passed e.detail.value and actual value is different or actual element doesn't need to clear the value
            this.clearTriggeredValues(triggered_event, triggered_marks);

            //Just try to trigger if mark exists
            if(this.containsMarkValue(marks,triggered_event.value)){
                //And is triggereable (not pending)
                let isTriggerable = this.isTriggereableMark(triggered_event, triggered_marks);
                if(isTriggerable){
                    //If mark is storable (if make any sense to store to render something different like a video) do it else, don't
                    if(triggered_event.stateElement){
                        let new_mark = {};
                        new_mark[triggered_event.id] = triggered_event.value;
                        this.setState({
                            triggeredMarks: triggered_marks,
                            richElementState: Object.assign({}, richElementsState, new_mark)
                        });
                    }else{
                        triggered_marks.forEach((mark,index)=>{
                            if(mark.id === isTriggerable.id){
                                triggered_marks[index] = isTriggerable;
                            }
                        });

                        this.setState({triggeredMarks: triggered_marks});

                    }
                }
            } else {
                if(triggered_event.stateElement){
                    let backupElementStates = this.state.backupElementStates;
                    let new_mark = {};
                    new_mark[triggered_event.id] = triggered_event.value;
                    this.setState({
                        backupElementStates: Object.assign({}, backupElementStates, new_mark)
                    });
                }
            }

        });
    }
    
    componentWillUpdate(nextProps, nextState){
        if(nextState.triggeredMarks.length !== 0 && this.returnTriggereableMark(nextState.triggeredMarks)){
             let newMark = this.returnTriggereableMark(nextState.triggeredMarks);

           nextState.triggeredMarks.forEach(mark=>{
                if(newMark.id === mark.id){
                    mark.currentState = 'TRIGGERED';
                }
                return mark;
            });

            let array_trigger_mark = this.santinizeViewsArray(nextState.triggeredMarks, nextState.currentView.concat([newMark.connection]));
            let newcv =  array_trigger_mark.length > 0 && array_trigger_mark[array_trigger_mark.length-1] && isContainedView(array_trigger_mark[array_trigger_mark.length-1]) ? array_trigger_mark[array_trigger_mark.length-1] : 0;

            this.setState({
                containedViewSelected: newcv,
                currentView: array_trigger_mark,
                triggeredMarks: nextState.triggeredMarks
            });

        }

    }


    render() {
        if (window.State) {
            Dali.State = window.State;
        }

        let boxes = Dali.State.boxesById;
        let boxSelected = Dali.State.boxSelected;
        let navItems = Dali.State.navItemsById;
        let navItemsIds = Dali.State.navItemsIds;
        let navItemSelected = this.state.navItemSelected; //Dali.State.navItemSelected;
        let containedViews = Dali.State.containedViewsById;
        let containedViewSelected = this.state.containedViewSelected; //Dali.State.containedViewSelected;
        let toolbars = Dali.State.toolbarsById;
        let globalConfig = Dali.State.globalConfig;
        let title = globalConfig.title;
        let ratio = globalConfig.canvasRatio;
        let wrapperClasses =  this.state.toggledSidebar ? "visorwrapper toggled" : "visorwrapper";
        let toggleIcon = this.state.toggledSidebar ? "keyboard_arrow_left" : "keyboard_arrow_right";
        let toggleColor = this.state.toggledSidebar ? "toggleColor" : "";
        let isSlide = navItems[navItemSelected].type === "slide" ? "pcw_slide":"pcw_doc";
        
        return (
            /* jshint ignore:start */
            <div id="app" 
                 className={wrapperClasses} >
                <SideNavVisor courseTitle={title}
                              toggled={this.state.toggledSidebar}
                              changePage={(page)=> {this.changeCurrentView(page)}}
                              navItemsById={navItems}
                              navItemsIds={navItemsIds}
                              navItemSelected={navItemSelected}/>
                <div id="page-content-wrapper" 
                     className={isSlide} 
                    style={{height: '100%'}}>
                    <Grid fluid={true} 
                          style={{height: '100%'}}>
                        <Row style={{height: '100%'}}>
                            <Col lg={12} style={{height: '100%'}}>
                                <VisorPlayer changePage={(page)=> {this.changeCurrentView(page)}} 
                                             navItemsById={navItems} 
                                             navItemsIds={navItemsIds} 
                                             navItemSelected={navItemSelected} />
                                <Button id="visorNavButton" 
                                        className={toggleColor} 
                                        bsStyle="primary"  
                                        onClick={e => {this.setState({toggledSidebar: !this.state.toggledSidebar})}}>
                                    <i className="material-icons">{toggleIcon}</i>
                                </Button>

                                { !isContainedView(this.getLastCurrentViewElement()) ?
                                    (<CanvasVisor boxes={boxes}
                                                boxSelected={boxSelected}
                                                changeCurrentView={(element) => {this.changeCurrentView(element)}}
                                                containedViews={containedViews}
                                                containedViewSelected={containedViews[containedViewSelected]||0}
                                                currentView={this.getLastCurrentViewElement()}
                                                navItems={navItems}
                                                navItemSelected={navItems[navItemSelected]}
                                                toolbars={toolbars}
                                                title={title}
                                                triggeredMarks={this.state.triggeredMarks}
                                                showCanvas={this.getLastCurrentViewElement().indexOf("cv-") === -1}
                                                removeLastView={()=>{this.removeLastView()}}
                                                richElementsState={this.state.richElementState}
                                                viewsArray={this.state.currentView}
                                                canvasRatio={ratio}
                                    />) :
                                    (<ContainedCanvasVisor boxes={boxes}
                                                boxSelected={boxSelected}
                                                changeCurrentView={(element) => {this.changeCurrentView(element)}}
                                                containedViews={containedViews}
                                                containedViewSelected={containedViews[containedViewSelected]||0}
                                                currentView={this.getLastCurrentViewElement()}
                                                navItems={navItems}
                                                navItemSelected={navItems[navItemSelected]}
                                                toolbars={toolbars}
                                                title={title}
                                                triggeredMarks={this.state.triggeredMarks}
                                                showCanvas={this.getLastCurrentViewElement().indexOf("cv-") !== -1}
                                                removeLastView={()=>{this.removeLastView()}}
                                                richElementsState={this.state.richElementState}
                                                viewsArray={this.state.currentView}
                                                canvasRatio={ratio}
                                    />)
                                }
                            </Col>
                        </Row>
                    </Grid>
                </div>
            </div>

            /* jshint ignore:end */
        );
    }

    getLastCurrentViewElement(){
        return this.state.currentView[this.state.currentView.length - 1];
    }

    changeCurrentView(element){
        if (isContainedView(element)) {
            this.setState({ containedViewSelected: element, 
                            currentView: [this.getCurrentView(this.state.navItemSelected, this.state.containedViewSelected), element]});
        } else {

             this.setState({ navItemSelected: element, 
                             containedViewSelected: 0,
                             currentView: [element] });
             if(this.state.currentView.length > 1) {
                this.setState({ triggeredMarks: this.unTriggerLastMark(this.state.triggeredMarks),
                                richElementState: this.getActualBoxesStates(this.state.backupElementStates,this.state.richElementState)});
             }

            if (Dali.State.fromScorm){
                API.changeLocation(element); 
            }
        }    
        this.mountFunction();   

        
    }

    getCurrentView(NIselected, CVselected){
        let currentView = (CVselected === 0) ? NIselected : CVselected;
        return currentView;
    }

    /*Marks functions*/

    containsMarkValue(marks,mark_value){
        let exists = false;
        marks.forEach(mark_element=>{
            if(mark_element.value === mark_value){
                exists = true;
            }
        });
        return exists;
    }

    returnTriggereableMark(triggeredMarks){
        let isAnyTriggereableMark = false;
        let canBeTriggered = true;
        if( Array.isArray(triggeredMarks)){
            triggeredMarks.forEach(mark=>{
                if (mark.currentState === 'TRIGGERED'){
                    canBeTriggered = false;
                }
                if(canBeTriggered && mark.currentState === 'PENDING' && !isAnyTriggereableMark){
                    isAnyTriggereableMark = mark;
                }
            });
        }
        return isAnyTriggereableMark;
    }

    /*Check if status is PENDING and not TRIGGERED*/
    isTriggereableMark(mark, triggerable_marks){
        let isAnyTriggereableMark = false;
        triggerable_marks.forEach(triggereable_mark=> {
            if (triggereable_mark.currentState === 'PENDING' && triggereable_mark.value === mark.value && triggereable_mark.box_id === mark.id) {
                if (!isAnyTriggereableMark) {
                    isAnyTriggereableMark = triggereable_mark;
                }
            }

            if (!mark.stateElement && triggereable_mark.value === mark.value && triggereable_mark.box_id === mark.id) {
                if (!isAnyTriggereableMark) {
                    isAnyTriggereableMark = triggereable_mark;
                    isAnyTriggereableMark.currentState = "PENDING";
                }
            }
        });
        return isAnyTriggereableMark;
    }

    unTriggerLastMark(state){
        let new_array = state;
        new_array.forEach(mark=>{
            if(mark.currentState === 'TRIGGERED'){
                mark.currentState = 'DONE';
            }
        });
        return new_array;
    }

    santinizeViewsArray(triggeredMarks, arrayViews){
        let final_array = arrayViews;

        triggeredMarks.forEach(mark=>{
           if(mark.currentState === "DONE" && final_array.indexOf(mark.connection) !== -1){
               final_array.splice(final_array.indexOf(mark.connection),1);

           }
        });

        return final_array;
    }

    /* Cleans */
    clearTriggeredValues(triggered_event, triggeredMarks){
        let clean_array = [];

        if(triggeredMarks.length > 0){
            if(!triggered_event.stateElement){
                /*triggeredMarks.forEach(element=>{
                   if(element.currentState !== 'DONE' || triggered_event.id !== element.box_id ){
                       clean_array.push(element);
                   }
                });
                if(clean_array.length !== triggeredMarks.length){
                    this.setState({triggeredMarks: clean_array});
                }*/
            } else {
                triggeredMarks.forEach(element =>{
                    if(element.currentState !== "DONE" || element.value === triggered_event.value || element.box_id !== triggered_event.id ){
                        clean_array.push(element);
                    }
                });
                if(clean_array.length !== triggeredMarks.length){
                    this.setState({triggeredMarks: clean_array});
                }
            }
        }
    }

    getTriggeredMarks(marks,triggered_event){
        let state_marks = [];
        let previously_triggered_marks = this.state.triggeredMarks;
        if(previously_triggered_marks.length === 0){
            marks.forEach(mark_element=>{
                if(mark_element.value === triggered_event.value && mark_element.box_id === triggered_event.id){
                    state_marks.push({
                        currentState:"PENDING",
                        id: mark_element.id,
                        value: mark_element.value,
                        connection:mark_element.connection,
                        box_id: mark_element.box_id
                    });
                }
            });
        }else{
            //return only triggered MARKS
            state_marks = state_marks.concat(previously_triggered_marks);

            marks.forEach(triggered_mark=>{
                let is_different = true;
                for(let n in state_marks){
                    if(state_marks[n].value === triggered_mark.value && state_marks[n].box_id === triggered_event.id ){
                        is_different = false;
                    }
                }

                if(is_different && triggered_event.value === triggered_mark.value && triggered_event.id === triggered_mark.box_id){
                    state_marks.push({
                        currentState:"PENDING",
                        id: triggered_mark.id,
                        value: triggered_mark.value,
                        connection:triggered_mark.connection,
                        box_id: triggered_mark.box_id
                    });
                }

            });
        }

        return state_marks;
    }

    getAllMarks() {
        let currentView = /*Dali.State.navItemSelected; */this.state.currentView[0];

        let boxes = this.getAllRichDescendantBoxes(currentView);
        let marks = [];
        boxes.forEach(box=>{
            Object.keys(Dali.State.toolbarsById[box].state.__marks).map(mark_element=>{
                let mark_box = Dali.State.toolbarsById[box].state.__marks[mark_element];
                mark_box.box_id = box;
                marks.push(mark_box);
            });
        });
        return marks;
    }

    getAllRichDescendantBoxes(navItemID){
        let view = Dali.State.navItemsById[navItemID];
        if (isContainedView(navItemID)) {
            view = Dali.State.containedViewsById[navItemID];
        }
        let boxes = view.boxes;
        let newBoxes = [];

        let richBoxes = [];
        Object.keys(Dali.State.boxesById).map(box=>{

            if(boxes.indexOf(box) !== -1){
                newBoxes.push(box);

                if(Object.keys(Dali.State.boxesById[box].children).length !== 0){
                    Object.keys(Dali.State.boxesById[box].sortableContainers).map(second_box=>{
                        newBoxes = newBoxes.concat(Dali.State.boxesById[box].sortableContainers[second_box].children);
                   });
                }
            }
        });

        newBoxes.forEach(final=>{
            if(Dali.State.toolbarsById[final] && Dali.State.toolbarsById[final].config && Dali.State.toolbarsById[final].config.isRich){
                richBoxes.push(final);
            }
        });
        return richBoxes;
    }

    getActualBoxesStates(backup, current){
        let nextState = backup;
        nextState[this.state.triggeredMarks[0].box_id] = current[this.state.triggeredMarks[0].box_id];
        return nextState;
    }

    removeLastView() {
        let newViews = this.state.currentView.slice(0,-1);
        if (newViews.length > 0){
            let lastView = newViews[newViews.length -1];
            if (lastView.indexOf("cv-") === -1){
                this.setState({containedViewSelected: 0});
            }
        }
        this.setState({
            currentView: newViews,
            triggeredMarks: this.unTriggerLastMark(this.state.triggeredMarks),
            richElementState: this.getActualBoxesStates(this.state.backupElementStates,this.state.richElementState)
        });
    }

    getFirstPage() {
        var navItems = Dali.State.navItemsIds;
        var bookmark = 0;
        for (var i = 0; i < navItems.length; i++){
            if (Config.sections_have_content ? isSection(navItems[i]):isPage(navItems[i])) {
                bookmark = navItems[i];
                break;
            }
        }
        return bookmark;
    }

    componentDidMount() {
        if (Dali.State.fromScorm) {
            window.addEventListener("readyForSCORM", function scormFunction(event){
                console.log(event.detail);
                var bookmark = event.detail && event.detail.bookmark && event.detail.bookmark !== '' ? event.detail.bookmark : this.getFirstPage();
                this.changeCurrentView(bookmark);
            }.bind(this));
        }
    }
 
}

/* jshint ignore:start */
ReactDOM.render((<Visor />), document.getElementById('root'));
/* jshint ignore:end */

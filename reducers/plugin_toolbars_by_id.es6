import {
    ADD_BOX, DELETE_BOX, DELETE_CONTAINED_VIEW,
    DELETE_NAV_ITEM, DELETE_SORTABLE_CONTAINER, RESIZE_BOX, RESIZE_SORTABLE_CONTAINER,
    TOGGLE_TEXT_EDITOR, UPDATE_BOX, UPDATE_PLUGIN_TOOLBAR,
    VERTICALLY_ALIGN_BOX, IMPORT_STATE, PASTE_BOX, ADD_NAV_ITEM,
} from '../common/actions';
import Utils, {
    changeProp, deleteProps,
} from '../common/utils';
import i18n from 'i18next';

function toolbarCreator(state, action) {
    let structure;
    let pluginId = action.payload.initialParams.name;
    let toolbar = {};
    if(action.payload.ids.container !== 0) {
        if(state[action.payload.container]) {
            let toolbar_container = {
                id: action.payload.id.container,
                pluginId: "sortableBox",
                state: {},
                structure: {},
                style: {},
            };
            toolbar = { ...toolbar, toolbar_container };
        }
    }
    structure = {
        height: action.payload.initialParams.height || "25%",
        width: action.payload.initialParams.width || "auto",
        rotation: action.payload.initialParams.rotation || 0,
        aspectRatio: true,
        position: action.payload.id ? "relative" : "absolute",
    };

    toolbar = {
        ...toolbar,
        [action.payload.ids.id]:
            {
                id: action.payload.ids.id,
                pluginId: pluginId,
                state: action.payload.state || {},
                structure: structure || {},
                style: action.payload.style || {},
                showTextEditor: false,
            },
    };

    return toolbar;
}

function toolbarSortableContainer(state, action) {
    let toolbar = {};
    if(isDocument(action.payload.id)) {
        toolbar = {
            id: action.payload.ids,
            pluginId: "sortableContainer",
            state: {},
            structure: {},
            style: {},
        };
    }
    return toolbar;
}

export default function(state = {}, action = {}) {
    let newState;
    switch (action.type) {
    case ADD_BOX:
        return { ...state, ...toolbarCreator(state, action) };
    case ADD_NAV_ITEM:
        return changeProp(state, action.payload.id.boxes[0], toolbarSortableContainer(state, action));
    case DELETE_BOX:
        let children = action.payload.children ? action.payload.children : [];
        return deleteProps(state, children.concat(action.payload.id));
    case DELETE_CONTAINED_VIEW:
        let boxesCV = action.payload.boxes ? action.payload.boxes : [];
        let newToolbarCV = JSON.parse(JSON.stringify(state));
        let parents = action.payload.parent ? action.payload.parent : [];
        // Delete all related marks

        return deleteProps(newToolbarCV, boxesCV.concat(action.payload.ids[0]));
    case DELETE_NAV_ITEM:
        let boxes = action.payload.boxes ? action.payload.boxes : [];
        let newToolbar = { ...state };

        return deleteProps(newToolbar, boxes.concat(action.payload.ids));
    case DELETE_SORTABLE_CONTAINER:
        return deleteProps(state, action.payload.children);
    case RESIZE_BOX:
        newState = {
            ...state,
            [action.payload.id]: {
                height: action.payload.height,
                width: action.payload.width,
            },
        };
        return newState;
    case RESIZE_SORTABLE_CONTAINER:
        newState = {
            ...state,
            [action.payload.id]: {
                style: {
                    height: action.payload.height,
                },
            },
        };
        return newState;
    case TOGGLE_TEXT_EDITOR:
        newState = {
            ...state,
            [action.payload.id]: {
                showTextEditor: action.payload.value,
            },
        };
        return newState;
    case UPDATE_BOX:
        //   return changeProp(state, action.payload.id, toolbarReducer(state[action.payload.id], action));
    case UPDATE_PLUGIN_TOOLBAR:
        newState = {
            ...state,
            [action.payload.id]: {
                ...state[action.payload.id],
                state: action.payload.state || state[action.payload.id].state,
                structure: action.payload.structure || state[action.payload.id].structure,
                style: action.payload.style || state[action.payload.id].style,
            },
        };
        return newState;
    case VERTICALLY_ALIGN_BOX:
        newState = {
            ...state,
            [action.payload.id]: {
                style: {
                    verticalAlign: action.payload.value,
                },
            },
        };
        return newState;
    case IMPORT_STATE:
        return action.payload.present.pluginToolbarsById || state;
    case PASTE_BOX:
        return changeProp(state, action.payload.ids.id, action.payload.toolbar);
    default:
        return state;
    }
}
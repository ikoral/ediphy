import React from "react";
import i18n from 'i18next';

export default class VirtualRealityPlugin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.toolbarUpdateValue = this.toolbarUpdateValue.bind(this);
        this.receiver = this.receiver.bind(this);
    }
    render() {
        return (
            <iframe allow="vr" width='100%' height='100%' className={'VRvisor'}
                src={'VR/index.html?id=' + this.props.id + "&visor=true"} id="receiver" />
        );
    }
    componentDidMount() {
        window.addEventListener("message", this.receiver);
        this.toolbarUpdateValue();
    }
    componentWillUnmount() {
        window.removeEventListener('message', this.receiver);
    }
    receiver(e) {
        try{
            console.log(e.data);
            let data = JSON.parse(e.data);
            // console.log(data);
            if (!this.windowSource && data.msg === 'LOAD' && data.id === this.props.id) {
                this.windowSource = e.source;
                this.toolbarUpdateValue();
            }
            if (this.windowSource && data.msg === 'MARK' && data.id === this.props.id) {
                this.props.onMarkClicked(this.props.id, this.props.marks[data.mark].value);
            }
        } catch (err) {
            console.error(err);
        }

    }
    toolbarUpdateValue(props = this.props) {
        console.log(props);
        let receiverWindow = this.windowSource;
        if(receiverWindow) {
            let { imagenBack, urlBack, numberOfPictures, audioBack, showPanel } = props.state;
            let imgs = [];
            for (let i = 0; i < numberOfPictures; i++) {
                imgs.push({ currentImg: props.state['urlPanel' + i] });
            }
            receiverWindow.postMessage({ msg: 'DATA', imagenBack, urlBack, audioBack: { play: audioBack },
                imgs, showPanel: { show: showPanel }, marks: props.marks }, "*");
        }

    }
}
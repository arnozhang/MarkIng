/**
 * MarkIng project.
 *
 * Copyright 2017 Arno Zhang <zyfgood12@163.com>
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import * as lodash from 'lodash';
import {ipcRenderer, remote} from 'electron';
import MarkdownEditor from '../markdown/MarkdownEditor';
import {AppEvents, Article, ReactStyles, renderToHtml} from '../../base/AppBase';


const {Menu} = remote;


interface HomePageState {
    showPreview?: boolean,
    showLineNumber?: boolean,
    showFillInfo?: boolean;
}


export default class Homepage extends React.Component<any, HomePageState> {

    article: Article = {};


    constructor(props: any) {
        super(props);

        this.state = {
            showPreview: true,
            showLineNumber: true,
            showFillInfo: false
        };
    }

    componentDidMount() {
        ipcRenderer.on(AppEvents.SwitchShowPreview, (event: Event, show: boolean) => {
            let state: any = lodash.assign({}, this.state);
            state.showPreview = show;
            this.setState(state);
        });

        ipcRenderer.on(AppEvents.SwitchShowLineNumber, (event: Event, show: boolean) => {
            let state: any = lodash.assign({}, this.state);
            state.showLineNumber = show;
            this.setState(state);
        });

        ipcRenderer.on(AppEvents.PrepareSaveMarkdown, (event: Event, args: any) => {
            ipcRenderer.send(AppEvents.DoSaveMarkdown, this.article.contents);
        });

        ipcRenderer.on(AppEvents.FileContentChanged, (event: Event, contents: string) => {
            this.onContentChanged(contents);
        });

        let options = ipcRenderer.sendSync(AppEvents.GetMainOptions);
        if (options) {
            let state: any = lodash.assign(this.state, options);
            this.setState(state);
        }

        this.installFileDrop();
        window.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
            Homepage.showContextMenu();
        }, false);
    }

    private installFileDrop() {
        const holder = document.getElementById('react_container');
        holder.ondragover = (e) => {
            e.preventDefault();
            return false;
        };

        holder.ondragleave = holder.ondragend = () => {
            return false;
        };

        holder.ondrop = (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.path && file.path.length > 0) {
                ipcRenderer.send(AppEvents.OpenExternalFile, file.path);
            }

            return false;
        };
    }

    private static showContextMenu() {
        let template: any[] = [
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {type: 'separator'},
            {role: 'selectall'}
        ];

        const menu = Menu.buildFromTemplate(template);
        menu.popup(remote.getCurrentWindow());
    }

    render() {
        return (
            <div style={styles.root}>
                <div style={styles.editor_root}>
                    <MarkdownEditor
                        source={this.article.contents}
                        style={{flex: 1, backgroundColor: 'white'}}
                        showPreview={this.state.showPreview}
                        showLineNumber={this.state.showLineNumber}
                        onContentChanged={this.onContentChanged.bind(this)}/>
                </div>
            </div>
        );
    }

    onContentChanged(content: string) {
        this.article.contents = content;
        this.setState({});
    }
}

const styles: ReactStyles = {
    root: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundImage: `url(../images/main_bkg.jpg)`
    },
    editor_root: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column'
    },
};

let homePage = renderToHtml(<Homepage/>);

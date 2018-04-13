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
import * as ReactDOM from 'react-dom';


export interface ReactStyles {
    [key: string]: React.CSSProperties
}


export function renderToHtml<T extends Element>(element: any): T {
    return ReactDOM.render(
        element, document.getElementById('react_container'));
}


export namespace AppEvents {

    export const SwitchShowPreview = 'SwitchShowPreview';
    export const SwitchShowLineNumber = 'SwitchShowLineNumber';
    export const GetMainOptions = 'GetMainOptions';
    export const PrepareSaveMarkdown = 'PrepareSaveMarkdown';
    export const DoSaveMarkdown = 'DoSaveMarkdown';
    export const OpenExternalFile = 'OpenExternalFile';
    export const FileContentChanged = 'FileContentChanged';
}


export interface Article {
    contents?: string;
}


export interface MainOptionsInterface {

    showPreview?: boolean;
    showLineNumber?: boolean;
    recentFiles?: string[];
}


export class MainOptions implements MainOptionsInterface {

    showPreview = true;
    showLineNumber = true;
    recentFiles?: string[];


    constructor(options?: MainOptionsInterface) {
        if (!options) {
            return;
        }

        if (options.showPreview != undefined) {
            this.showPreview = options.showPreview;
        }

        if (options.showLineNumber != undefined) {
            this.showLineNumber = options.showLineNumber;
        }

        this.recentFiles = options.recentFiles;
    }

    addRecentFile(filePath: string): void {
        if (!filePath || filePath.length <= 0) {
            return;
        }

        if (!this.recentFiles) {
            this.recentFiles = [];
        }

        for (let i = 0; i < this.recentFiles.length; ++i) {
            if (this.recentFiles[i] == filePath) {
                this.recentFiles.splice(i, 1);
                break;
            }
        }

        this.recentFiles.unshift(filePath);
    }
}

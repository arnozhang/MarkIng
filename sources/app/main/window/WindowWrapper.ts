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

import * as electron from 'electron';
import {BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import Application from '../Application';


const {app, Menu, globalShortcut, ipcMain} = electron;


export default class WindowWrapper {

    protected mWindow: BrowserWindow = null;


    constructor() {
    }

    initialize() {
    }

    createWindow(html: string, title: string,
        width: number, height: number, icon?: string, show?: boolean) {

        if (!icon) {
            icon = 'app-icon.png';
        }

        const hasShowOption = show != undefined;
        this.mWindow = new BrowserWindow({
            width: width,
            height: height,
            center: true,
            title: title,
            show: hasShowOption ? show : false,
            icon: path.join(__dirname, `../../public/images/${icon}`)
        });

        if (!hasShowOption) {
            this.mWindow.once('ready-to-show', () => {
                this.mWindow.show();
            });
        }

        this.mWindow.on('closed', () => {
            this.mWindow = null;
        });

        this.mWindow.loadURL(url.format({
            pathname: path.join(__dirname, `../../public/html/${html}`),
            protocol: 'file:',
            slashes: true
        }));

        this.afterWindowCreated();
    }

    getWindow(): BrowserWindow {
        return this.mWindow;
    }

    close(): void {
        this.mWindow = null;
    }

    isClosed(): boolean {
        return !!this.mWindow;
    }

    setTitle(title: string): void {
        this.mWindow.setTitle(title);
    }

    protected afterWindowCreated(): void {
        if (!Application.isRelease()) {
            this.mWindow.webContents.openDevTools();
        }
    }

    protected sendEvent(channel: string, ...args: any[]) {
        this.mWindow.webContents.send(channel, ...args);
    }
}
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
import ApplicationMainWindow from './window/ApplicationMainWindow';

const {app, globalShortcut, BrowserWindow, ipcMain} = electron;


export default class Application {

    private mMainWindow = new ApplicationMainWindow();
    public static readonly mAppEnv = process.env.NODE_ENV;


    initialize(): void {
        this.mMainWindow.initialize();
        this.initializeEvents();
    }

    protected createMainWindow() {
        this.mMainWindow.create();
        this.initializeGlobalShortcut();
    }

    static isRelease() {
        return Application.mAppEnv === 'release';
    }

    private initializeEvents() {
        app.on('ready', () => {
            this.createMainWindow();
        });

        app.on('window-all-closed', () => {
            this.mMainWindow.preQuitApp();
            app.quit();
        });
    }

    private initializeGlobalShortcut() {
        if (!Application.isRelease()) {
            globalShortcut.register('CmdOrCtrl+Alt+P', () => {
                let window = BrowserWindow.getFocusedWindow();
                if (window) {
                    window.webContents.toggleDevTools();
                }
            });
        }
    }
}

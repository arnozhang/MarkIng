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

import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';
import {AppEvents, MainOptions} from '../../base/AppBase';
import WindowWrapper from './WindowWrapper';
import AppStorage from "../AppStorage";


const {app, Menu, ipcMain, dialog} = electron;


export default class ApplicationMainWindow extends WindowWrapper {

    private mViewOptions: MainOptions;
    private mCurrentFilePath: string;


    initialize() {
        super.initialize();
        AppStorage.loadOptions(options => {
            this.mViewOptions = new MainOptions(options);
            this.createApplicationMenu();
        });

        ipcMain.on(AppEvents.GetMainOptions, (event: any, args: any) => {
            event.returnValue = this.mViewOptions;
        });

        ipcMain.on(AppEvents.DoSaveMarkdown, (event: Event, contents: string) => {
            if (this.mCurrentFilePath) {
                this.saveFileInternal(this.mCurrentFilePath, contents);
            } else {
                let firstLine = contents.split('\n')[0];
                let result = firstLine.match(/^\s*(#)+\s+(.+)$/);
                if (result && result.length >= 3) {
                    firstLine = result[2];
                }

                firstLine = firstLine.trim();
                if (path.extname(firstLine).length <= 0) {
                    firstLine += '.md';
                }

                dialog.showSaveDialog(this.mWindow,
                    {
                        title: 'Save markdown file...',
                        defaultPath: firstLine
                    },
                    filename => {
                        if (filename && filename.length > 0) {
                            this.saveFileInternal(filename, contents);
                        }
                    });
            }
        });

        ipcMain.on(AppEvents.OpenExternalFile, (event: Event, fileName: string) => {
            this.updateFileStatus(fileName, true);
            this.openFileInternal(fileName);
        });
    }

    private saveFileInternal(filePath: string, contents: string) {
        fs.writeFileSync(filePath, contents);
        this.updateFileStatus(filePath, true);
    }

    preQuitApp() {
        AppStorage.saveOptions(this.mViewOptions);
    }

    create(): void {
        let workArea = electron.screen.getPrimaryDisplay().workAreaSize;
        super.createWindow('index.html', app.getName(),
            workArea.width * 3 / 4, workArea.height - 150);
    }

    afterWindowCreated(): void {
        super.afterWindowCreated();
        this.updateFileStatus(null);
        this.createApplicationMenu();
    }

    openFileInternal(filePath: string) {
        let contents = fs.readFileSync(filePath).toString();
        this.sendEvent(AppEvents.FileContentChanged, contents);
        this.updateFileStatus(filePath, true);
    }

    private updateFileStatus(filePath: string, saved?: boolean): void {
        this.mCurrentFilePath = filePath;
        if (this.mViewOptions) {
            this.mViewOptions.addRecentFile(filePath);
            AppStorage.saveOptions(this.mViewOptions);
        }

        if (filePath && filePath.length > 0) {
            this.setTitle((saved ? '' : '* ') + path.basename(filePath) + ` [${filePath}]`);
        } else {
            this.setTitle(`NoTitle`);
        }
    }

    private static getStatus(show: boolean): string {
        return show ? 'Hide' : 'Show';
    }

    private onAboutClicked(): void {
        new WindowWrapper().createWindow('about.html', 'About MarkIng', 350, 240);
    }

    private onOpenFileClicked(): void {
        dialog.showOpenDialog(this.mWindow, {
            title: 'Open markdown file...',
            properties: ['openFile']
        }, filePaths => {
            if (filePaths && filePaths.length > 0) {
                dialog.showMessageBox(this.mWindow, {message: filePaths[0]}, null)
            }
        });
    }

    private onSaveFileClicked(): void {
        this.sendEvent(AppEvents.PrepareSaveMarkdown);
    }

    private createApplicationMenu(): void {
        if (!this.mViewOptions) {
            return;
        }

        const recent: any[] = [];
        if (this.mViewOptions.recentFiles) {
            for (let filePath of this.mViewOptions.recentFiles) {
                recent.push({
                    label: path.basename(filePath),
                    click: () => {
                        this.openFileInternal(filePath)
                    }
                });
            }
        }

        if (recent.length <= 0) {
            recent.push({
                label: 'None',
                enabled: false
            });
        } else {
            recent.push({
                type: 'separator'
            });

            recent.push({
                label: 'Clear recent file list',
                click: () => {
                    this.mViewOptions.recentFiles = [];
                    this.createApplicationMenu();
                    AppStorage.saveOptions(this.mViewOptions);
                }
            });
        }

        const template: any[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open',
                        accelerator: 'CmdOrCtrl+O',
                        click: this.onOpenFileClicked.bind(this)
                    },
                    {
                        label: 'Save',
                        accelerator: 'CmdOrCtrl+S',
                        click: this.onSaveFileClicked.bind(this)
                    },
                    {
                        label: 'Open Recent...',
                        accelerator: 'CmdOrCtrl+Shift+O',
                        submenu: recent
                    },
                    {
                        type: 'separator'
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: `${ApplicationMainWindow.getStatus(this.mViewOptions.showPreview)} Preview`,
                        click: () => {
                            this.mViewOptions.showPreview = !this.mViewOptions.showPreview;
                            this.createApplicationMenu();

                            this.sendEvent(
                                AppEvents.SwitchShowPreview, this.mViewOptions.showPreview);
                        }
                    },
                    {
                        label: `${ApplicationMainWindow.getStatus(this.mViewOptions.showLineNumber)} Line Number`,
                        click: () => {
                            this.mViewOptions.showLineNumber = !this.mViewOptions.showLineNumber;
                            this.createApplicationMenu();

                            this.sendEvent(
                                AppEvents.SwitchShowLineNumber, this.mViewOptions.showLineNumber);
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {type: 'separator'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'selectall'}
                ]
            }
        ];

        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    {label: 'About', click: this.onAboutClicked.bind(this)},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            });
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}

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
import {ReactStyles, renderToHtml} from '../../base/AppBase';

const packageJson = require("../../../package.json");


export default class AboutPage extends React.Component<any, any> {

    render() {
        return (
            <div style={styles.root}>
                <div style={styles.title}>
                    <img style={{width: 50, height: 50}}
                         src="../images/app-icon.png"/>

                    <span style={styles.app_name}>MarkIng</span>
                </div>
                <span style={{marginTop: 20, color: '#666'}}>
                    {packageJson.version} @牧秦
                </span>
            </div>
        );
    }
}


const styles: ReactStyles = {
    root: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    app_name: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10
    }
};


let aboutPage = renderToHtml(<AboutPage/>);

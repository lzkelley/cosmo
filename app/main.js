const {app, BrowserWindow, shell, dialog} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// require('electron-debug')({showDevTools: true, enabled: true});
require('electron-debug')({enabled: true});

var win;

var pyProc = null;
var pyPort = null;
var pyPath = null;


const fixPath = require('fix-path');
console.log("path before = ", process.env.PATH);
fixPath();
console.log("path after = ", process.env.PATH);


function initPython() {
    const selectPort = () => {
        pyPort = 4242;
        return pyPort;
    }

    const pathPyAPI = () => {
        pyPath = path.join(__dirname, 'external', 'pyapi.py');
        console.log("Trying to find python at ", pyPath);
        if (fs.existsSync(pyPath)) {
            console.log("\tLocated python!");
            return pyPath;
        }

        pyPath = path.join(__dirname, '..', '..', 'external', 'pyapi.py');
        console.log("Trying to find python at ", pyPath);
        if (fs.existsSync(pyPath)) {
            console.log("\tLocated python!");
            return pyPath;
        }

        console.log("Failed to find python!");
        throw "Failed to find python!";
    }

    const createPyProc = () => {
        let port = '' + selectPort();
        let pyPath = '' + pathPyAPI();
        console.log("pyPath: '", pyPath, "'", "on port", port)
        pyProc = require('child_process').spawn('python', [pyPath, port]);
        // pyProc = require('child_process').spawnSync('python', [pyPath, port]);
        if (pyProc != null) {
            console.log('child process success');
        }

    }

    const exitPyProc = () => {
        pyProc.kill();
        pyProc = null;
        pyPort = null;
    }

    app.on('ready', createPyProc);
    app.on('will-quit', exitPyProc);
}

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        width: 950,
        height: 500,
        x: 20,
        y: 40,
        resizeable: false,
        show: false,   // dont show until ready (below)
    });

    win.setResizable(false);
    // win.webContents.openDevTools();

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.once('ready-to-show', () => {
        win.show()
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null
    })

    // Load all external links in default browser
    win.webContents.on('will-navigate', function(e, reqUrl) {
        let getHost = url=>require('url').parse(url).host;
        let reqHost = getHost(reqUrl);
        let isExternal = reqHost && reqHost != getHost(win.webContents.getURL());
        console.log("host = ", getHost, reqHost);
        console.log(isExternal);
        if (isExternal) {
            e.preventDefault();
            shell.openExternal(reqUrl);
        }
    });
}

function initApp() {
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        app.quit()
    });
}

// dialog.showErrorBox("hello", "content");
// exit(2);

/* ==  Create Python Process  == */
console.log("Calling `initPython()`");
initPython();

/* ==  Create App Window  == */
console.log("Calling `initApp()`");
initApp();

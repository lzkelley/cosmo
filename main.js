const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

/* ==  Create Python Process  == */

let pyProc = null;
let pyPort = null;
let pyPath = null;

const selectPort = () => {
    pyPort = 4242;
    return pyPort;
}

const pathPyAPI = () => {
    pyPath = path.join(__dirname, 'face', 'pyapi.py');
    return pyPath;
}

const createPyProc = () => {
    let port = '' + selectPort();
    let pyPath = '' + pathPyAPI();
    console.log("pyPath: '", pyPath, "'", "on port", port)
    pyProc = require('child_process').spawn('python', [pyPath, port]);
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


/* ==  Create App Window  == */

let win

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 500,
        x: 20,
        y: 40,
        resizeable: false,
        show: false,   // dont show until ready (below)
    });

    win.webContents.openDevTools();

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
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})

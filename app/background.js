// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var fs = require('fs');
var os = require('os');
var Menu = require("menu");

var jetpack = require('fs-jetpack');

var ipc = require('electron').ipcMain;
var com = require('serialport');

var Toaster = require('electron-toaster');
var toaster = new Toaster();

var mainWindow = null;
var aboutWindow = null;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 1165,
    height: 620
});


// Configuration de port de base
var portConfig = {
    "portName": "COM1",
    "portSettings": {
        "baudrate": 9600,
        "buffersize": 1024,
        "databits": 8,
        "parity": "none",
        "stopbits": 2
    }
}

// On utilise le dossier programData pour que tous les utilisateurs aient la même config
var appDir = jetpack.path(process.env.ALLUSERSPROFILE + '/' + app.getName());

var config = jetpack.read(appDir + '/config.json', 'json');

// si le fichier config.json n'existe pas, on le créer et on ajoute des valeurs par défaut
if(config === null){
    jetpack.fileAsync(appDir + '/config.json', {content: portConfig});
    config = portConfig;
}else{
    jetpack.file(appDir + '/config.json');
}
// On créer le fichier seralize.json qui contiendra les data reçu des équipements.
jetpack.file(appDir + '/serialize.json');

// On initialise serialPort 
var serialPort = new com.SerialPort(config.portName, config.portSettings, false);

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        'min-height': 620,
        'min-width': 1165,
        'use-content-size' : true
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    toaster.init(mainWindow);

    mainWindow.loadURL('file://' + __dirname + '/index.html');
    
    if (env.name !== 'production') {
        devHelper.setDevMenu();
        mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });

    var template = [
        {
            label: "Application",
            submenu: [
                { label: "About Application", click: function(){
                        aboutWindow = new BrowserWindow({
                            width: 600,
                            height: 400,
                            'use-content-size' : true
                        });

                        aboutWindow.loadURL('file://' + __dirname + '/about.html');

                        aboutWindow.on('close', function () {
                            aboutWindow = null;
                        });
                    } 
                },
                { type: "separator" },
                { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
            ]}, {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

app.on('window-all-closed', function () {
    app.quit();
});

//var config = fs.readFileSync(appDir + '/config.json', 'utf8');

// Le client demande la liste des ports disponible.
ipc.on('getPort', function (event, arg) {
    com.list(function (err, ports) {
        event.sender.send('asynchronous-reply', ports);
    });
});

// Le client demande la configuration
ipc.on('getConfig', function(e){
    e.sender.send('getConfig-reply', config);
});

// Retourne le status du port
ipc.on('getStatusPort', function(e){
    e.sender.send('statusPort-reply', statusPort());
});

// Le client envoie une nouvelle configuration
ipc.on('setConfig', function(e, data){    
    jetpack.writeAsync(appDir + '/config.json', data, {jsonIndent : 4});
    closePort(e);
    serialPort = new com.SerialPort(data.portName, data.portSettings, false);
    config = data;
});

// On demande l'ouverture du port.
ipc.on('openPort', function(e){
    serialPort.open(function (error) {
        if ( error ) {
            throw error;
        } else {
            var logStream = fs.createWriteStream(appDir + '/serialize.json', {'flags': 'a'});
            e.sender.send('statusPort-reply', statusPort());
            serialPort.on('data', function(data) {
                logStream.write(data);
                e.sender.send('serialData-reply', data);
            });
        }
    });
});

// Le client demande la fermeture du port
ipc.on('closePort', function(e){
    closePort(e);
});

function closePort(e){
    if(statusPort()){
        serialPort.close(function(err){            
            e.sender.send('statusPort-reply', statusPort());
        });
    }
}

var statusPort = function(){
    return serialPort.isOpen();
}
require('angular')
require('angular-ui-router')
require('angular-bootstrap');
require('angularjs-toaster');
require('angular-animate');
require('angular-electron');
require('ngclipboard');

global.Clipboard = require('clipboard');
/*
global.ipc = window.require('electron').ipcRenderer;
*/
angular
.module('visioCatch', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'toaster', 'ngclipboard', 'angular-electron'])
.config( require('./router') )
;
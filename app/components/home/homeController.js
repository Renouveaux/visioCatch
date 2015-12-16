
module.exports = function($scope, ipcRenderer){
	
	var msg = {
		title : "Information",
		message : "Données Copiées",
		width: 400,
		timeout : 3000,
		focus: true
	};

	$scope.onSuccess = function(e) {
		ipcRenderer.send('electron-toaster-message', msg);
	};

}
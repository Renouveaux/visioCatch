module.exports = function($scope, ipcRenderer){

	var portName = "COM1";

	var defaultData = {
		baudrate: 9600,
		buffersize: 1024,
		databits: 8,
		parity: "none",
		stopbits: 1
	}

	ipcRenderer.on('asynchronous-reply', function(event, arg) {
		$scope.comPort = arg;
		if(!$scope.$$phase) {
			$scope.$digest($scope);
		}
	});

	ipcRenderer.send('getPort');
	ipcRenderer.send('getConfig');
	ipcRenderer.send('getStatusPort');

	ipcRenderer.on('getConfig-reply', function(e, data){
		$scope.settings = data.portSettings;
		$scope.portName = data.portName;
	})

	ipcRenderer.on('statusPort-reply', function(e, data){
		$scope.portStatus = data;
		if(!$scope.$$phase) {
			$scope.$digest($scope);
		}
	})

	var dataSaved = {
		title : "Information",
		message : "Configuration enregistrée",
		width: 400,
		timeout : 3000,
		focus: true
	};

	ipcRenderer.on('setConfig-reply', function(e){
		ipcRenderer.send('electron-toaster-message', dataSaved);
	})

	$scope.serialData = '';

	ipcRenderer.on('serialData-reply', function(e, data){
		$scope.serialData = data.toString();

		var chaine = data.toString();

		//var ID = chaine[0].match(/ID[0-9]{12}/);

		var test = chaine.match(/([A-Z]+)((?:\+|\-)(?:\s)(\d\.\d\d))((?:\+|\-)(?:\s)(\d\.\d\d))?(\d*)?/);



		console.log(test);





		if(!$scope.$$phase) {
			$scope.$digest($scope);
		}
	})
	
	$scope.setDefault = function(){
		$scope.settings = defaultData;
		$scope.portName = portName;
	}

	$scope.apply = function(){
		ipcRenderer.send('setConfig', {portName: $scope.portName, portSettings: $scope.settings});
	}

	$scope.open = function(){
		ipcRenderer.send('openPort', {portName: $scope.portName, portSettings: $scope.settings});
	}

	$scope.close = function(){
		ipcRenderer.send('closePort');
	}

}
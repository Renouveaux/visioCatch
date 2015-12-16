module.exports = function($httpProvider, $stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise("/");

	$stateProvider.state('home', {
		url: '/',
		templateUrl: './components/home/homeView.html',
		controller: require('./components/home/homeController')
	});

	$stateProvider.state('settings', {
		url: '/settings',
		templateUrl: './components/settings/settingsView.html',
		controller: require('./components/settings/settingsController')
	});



};

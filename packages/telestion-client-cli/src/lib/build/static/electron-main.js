const { app, BrowserWindow } = require('electron');

function createWindow() {
	const mainWindow = new BrowserWindow({
		height: 600,
		width: 800
	});

	mainWindow.loadURL(
		process.env.NODE_ENV !== 'production'
			? 'http://localhost:3000/'
			: `file://${__dirname}/index.html`
	);
}

app.on('ready', () => {
	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

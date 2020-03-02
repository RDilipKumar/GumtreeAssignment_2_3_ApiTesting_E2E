try {
  var World = function World() {
    const devicename = global.browser.desiredCapabilities.browserName;

    if (process.env.EnvironmentVar == null) {
      process.env.EnvironmentVar = global.browser.options.serverUrls.environment;
    }
    process.env.BrowserName = global.browser.desiredCapabilities.browserName;
    console.log('Browser name in capa', process.env.BrowserName);

  };

  exports.World = World;
} catch (err) {
  console.log('world.conf file');
  console.log(err);
}

World();

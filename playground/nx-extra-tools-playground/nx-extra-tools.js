"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("@nrwl/schematics/src/command-line/shared");
var affected_apps_1 = require("@nrwl/schematics/src/command-line/affected-apps");
var fs_1 = require("fs");
var appRoot = require("app-root-path");
var yargs = require("yargs");
function getDependencies() {
    var angularJson = shared_1.readAngularJson();
    var nxJson = shared_1.readNxJson();
    var npmScope = nxJson.npmScope;
    var projects = shared_1.getProjectNodes(angularJson, nxJson);
    // fetch all apps and libs
    var deps = affected_apps_1.dependencies(npmScope, projects, function (f) {
        return fs_1.readFileSync(appRoot.path + "/" + f, 'utf-8');
    });
    return { deps: deps, angularJson: angularJson };
}
function getAppsAndLibs(projects) {
    var projectsByType = { apps: [], libs: [] };
    Object.keys(projects).forEach(function (project) {
        if (projects[project].projectType === 'application') {
            projectsByType.apps.push(project);
        }
        else if (projects[project].projectType === 'library') {
            {
                projectsByType.libs.push(project);
            }
        }
    });
    return projectsByType;
}
var checkIfFileExists = function () {
    if (!fs_1.existsSync('../.git/info/sparse-checkout')) {
        fs_1.appendFileSync('../.git/info/sparse-checkout', '');
    }
};
var updateFile = function (appName, deps, projectsByType) {
    var content = "/*\n";
    projectsByType.apps.forEach(function (dep) {
        content += "!/libs/" + dep + "\n";
    });
    projectsByType.apps.forEach(function (dep) {
        content += "!/libs/" + dep + "\n";
    });
    console.log(JSON.stringify(projectsByType));
};
var checkoutApp = function (appName) {
    var deps = getDependencies();
    var projectsByType = getAppsAndLibs(deps.angularJson.projects);
    checkIfFileExists();
    updateFile(appName, deps.deps, projectsByType);
};
var cli = yargs
    .usage('Perform partial checkouts to only work on subset of the monorepo')
    .command('$0', 'Checks out app and libs that are checked out at this instance', function (yargsOptions) {
    return yargsOptions.option('apps', {
        type: 'string',
        describe: 'app and dependencies to checkout'
    });
}, function (args) { return checkoutApp(args.apps); })
    .help('help').argv;
//# sourceMappingURL=nx-extra-tools.js.map
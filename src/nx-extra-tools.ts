import {
  getProjectNodes,
  readAngularJson,
  readNxJson
} from '@nrwl/schematics/src/command-line/shared'
import { dependencies, ProjectNode } from '@nrwl/schematics/src/command-line/affected-apps'
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs'
import * as appRoot from 'app-root-path'
import * as yargs from 'yargs'
import { execSync } from 'child_process'

function getDependencies() {
  const angularJson = readAngularJson()
  const nxJson = readNxJson()
  const npmScope = nxJson.npmScope
  const projects: ProjectNode[] = getProjectNodes(angularJson, nxJson)

  // fetch all apps and libs
  const deps = dependencies(npmScope, projects, (f: string) =>
    readFileSync(`${appRoot.path}/${f}`, 'utf-8')
  )

  return { deps, angularJson }
}

function getAppsAndLibs(projects: { [id: string]: any }) {
  const projectsByType: { apps: string[]; libs: string[] } = { apps: [], libs: [] }
  Object.keys(projects).forEach((project: string) => {
    if (projects[project].projectType === 'application') {
      projectsByType.apps.push(project)
    } else if (projects[project].projectType === 'library') {
      {
        projectsByType.libs.push(project)
      }
    }
  })
  return projectsByType
}

const checkIfFileExists = () => {
  if (!existsSync('.git/info/sparse-checkout')) {
    appendFileSync('.git/info/sparse-checkout', '')
  }
}

const updateFile = (appName: string, deps: any, projectsByType: any) => {
  let content = `/*\n`
  const extractDepsFromApp = deps[appName].map((dep: { projectName: string }) => dep.projectName)

  projectsByType.apps.forEach((dep: any) => {
    if (!extractDepsFromApp[appName] && appName !== dep) {
      content += `!/apps/${dep}\n`
    }
  })
  projectsByType.libs.forEach((dep: any) => {
    if (!extractDepsFromApp.includes(dep)) {
      content += `!/libs/${dep}\n`
    }
  })

  writeFileSync('.git/info/sparse-checkout', content)
}

const checkout = () => {
  execSync('git checkout')
}

const checkoutEverything = () => {
  writeFileSync('.git/info/sparse-checkout', '/*')
  checkout()
}

const checkoutApp = (appName: string) => {
  if (!appName) {
    checkoutEverything()
    return
  }
  checkoutEverything()

  const deps: { deps: any; angularJson: any } = getDependencies()

  const projectsByType = getAppsAndLibs(deps.angularJson.projects)

  checkIfFileExists()

  updateFile(appName, deps.deps, projectsByType)
  checkout()
}

const cli = yargs
  .usage('Perform partial checkouts to only work on subset of the monorepo')
  .command(
    '$0',
    'Checks out app and libs that are checked out at this instance',
    yargsOptions =>
      yargsOptions.option('apps', {
        type: 'string',
        describe: 'app and dependencies to checkout'
      }),
    args => checkoutApp(args.apps)
  )
  .help('help').argv

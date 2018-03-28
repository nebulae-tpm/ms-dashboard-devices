const shell = require('shelljs');
const jsonfile = require('jsonfile');
const fs = require('fs');
const FilesGenerator = require('./angular-project-files-generator.js');
var emoji = require('node-emoji');

const EMI_SHELL_GIT_URL = 'https://github.com/NebulaEngineering/lab-emi.git';
const EMI_SHELL_GIT_BRANCH = 'exp-emi-shell-proj';
const MFES_PATH = 'app/emi/';


// ======= VALIDATIONS ==========
if (!shell.which('git')) {
    console.log('Sorry, this script requires git');
    shell.exit(1);
}

//GIT project top level directory
let topLevelDir = shell.exec('git rev-parse --show-toplevel').stdout;
topLevelDir = topLevelDir.substring(0, topLevelDir.length - 1);
shell.cd(topLevelDir);

if (!fs.existsSync(MFES_PATH)) {
    console.log(`Sorry, it seems you do not have the valid MFE directory: ${MFES_PATH}`);
    shell.exit(1);
} else if (!fs.existsSync(`${MFES_PATH}etc/mfe-setup.json`)) {
    console.log(`Sorry, it seems you do not have the valid MFE config file: ${MFES_PATH}etc/mfe-setup.json`);
    shell.exit(1);
}

// ======= DIST DIRECTORY CREATION ==========
if (!fs.existsSync('dist/')) {
    shell.mkdir('dist');
}
shell.cd('dist');
shell.rm('-rf', 'emi/');

// ======= EMI SHELL DOWNLOAD ==========
console.log('Downloading EMI Shell ');
if (shell.exec(`git clone --single-branch -b ${EMI_SHELL_GIT_BRANCH} ${EMI_SHELL_GIT_URL} emi`).code !== 0) {
    console.log(`Failed to download EMI shell from ${EMI_SHELL_GIT_URL} branch=${EMI_SHELL_GIT_BRANCH}`);
    shell.exit(1);
}

// ======= MICRO-FRONTENDS SOFT LINKING ==========
console.log('Linking micro-frontend:');
shell.cd(topLevelDir);
const mfes = shell.ls(MFES_PATH).stdout.split('\n').filter(dir => dir !== 'etc' && dir !== '');
shell.cd(`dist/emi/src/app/main/content/`);
mfes.forEach(mfe => {
    if (shell.exec(`ln -s ../../../../../../${MFES_PATH}/${mfe} ${mfe}`).code === 0) {
        console.log(`    -> Linked ${mfe}`);
    } else {
        console.log(`    -> Failed to link ${mfe}`);
        shell.exit(1);
    }
});

// ======= MICRO-FRONTENDS ROUTE, NAV AND ENVIROMENT GENERATORS ==========
console.log('Generating routes, navs and environment variables for Micro-frontends');
shell.cd(topLevelDir);
const setup = jsonfile.readFileSync(`${MFES_PATH}etc/mfe-setup.json`);
FilesGenerator.generateFiles(setup, `${topLevelDir}/dist/emi`);

// ======= PRE-BUILD SCRIPTS ====================
console.log('Running pre-builds commands needed per Micro-Frontend');
shell.cd(`${topLevelDir}/dist/emi`);
const cmds = new Set();
setup.filter(mod => mod.preBuildCommands)
.forEach(mod => mod.preBuildCommands.forEach(cmd => cmds.add(cmd)));

if(cmds.size > 0){
    console.log(`   - Found ${cmds.size} commands. lets run them all`);
    cmds.forEach(cmd => {
        console.log(`       - Running: ${cmd}`);
        if(shell.exec(cmd).code !== 0){
            console.log('       - Failed to run CMD');
            shell.exit(1);
        }
    });
}

// ======= BUILD ANGULAR APP ====================
console.log(emoji.emojify(':pray:  Building integrated EMI application :thinking_face:'));
shell.cd(`${topLevelDir}/dist/emi`);
if (shell.exec('npm install').code !== 0) {
    console.log(emoji.emojify('Failed to install NPM dependencies :fearful:'));
    shell.exit(1);
}
if (shell.exec('ng build').code !== 0) {
    console.log(emoji.emojify('Failed to build Angular project :unamused:'));
    shell.exit(1);
}

console.log(emoji.emojify('IT COMPILES! :grimacing:'));
console.log(emoji.emojify('EMI project had been downloaded, linked, assembled and built :ok_hand:'));

shell.exit(0);
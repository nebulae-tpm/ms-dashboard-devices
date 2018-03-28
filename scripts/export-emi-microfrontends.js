const shell = require('shelljs');
const fs = require('fs');

const EMI_MFES_PATH = 'app/emi';
const EXPORT_BRANCH = 'exp-emi-mfes';

/*
 ========== VALIDATIONS =============
*/
if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

const topLevelDir = shell.exec('git rev-parse --show-toplevel').stdout;
shell.cd(topLevelDir);
if(!fs.existsSync(EMI_MFES_PATH)){
    shell.echo(`emi micro-frontends directoy not found!, please make sure the micro-frontends are at ${shell.pwd()}/${EMI_MFES_PATH}`);
    shell.exit(1);
}

/*
 ========== GIT SUBTREE =============
*/
const pushCmd = `git subtree push --prefix ${EMI_MFES_PATH} origin ${EXPORT_BRANCH}`;
if(shell.exec(pushCmd).code !== 0){
    shell.echo('Error: Git subtree push failed, please verify the current git status');
    shell.exit(1);
}

shell.echo(`Git subtree push completed successfully to branch ${EXPORT_BRANCH}`);
shell.exit(0);
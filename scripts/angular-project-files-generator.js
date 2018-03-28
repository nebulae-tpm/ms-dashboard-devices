const fs = require('fs');
const tsfmt = require('typescript-formatter');
const shell = require('shelljs');


/**
 * Holds app routes
 */
const appRoutes = [];
/**
 * Holds site navigation
 */
const navModel = [];
/**
 * Holds site navigations i18n map
 */
const navLocaleMap = {}
/**
 * Holds project enviroment variables
 */
const enviromentVars = {}

/**
 * Holds logic needed to apply per module
 */
processModule = (mod) => {    
    console.log(`   - processModule(${mod ? mod.name : undefined})`);
};

/**
 * Holds logic needed to apply per group
 */
processGroup = (group) => {
    console.log(`       - processGroup(${group ? group.id : undefined})`);
    appendNavigationGroup(group);
};

/**
 * Holds logic needed to apply per subgroup
 */
processSubGroup = (group, subgroup) => {
    console.log(`       - processSubGroup(${group ? group.id : undefined},${subgroup ? subgroup.id : undefined})`);
    appendNavigationSubgroup(subgroup);
};

/**
 * Holds logic needed to apply per content
 */
processContent = (group, subgroup, content) => {
    console.log(`       - processContent(${group ? group.id : undefined},${subgroup ? subgroup.id : undefined},${content ? content.id : undefined})`);
    appendRoute(content);
    appendNavigationContent(content);
};

/**
 * Appends new content to the App route
 */
appendRoute = (content) => {
    let route = appRoutes.filter(route => route.path === content.path)[0];
    if (!route) {
        appRoutes.push({
            path: content.path,
            loadChildren: content.loadChildren
        });
    }
    if (content.default && !appRoutes.filter(route => route.path === '**')[0]) {
        appRoutes.push({
            path: '**',
            redirectTo: content.path
        });
    }
};

/**
 * Appends new locale map to a translate path
 */
appendLocale = (translateRoute, translateMap) => {
    Object.keys(translateMap).forEach(lan => {
        if (!navLocaleMap[lan]) {
            navLocaleMap[lan] = {
                lang: lan,
                data: {}
            }
        }

        const branches = translateRoute.split('.');
        const leaf = branches.pop();
        let branch = navLocaleMap[lan].data;
        branches.forEach(p => {
            if (!branch[p]) {
                branch[p] = {};
            }
            branch = branch[p];
        });
        branch[leaf] = translateMap[lan];

    });

}

/**
 * Append a new group to the site navigation
 */
appendNavigationGroup = (group) => {
    if (!navModel.filter(gr => gr.id === group.id)[0]) {
        const translateRoute = `NAV.${group.id}.self`;
        navModel.push({
            'id': group.id,
            'title': group.id,
            'translate': translateRoute,
            'type': 'group',
            'icon': group.icon,
            'children': [],
            'priority': group.priority || 1000
        });
        appendLocale(translateRoute, group.translate);
    }
}

/**
 * Append a new subgroup to the site navigation
 */
appendNavigationSubgroup = (subgroup) => {
    const parent = navModel.filter(g => g.id === subgroup.groupId)[0];
    const translateRoute = `NAV.${subgroup.groupId}.${subgroup.id}.self`;
    if (parent && !parent.children.filter(sgr => sgr.id === subgroup.id)[0]) {
        parent.children.push({
            'id': subgroup.id,
            'title': subgroup.id,
            'translate': translateRoute,
            'type': 'collapse',
            'icon': subgroup.icon,
            'children': [],
            'priority': subgroup.priority || 1000
        });
        appendLocale(translateRoute, subgroup.translate);
    }
}

/**
 * Append a new content to the site navigation
 */
appendNavigationContent = (content) => {
    const groupLevel = content.groupId ? navModel.filter(g => g.id === content.groupId)[0] : undefined;
    const subgroupLevel = content.subgroupId && groupLevel ? groupLevel.children.filter(sg => sg.id === content.subgroupId)[0] : undefined;
    const parentChildren = subgroupLevel
        ? subgroupLevel.children
        : groupLevel
            ? groupLevel.children
            : navModel;
    const translateRoute = subgroupLevel
        ? `NAV.${content.groupId}.${content.subgroupId}.${content.id}`
        : groupLevel
            ? `NAV.${content.groupId}.${content.id}`
            : `NAV.${content.id}`;

    if (parentChildren && !parentChildren.filter(cont => cont.id === content.id)[0]) {
        parentChildren.push({
            'id': content.id,
            'title': content.id,
            'translate': translateRoute,
            'type': 'item',
            'url': content.navURL,
            'icon': content.icon,
            'priority': content.priority || 1000
        });
        appendLocale(translateRoute, content.translate);
    }
}

/**
 * Load current enviroment variables from the EMI project itself
 */
loadCurrentEnviromentVars = (envsPath) =>{
    console.log('   - Loading EMI enviroments variables');
    const enviroments = shell.ls(envsPath).stdout.split('\n').filter(file => file !== '');
    enviroments.forEach(envFile => {
        console.log(`       - Fetching ${envFile}`);
        const env = envFile === 'environment.ts' ? 'default' :  envFile.split(".")[1];
        let json = fs.readFileSync(`${envsPath}/${envFile}`,'latin1');
        json = json.replace('export const environment =','').replace(';','');
        enviromentVars[env] = JSON.parse(json);
    });
};

/**
 * Append a enviroments variables
 */
appendEnviromentVars = (env, vars) => {
    if(!enviromentVars[env]){
        enviromentVars[env] = {};
    }
    const currentVars = enviromentVars[env];
    Object.keys(vars).forEach(key => {
        if(!currentVars[key] !== undefined && currentVars[key] !== vars[key]){
            console.log(`       # WARN: the enviroment ${env} already have a property called ${key}, and it will be overriden from ${currentVars[key]} to ${vars[key]}`);
        }else{
            currentVars[key] = vars[key];
        }
    });

}


module.exports.generateFiles = (compendium, emiPath) => {

    //LOAD EXISTING ENVIROMENTS VARS
    loadCurrentEnviromentVars(`${emiPath}/src/environments/`);

    // PROCESS EVERY FOUND MODULE
    compendium.forEach(module => {
        processModule(module);
        if (module.groups) {
            module.groups.forEach(processGroup);
        }
        if (module.subgroups) {
            module.subgroups.forEach(subgroup => {
                let group = module.groups ? module.groups.filter(mod => mod.id === subgroup.groupId)[0] : undefined;
                processSubGroup(group, subgroup);
            });
        }
        if (module.contents) {
            module.contents.forEach(content => {
                let group = module.groups ? module.groups.filter(mod => mod.id === content.groupId)[0] : undefined;
                let subgroup = module.subgroups ? module.subgroups.filter(sg => sg.id === content.subgroupId)[0] : undefined;
                processContent(group, subgroup, content);
            });
        }
        if(module.environmentVars){
            Object.keys(module.environmentVars).forEach(env => appendEnviromentVars(env,module.environmentVars[env]));
        }
    });

    //Sort routes
    appRoutes.sort((r1, r2) => r1.path === '**' ? 1 : -1);
    //Sort Navigation
    sortNavigation = (menuArray) => {
        menuArray.sort((m1, m2) => m2.priority - m1.priority);
        menuArray.forEach(node => {
            if (node.children) {
                sortNavigation(node.children);
            }
        });
    };
    sortNavigation(navModel);


    /*
    FILES CREATION
    */
    const files = [];
    let fileName = '';


    Object.keys(enviromentVars).forEach(env => {
        let body = `export const environment =  ${JSON.stringify(enviromentVars[env], null, 1)};`;
        fileName = env === 'default' ? `${emiPath}/src/environments/environment.ts` : `${emiPath}/src/environments/environment.${env}.ts`; 
        files.push(fileName);
        fs.writeFileSync(fileName, body);
        console.log(`   * file created: ${fileName}`);
    });

    const navLocaleFileBodyMap = {};
    Object.keys(navLocaleMap).forEach(lan => {
        navLocaleFileBodyMap[lan] = `export const locale =  ${JSON.stringify(navLocaleMap[lan], null, 1)};`;
        fileName = `${emiPath}/src/app/navigation/i18n/${lan}.ts`;
        files.push(fileName);
        fs.writeFileSync(fileName, navLocaleFileBodyMap[lan]);
        console.log(`   * file created: ${fileName}`);
    });


    const navModelFileBody = `
        import { FuseNavigationModelInterface } from '../core/components/navigation/navigation.model';

        export class FuseNavigationModel implements FuseNavigationModelInterface {
            public model: any[];

            constructor() {
                this.model = ${JSON.stringify(navModel, null, 4)};
            }
        }`;
    fileName = `${emiPath}/src/app/navigation/navigation.model.ts`;
    files.push(fileName);
    fs.writeFileSync(fileName, navModelFileBody);
    console.log(`   * file created: ${fileName}`);


    const appModuleFileBody = `
        import { NgModule } from '@angular/core'; import { BrowserModule } from '@angular/platform-browser';
        import { HttpClientModule } from '@angular/common/http';
        import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
        import { RouterModule, Routes } from '@angular/router';
        import 'hammerjs';
        import { SharedModule } from './core/modules/shared.module';
        import { AppComponent } from './app.component';
        import { FuseMainModule } from './main/main.module';
        import { FuseSplashScreenService } from './core/services/splash-screen.service';
        import { FuseConfigService } from './core/services/config.service';
        import { FuseNavigationService } from './core/components/navigation/navigation.service';
        import { TranslateModule } from '@ngx-translate/core';

        const appRoutes: Routes = ${JSON.stringify(appRoutes, null, 4)};

        @NgModule({
            declarations: [
                AppComponent
            ],
            imports     : [
                BrowserModule,
                HttpClientModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(appRoutes),
                SharedModule,
                TranslateModule.forRoot(),
                FuseMainModule
            ],
            providers   : [
                FuseSplashScreenService,
                FuseConfigService,
                FuseNavigationService
            ],
            bootstrap   : [
                AppComponent
            ]
        })
        export class AppModule
        {
        }`;
    fileName = `${emiPath}/src/app/app.module.ts`;
    files.push(fileName);
    fs.writeFileSync(fileName, appModuleFileBody);
    console.log(`   * file created: ${fileName}`);



    //Finally we have to format the created files
    tsfmt.processFiles(files, {
        dryRun: true,
        replace: true,
        verify: false,
        tsconfig: true,
        tslint: true,
        editorconfig: true,
        tsfmt: true
    });

    console.log(`   * all files formatted using typescript-formatter`);



}
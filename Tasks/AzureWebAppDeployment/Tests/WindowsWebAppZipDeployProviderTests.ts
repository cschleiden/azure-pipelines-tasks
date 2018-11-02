import tl = require('vsts-task-lib');
import tmrm = require('vsts-task-lib/mock-run');
import ma = require('vsts-task-lib/mock-answer');
import * as path from 'path';
import { setEndpointData, setAgentsData, mockTaskArgument, mockTaskInputParameters } from './utils';

export class WindowsWebAppZipDeployProviderTests {

    public static startWindowsWebAppZipDeployProviderTests(){
        let tp = path.join(__dirname, 'WindowsWebAppZipDeployProviderL0Tests.js');
        let tr : tmrm.TaskMockRunner = new tmrm.TaskMockRunner(tp);
        mockTaskInputParameters(tr);
        setEndpointData();
        setAgentsData();

        tr.registerMock('azurermdeploycommon/operations/KuduServiceUtility', {
            KuduServiceUtility: function(A) {
                return {                    
                    updateDeploymentStatus : function(B,C,D) {
                        return "MOCK_DEPLOYMENT_ID";
                    },
                    warmUp: function() {
                        console.log('warmed up Kudu Service');
                    }
                }
            }
        });

        tr.registerMock('azurermdeploycommon/azure-arm-rest/azure-arm-app-service-kudu', {
            Kudu: function(A, B, C) {
                return {
                    getAppSettings : function() {
                        var map: Map<string, string> = new Map<string, string>();
                        map.set('MSDEPLOY_RENAME_LOCKED_FILES', '1');
                        map.set('ScmType', 'ScmType');
                        map.set('WEBSITE_RUN_FROM_PACKAGE', '0');
                        return map;
                    },
                    zipDeploy: function(E, F) {
                        return '{id: "ZIP_DEPLOY_FAILED_ID", status: 3, deployer: "VSTS_ZIP_DEPLOY", author: "VSTS USER"}';
                    },
                    warDeploy: function(G, H) {
                        return '{id: "ZIP_DEPLOY_FAILED_ID", status: 3, deployer: "VSTS_ZIP_DEPLOY", author: "VSTS USER"}';
                    },
                    getDeploymentDetails: function(I) {
                        return "{ type: 'Deployment',url: 'http://MOCK_SCM_WEBSITE/api/deployments/MOCK_DEPLOYMENT_ID'}";
                    }  
                }
            }
        });

        tr.registerMock('azurermdeploycommon/operations/AzureAppServiceUtility.js', {
            AzureAppServiceUtility: function(X) {
                return {
                    getApplicationURL: function (A) {
                        return "http://mytestapp.azurewebsites.net";
                    },
                    deployUsingZipDeploy: function(D,E,F) {
                        return "ZIP_DEPLOY_FAILED_ID";
                    }
                }
            }
        });

        tr.registerMock('azurermdeploycommon/webdeployment-common/utility.js', {
            generateTemporaryFolderForDeployment: function () {
                return "webAppPkg";
            },
            archiveFolderForDeployment: function() {
                return {
                    "webDeployPkg": "webAppPkg",
                    "tempPackagePath": "webAppPkg"
                };
            },
            getFileNameFromPath: function(A, B) {
                return "webAppPkg";
            },
            generateTemporaryFolderOrZipPath: function(C, D) {
                return "webAppPkg.zip";
            }
        });
        
        tr.registerMock('azurermdeploycommon/webdeployment-common/ziputility.js', {
            archiveFolder: function(A, B){
                return "webAppPkg.zip";
            }
        });
        

        tr.setAnswers(mockTaskArgument());
        tr.run();
    }

}

WindowsWebAppZipDeployProviderTests.startWindowsWebAppZipDeployProviderTests();
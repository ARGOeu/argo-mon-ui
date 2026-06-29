pipeline {
    agent none
    options {
        checkoutToSubdirectory('argo-mon-ui')
        newContainerPerStage()
    }
    environment {
        PROJECT_DIR='argo-mon-ui'
    }
    stages {
        stage ('Lint and build argo-mon-ui') {
            agent {
                docker {
                    image 'node:20.19-bullseye'
                }
            }
            steps {
                echo 'Build argo-mon-ui'
                    sh '''
                        cd $WORKSPACE/$PROJECT_DIR
                        npm install
                        CI=false npm run prettier && npm run lint && npm run build
                    '''
            }
        }
    }
    post {
        success {
            script{
                if ( env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                    slackSend( message: ":satellite: New version of <$BUILD_URL|$PROJECT_DIR> built successfully to devel!")
                }
                else if ( env.BRANCH_NAME == 'master' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                }
            }
        }
        failure {
            script{
                if ( env.BRANCH_NAME == 'master' || env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rain_cloud: Build Failed for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME")
                }
            }
        }
    }
}

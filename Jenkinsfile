pipeline {
    agent any
    
    stages {
        stage('Get inventory') {
            steps {
                sh "aws s3 cp s3://apiappinventorybucket/dynamic_inventory.ini ${currentBuild.workspace}"
            }
        }
        stage('Update') {
            steps {
                ansiblePlaybook credentialsId: 'ec2', inventory: 'dynamic_inventory.ini', playbook: 'configapp.yml'
            }
        }
    }
}

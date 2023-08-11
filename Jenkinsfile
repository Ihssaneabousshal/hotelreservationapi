pipeline {
    agent any
    
    stages {
        stage('Update') {
            steps {
                ansiblePlaybook credentialsId: 'ec2', inventory: 'dynamic_inventory.ini', playbook: 'configapp.yml'
            }
        }
    }
}

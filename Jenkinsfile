pipeline {
    agent any

    stages {
        stage('Download Inventory') {
            steps {
                script {
                    sh "aws s3 cp s3://apiappinventorybucket/dynamic_inventory.ini ./"
                }
            }
        }

        stage('Run Ansible') {
            steps {
                ansiblePlaybook(
                    inventory: "./dynamic_inventory.ini",
                    playbook: "configapp.yml"
                )
            }
        }
    }
}

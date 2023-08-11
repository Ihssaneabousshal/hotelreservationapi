pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

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

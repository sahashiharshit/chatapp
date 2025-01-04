pipeline {
    agent any
    
    stages{
        stage('Checkout Code'){
            steps{
            git branch: 'development', url:'https://github.com/sahashiharshit/chatapp.git'
            }
        }
        stage('Build'){
            steps{
                sh 'npm install'
                sh 'npm run build'
            }   
        }
        stage('Test'){
            steps{
            sh 'npm test'
            }
        }
        stage('Deploy'){
            steps{
                sshagent(['aws-chatapp-server'])
                sh 'scp -r build/ ubuntu@ip-172-31-4-205:/chatserver/'
            }
        }
    }
    post{
     success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }

}
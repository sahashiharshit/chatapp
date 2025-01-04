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
               
            }   
        }
       
        stage('Deploy'){
            steps{
                sshagent(['aws-chatapp-server']){
                sh scp -o UserKnownHostsFile=~/.ssh/known_hosts -r . ubuntu@3.6.134.76:/chatserver/
                }
                
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
# Configure the AWS Provider
provider "aws" {
  region = var.aws_region # Uses the region defined in variables.tf
}

# 1. Define the Security Group (Firewall)
resource "aws_security_group" "news_sg" {
  name        = "news-platform-ci-cd-sg"
  description = "Security group for the news platform CI/CD EC2 instance"

  # SSH Access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTP for Certbot Verification and Redirect
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTPS for Secure Access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Webhook Listener Access
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
  }
}

# 2. Define the EC2 Instance
resource "aws_instance" "news_platform" {
  # Use a valid Ubuntu AMI ID for your region (e.g., Ubuntu 22.04 LTS)
  ami           = var.ami_id
  instance_type = var.instance_type

  # The Key Pair name used when launching the EC2 instance
  key_name      = var.key_pair_name 
  
  security_groups = [aws_security_group.news_sg.name]

  tags = {
    Name = "News-Platform-CI-CD"
  }
}

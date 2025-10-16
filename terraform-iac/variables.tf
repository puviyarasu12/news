variable "aws_region" {
  description = "The AWS region to deploy resources in"
  default     = "us-east-1" # REPLACE with your EC2's region
}

variable "ami_id" {
  description = "The AMI ID for the EC2 instance (e.g., Ubuntu 22.04 LTS)"
  default     = "ami-053b01d54201384e5" # REPLACE with the actual AMI ID you used
}

variable "instance_type" {
  description = "The type of EC2 instance"
  default     = "t2.micro" # REPLACE with your actual instance type
}

variable "key_pair_name" {
  description = "The name of the SSH key pair to use for the EC2 instance"
  default     = "my-ec2-key" # REPLACE with your actual key pair name
}

# Terraform Configuration for Vercel Infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

# Variables
variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID"
  type        = string
}

variable "project_name" {
  description = "Zentix Protocol project name"
  type        = string
  default     = "zentix-protocol"
}

variable "github_repo" {
  description = "GitHub repository owner/name"
  type        = string
  default     = "zentix-protocol"
}

variable "environments" {
  description = "Deployment environments configuration"
  type = map(object({
    build_command     = string
    output_directory  = string
    install_command   = string
    framework         = string
    serverless_function_region = string
    env_vars = map(string)
  }))
  default = {
    production = {
      build_command     = "cd frontend && npm run build"
      output_directory  = "frontend/dist"
      install_command   = "npm install && cd frontend && npm install"
      framework         = "vite"
      serverless_function_region = "iad1"
      env_vars = {
        NODE_ENV = "production"
        VERCEL_ENV = "production"
      }
    }
    staging = {
      build_command     = "cd frontend && npm run build"
      output_directory  = "frontend/dist"
      install_command   = "npm install && cd frontend && npm install"
      framework         = "vite"
      serverless_function_region = "iad1"
      env_vars = {
        NODE_ENV = "staging"
        VERCEL_ENV = "staging"
      }
    }
    preview = {
      build_command     = "cd frontend && npm run build"
      output_directory  = "frontend/dist"
      install_command   = "npm install && cd frontend && npm install"
      framework         = "vite"
      serverless_function_region = "iad1"
      env_vars = {
        NODE_ENV = "preview"
        VERCEL_ENV = "preview"
      }
    }
  }
}

# Provider configuration
provider "vercel" {
  token = var.vercel_token
}

# Project resource
resource "vercel_project" "zentix_protocol" {
  name      = var.project_name
  framework = "vite"
  
  git_repository {
    type = "github"
    repo = var.github_repo
  }
  
  # Environment variables
  dynamic "environment" {
    for_each = merge(
      var.environments.production.env_vars,
      var.environments.staging.env_vars,
      var.environments.preview.env_vars
    )
    content {
      key      = environment.key
      value    = environment.value
      target   = ["production", "staging", "preview"]
    }
  }
  
  # Build and output settings
  settings {
    build_command    = var.environments.production.build_command
    output_directory = var.environments.production.output_directory
    install_command  = var.environments.production.install_command
    framework        = var.environments.production.framework
  }
  
  # Security and deployment settings
  serverless_function_region = var.environments.production.serverless_function_region
  skip_git_connect = false
}

# Environment-specific aliases
resource "vercel_project_alias" "production" {
  project_id = vercel_project.zentix_protocol.id
  alias      = "${var.project_name}.vercel.app"
}

resource "vercel_project_alias" "staging" {
  project_id = vercel_project.zentix_protocol.id
  alias      = "${var.project_name}-staging.vercel.app"
}

# Domain configuration (custom domain)
resource "vercel_domain" "zentix_protocol" {
  for_each = toset(["zentix-protocol.com", "api.zentix-protocol.com"])
  
  name     = each.value
  project_id = vercel_project.zentix_protocol.id
}

# API routes configuration
resource "vercel_project_function" "api_health" {
  project_id = vercel_project.zentix_protocol.id
  name       = "health"
  route      = "/api/health"
  
  config = jsonencode({
    runtime = "nodejs20.x"
    memory = 128
    maxDuration = 10
  })
}

resource "vercel_project_function" "api_metrics" {
  project_id = vercel_project.zentix_protocol.id
  name       = "metrics"
  route      = "/api/metrics"
  
  config = jsonencode({
    runtime = "nodejs20.x"
    memory = 256
    maxDuration = 30
  })
}

# Monitoring configuration
resource "vercel_project" "monitoring" {
  name      = "zentix-protocol-monitoring"
  framework = "other"
  
  git_repository {
    type = "github"
    repo = var.github_repo
  }
}

# Deployment configuration
resource "vercel_deployment" "production" {
  project_id = vercel_project.zentix_protocol.id
  production = true
  
  meta = {
    deployment_reason = "Automated production deployment"
    darwin_protocol_version = "1.0.0"
  }
}

# Output
output "project_url" {
  value = vercel_project_alias.production.alias
}

output "staging_url" {
  value = vercel_project_alias.staging.alias
}

output "custom_domains" {
  value = [for domain in vercel_domain.zentix_protocol : domain.name]
}

output "deployment_url" {
  value = vercel_deployment.production.url
}
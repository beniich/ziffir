terraform {
  required_version = ">= 1.6"
  backend "s3" {
    bucket = "zaphir-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  alias  = "eu"
  region = "eu-west-1"
}

provider "aws" {
  alias  = "us"
  region = "us-east-1"
}

provider "aws" {
  alias  = "apac"
  region = "ap-southeast-1"
}

# ════════════════════════════════════════════════════════════
# RDS Aurora Global (Primary + Replicas)
# ════════════════════════════════════════════════════════════

resource "aws_rds_global_cluster" "zaphir" {
  global_cluster_identifier = "zaphir-global"
  engine                    = "aurora-postgresql"
  engine_version            = "15.4"
  storage_encrypted         = true
  deletion_protection       = true
}

# Primary cluster (EU)
resource "aws_rds_cluster" "primary" {
  provider               = aws.eu
  cluster_identifier     = "zaphir-primary"
  global_cluster_identifier = aws_rds_global_cluster.zaphir.id
  engine                 = "aurora-postgresql"
  engine_version         = "15.4"
  database_name          = "zaphir"
  master_username        = "zaphir_admin"
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.primary.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 35
  preferred_backup_window = "03:00-04:00"
  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "zaphir-final-${formatdate("YYYY-MM-DD-hh-mm", timestamp())}"

  tags = {
    Environment = "production"
    Region      = "eu-west-1"
    Role        = "primary"
  }
}

# Secondary clusters (US, APAC)
resource "aws_rds_cluster" "secondary_us" {
  provider               = aws.us
  cluster_identifier     = "zaphir-secondary-us"
  global_cluster_identifier = aws_rds_global_cluster.zaphir.id
  engine                 = "aurora-postgresql"
  engine_version         = "15.4"

  db_subnet_group_name   = aws_db_subnet_group.secondary_us.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  deletion_protection = true
  skip_final_snapshot = false

  depends_on = [aws_rds_cluster.primary]
}

resource "aws_rds_cluster" "secondary_apac" {
  provider               = aws.apac
  cluster_identifier     = "zaphir-secondary-apac"
  global_cluster_identifier = aws_rds_global_cluster.zaphir.id
  engine                 = "aurora-postgresql"
  engine_version         = "15.4"

  db_subnet_group_name   = aws_db_subnet_group.secondary_apac.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  deletion_protection = true
  skip_final_snapshot = false

  depends_on = [aws_rds_cluster.primary]
}

# ════════════════════════════════════════════════════════════
# ECS Backend (déployé dans chaque région)
# ════════════════════════════════════════════════════════════

module "backend_ecs" {
  source  = "./modules/ecs-service"
  providers = { aws = aws.eu }
  
  service_name = "zaphir-backend"
  image_uri    = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-west-1.amazonaws.com/zaphir-backend:latest"
  cpu          = 2048
  memory       = 4096
  desired_count = 3

  environment = {
    NODE_ENV     = "production"
    DATABASE_URL = "postgresql://${aws_rds_cluster.primary.master_username}@${aws_rds_cluster.primary.endpoint}:5432/zaphir"
    REDIS_URL    = "redis://${aws_elasticache_replication_group.primary.primary_endpoint}:6379"
    JWT_SECRET   = data.aws_secretsmanager_secret.jwt.arn
  }
}

# ════════════════════════════════════════════════════════════
# ElastiCache Redis (cluster mode)
# ════════════════════════════════════════════════════════════

resource "aws_elasticache_replication_group" "primary" {
  provider               = aws.eu
  replication_group_id   = "zaphir-redis"
  description            = "Zaphir Redis cluster"
  engine                 = "redis"
  engine_version         = "7.0"
  node_type              = "cache.r6g.xlarge"
  num_cache_clusters     = 3
  port                   = 6379
  parameter_group_name   = "default.redis7.cluster.on"

  subnet_group_name  = aws_elasticache_subnet_group.primary.name
  security_group_ids = [aws_security_group.redis.id]

  automatic_failover_enabled = true
  multi_az_enabled           = true

  snapshot_retention_limit = 7
}

# ════════════════════════════════════════════════════════════
# Route 53 (DNS geo-routing)
# ════════════════════════════════════════════════════════════

resource "aws_route53_record" "api_eu" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.zaphir.com"
  type    = "A"

  alias {
    name                   = module.backend_ecs.alb_dns_name
    zone_id                = module.backend_ecs.alb_zone_id
    evaluate_target_health = true
  }

  set_identifier  = "eu-west-1"
  geolocation_routing_policy {
    continent = "EU"
  }
}

resource "aws_route53_record" "api_us" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.zaphir.com"
  type    = "A"

  alias {
    name                   = module.backend_ecs_us.alb_dns_name
    zone_id                = module.backend_ecs_us.alb_zone_id
    evaluate_target_health = true
  }

  set_identifier  = "us-east-1"
  geolocation_routing_policy {
    continent = "NA"
  }
}

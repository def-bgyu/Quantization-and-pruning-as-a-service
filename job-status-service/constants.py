import os
from dotenv import load_dotenv
load_dotenv()


# Confluent Kafka configs
KAFKA_USERNAME = os.getenv("KAFKA_USERNAME")
KAFKA_SECRET = os.getenv("KAFKA_SECRET")
KAFKA_BOOTSTRAP_SERVER = os.getenv("KAFKA_BOOTSTRAP_SERVER") or "localhost:9092" 
KAFKA_CONSUME_JOB_TOPIC = 'completed_job'
KAFKA_GROUP_ID = 'job_status'
KAFKA_OFFSET_RESET = 'earliest'
KAFKA_RESET_STATUS = True

# Mongo configs
MONGO_ATLAS_SECRET = os.getenv("MONGO_ATLAS_SECRET")
MONGO_CONNECTION = f'mongodb+srv://Nidhi:{MONGO_ATLAS_SECRET}@cluster0.a6v2ibl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' 
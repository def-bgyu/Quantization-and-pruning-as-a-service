VERSION=v1
DOCKERUSER=nidhisankhe1

build:
	docker build -f Dockerfile -t quantaas-trainer-service .

push:
	docker tag quantaas-trainer-service $(DOCKERUSER)/quantaas-trainer-service:$(VERSION)
	docker push $(DOCKERUSER)/quantaas-trainer-service:$(VERSION)
	docker tag quantaas-trainer-service $(DOCKERUSER)/quantaas-trainer-service:latest
	docker push $(DOCKERUSER)/quantaas-trainer-service:latest
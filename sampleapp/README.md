# Instructions for configuration of containerized applications at Klever

## Autenticating on Kubernetes cluster

```bash
gcloud container clusters get-credentials development --region us-central1 --project tronwallet-dev-266921
```

## Example of the application in Golang

<details>
<summary>main.go</summary>

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	// register hello function to handle all requests
	mux := http.NewServeMux()
	mux.HandleFunc("/", hello)
	// use PORT environment variable, or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	// start the web server on port and accept requests
	log.Printf("Server listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

// hello responds to the request with a plain-text "Hello, world" message.
func hello(w http.ResponseWriter, r *http.Request) {
	log.Printf("Serving request: %s", r.URL.Path)
	host, _ := os.Hostname()
	fmt.Fprintf(w, "Hello, world!\n")
	fmt.Fprintf(w, "Version: 1.0.0\n")
	fmt.Fprintf(w, "Hostname: %s\n", host)
}
```
</details>

## Good practices to work with Golang

**go mod tidy**
<details>

```text
Ensures that the go.mod file matches the source code in the module. It adds any missing module requirements necessary to build the current module’s packages and dependencies, and it removes requirements on modules that don’t provide any relevant packages. It also adds any missing entries to go.sum and removes unnecessary entries.

The -e flag (added in Go 1.16) causes go mod tidy to attempt to proceed despite errors encountered while loading packages.

The -v flag causes go mod tidy to print information about removed modules to standard error.
```
</details>

**go mod vendor**

<details>

```text
The go mod vendor command constructs a directory named vendor in the main module’s root directory that contains copies of all packages needed to support builds and tests of packages in the main module. Packages that are only imported by tests of packages outside the main module are not included. As with go mod tidy and other module commands, build constraints except for ignore are not considered when constructing the vendor directory.

When vendoring is enabled, the go command will load packages from the vendor directory instead of downloading modules from their sources into the module cache and using packages those downloaded copies. See Vendoring for more information.
```
</details>

## Multi-stage Dockerfile for apps on Golang

<details>
<summary>Dockerfile</summary>

```Dockerfile
FROM golang:1.16-buster as builder
COPY . /go/src/github.com/klever-io/sampleapp
WORKDIR /go/src/github.com/klever-io/sampleapp
RUN go build -o "app" .
FROM debian:buster
RUN apt-get update \
    && apt-get install -y ca-certificates --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates 
RUN addgroup klever \
    && adduser --disabled-password --gecos "" klever --uid 1000 --ingroup klever
COPY --from=builder --chown=klever:klever /go/src/github.com/klever-io/sampleapp/app /usr/local/bin/
RUN chmod +x /usr/local/bin/app
USER klever
WORKDIR /tmp
ENTRYPOINT [ "/usr/local/bin/app" ]
```
</details>

### Build image

```bash
docker build -t sampleapp-klv:v1.0 .
```

### Tag image

**Note** - Before of create tag of the image, need create git repositorie. This is necessary to create the correct tag id

```text
docker tag <local-image> gcr.io/<google-project-id>/k8s-for-developers:<commit-hash>

# you can type "gcloud projects list" or go to gcp console in order to find google project id
```

```bash
git init
git add .
git commit -m "Commit to generate image with id $(git rev-parse --short HEAD)"
```

Following, create a image tag with the project id (tronwallet-dev-266921)

```bash
docker tag sampleapp-klv:v1.0 gcr.io/tronwallet-dev-266921/sampleapp:$(git rev-parse --short HEAD)
```

### Push image to registry

We are now pushing our local image to a remote registry. Everyone that has access, including our kubernetes cluster, can now pull this image

But, before is needed configure Docker to access the gcloud registry

```bash
gcloud auth configure-docker
```

```text
docker push gcr.io/<google-project-id>/k8s-for-developers:<commit-hash>
```

```bash
docker push gcr.io/tronwallet-dev-266921/sampleapp:$(git rev-parse --short HEAD)
```

## Create the Kustomize structure and yaml files

**Note** Is necessary get kustomize add-ons to follow this secction

Getting Kustomize add-on

```bash
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
```

Directory struct

```text
├── k8s
    ├── base
    │   ├── kustomization.yaml
    │   └── server.yaml
    ├── develop
    │   ├── hpa.yaml
    │   ├── kustomization.yaml
    │   └── server.yaml
    ├── master
    │   ├── hpa.yaml
    │   ├── kustomization.yaml
    │   └── server.yaml
    └── staging
        ├── hpa.yaml
        ├── kustomization.yaml
        └── server.yaml
```

## The contents of directories

- base directory

    The base directory has the content that will be merged with the other files. It contains general instructions for other environments.
    Your main file *kustomization.yaml* references the base file (manager.yaml in this example).

    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    commonLabels:
    app.kubernetes.io/name: <app name>
    resources:
        - manager.yaml
    ```

    <details>
    <summary>kustomization.yaml</summary>

    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    commonLabels:
        app.kubernetes.io/name: sampleapp
    resources:
    - deployment.yaml
    ```
    </details>

    The file listes under 'resources' is the template file. You content is common to another manifests

    <details>
    <summary>deployment.yaml</summary>

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: sampleapp
    spec:
    selector:
        matchLabels:
        app: sampleapp
    template:
        metadata:
        labels:
            app: sampleapp
        spec:
        containers:
        - name: sampleapp
            image: sampleapp
            resources: {}
            ports:
            - containerPort: 8080
    ---
    apiVersion: v1
    kind: Service
    metadata:
    name: sampleapp
    spec:
    selector:
        app: sampleapp
    ports:
    - port: 8080
        targetPort: 8080
    ```
    </details>

- Anhother directories

    The other directories has the particular configurations for each environment how production, stage, developer...
    Your content is similar the file *base/kustomize.yaml*, however it join the content from file refereced for the  'resources' key, with the content from file referenced with 'resources' key from *base/kustomize.yaml* file.


## Replace image field

Before of generate the final manifest file is necessary fill the correct name of the image. The command shown below, create a new entry of type 'images' called 'sampleapp' into *kustomization.yaml* file.

It´s very important what the name match with the name informed in metadata field of base/deployment.yaml file.

This instruction replace the image field in kustomize.yaml file to match with project

```bash
(cd k8s/base && kustomize edit set image sampleapp="gcr.io/tronwallet-dev-266921/sampleapp:$(git rev-parse --short HEAD)")
```

Your result is:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
commonLabels:
  app.kubernetes.io/name: sampleapp
resources:
- deployment.yaml
images:
- name: sampleapp
  newName: gcr.io/tronwallet-dev-266921/sampleapp
  newTag: 3b4f163
```

## Generating the final yaml file for deploy

Finally the final file can be build. The command below generate the manifest and pipe to kubectl command for be apply.

```bash
kustomize build k8s/develop/ | kubectl apply -f -
```

To verify the final work execute:
```bash
kustomize build k8s/develop/
```

The final manifest must seem with this:

<details>
<summary>Final manifest</summary>

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: sampleapp
    branch: development
    env: dev
  name: sampleapp
  namespace: sampleapp
spec:
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: sampleapp
    app.kubernetes.io/name: sampleapp
    branch: development
    env: dev
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: sampleapp
    branch: development
    env: dev
  name: sampleapp
  namespace: sampleapp
spec:
  selector:
    matchLabels:
      app: sampleapp
      app.kubernetes.io/name: sampleapp
      branch: development
      env: dev
  template:
    metadata:
      labels:
        app: sampleapp
        app.kubernetes.io/name: sampleapp
        branch: development
        env: dev
    spec:
      containers:
      - image: gcr.io/tronwallet-dev-266921/sampleapp:ed98a71
        name: sampleapp
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: 200m
            memory: 256Mi
          requests:
            cpu: 30m
            memory: 64Mi
```

</details>
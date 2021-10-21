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
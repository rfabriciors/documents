# Procedure to upgrade of the certificates of the HAProxy services

### Access via ssh the HAProxy server 1 or 3, because the server 2 no have Certbot installed.


```text
gcloud compute ssh --zone "europe-west3-b" "hetzner-lb-35db8b4e-2" --project "stately-sentry-249714"
gcloud compute ssh --zone "europe-west3-c" "hetzner-lb-35db8b4e-0" --project "stately-sentry-249714"
gcloud compute ssh --zone "europe-west3-a" "hetzner-lb-35db8b4e-1" --project "stately-sentry-249714"
```


```bash
gcloud compute ssh --zone "europe-west3-c" "hetzner-lb-35db8b4e-0" --project "stately-sentry-249714"
```

- Can be necessary create rules to allow remote access via SSH protocol. The rules must be created in *hetzner-labs-haproxy-operators*

    https://console.cloud.google.com/networking/firewalls/details/hetzner-labs-haproxy-operators?project=stately-sentry-249714

After access the server, execute the certbot application:

```bash
sudo su -
certbot -d dominio.xxx.klever.io --manual --preferred-challenges dns certonly
```

This command will generate a hash what must be put how TXT register on Route 53 DNS service.

The certificates files will be generate and copy to folder /etc/letsencrypt/live/dominio.xxx.klever.io

The HAProxy require a standard of the file what contains the complete chain more the private key. Thus, must generate this file with the command:

```bash
cd /opt/haproxy/
cat /etc/letsencrypt/live/dominio.xxx.klever.io/fullchain.pem > certs/dominio.xxx.klever.io.pem
cat /etc/letsencrypt/live/dominio.xxx.klever.io/privkey.pem >> certs/dominio.xxx.klever.io.pem
```

Next, restart the container of the HAProxy

```bash
cd /opt/haproxy
docker-compose down
docker-compose up -d
```

### Tip: Keep the content of file dominio.xxx.klever.io.pem on the notepad to use this file in the other two hosts
 

## Tip to automatizate

- This very tinny code calculate how many time the certificate has of life. It can be adapted to automate the task of update certificates.

```bash
#/bin/sh

for certificado in *.pem
do
     cert_age=$(($(date -d "$(openssl x509 -noout -text -in $certificado | grep -i "not after"|awk -F ' : ' '{print $2}')" +%j) - $(date '+%j')))
    if [ $cert_age -lt 15 ]; then
         echo "O certificado $certificado tem $cert_age de dias restantes"
    fi
done
 ```

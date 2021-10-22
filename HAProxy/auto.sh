#/bin/sh

for certificado in *.pem
do
     cert_age=$(($(date -d "$(openssl x509 -noout -text -in $certificado | grep -i "not after"|awk -F ' : ' '{print $2}')" +%j) - $(date '+%j')))
    if [ $cert_age -lt 15 ]; then
         echo "O certificado $certificado tem $cert_age de dias restantes"
    fi
done

echo | openssl s_client -servername google.com -connect google.com:443 |\
  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > certificate.crt

  teste=$(echo | openssl s_client -servername google.com -connect google.com:443 |sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p')
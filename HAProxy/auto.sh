#/bin/sh

for a in *.cer
do
     cert_age=$(($(date -d "$(openssl x509 -noout -text -in $a | grep -i "not after"|awk -F ' : ' '{print $2}')" +%j) - $(date '+%j')))
    if [ $cert_age -lt 15 ]; then
         echo "it's going to give shit in certificate" $a
    fi
done
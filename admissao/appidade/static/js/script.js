
var cxAno = document.querySelector("input#idade")
var btVerificar = document.querySelector("input#verificar")
var res = document.querySelector("div#divresult")
btVerificar.addEventListener('click', calculaIdade)

function calculaIdade(){
    var agora = new Date()
    var anoAtual = agora.getFullYear()
    var anoInformado = cxAno.value
    var tratamento = ""
    var img = document.createElement('img')
    img.setAttribute('id', 'foto')
    if(cxAno.value.length == 0 || anoInformado > anoAtual){
        window.alert('Idade inválida!')
    } else {
            var idade = anoAtual - anoInformado
            var sexo = document.getElementsByName('radSex')
            if(idade < 4) {
                if(sexo[0].checked){
                    tratamento = "um bebê, menino"
                    img.setAttribute('src', 'static/img/foto-bebe-m.png')
                } else {
                    tratamento = "uma bebê, menina"
                    img.setAttribute('src', 'static/img/foto-bebe-f.png')
                }
            } else if (idade < 16) {
                if(sexo[0].checked){
                    tratamento = "um jovem, homem"
                    img.setAttribute('src', 'static/img/foto-jovem-m.png')
                } else {
                    tratamento = "uma jovem, mulher"
                    img.setAttribute('src', 'static/img/foto-jovem-f.png')
                } 
            } else if (idade < 65) {
                if(sexo[0].checked){
                    tratamento = "um homem adulto"
                    if (idade == (anoAtual - 1977)){
                        tratamento = "Olha que gato"
                        document.body.style.background = '#2e2e2e'
                         img.setAttribute('src', 'static/img/foto-eu-m.png')
                        //img.setAttribute('src', '{{ user_image }}')
                        
                    } else {
                        img.setAttribute('src', 'static/img/foto-adulto-m.png')
                    }
                } else {
                    tratamento = "uma mulher adulta"
                    img.setAttribute('src', 'static/img/foto-adulto-f.png')
                }
            } else {
                if(sexo[0].checked){
                    tratamento = "um homem idoso"
                    img.setAttribute('src', 'static/img/foto-idoso-m.png')
                } else {
                    tratamento = "uma mulher idosa"
                    img.setAttribute('src', 'static/img/foto-idoso-f.png')
                }
            }
            res.innerHTML = `É ${tratamento} de ${idade} anos de idade`
            res.appendChild(img)
    }
}
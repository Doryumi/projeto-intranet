# Projeto de Infraestrutura de Rede - XPTO

Projeto acadêmico de infraestrutura de rede implementado na AWS EC2, simulando o ambiente de TI de uma empresa fictícia chamada XPTO.

---

## Arquitetura

    Internet
        |
    [Usuario]
        |
    [Servidor VPN - OpenVPN + EasyRSA] (porta 1194 UDP)
        |
    Rede Interna AWS (172.31.0.0/16)
        |
    [projeto-intranet]
        |-- [Nginx - Load Balancer] (porta 8080)
        |       |-- [intranet1 - Node.js] (porta 80)
        |       |-- [intranet2 - Node.js] (porta 80)
        |-- [vsftpd - Servidor FTP] (porta 21)

---

## Instâncias EC2

| Instância | Serviço | Portas abertas |
|---|---|---|
| servidor-vpn | OpenVPN + EasyRSA | 22 (SSH), 1194 UDP (VPN) |
| projeto-intranet | Docker + Nginx + FTP | 22 (SSH), 8080 (Intranet via VPN) |

---

## Requisitos implementados

### 1. Acesso Remoto SSH
Acesso seguro às instâncias EC2 via chave .pem gerada na AWS.
Regras de firewall configuradas via Security Group restringindo acessos externos.

    ssh -i "chave.pem" ubuntu@IP_DA_INSTANCIA

### 2. Compartilhamento de Arquivos FTP
Servidor vsftpd com dois usuarios e permissoes diferentes:
- funcionario: pode fazer upload de arquivos
- visitante: acesso negado ao upload

Teste via terminal:
    ftp localhost

### 3. VPN
Servidor OpenVPN com certificados gerados pelo EasyRSA.
- CA criada internamente com EasyRSA
- Certificados do servidor e do cliente assinados pela CA
- Cliente conecta via arquivo cliente.ovpn
- Intranet acessivel apenas pelo IP privado apos conexao VPN

### 4. Balanceamento de Carga
Nginx configurado como proxy reverso distribuindo requisicoes entre dois
containers Node.js usando o metodo round-robin:
- Requisicao 1 vai para intranet1
- Requisicao 2 vai para intranet2
- Requisicao 3 volta para intranet1
- E assim por diante

### 5. Docker e Intranet
Portal de intranet containerizado com Docker Compose:
- intranet1 e intranet2: servidores Node.js rodando o portal da XPTO
- nginx: proxy reverso e load balancer
- Acesso ao portal apenas via VPN pelo IP privado da instancia

---

## Estrutura de arquivos

    projeto/
    |-- docker-compose.yml
    |-- nginx/
    |   |-- nginx.conf
    |-- intranet/
        |-- Dockerfile
        |-- server.js

---

## Como rodar

### Instalar o Docker
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo usermod -aG docker ubuntu
    newgrp docker

### Subir o projeto
    cd projeto
    docker-compose up --build -d

### Verificar containers
    docker ps

### Acessar o portal (requer VPN conectada)
    http://IP_PRIVADO_DA_INSTANCIA:8080

---

## Configuracao do FTP

### Instalar
    sudo apt install vsftpd -y

### Criar usuarios
    sudo useradd -m -s /bin/bash funcionario
    echo "funcionario:funcionario123" | sudo chpasswd
    sudo useradd -m -s /bin/bash visitante
    echo "visitante:visitante123" | sudo chpasswd

### Testar
    ftp localhost

---

## Configuracao da VPN

### Instalar
    sudo apt install openvpn easy-rsa -y

### Criar certificados
    make-cadir ~/easy-rsa
    cd ~/easy-rsa
    ./easyrsa init-pki
    ./easyrsa build-ca nopass
    ./easyrsa gen-req servidor nopass
    ./easyrsa sign-req server servidor
    ./easyrsa gen-req cliente nopass
    ./easyrsa sign-req client cliente
    ./easyrsa gen-dh

### Iniciar servidor VPN
    sudo systemctl start openvpn@server
    sudo systemctl enable openvpn@server

---

## Como testar o balanceamento de carga

### Via navegador (requer VPN)
Acessa http://IP_PRIVADO:8080 e clica em "Fazer nova requisicao" varias vezes.
O nome do servidor alterna entre intranet1 e intranet2.

### Via terminal
    for i in {1..10}; do curl -s http://localhost:8080 | grep "servidor"; done

### Via logs do Nginx
    docker logs -f projeto_nginx_1

---

## Como testar a VPN

1. Conecta no OpenVPN Connect com o arquivo cliente.ovpn
2. Acessa http://IP_PRIVADO_INTRANET:8080 - deve carregar
3. Desconecta a VPN
4. Tenta acessar o mesmo link - nao deve carregar

---

## Tecnologias utilizadas

- AWS EC2 - infraestrutura em nuvem
- Ubuntu 24.04 - sistema operacional
- Docker e Docker Compose - containerizacao
- Node.js - servidor da intranet
- Nginx - proxy reverso e balanceamento de carga
- vsftpd - servidor FTP
- OpenVPN e EasyRSA - VPN e certificados
EOF

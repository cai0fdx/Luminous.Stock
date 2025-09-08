let contadorPedidos = 0;
let pedidos = [];
let tipoUsuario = ''; // variável global para armazenar o tipo do usuário

const form = document.getElementById("loginForm");
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const usuario = document.getElementById("nome_usuario").value;
        const senha = document.getElementById("senha").value;

        fetch('../php/validar_login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `nome_usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`
        });
    });
}


function logout() {
    fetch('../php/logout.php') // chama o script PHP que destrói a sessão
        .then(() => {
            window.location.href = '../html/index.html'; // redireciona para login
        });
}
async function gerarRelatorioPDF() {
    try {
        console.log('Chamando get_pedidos.php...');
        const res = await fetch('../php/get_pedidos.php');
        console.log('→ status:', res.status, res.statusText);
        const text = await res.text();
        console.log('→ resposta crua:', text);

        const pedidos = JSON.parse(text);
        console.log('→ JSON parseado:', pedidos);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Relatório de Pedidos', 14, 20);
        doc.setFontSize(11);
        doc.text('Data: ' + new Date().toLocaleString('pt-BR'), 14, 28);

        const headers = [
            ['ID', 'Item', 'Qtd', 'Prateleira', 'Lado', 'Status']
        ];
        const rows = pedidos.map(p => [p.id, p.item, p.quantidade, p.prateleira, p.lado, p.status]);

        doc.autoTable({ head: headers, body: rows, startY: 36 });

        doc.save('relatorio_pedidos.pdf');
    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        alert('Falha ao gerar relatório. Veja o Console do Browser.');
    }
}



window.onload = function() {
    fetch('../php/usuario_tipo.php')
        .then(res => res.json())
        .then(data => {
            tipoUsuario = data.tipo;
            console.log('Tipo de usuário:', tipoUsuario);

            if (tipoUsuario === 'funcionario') {
                const btnFuncionario = document.querySelector("button[onclick=\"abrirAba('funcionario')\"]");
                const btnLocalizacao = document.querySelector("button[onclick=\"abrirAba('localização')\"]");
                const btnRelatorio = document.querySelector("button[onclick=\"abrirAba('relatorio')\"]");

                if (btnFuncionario) btnFuncionario.style.display = 'none';
                if (btnLocalizacao) btnLocalizacao.style.display = 'none';
                if (btnRelatorio) btnRelatorio.style.display = 'none';


                abrirAba('cliente');
            } else if (tipoUsuario === 'admin') {
                const btnCliente = document.querySelector("button[onclick=\"abrirAba('cliente')\"]");
                if (btnCliente) btnCliente.style.display = 'none';
                abrirAba('funcionario');

            }

        })
        .catch(err => console.error('Erro ao pegar tipo de usuário:', err));
};

// Mapeamento global item → localização (prateleira + lado)
const mapeamentoLocalizacao = {
    'Grampo Ater BT MT': { prateleira: 'A1', lado: 'Frente' },
    'Paraf Fenda CAB': { prateleira: 'A1', lado: 'Frente' },
    'Arruela Pressao M6 DIN': { prateleira: 'A2', lado: 'Frente' },
    'Abraçadeira Aluminio': { prateleira: 'B1', lado: 'Frente' },
    'Cabo Cobre Eletrol': { prateleira: 'A2', lado: 'Frente' },
    'Terminal Cobre Rosqueado': { prateleira: 'B1', lado: 'Frente' },
    'Porca SX W 5/8': { prateleira: 'B2', lado: 'Frente' },
    'Etiqueta Metalica Manual': { prateleira: 'B2', lado: 'Frente' }
};

const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.getElementById('mainContent');

menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shifted'); // importante
});

function acenderBolinha(item) {
    // Primeiro desliga todas as bolinhas
    document.querySelectorAll('.bolinha').forEach(bola => {
        bola.classList.remove('ativa');
    });

    const mapeamentoItens = {
        'Grampo Ater BT MT': 'bolinha1-superior',
        'Paraf Fenda CAB': 'bolinha2-inferior',
        'Arruela Pressao M6 DIN': 'bolinha3-superior',
        'Abraçadeira Aluminio': 'bolinha4-inferior',
        'Cabo Cobre Eletrol': 'bolinha1-inferior',
        'Terminal Cobre Rosqueado': 'bolinha2-superior',
        'Porca SX W 5/8': 'bolinha3-inferior',
        'Etiqueta Metalica Manual': 'bolinha4-superior'
    };

    const bolinhaId = mapeamentoItens[item];
    if (bolinhaId) {
        const bolinha = document.getElementById(bolinhaId);
        if (bolinha) bolinha.classList.add('ativa');
    }
}

function abrirAba(abaId) {
    document.querySelectorAll('.aba').forEach(el => el.classList.remove('ativa'));
    document.getElementById(abaId).classList.add('ativa');

    if (abaId === 'usuario') {
        atualizarListaPedidos();
    }

    if (abaId === 'funcionario') {
        // Buscar pedidos pendentes do BD para exibir ao admin
        fetch('../php/listar_pedidos.php')
            .then(res => res.json())
            .then(data => {
                pedidos = data.map(p => ({
                    id: Number(p.id),
                    item: p.item,
                    quantidade: Number(p.quantidade),
                    status: p.status,
                    prateleira: p.prateleira,
                    lado: p.lado
                }));
                atualizarListaPedidos();
            })
            .catch(err => {
                console.error('Erro ao carregar pedidos pendentes:', err);
                pedidos = [];
                atualizarListaPedidos();
            });
    }
}


function adicionarPedido(item, botao) {
    const quantidade = prompt(`Informe a quantidade desejada para "${item}":`, "1");

    if (!quantidade || isNaN(quantidade) || quantidade <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    const rect = botao.getBoundingClientRect();
    confetti({
        particleCount: 100,
        spread: 70,
        origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
        }
    });

    contadorPedidos++;
    const pedido = { id: contadorPedidos, item: item, quantidade: Number(quantidade) };
    pedidos.push(pedido);
    atualizarListaPedidos();

    // Salva pedido no banco para qualquer usuário (funcionario ou cliente)
    const localizacaoInfo = mapeamentoLocalizacao[item] || { prateleira: '', lado: '' };

    fetch('../php/salvar_pedido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'item=' + encodeURIComponent(item) +
                '&quantidade=' + encodeURIComponent(quantidade) +
                '&prateleira=' + encodeURIComponent(localizacaoInfo.prateleira) +
                '&lado=' + encodeURIComponent(localizacaoInfo.lado) +
                '&status=' + encodeURIComponent('pendente')
        })
        .then(res => res.text())
        .then(res => console.log('Pedido salvo:', res))
        .catch(err => console.error('Erro ao salvar pedido:', err));
}

function atualizarListaPedidos() {
    const listaDiv = document.getElementById('listaPedidos');
    listaDiv.innerHTML = '';

    pedidos.forEach(pedido => {
        const pedidoDiv = document.createElement('div');
        pedidoDiv.className = 'pedido';
        pedidoDiv.dataset.id = pedido.id;
        pedidoDiv.innerHTML = `
      <strong>Pedido #${pedido.id}</strong><br>
      Item: ${pedido.item}<br>
      Quantidade: ${pedido.quantidade}<br>
      <button class="acao" onclick="aceitarPedido(${pedido.id})">Aceitar Pedido</button>
      <button class="recusar" onclick="recusarPedido(${pedido.id})">Recusar Pedido</button>
    `;
        listaDiv.appendChild(pedidoDiv);
    });
}

function aceitarPedido(idPedido) {
    const pedidoIndex = pedidos.findIndex(p => p.id === idPedido);
    if (pedidoIndex === -1) return;

    const pedido = pedidos[pedidoIndex];
    acenderBolinha(pedido.item);

    // PARTE DA ESP
    const esp32IP = "10.40.50.200"; // ou IP local fornecido
    fetch(`../php/enviar_para_esp.php?item=${encodeURIComponent(pedido.item)}`)

    // fetch(`${esp32IP}/led?item=${encodeURIComponent(pedido.item)}`)
    .then(res => res.text())
        .then(data => console.log("Resposta do ESP32:", data))
        .catch(err => console.error("Erro ao enviar comando para ESP32:", err));


    const botaoLocal = document.querySelector('button[onclick="abrirAba(\'localização\')"]');
    if (botaoLocal) {
        botaoLocal.classList.add('destacar');
        setTimeout(() => {
            botaoLocal.classList.remove('destacar');
        }, 10000);
    }

    const localizacaoInfo = mapeamentoLocalizacao[pedido.item] || { prateleira: '', lado: '' };

    fetch('../php/atualizar_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + encodeURIComponent(pedido.id) +
                '&status=' + encodeURIComponent('aceito')
        })
        .then(res => res.text())
        .then(res => console.log('Pedido aceito salvo:', res))
        .catch(err => console.error('Erro ao salvar pedido aceito:', err));

    const listaDiv = document.getElementById('listaPedidos');
    const pedidoElement = [...listaDiv.children].find(el => Number(el.dataset.id) === idPedido);

    if (pedidoElement) {
        pedidoElement.classList.add('desaparecer');
        setTimeout(() => {
            pedidos.splice(pedidoIndex, 1);
            atualizarListaPedidos();
        }, 400);
    }
}


function recusarPedido(idPedido) {
    const pedidoIndex = pedidos.findIndex(p => p.id === idPedido);
    if (pedidoIndex === -1) return;
    fetch('../php/atualizar_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + encodeURIComponent(idPedido) +
            '&status=' + encodeURIComponent('recusado')
    })

    const listaDiv = document.getElementById('listaPedidos');
    const pedidoElement = [...listaDiv.children].find(el => Number(el.dataset.id) === idPedido);

    if (pedidoElement) {
        pedidoElement.classList.add('desaparecer');
        setTimeout(() => {
            pedidos.splice(pedidoIndex, 1);
            atualizarListaPedidos();
        }, 400);
    }
}

function filtrarProdutos() {
    const filtro = document.getElementById('searchInput').value.toLowerCase();
    const produtos = document.querySelectorAll('#produtosContainer .produto');

    produtos.forEach(produto => {
        const nome = produto.getAttribute('data-nome').toLowerCase();
        produto.style.display = nome.includes(filtro) ? '' : 'none';
    });
}

// function toggleSidebar() {
//   const sidebar = document.getElementById("sidebar");
//   const mainContent = document.getElementById("mainContent");

//   sidebar.classList.toggle("show");
//   mainContent.classList.toggle("shifted");
// }
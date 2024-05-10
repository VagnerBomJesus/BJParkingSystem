 // Tabela de preços por hora
 const tabelaPrecos = {
    dinheiro: {
        '0-1': 0.20,
        '1-2': 0.30,
        '2-3': 0.40
    },
    multibanco: {
        '0-1': 5.00,
        '1-2': 5.50,
        '2-3': 6.00
    }
};

// Função para exibir a lista de carros estacionados de mais recente a mais antiga
function exibirCarrosEstacionados(carros) {
    const listaCarros = document.getElementById('lista-carros');
    listaCarros.innerHTML = ''; // Limpa a lista antes de atualizar

    carros.forEach((carro, index) => {
        const row = document.createElement('tr');

        const matriculaCell = document.createElement('td');
        matriculaCell.textContent = carro.matricula;
        row.appendChild(matriculaCell);

        const marcaCell = document.createElement('td');
        marcaCell.textContent = carro.marca;
        row.appendChild(marcaCell);

        const vagaCell = document.createElement('td');
        vagaCell.textContent = carro.vaga;
        row.appendChild(vagaCell);

        const entradaCell = document.createElement('td');
        entradaCell.textContent = carro.entrada;
        row.appendChild(entradaCell);

        const saidaCell = document.createElement('td');
        saidaCell.textContent = carro.saida || '-';
        row.appendChild(saidaCell);

        const tempoEstacionadoCell = document.createElement('td');
        tempoEstacionadoCell.textContent = calcularTempoEstacionado(carro.entrada, carro.saida);
        row.appendChild(tempoEstacionadoCell);

        const valorPagarCell = document.createElement('td');
        valorPagarCell.textContent = carro.valorPago || '-';
        row.appendChild(valorPagarCell);

        const metodoPagamentoCell = document.createElement('td');
        metodoPagamentoCell.textContent = carro.metodoPagamento || '-';
        row.appendChild(metodoPagamentoCell);

        const actionsCell = document.createElement('td');

        // Botão de editar
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('btn', 'btn-warning', 'mr-2');
        editButton.onclick = () => abrirModalEditar(index);
        actionsCell.appendChild(editButton);

        // Botão de deletar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => abrirModalDeletar(index);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        listaCarros.appendChild(row);
    });
}

// Função para calcular o tempo estacionado
function calcularTempoEstacionado(entrada, saida) {
    if (!saida) return '-';
    const diff = new Date(saida) - new Date(entrada);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
}

// Função para abrir o modal de editar
function abrirModalEditar(index) {
    const carrosEstacionados = lerDados();
    const carro = carrosEstacionados[index];

    const novaMatricula = prompt(
        "Digite a nova matrícula:",
        carro.matricula
    );
    const novaMarca = prompt("Digite a nova marca:", carro.marca);

    if (novaMatricula && novaMarca) {
        // Verifica se já existe um carro com a mesma matrícula
        const carroExistente = carrosEstacionados.find(
            (carro) => carro.matricula === novaMatricula
        );
        if (carroExistente) {
            alert("Já existe um carro com essa matrícula no estacionamento.");
            return;
        }

        carro.matricula = novaMatricula;
        carro.marca = novaMarca;
        escreverDados(carrosEstacionados);
        exibirCarrosEstacionados(carrosEstacionados);
    }
}

// Função para abrir o modal de deletar
function abrirModalDeletar(index) {
    const confirmarDeletar = confirm("Tem certeza que deseja deletar este carro?");
    if (confirmarDeletar) {
        deletarCarro(index);
    }
}



// Função para deletar um carro do estacionamento
function deletarCarro(index) {
    const carrosEstacionados = lerDados();
    const carro = carrosEstacionados[index];
    const valorPagar = carro.valorPago || '-';
    const metodoPagamento = carro.metodoPagamento || '-';

    // Remover o carro do estacionamento
    carrosEstacionados.splice(index, 1);
    escreverDados(carrosEstacionados);
    exibirCarrosEstacionados(carrosEstacionados);

    // Exibir o valor a pagar
    adicionarAlerta(`Valor a pagar: ${valorPagar}€`);
    // Exibir o método de pagamento
    adicionarAlerta(`Método de pagamento: ${metodoPagamento}`);
}

// Função para adicionar um carro ao estacionamento
function adicionarCarro(matricula, marca, valorPago, metodoPagamento) {
    const carrosEstacionados = lerDados();

    // Verifica se já existe um carro com a mesma matrícula
    const carroExistente = carrosEstacionados.find(
        (carro) => carro.matricula === matricula
    );
    if (carroExistente) {
        adicionarAlerta("Já existe um carro com essa matrícula no estacionamento.");
        return;
    }

    if (carrosEstacionados.length >= 50) {
        adicionarAlerta("O estacionamento atingiu a capacidade máxima de 50 vagas.");
        return;
    }

    // Verifica se o valor pago é válido com base na tabela de preços
    const precoHora = tabelaPrecos[metodoPagamento]['0-1'];
    if (valorPago < precoHora) {
        adicionarAlerta("O valor pago é insuficiente.");
        return;
    }

    // Simulação de dados randomicos de 0 a 50 para a vaga
    const vaga = Math.floor(Math.random() * 51);

    // Registro de data e hora
    const entrada = new Date().toLocaleString();

    // Calcular a data e hora de saída com base no valor pago
    const horasPagas = valorPago / precoHora;
    const horaSaida = new Date(new Date().getTime() + horasPagas * 60 * 60 * 1000).toLocaleString();

    carrosEstacionados.push({
        matricula,
        marca,
        vaga,
        entrada,
        saida: horaSaida, // Definindo a hora de saída com base no valor pago
        valorPago,
        metodoPagamento
    });

    escreverDados(carrosEstacionados);
    exibirCarrosEstacionados(carrosEstacionados);

    // Exibe os dados inseridos no status
    adicionarAlerta(`Veículo estacionado com sucesso!<br>Matrícula: ${matricula}<br>Marca: ${marca}<br>Vaga: ${vaga}<br>Entrada: ${entrada}<br>Saída: ${horaSaida}`);

    // Limpa os campos de entrada
    document.getElementById('matricula').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('valor-pago').value = '';
    document.getElementById('metodo-pagamento').selectedIndex = 0;
}

// Função para ler os dados do armazenamento local do navegador
function lerDados() {
    const data = localStorage.getItem("carrosEstacionados");
    return data ? JSON.parse(data) : [];
}

// Função para escrever os dados no armazenamento local do navegador
function escreverDados(data) {
    localStorage.setItem("carrosEstacionados", JSON.stringify(data));
}

// Função para adicionar o elemento de alerta
function adicionarAlerta(mensagem) {
    const statusDiv = document.getElementById("status");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert", "alert-warning", "alert-dismissible", "fade", "show");
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
        <strong>${mensagem}</strong>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    statusDiv.appendChild(alertDiv);

    // Remove o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}



// Adicionando evento de submit ao formulário
document
    .getElementById("parking-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const matricula = document.getElementById("matricula").value;
        const marca = document.getElementById("marca").value;
        const valorPago = parseFloat(document.getElementById("valor-pago").value);
        const metodoPagamento = document.getElementById('metodo-pagamento').value;

        adicionarCarro(matricula, marca, valorPago, metodoPagamento);
    });

// Exibir a lista de carros estacionados ao carregar a página
window.addEventListener("load", function () {
    const carrosEstacionados = lerDados();
    exibirCarrosEstacionados(carrosEstacionados);
});
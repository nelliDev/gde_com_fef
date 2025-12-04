var todasAtividades = [];
var categorias = [];
var atividadesFiltradas = [];

var filtroCategoria = '';
var filtroCusto = '';
var filtroDiaSemana = '';
var filtroHorarioInicio = '';
var filtroHorarioFim = '';

var paginaAtual = 1;
var itensPorPagina = 20;
var totalItens = 0;
var totalPaginas = 0;
    
function inicializar() {
    setupEventos();
    carregarDados();
}
    
function setupEventos() {
    document.getElementById('filtroCategoria').addEventListener('change', function() {
        filtroCategoria = this.value;
        aplicarFiltros();
    });
    
    document.getElementById('filtroCusto').addEventListener('change', function() {
        filtroCusto = this.value;
        aplicarFiltros();
    });
    
    document.getElementById('filtroDiaSemana').addEventListener('change', function() {
        filtroDiaSemana = this.value;
        aplicarFiltros();
    });
    
    document.getElementById('filtroHorarioInicio').addEventListener('change', function() {
        filtroHorarioInicio = this.value;
        aplicarFiltros();
    });
    
    document.getElementById('filtroHorarioFim').addEventListener('change', function() {
        filtroHorarioFim = this.value;
        aplicarFiltros();
    });
    
    document.getElementById('itensPorPagina').addEventListener('change', function() {
        itensPorPagina = parseInt(this.value);
        paginaAtual = 1;
        aplicarFiltros();
    });
    
    document.getElementById('btnPaginaAnterior').addEventListener('click', function() {
        if (paginaAtual > 1) {
            paginaAtual--;
            mostrarAtividades();
            atualizarPaginacao();
        }
    });
    
    document.getElementById('btnProximaPagina').addEventListener('click', function() {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            mostrarAtividades();
            atualizarPaginacao();
        }
    });
}
    
function carregarDados() {
    mostrarCarregando();
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', CONFIG_URL + 'ajax/atividades-fef.php?action=listar', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    processarResposta(response);
                } catch (e) {
                    mostrarErro('Erro ao processar dados do servidor');
                }
            } else {
                mostrarErro('Erro ao conectar com o servidor (Status: ' + xhr.status + ')');
            }
        }
    };
    xhr.send();
}
    
function processarResposta(response) {
    if (response.success) {
        todasAtividades = response.atividades || [];
        categorias = response.categorias || [];
        
        atualizarFiltros();
        aplicarFiltros();
    } else {
        mostrarErro(response.error || 'Erro desconhecido');
    }
    esconderCarregando();
}

function atualizarFiltros() {
    var selectCategoria = document.getElementById('filtroCategoria');
    if (!selectCategoria) return;
    
    while (selectCategoria.children.length > 1) {
        selectCategoria.removeChild(selectCategoria.lastChild);
    }
    
    var i = 0;
    while (i < categorias.length) {
        var option = document.createElement('option');
        option.value = categorias[i];
        option.textContent = categorias[i];
        selectCategoria.appendChild(option);
        i++;
    }
}
    
    // Aplicar filtros
function aplicarFiltros() {
    var atividades = todasAtividades;
    
    if (filtroCategoria) {
        var temp = [];
        var i = 0;
        while (i < atividades.length) {
            if (atividades[i].categoria === filtroCategoria) {
                temp.push(atividades[i]);
            }
            i++;
        }
        atividades = temp;
    }
    
    if (filtroCusto) {
        var temp = [];
        var i = 0;
        while (i < atividades.length) {
            var custo = parseFloat(atividades[i].custo || 0);
            if (filtroCusto === 'gratuito') {
                if (custo === 0) {
                    temp.push(atividades[i]);
                }
            } else if (filtroCusto === 'pago') {
                if (custo > 0) {
                    temp.push(atividades[i]);
                }
            }
            i++;
        }
        atividades = temp;
    }
        
    if (filtroDiaSemana) {
        var temp = [];
        var i = 0;
        while (i < atividades.length) {
            var horario = atividades[i].horario.toLowerCase();
            var diaProcurado = filtroDiaSemana.toLowerCase();
            if (horario.indexOf(diaProcurado) !== -1) {
                temp.push(atividades[i]);
            }
            i++;
        }
        atividades = temp;
    }
    
    if (filtroHorarioInicio) {
        var temp = [];
        var i = 0;
        while (i < atividades.length) {
            if (verificarHorario(atividades[i].horario, filtroHorarioInicio, 'inicio')) {
                temp.push(atividades[i]);
            }
            i++;
        }
        atividades = temp;
    }
    
    if (filtroHorarioFim) {
        var temp = [];
        var i = 0;
        while (i < atividades.length) {
            if (verificarHorario(atividades[i].horario, filtroHorarioFim, 'fim')) {
                temp.push(atividades[i]);
            }
            i++;
        }
        atividades = temp;
    }
    
    atividadesFiltradas = atividades;
    
    totalItens = atividades.length;
    totalPaginas = Math.ceil(totalItens / itensPorPagina);
    
    if (paginaAtual > totalPaginas) {
        paginaAtual = Math.max(1, totalPaginas);
    }
    
    mostrarAtividades();
    atualizarPaginacao();
}
    
function mostrarAtividades() {
    var container = document.getElementById('atividadesContainer');
    if (!container) return;
    
    var ativs = atividadesFiltradas;
    
    if (ativs.length === 0) {
        container.innerHTML = '<div class="sem-atividades">🏃‍♂️ Nenhuma atividade encontrada com os filtros selecionados.</div>';
        return;
    }
    
    var inicio = (paginaAtual - 1) * itensPorPagina;
    var fim = inicio + itensPorPagina;
    var atividadesPagina = ativs.slice(inicio, fim);
    
    var html = '<div class="atividades-grid">';
    
    var i = 0;
    while (i < atividadesPagina.length) {
        html += criarCard(atividadesPagina[i]);
        i++;
    }
    
    html += '</div>';
    container.innerHTML = html;
}
    
function criarCard(atividade) {
    var custo = parseFloat(atividade.custo || 0);
    var custoTexto = custo === 0 ? 'GRATUITO' : 'R$ ' + custo.toFixed(2);
    var custoClass = 'atividade-custo';
    
    return '<div class="atividade-card">' +
        '<div class="atividade-categoria">' + (atividade.categoria || 'Categoria não informada') + '</div>' +
        '<div class="atividade-titulo">' + (atividade.titulo || 'Título não informado') + '</div>' +
        '<div class="atividade-info">' +
            '<strong>📅 Horário:</strong> ' + (atividade.horario || 'Horário não informado') +
        '</div>' +
        '<div class="' + custoClass + '">' +
            '💰 ' + custoTexto +
        '</div>' +
        '<div class="atividade-prazo">' +
            '⏰ Inscrições até: ' + (atividade.prazo_inscricao || 'Prazo não informado') +
        '</div>' +
    '</div>';
}
    
function mostrarCarregando() {
    var container = document.getElementById('atividadesContainer');
    if (container) {
        container.innerHTML = '<div class="loading" id="loadingIndicator">🔄 Carregando atividades...</div>';
    }
}

function mostrarErro(mensagem) {
    var container = document.getElementById('atividadesContainer');
    if (container) {
        container.innerHTML = '<div class="error">❌ ' + mensagem + '</div>';
    }
}

function esconderCarregando() {
    var loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}
    
function atualizarPaginacao() {
    var info1 = document.getElementById('infoPaginacao');
    var info2 = document.getElementById('infoPaginacao2');
    var btnAnt = document.getElementById('btnPaginaAnterior');
    var btnProx = document.getElementById('btnProximaPagina');
    
    if (!info1 || !btnAnt || !btnProx) return;
    
    var inicio = (paginaAtual - 1) * itensPorPagina + 1;
    var fim = Math.min(inicio + itensPorPagina - 1, totalItens);
    
    var textoInfo;
    if (totalItens === 0) {
        textoInfo = 'Nenhuma atividade encontrada';
    } else {
        textoInfo = 'Mostrando ' + inicio + '-' + fim + ' de ' + totalItens + ' atividades (Página ' + paginaAtual + ' de ' + totalPaginas + ')';
    }
    
    info1.textContent = textoInfo;
    if (info2) info2.textContent = textoInfo;
    
    btnAnt.disabled = paginaAtual <= 1;
    btnProx.disabled = paginaAtual >= totalPaginas;
    
    btnAnt.className = btnAnt.disabled ? 'btn-paginacao disabled' : 'btn-paginacao';
    btnProx.className = btnProx.disabled ? 'btn-paginacao disabled' : 'btn-paginacao';
}
    
function atualizarDados() {
    carregarDados();
}

function verificarHorario(horarioAtividade, horarioFiltro, tipo) {
    try {
        var regex = /(\d{2}:\d{2})\s*[àa]s?\s*(\d{2}:\d{2})/;
        var match = horarioAtividade.match(regex);
        
        if (!match) return false;
        
        var horaInicio = match[1];
        var horaFim = match[2];
        
        function horaParaNumero(hora) {
            var partes = hora.split(':');
            return parseInt(partes[0]) * 100 + parseInt(partes[1]);
        }
        
        var inicioNum = horaParaNumero(horaInicio);
        var fimNum = horaParaNumero(horaFim);
        var filtroNum = horaParaNumero(horarioFiltro);
        
        if (tipo === 'inicio') {
            return inicioNum >= filtroNum;
        } else if (tipo === 'fim') {
            return fimNum <= filtroNum;
        }
        
        return false;
    } catch (e) {
        return false;
    }
}

if (typeof $ === 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            inicializar();
        });
    } else {
        inicializar();
    }
}
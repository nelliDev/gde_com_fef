/**
 * Módulo para gerenciar as Atividades da FEF
 */
var atividadesFEF = {
    // Dados carregados
    dados: {
        atividades: [],
        categorias: [],
        atividadesFiltradas: []
    },
    
    // Estado dos filtros
    filtros: {
        categoria: '',
        custo: '',
        diaSemana: '',
        horarioInicio: '',
        horarioFim: ''
    },
    
    // Estado da paginação
    paginacao: {
        paginaAtual: 1,
        itensPorPagina: 20,
        totalItens: 0,
        totalPaginas: 0
    },
    
    // Inicialização
    init: function() {
        console.log('Inicializando módulo Atividades da FEF...');
        this.setupEventListeners();
        this.carregarDados();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        var self = this;
        
        // Filtros
        document.getElementById('filtroCategoria').addEventListener('change', function() {
            self.filtros.categoria = this.value;
            self.aplicarFiltros();
        });
        
        document.getElementById('filtroCusto').addEventListener('change', function() {
            self.filtros.custo = this.value;
            self.aplicarFiltros();
        });
        
        document.getElementById('filtroDiaSemana').addEventListener('change', function() {
            self.filtros.diaSemana = this.value;
            self.aplicarFiltros();
        });
        
        document.getElementById('filtroHorarioInicio').addEventListener('change', function() {
            self.filtros.horarioInicio = this.value;
            self.aplicarFiltros();
        });
        
        document.getElementById('filtroHorarioFim').addEventListener('change', function() {
            self.filtros.horarioFim = this.value;
            self.aplicarFiltros();
        });
        
        // Paginação
        document.getElementById('itensPorPagina').addEventListener('change', function() {
            self.paginacao.itensPorPagina = parseInt(this.value);
            self.paginacao.paginaAtual = 1;
            self.aplicarFiltros();
        });
        
        document.getElementById('btnPaginaAnterior').addEventListener('click', function() {
            if (self.paginacao.paginaAtual > 1) {
                self.paginacao.paginaAtual--;
                self.renderizarAtividades();
                self.atualizarPaginacao();
            }
        });
        
        document.getElementById('btnProximaPagina').addEventListener('click', function() {
            if (self.paginacao.paginaAtual < self.paginacao.totalPaginas) {
                self.paginacao.paginaAtual++;
                self.renderizarAtividades();
                self.atualizarPaginacao();
            }
        });
    },
    
    // Carregar dados do servidor
    carregarDados: function() {
        console.log('Carregando dados das atividades...');
        this.showLoading();
        
        var self = this;
        
        // Fazer requisição AJAX
        var xhr = new XMLHttpRequest();
        xhr.open('GET', CONFIG_URL + 'ajax/atividades-fef.php?action=listar', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        console.log('Resposta recebida:', response);
                        self.processarResposta(response);
                    } catch (e) {
                        console.error('Erro ao processar resposta JSON:', e);
                        self.showError('Erro ao processar dados do servidor');
                    }
                } else {
                    console.error('Erro na requisição:', xhr.status, xhr.statusText);
                    self.showError('Erro ao conectar com o servidor (Status: ' + xhr.status + ')');
                }
            }
        };
        xhr.send();
    },
    
    // Processar resposta do servidor
    processarResposta: function(response) {
        if (response.success) {
            this.dados.atividades = response.atividades || [];
            this.dados.categorias = response.categorias || [];
            
            console.log('Dados carregados:', this.dados.atividades.length + ' atividades');
            
            this.atualizarFiltros();
            this.atualizarStatus(response);
            this.aplicarFiltros();
        } else {
            console.error('Erro na resposta:', response.error);
            this.showError(response.error || 'Erro desconhecido');
            
            // Em caso de erro, mostrar dados mock se disponíveis
            if (response.debug) {
                console.error('Debug:', response.debug);
            }
        }
    },
    
    // Atualizar status na interface
    atualizarStatus: function(response) {
        var statusContainer = document.getElementById('statusContainer');
        var statusText = document.getElementById('statusText');
        var ultimaAtualizacao = document.getElementById('ultimaAtualizacao');
        
        if (!statusContainer || !statusText || !ultimaAtualizacao) return;
        
        var fonte = '';
        switch(response.source) {
            case 'database':
                fonte = 'Dados do banco de dados';
                statusContainer.style.backgroundColor = '#e8f5e8';
                statusContainer.style.borderColor = '#c8e6c9';
                break;
            case 'mock':
                fonte = 'Dados de exemplo (banco vazio)';
                statusContainer.style.backgroundColor = '#fff3e0';
                statusContainer.style.borderColor = '#ffcc02';
                break;
            default:
                fonte = 'Fonte desconhecida';
                break;
        }
        
        statusText.textContent = fonte + ' - ' + (response.total || 0) + ' atividades encontradas';
        
        if (response.ultima_atualizacao) {
            ultimaAtualizacao.textContent = 'Última atualização: ' + response.ultima_atualizacao;
        } else {
            ultimaAtualizacao.textContent = 'Dados de exemplo - Execute o scraper para dados reais';
        }
    },
    
    // Atualizar opções dos filtros
    atualizarFiltros: function() {
        var selectCategoria = document.getElementById('filtroCategoria');
        if (!selectCategoria) return;
        
        // Limpar opções existentes (exceto "Todas")
        while (selectCategoria.children.length > 1) {
            selectCategoria.removeChild(selectCategoria.lastChild);
        }
        
        // Adicionar categorias
        this.dados.categorias.forEach(function(categoria) {
            var option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectCategoria.appendChild(option);
        });
        
        console.log('Filtros atualizados com', this.dados.categorias.length, 'categorias');
    },
    
    // Aplicar filtros
    aplicarFiltros: function() {
        console.log('Aplicando filtros:', this.filtros);
        
        var atividades = this.dados.atividades;
        
        // Filtrar por categoria
        if (this.filtros.categoria) {
            atividades = atividades.filter(function(atividade) {
                return atividade.categoria === atividadesFEF.filtros.categoria;
            });
        }
        
        // Filtrar por custo
        if (this.filtros.custo) {
            atividades = atividades.filter(function(atividade) {
                var custo = parseFloat(atividade.custo || 0);
                if (atividadesFEF.filtros.custo === 'gratuito') {
                    return custo === 0;
                } else if (atividadesFEF.filtros.custo === 'pago') {
                    return custo > 0;
                }
                return true;
            });
        }
        
        // Filtrar por dia da semana
        if (this.filtros.diaSemana) {
            atividades = atividades.filter(function(atividade) {
                var horario = atividade.horario.toLowerCase();
                var diaProcurado = atividadesFEF.filtros.diaSemana.toLowerCase();
                return horario.indexOf(diaProcurado) !== -1;
            });
        }
        
        // Filtrar por horário de início
        if (this.filtros.horarioInicio) {
            atividades = atividades.filter(function(atividade) {
                return atividadesFEF.verificarHorario(atividade.horario, atividadesFEF.filtros.horarioInicio, 'inicio');
            });
        }
        
        // Filtrar por horário de fim
        if (this.filtros.horarioFim) {
            atividades = atividades.filter(function(atividade) {
                return atividadesFEF.verificarHorario(atividade.horario, atividadesFEF.filtros.horarioFim, 'fim');
            });
        }
        
        this.dados.atividadesFiltradas = atividades;
        
        // Calcular paginação
        this.paginacao.totalItens = atividades.length;
        this.paginacao.totalPaginas = Math.ceil(this.paginacao.totalItens / this.paginacao.itensPorPagina);
        
        // Ajustar página atual se necessário
        if (this.paginacao.paginaAtual > this.paginacao.totalPaginas) {
            this.paginacao.paginaAtual = Math.max(1, this.paginacao.totalPaginas);
        }
        
        console.log('Filtros aplicados:', atividades.length, 'atividades encontradas');
        this.renderizarAtividades();
        this.atualizarPaginacao();
    },
    
    // Renderizar atividades na tela
    renderizarAtividades: function() {
        var container = document.getElementById('atividadesContainer');
        if (!container) return;
        
        var todasAtividades = this.dados.atividadesFiltradas;
        
        if (todasAtividades.length === 0) {
            container.innerHTML = '<div class="sem-atividades">🏃‍♂️ Nenhuma atividade encontrada com os filtros selecionados.</div>';
            return;
        }
        
        // Calcular atividades da página atual
        var inicio = (this.paginacao.paginaAtual - 1) * this.paginacao.itensPorPagina;
        var fim = inicio + this.paginacao.itensPorPagina;
        var atividadesPagina = todasAtividades.slice(inicio, fim);
        
        var html = '<div class="atividades-grid">';
        
        atividadesPagina.forEach(function(atividade) {
            html += atividadesFEF.criarCardAtividade(atividade);
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        console.log('Renderizadas', atividadesPagina.length, 'atividades da página', this.paginacao.paginaAtual);
    },
    
    // Criar card de uma atividade
    criarCardAtividade: function(atividade) {
        var custo = parseFloat(atividade.custo || 0);
        var custoTexto = custo === 0 ? 'GRATUITO' : 'R$ ' + custo.toFixed(2);
        var custoClass = custo === 0 ? 'atividade-custo' : 'atividade-custo';
        
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
    },
    
    // Mostrar indicador de carregamento
    showLoading: function() {
        var container = document.getElementById('atividadesContainer');
        if (container) {
            container.innerHTML = '<div class="loading" id="loadingIndicator">🔄 Carregando atividades...</div>';
        }
    },
    
    // Mostrar erro
    showError: function(mensagem) {
        var container = document.getElementById('atividadesContainer');
        if (container) {
            container.innerHTML = '<div class="error">❌ ' + mensagem + '</div>';
        }
    },
    
    // Atualizar controles de paginação
    atualizarPaginacao: function() {
        var infoPaginacao = document.getElementById('infoPaginacao');
        var infoPaginacao2 = document.getElementById('infoPaginacao2');
        var btnAnterior = document.getElementById('btnPaginaAnterior');
        var btnProxima = document.getElementById('btnProximaPagina');
        
        if (!infoPaginacao || !btnAnterior || !btnProxima) return;
        
        // Atualizar informações
        var inicio = (this.paginacao.paginaAtual - 1) * this.paginacao.itensPorPagina + 1;
        var fim = Math.min(inicio + this.paginacao.itensPorPagina - 1, this.paginacao.totalItens);
        
        var textoInfo;
        if (this.paginacao.totalItens === 0) {
            textoInfo = 'Nenhuma atividade encontrada';
        } else {
            textoInfo = 'Mostrando ' + inicio + '-' + fim + ' de ' + this.paginacao.totalItens + ' atividades (Página ' + this.paginacao.paginaAtual + ' de ' + this.paginacao.totalPaginas + ')';
        }
        
        infoPaginacao.textContent = textoInfo;
        if (infoPaginacao2) infoPaginacao2.textContent = textoInfo;
        
        // Atualizar botões
        btnAnterior.disabled = this.paginacao.paginaAtual <= 1;
        btnProxima.disabled = this.paginacao.paginaAtual >= this.paginacao.totalPaginas;
        
        // Atualizar classes CSS
        btnAnterior.className = btnAnterior.disabled ? 'btn-paginacao disabled' : 'btn-paginacao';
        btnProxima.className = btnProxima.disabled ? 'btn-paginacao disabled' : 'btn-paginacao';
    },
    
    // Atualizar dados (recarregar do servidor)
    atualizarDados: function() {
        console.log('Atualizando dados...');
        this.carregarDados();
    },
    
    // Verificar se o horário da atividade atende ao filtro de horário
    verificarHorario: function(horarioAtividade, horarioFiltro, tipo) {
        // Exemplo de horário: "Seg, Qua - 18:00 às 19:00" ou "Ter, Qui - 07:00 às 08:00"
        try {
            // Extrair horários do formato "XX:XX às YY:YY"
            var regex = /(\d{2}:\d{2})\s*[àa]s?\s*(\d{2}:\d{2})/;
            var match = horarioAtividade.match(regex);
            
            if (!match) return false;
            
            var horaInicio = match[1];
            var horaFim = match[2];
            
            // Converter para números para comparação (formato HHMM)
            function horaParaNumero(hora) {
                var partes = hora.split(':');
                return parseInt(partes[0]) * 100 + parseInt(partes[1]);
            }
            
            var inicioNum = horaParaNumero(horaInicio);
            var fimNum = horaParaNumero(horaFim);
            var filtroNum = horaParaNumero(horarioFiltro);
            
            if (tipo === 'inicio') {
                // Atividade deve começar no horário especificado ou depois
                return inicioNum >= filtroNum;
            } else if (tipo === 'fim') {
                // Atividade deve terminar no horário especificado ou antes
                return fimNum <= filtroNum;
            }
            
            return false;
        } catch (e) {
            console.warn('Erro ao processar horário:', horarioAtividade, e);
            return false;
        }
    }
};

// Auto-inicializar se jQuery não estiver disponível
if (typeof $ === 'undefined') {
    console.log('jQuery não detectado, usando JavaScript nativo');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            atividadesFEF.init();
        });
    } else {
        atividadesFEF.init();
    }
}
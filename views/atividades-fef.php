<?php

namespace GDE;

define('TITULO', 'Atividades da FEF');
define('NO_DENIAL', true);

require_once('../common/common.inc.php');

// Add a simple header for non-logged-in users
if($_Usuario === null) {
?>
<div id="simple_header" style="background: #4a90a4; padding: 10px 0; margin-bottom: 20px;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <a href="<?= CONFIG_URL; ?>" style="color: white; text-decoration: none; font-weight: bold; font-size: 18px;">
                GDE - Sistema de Gestão de Dados Estudantis
            </a>
        </div>
        <div>
            <a href="<?= CONFIG_URL; ?>" style="color: white; text-decoration: none; margin-right: 15px;">Login</a>
            <a href="<?= CONFIG_URL; ?>sobre/" style="color: white; text-decoration: none;">Sobre</a>
        </div>
    </div>
</div>
<?php
}
?>

<script type="text/javascript">
    var CONFIG_URL = '<?= CONFIG_URL ?>';
</script>
<script type="text/javascript" src="<?= CONFIG_URL ?>web/js/gde.atividades-fef.js"></script>
<style>
    .atividades-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .filtros-container {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .filtros-container h3 {
        margin-top: 0;
        color: #495057;
        font-size: 18px;
        margin-bottom: 15px;
    }
    
    .filtros-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 15px;
        align-items: end;
    }
    
    .filtro-grupo {
        display: flex;
        flex-direction: column;
    }
    
    .filtro-grupo label {
        font-weight: bold;
        margin-bottom: 5px;
        color: #495057;
        font-size: 14px;
    }
    
    .filtro-grupo select {
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 14px;
        background-color: white;
    }
    
    .btn-atualizar {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .atividades-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .atividade-card {
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .atividade-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .atividade-categoria {
        background: #e3f2fd;
        color: #1565c0;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 10px;
        text-transform: uppercase;
    }
    
    .atividade-titulo {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        line-height: 1.3;
    }
    
    .atividade-info {
        margin-bottom: 10px;
    }
    
    .atividade-info strong {
        color: #555;
        margin-right: 8px;
    }
    
    .atividade-custo {
        background: #e8f5e8;
        color: #2e7d32;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
        margin-top: 15px;
        border-left: 4px solid #4caf50;
    }
    
    .atividade-prazo {
        background: #fff3e0;
        color: #f57c00;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
        border-left: 4px solid #ff9800;
    }
    
    .loading {
        text-align: center;
        padding: 40px;
        font-size: 16px;
        color: #666;
    }
    
    .error {
        text-align: center;
        padding: 40px;
        font-size: 16px;
        color: #dc3545;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
    }
    
    .sem-atividades {
        text-align: center;
        padding: 40px;
        font-size: 16px;
        color: #666;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
    }
    
    @media (max-width: 768px) {
        .atividades-container {
            padding: 10px;
        }
        
        .filtros-grid {
            flex-direction: column;
        }
        
        .filtro-grupo {
            min-width: 100%;
        }
        
        .atividades-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .atividade-card {
            padding: 15px;
        }
    }
    
    /* Estilos de paginação */
    .paginacao-container {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #dee2e6;
    }
    
    .paginacao-controles {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .paginacao-navegacao {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .itens-por-pagina {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .itens-por-pagina label {
        font-weight: 500;
        color: #495057;
    }
    
    .itens-por-pagina select {
        padding: 6px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        background: white;
        font-size: 14px;
    }
    
    .info-paginacao {
        font-size: 14px;
        color: #6c757d;
        font-weight: 500;
    }
    
    .btn-paginacao {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .btn-paginacao:hover:not(.disabled) {
        background: #0056b3;
        transform: translateY(-1px);
    }
    
    .btn-paginacao.disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    @media (max-width: 768px) {
        .atividades-container {
            padding: 10px;
        }
        .filtros-grid {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        .atividades-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        .atividade-card {
            padding: 15px;
        }
    }
        border: 1px solid #dee2e6;
    }
    
    .paginacao-controles {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .paginacao-navegacao {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .itens-por-pagina {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .itens-por-pagina label {
        font-weight: 500;
        color: #495057;
    }
    
    .itens-por-pagina select {
        padding: 6px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        background: white;
        font-size: 14px;
    }
    
    .info-paginacao {
        font-size: 14px;
        color: #6c757d;
        font-weight: 500;
    }
    
    .btn-paginacao {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .btn-paginacao:hover:not(.disabled) {
        background: #0056b3;
        transform: translateY(-1px);
    }
    
    .btn-paginacao.disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    @media (max-width: 768px) {
        .paginacao-controles,
        .paginacao-navegacao {
            flex-direction: column;
            text-align: center;
        }
        
        .itens-por-pagina {
            justify-content: center;
        }
    }
</style>

<div class="atividades-container">
    <h1>Atividades da FEF - UNICAMP</h1>
    <p>Confira as atividades de extensão da Faculdade de Educação Física disponíveis para inscrição.</p>
    
    <!-- Filtros -->
    <div class="filtros-container">
        <h3>🔍 Filtros</h3>
        <div class="filtros-grid">
            <div class="filtro-grupo">
                <label for="filtroCategoria">Categoria:</label>
                <select id="filtroCategoria">
                    <option value="">Todas as categorias</option>
                </select>
            </div>
            
            <div class="filtro-grupo">
                <label for="filtroDiaSemana">Dia da Semana:</label>
                <select id="filtroDiaSemana">
                    <option value="">Todos os dias</option>
                    <option value="seg">Segunda-feira</option>
                    <option value="ter">Terça-feira</option>
                    <option value="qua">Quarta-feira</option>
                    <option value="qui">Quinta-feira</option>
                    <option value="sex">Sexta-feira</option>
                    <option value="sab">Sábado</option>
                    <option value="dom">Domingo</option>
                </select>
            </div>
            
            <div class="filtro-grupo">
                <label for="filtroHorarioInicio">Horário de Início:</label>
                <select id="filtroHorarioInicio">
                    <option value="">Qualquer horário</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                </select>
            </div>
            
            <div class="filtro-grupo">
                <label for="filtroHorarioFim">Horário de Fim:</label>
                <select id="filtroHorarioFim">
                    <option value="">Qualquer horário</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                </select>
            </div>
            
            <div class="filtro-grupo">
                <label for="filtroCusto">Custo:</label>
                <select id="filtroCusto">
                    <option value="">Todos</option>
                    <option value="gratuito">Gratuito</option>
                    <option value="pago">Pago</option>
                </select>
            </div>
            
            <button class="btn-atualizar" onclick="atualizarDados()">
                🔄 Atualizar Dados
            </button>
        </div>
    </div>
    
    <!-- Controles de paginação superior -->
    <div class="paginacao-container">
        <div class="paginacao-controles">
            <div class="itens-por-pagina">
                <label for="itensPorPagina">Itens por página:</label>
                <select id="itensPorPagina">
                    <option value="10">10</option>
                    <option value="20" selected>20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div class="info-paginacao" id="infoPaginacao">
                Carregando...
            </div>
        </div>
    </div>
    
    <!-- Container das atividades -->
    <div id="atividadesContainer">
        <div class="loading" id="loadingIndicator">
            🔄 Carregando atividades...
        </div>
    </div>
    
    <!-- Controles de paginação inferior -->
    <div class="paginacao-container">
        <div class="paginacao-navegacao">
            <button id="btnPaginaAnterior" class="btn-paginacao" disabled>
                ← Página Anterior
            </button>
            <div class="info-paginacao" id="infoPaginacao2">
                <!-- Duplicação da info para footer -->
            </div>
            <button id="btnProximaPagina" class="btn-paginacao" disabled>
                Próxima Página →
            </button>
        </div>
    </div>
</div>

<script>
// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Atividades da FEF carregada');
    atividadesFEF.init();
});
</script>

<?= $FIM; ?>
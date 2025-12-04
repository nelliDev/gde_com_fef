<?php
define('NO_LOGIN_CHECK', true);
define('JSON', true);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../common/common.inc.php';

try {
    $action = $_GET['action'] ?? 'listar';
    
    switch ($action) {
        case 'listar':
            echo json_encode(carregarAtividadesFEF());
            break;
            
        case 'status':
            echo json_encode(getStatusScraper());
            break;
            
        default:
            throw new Exception('Ação não reconhecida');
    }
    
} catch (Exception $e) {
    error_log("Erro em atividades-fef.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor',
        'debug' => $e->getMessage(),
        'atividades' => [],
        'categorias' => [],
        'total' => 0,
        'ultima_atualizacao' => null
    ]);
}

function carregarAtividadesFEF() {
    try {
        // Primeiro, tentar carregar do banco de dados
        $atividades_db = carregarAtividadesDatabase();
        if (!empty($atividades_db)) {
            return processarDados($atividades_db, 'database');
        }
        
        // Se não houver dados no banco, tentar carregar dados de exemplo/mock
        $atividades_mock = carregarAtividadesMock();
        return processarDados($atividades_mock, 'mock');
        
    } catch (Exception $e) {
        error_log("Erro ao carregar atividades FEF: " . $e->getMessage());
        
        // Em caso de erro, tentar retornar dados mock
        try {
            $atividades_mock = carregarAtividadesMock();
            return processarDados($atividades_mock, 'mock_fallback');
        } catch (Exception $e2) {
            return [
                'success' => false,
                'error' => 'Erro ao carregar atividades',
                'debug' => $e->getMessage(),
                'source' => 'error',
                'atividades' => [],
                'categorias' => [],
                'total' => 0,
                'ultima_atualizacao' => null
            ];
        }
    }
}

function carregarAtividadesDatabase() {
    try {
        $em = \GDE\Base::_EM()->getConnection();
        
        $query = "SELECT * FROM gde_activities ORDER BY scraped_at DESC";
        $stmt = $em->prepare($query);
        $stmt->execute();
        
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $atividades = [];
        $i = 0;
        while ($i < count($resultados)) {
            $row = $resultados[$i];
            $atividades[] = [
                'id' => $row['id'],
                'categoria' => $row['category'],
                'titulo' => $row['class_name'],
                'horario' => $row['schedule'],
                'custo' => floatval($row['cost']),
                'prazo_inscricao' => $row['enrollment_deadline'],
                'data_scraping' => $row['scraped_at']
            ];
            $i++;
        }
        
        return $atividades;
        
    } catch (Exception $e) {
        error_log("Erro ao acessar banco de dados: " . $e->getMessage());
        return [];
    }
}

function carregarAtividadesMock() {
    // Dados de exemplo baseados no HTML da FEF
    return [
        [
            'id' => 1,
            'categoria' => 'Atividades Físicas',
            'titulo' => 'Hidroginástica para Terceira Idade',
            'horario' => 'Terças e Quintas, 14h às 15h',
            'custo' => 0.0,
            'prazo_inscricao' => '15 de dezembro de 2024',
            'data_scraping' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 2,
            'categoria' => 'Esportes',
            'titulo' => 'Futebol de Campo - Iniciantes',
            'horario' => 'Segundas e Quartas, 19h às 21h',
            'custo' => 50.0,
            'prazo_inscricao' => '20 de dezembro de 2024',
            'data_scraping' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 3,
            'categoria' => 'Dança',
            'titulo' => 'Dança de Salão',
            'horario' => 'Sextas, 20h às 22h',
            'custo' => 80.0,
            'prazo_inscricao' => '10 de janeiro de 2025',
            'data_scraping' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 4,
            'categoria' => 'Condicionamento',
            'titulo' => 'Musculação Orientada',
            'horario' => 'Segunda a Sexta, 6h às 22h',
            'custo' => 120.0,
            'prazo_inscricao' => '31 de dezembro de 2024',
            'data_scraping' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 5,
            'categoria' => 'Atividades Físicas',
            'titulo' => 'Yoga e Relaxamento',
            'horario' => 'Terças e Quintas, 7h às 8h',
            'custo' => 0.0,
            'prazo_inscricao' => '25 de dezembro de 2024',
            'data_scraping' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 6,
            'categoria' => 'Esportes',
            'titulo' => 'Vôlei Misto',
            'horario' => 'Quartas e Sextas, 18h às 20h',
            'custo' => 30.0,
            'prazo_inscricao' => '5 de janeiro de 2025',
            'data_scraping' => date('Y-m-d H:i:s')
        ]
    ];
}

function processarDados($atividades, $source) {
    if (empty($atividades)) {
        return [
            'success' => true,
            'source' => $source,
            'atividades' => [],
            'categorias' => [],
            'total' => 0,
            'ultima_atualizacao' => null,
            'message' => 'Nenhuma atividade encontrada'
        ];
    }
    
    $categorias = [];
    $j = 0;
    while ($j < count($atividades)) {
        $categoria = $atividades[$j]['categoria'];
        if (!in_array($categoria, $categorias)) {
            $categorias[] = $categoria;
        }
        $j++;
    }
    sort($categorias);
    
    $ultima_atualizacao = null;
    for ($k = 0; $k < count($atividades); $k++) {
        if (isset($atividades[$k]['data_scraping'])) {
            $data = strtotime($atividades[$k]['data_scraping']);
            if ($ultima_atualizacao === null || $data > $ultima_atualizacao) {
                $ultima_atualizacao = $data;
            }
        }
    }
    
    return [
        'success' => true,
        'source' => $source,
        'atividades' => $atividades,
        'categorias' => $categorias,
        'total' => count($atividades),
        'ultima_atualizacao' => $ultima_atualizacao ? date('d/m/Y H:i', $ultima_atualizacao) : null
    ];
}

function getStatusScraper() {
    try {
        $em = \GDE\Base::_EM()->getConnection();
        
        // Verificar a última execução do scraper
        $query = "SELECT MAX(scraped_at) as ultima_execucao, COUNT(*) as total_atividades FROM gde_activities";
        $stmt = $em->prepare($query);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'scraper_ativo' => false,
            'ultima_execucao' => $resultado['ultima_execucao'],
            'total_atividades' => intval($resultado['total_atividades']),
            'proximo_scraping' => 'Manual'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Erro ao verificar status do scraper',
            'debug' => $e->getMessage()
        ];
    }
}
?>
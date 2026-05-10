<?php
/**
 * api_export_course.php - Export d'une compétition au format JSON
 * 
 * USAGE: GET api_export_course.php?competition=173
 * 
 * Retourne un JSON avec { success: true, export: { ... } }
 * Compatible avec administration.html
 */

require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$competitionCode = $_GET['competition'] ?? null;

if (empty($competitionCode)) {
    echo json_encode(['success' => false, 'error' => 'Paramètre "competition" requis']);
    exit;
}

try {
    $pdo = getDbConnection();
    global $tables;

    // Vérifier que la compétition existe
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM {$tables['settings']} WHERE Code_competition = ?");
    $checkStmt->execute([$competitionCode]);
    if ($checkStmt->fetchColumn() == 0) {
        echo json_encode(['success' => false, 'error' => "Compétition '$competitionCode' non trouvée"]);
        exit;
    }

    // Détecter si c'est une compétition manuelle
    $isManual = (strpos($competitionCode, 'M') === 0);

    // Structure de l'export
    $export = [
        'kcross_export' => [
            'version' => '1.0',
            'format' => 'kcross_course',
            'export_date' => date('c'),
            'source_instance' => gethostname() ?: 'unknown',
            'competition_code' => $competitionCode,
            'is_manual' => $isManual
        ],
        'data' => [
            'competition' => null,
            'categories' => [],
            'horaires' => null,
            'series' => [],
            'slots' => [],
            'classement' => []
        ],
        'stats' => []
    ];

    // Si compétition manuelle, exporter aussi les données participants
    if ($isManual) {
        $export['data']['manual_results'] = [];
    }

    // 1. KCross_Competitions (settings)
    $stmt = $pdo->prepare("SELECT Format, Nombre_portes, Detail_portes, Roll_Zone, Ecart_Series_Global, Ecart_Categories_Global 
                           FROM {$tables['settings']} WHERE Code_competition = ?");
    $stmt->execute([$competitionCode]);
    $export['data']['competition'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. KCross_Competition_Categories
    $stmt = $pdo->prepare("SELECT Code_Categorie, Nom_Categorie, Nb_Bateau, Nom_Variante, Ordre 
                           FROM {$tables['categories']} WHERE Code_competition = ? ORDER BY Ordre, Code_Categorie");
    $stmt->execute([$competitionCode]);
    $export['data']['categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. KCross_Competition_Horaires
    $stmt = $pdo->prepare("SELECT Data_horaires FROM {$tables['schedules']} WHERE Code_competition = ?");
    $stmt->execute([$competitionCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $export['data']['horaires'] = $row ? $row['Data_horaires'] : null;

    // 4. KCross_Series
    $stmt = $pdo->prepare("SELECT Code_Serie, Code_Categorie, Nom_Tour, Nom_Serie, H_depart, Etat, Zones_Jugees, Num_Serie_Global 
                           FROM {$tables['heats']} WHERE Code_competition = ? ORDER BY Num_Serie_Global, Code_Serie");
    $stmt->execute([$competitionCode]);
    $export['data']['series'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. KCross_Slots_Serie
    $stmt = $pdo->prepare("SELECT Code_Serie, Slot_Index, Code_bateau, Ordre_arrivee, Penalite, Statut_Special, Clt 
                           FROM {$tables['slots']} WHERE Code_competition = ? ORDER BY Code_Serie, Slot_Index");
    $stmt->execute([$competitionCode]);
    $export['data']['slots'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. KCross_Competitions_Classement
    $stmt = $pdo->prepare("SELECT Code_Categorie, Code_bateau, Cltc, Serie_Source 
                           FROM {$tables['ranking']} WHERE Code_competition = ? ORDER BY Code_Categorie, Cltc");
    $stmt->execute([$competitionCode]);
    $export['data']['classement'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Si manuel, exporter les participants
    if ($isManual) {
        $manualCompId = (int) str_replace('M', '', $competitionCode);
        $stmt = $pdo->prepare("SELECT dossard, nom, prenom, club, sexe, code_categorie, tps_chrono_cs, cltc, code_bateau, bateau, nation, licence 
                               FROM {$tables['manual_results']} WHERE id_competition = ? ORDER BY code_categorie, cltc");
        $stmt->execute([$manualCompId]);
        $export['data']['manual_results'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Statistiques
    $export['stats'] = [
        'categories' => count($export['data']['categories']),
        'series' => count($export['data']['series']),
        'slots' => count($export['data']['slots']),
        'classement' => count($export['data']['classement']),
        'manual_results' => $isManual ? count($export['data']['manual_results']) : 0
    ];

    echo json_encode(['success' => true, 'export' => $export]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
<?php
/**
 * api_import_course.php - Import d'une compétition depuis JSON
 * 
 * USAGE: POST avec JSON { target_code: "173", export_data: { ... } }
 */

require_once __DIR__ . '/_bootstrap.php';

// 1. Augmentation des limites pour les gros fichiers
ini_set('memory_limit', '512M');
set_time_limit(300); // 5 minutes max

// S'assurer que le header est bon
header('Content-Type: application/json; charset=utf-8');

try {
    // Lire le JSON POST
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    if ($input === null) {
        throw new Exception('JSON invalide dans la requête (Problème de décodage)');
    }

    $targetCode = trim($input['target_code'] ?? '');
    $exportData = $input['export_data'] ?? null;

    if (empty($targetCode)) {
        throw new Exception('Code compétition cible requis (target_code)');
    }

    if (empty($exportData)) {
        throw new Exception('Données d\'export manquantes (export_data)');
    }

    // === VALIDATION STRUCTURE ===
    $structureErrors = validateStructure($exportData);
    if (!empty($structureErrors)) {
        throw new Exception('Structure invalide: ' . implode('; ', $structureErrors));
    }

    // === VALIDATION COHÉRENCE ===
    $data = $exportData['data'] ?? $exportData;
    $coherenceErrors = validateCoherence($data);
    if (!empty($coherenceErrors)) {
        throw new Exception('Données incohérentes: ' . implode('; ', array_slice($coherenceErrors, 0, 5)));
    }

    // === IMPORT TRANSACTIONNEL ===
    global $tables, $auditLogger;
    $pdo = getDbConnection();
    
    $result = executeImport($pdo, $tables, $exportData, $targetCode);

    // === AUDIT (non bloquant) ===
    try {
        if ($auditLogger && $auditLogger->isEnabled()) {
            $sourceCode = $exportData['kcross_export']['competition_code'] ?? 'unknown';
            $auditLogger->startAction($targetCode, 'import_course', 'admin_import', [
                'source_code' => $sourceCode
            ]);
            $auditLogger->recordTableChange('import', $result['total_records']);
            if (method_exists($auditLogger, 'endAction')) {
                $auditLogger->endAction(true);
            }
        }
    } catch (Throwable $e) {
        // Non bloquant
    }

    // === RÉPONSE JSON SÉCURISÉE ===
    $response = [
        'success' => true,
        'message' => 'Import réussi',
        'log' => $result['log'],
        'total_records' => $result['total_records']
    ];

    // Utilisation de JSON_INVALID_UTF8_SUBSTITUTE pour éviter que json_encode ne renvoie false
    // si des caractères Latin1 traînent dans les logs.
    $jsonOutput = json_encode($response, JSON_INVALID_UTF8_SUBSTITUTE);

    if ($jsonOutput === false) {
        throw new Exception("Erreur d'encodage JSON de la réponse : " . json_last_error_msg());
    }

    echo $jsonOutput;

} catch (Throwable $e) {
    // En cas d'erreur, on s'assure de renvoyer un JSON valide
    http_response_code(500); // Signaler l'erreur au client
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_INVALID_UTF8_SUBSTITUTE);
}

// ============================================================
// VALIDATION STRUCTURE
// ============================================================
function validateStructure($exportData) {
    $errors = [];

    // Vérifier l'en-tête
    if (!isset($exportData['kcross_export'])) {
        $errors[] = "En-tête 'kcross_export' manquant";
        return $errors;
    }

    if (!isset($exportData['kcross_export']['format']) || $exportData['kcross_export']['format'] !== 'kcross_course') {
        $errors[] = "Format invalide (attendu: kcross_course)";
    }

    // Vérifier la section data
    $data = $exportData['data'] ?? null;
    if (!$data) {
        $errors[] = "Section 'data' manquante";
        return $errors;
    }

    if (!isset($data['competition']) || empty($data['competition'])) {
        $errors[] = "Section 'data.competition' manquante ou vide";
    }

    if (!isset($data['categories']) || !is_array($data['categories'])) {
        $errors[] = "Section 'data.categories' manquante ou invalide";
    }

    if (!isset($data['series']) || !is_array($data['series'])) {
        $errors[] = "Section 'data.series' manquante ou invalide";
    }

    if (!isset($data['slots']) || !is_array($data['slots'])) {
        $errors[] = "Section 'data.slots' manquante ou invalide";
    }

    return $errors;
}

// ============================================================
// VALIDATION COHÉRENCE
// ============================================================
function validateCoherence($data) {
    $errors = [];

    // Collecter les Code_Categorie
    $categoryIds = [];
    foreach ($data['categories'] ?? [] as $idx => $cat) {
        if (!isset($cat['Code_Categorie'])) {
            $errors[] = "Catégorie #$idx: Code_Categorie manquant";
            continue;
        }
        $categoryIds[$cat['Code_Categorie']] = true;
    }

    // Collecter les Code_Serie et vérifier FK
    $serieIds = [];
    foreach ($data['series'] ?? [] as $idx => $serie) {
        if (!isset($serie['Code_Serie'])) {
            $errors[] = "Série #$idx: Code_Serie manquant";
            continue;
        }
        if (isset($serie['Code_Categorie']) && !isset($categoryIds[$serie['Code_Categorie']])) {
            $errors[] = "Série {$serie['Code_Serie']}: catégorie inexistante";
        }
        $serieIds[$serie['Code_Serie']] = true;
    }

    // Vérifier FK des slots
    foreach ($data['slots'] ?? [] as $idx => $slot) {
        if (isset($slot['Code_Serie']) && !isset($serieIds[$slot['Code_Serie']])) {
            $errors[] = "Slot #$idx: série inexistante";
        }
    }

    return $errors;
}

// ============================================================
// EXÉCUTION DE L'IMPORT
// ============================================================
function executeImport($pdo, $tables, $exportData, $targetCode) {
    $log = [];
    $data = $exportData['data'];
    $isManual = $exportData['kcross_export']['is_manual'] ?? (strpos($targetCode, 'M') === 0);

    $pdo->beginTransaction();

    try {
        // === SUPPRESSION dans l'ordre des dépendances ===
        $deleteOrder = ['slots', 'ranking', 'heats', 'categories', 'schedules', 'settings'];
        foreach ($deleteOrder as $key) {
            $stmt = $pdo->prepare("DELETE FROM {$tables[$key]} WHERE Code_competition = ?");
            $stmt->execute([$targetCode]);
            $count = $stmt->rowCount();
            if ($count > 0) {
                $log[] = "DELETE {$tables[$key]}: $count";
            }
        }

        // Supprimer manual_results si compétition manuelle
        if ($isManual && isset($data['manual_results'])) {
            $manualCompId = (int) str_replace('M', '', $targetCode);
            $stmt = $pdo->prepare("DELETE FROM {$tables['manual_results']} WHERE id_competition = ?");
            $stmt->execute([$manualCompId]);
            $count = $stmt->rowCount();
            if ($count > 0) {
                $log[] = "DELETE manual_results: $count";
            }
        }

        // === INSERTION ===
        
        // 1. Settings (competition)
        if (!empty($data['competition'])) {
            $comp = $data['competition'];
            $stmt = $pdo->prepare("INSERT INTO {$tables['settings']} 
                (Code_competition, Format, Nombre_portes, Detail_portes, Roll_Zone, Ecart_Series_Global, Ecart_Categories_Global) 
                VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetCode,
                $comp['Format'] ?? null,
                $comp['Nombre_portes'] ?? null,
                $comp['Detail_portes'] ?? null,
                $comp['Roll_Zone'] ?? null,
                $comp['Ecart_Series_Global'] ?? null,
                $comp['Ecart_Categories_Global'] ?? null
            ]);
            $log[] = "INSERT settings: 1";
        }

        // 2. Categories (avec remapping des IDs)
        $categoryMap = [];
        foreach ($data['categories'] ?? [] as $cat) {
            $oldId = $cat['Code_Categorie'];
            $stmt = $pdo->prepare("INSERT INTO {$tables['categories']} 
                (Code_competition, Nom_Categorie, Nb_Bateau, Nom_Variante, Ordre) 
                VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetCode,
                $cat['Nom_Categorie'],
                $cat['Nb_Bateau'] ?? null,
                $cat['Nom_Variante'] ?? null,
                $cat['Ordre'] ?? null
            ]);
            $categoryMap[$oldId] = $pdo->lastInsertId();
        }
        $log[] = "INSERT categories: " . count($data['categories'] ?? []);

        // 3. Horaires
        if (!empty($data['horaires'])) {
            $stmt = $pdo->prepare("INSERT INTO {$tables['schedules']} (Code_competition, Data_horaires) VALUES (?, ?)");
            $stmt->execute([$targetCode, $data['horaires']]);
            $log[] = "INSERT schedules: 1";
        }

        // 4. Series (avec remapping)
        $serieMap = [];
        foreach ($data['series'] ?? [] as $serie) {
            $oldSerieId = $serie['Code_Serie'];
            $newCatId = $categoryMap[$serie['Code_Categorie']] ?? $serie['Code_Categorie'];
            
            $stmt = $pdo->prepare("INSERT INTO {$tables['heats']} 
                (Code_competition, Code_Categorie, Nom_Tour, Nom_Serie, H_depart, Etat, Zones_Jugees, Num_Serie_Global) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetCode,
                $newCatId,
                $serie['Nom_Tour'] ?? '',
                $serie['Nom_Serie'] ?? '',
                $serie['H_depart'] ?? null,
                $serie['Etat'] ?? 1,
                $serie['Zones_Jugees'] ?? null,
                $serie['Num_Serie_Global'] ?? null
            ]);
            $serieMap[$oldSerieId] = $pdo->lastInsertId();
        }
        $log[] = "INSERT series: " . count($data['series'] ?? []);

        // 5. Slots (avec remapping)
        $slotsCount = 0;
        foreach ($data['slots'] ?? [] as $slot) {
            $newSerieId = $serieMap[$slot['Code_Serie']] ?? $slot['Code_Serie'];
            
            $stmt = $pdo->prepare("INSERT INTO {$tables['slots']} 
                (Code_competition, Code_Serie, Slot_Index, Code_bateau, Ordre_arrivee, Penalite, Statut_Special, Clt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetCode,
                $newSerieId,
                $slot['Slot_Index'],
                $slot['Code_bateau'] ?? null,
                $slot['Ordre_arrivee'] ?? null,
                $slot['Penalite'] ?? null,
                $slot['Statut_Special'] ?? null,
                $slot['Clt'] ?? null
            ]);
            $slotsCount++;
        }
        $log[] = "INSERT slots: $slotsCount";

        // 6. Classement (avec remapping)
        $classCount = 0;
        foreach ($data['classement'] ?? [] as $rank) {
            $newCatId = $categoryMap[$rank['Code_Categorie']] ?? $rank['Code_Categorie'];
            
            $stmt = $pdo->prepare("INSERT INTO {$tables['ranking']} 
                (Code_competition, Code_Categorie, Code_bateau, Cltc, Serie_Source) 
                VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetCode,
                $newCatId,
                $rank['Code_bateau'] ?? '',
                $rank['Cltc'] ?? null,
                $rank['Serie_Source'] ?? ''
            ]);
            $classCount++;
        }
        $log[] = "INSERT classement: $classCount";

        // 7. Manual results (si applicable)
        if ($isManual && !empty($data['manual_results'])) {
            $manualCompId = (int) str_replace('M', '', $targetCode);
            $manualCount = 0;
            
            foreach ($data['manual_results'] as $result) {
                $stmt = $pdo->prepare("INSERT INTO {$tables['manual_results']} 
                    (id_competition, dossard, nom, prenom, club, sexe, code_categorie, tps_chrono_cs, cltc, code_bateau, bateau, nation, licence) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $manualCompId,
                    $result['dossard'] ?? '',
                    $result['nom'] ?? null,
                    $result['prenom'] ?? null,
                    $result['club'] ?? null,
                    $result['sexe'] ?? null,
                    $result['code_categorie'] ?? '',
                    $result['tps_chrono_cs'] ?? null,
                    $result['cltc'] ?? null,
                    $result['code_bateau'] ?? '',
                    $result['bateau'] ?? '',
                    $result['nation'] ?? null,
                    $result['licence'] ?? null
                ]);
                $manualCount++;
            }
            $log[] = "INSERT manual_results: $manualCount";
        }

        $pdo->commit();

        // Calculer le total
        $totalRecords = 0;
        foreach ($log as $line) {
            if (preg_match('/INSERT [^:]+: (\d+)/', $line, $m)) {
                $totalRecords += (int)$m[1];
            }
        }

        return [
            'log' => $log,
            'total_records' => $totalRecords
        ];

    } catch (Throwable $e) {
        $pdo->rollBack();
        throw new Exception('Erreur import: ' . $e->getMessage());
    }
}
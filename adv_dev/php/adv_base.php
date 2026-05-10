<?php
// advBase : Class de Base pour interface MySQL - MariaDB
declare(strict_types=1);  

include_once('adv.php');
include_once('adv_table.php');

class advBase
{
	// Variables pour la Connexion MySQL ...
    protected string $m_login;	
    protected string $m_password;		
    protected string $m_database;
    protected string $m_server;

    protected string $m_directory;		// Repertoire principal 
    protected string $m_url;			// URL principal

	protected $m_link;			// Connexion MySQL 
	
    // Constructeur 
    function __construct()
    {
		$this->m_link = null;
    }
	
    // Destructeur 
    function __destruct()
    {
        $this->Close();
    }
	
    // Connexion BDD MySQL 
    function Connect()
    { 
        $this->m_link = mysqli_connect($this->m_server, $this->m_login, $this->m_password, $this->m_database);
        if (mysqli_connect_errno()) 
        {
			die('Impossible de se connecter : ' . mysqli_connect_error());
        }

        mysqli_set_charset($this->m_link, "utf8");
    }  
	
    // Close
    function Close()
    { 
        if (isset($this->m_link))
        {
            mysqli_close($this->m_link);
            $this->m_link = null;
            return true;
        }

        return false;
    }
	
	static public function GetTypeColumn(int $field_type) : int
	{
		switch($field_type)
		{
			case MYSQLI_TYPE_DECIMAL:
			case MYSQLI_TYPE_NEWDECIMAL:
			case MYSQLI_TYPE_FLOAT:
			case MYSQLI_TYPE_DOUBLE:
				return COLUMN_TYPE_DOUBLE;

			case MYSQLI_TYPE_BIT:
			case MYSQLI_TYPE_TINY:
			case MYSQLI_TYPE_SHORT:
			case MYSQLI_TYPE_LONG:
			case MYSQLI_TYPE_LONGLONG:
			case MYSQLI_TYPE_INT24:
			case MYSQLI_TYPE_YEAR:
			case MYSQLI_TYPE_ENUM:
				return COLUMN_TYPE_LONG;

			case MYSQLI_TYPE_TIME:
			case MYSQLI_TYPE_DATETIME:
			case MYSQLI_TYPE_TIMESTAMP:
				return COLUMN_TYPE_DATETIME;

			case MYSQLI_TYPE_DATE:
			case MYSQLI_TYPE_NEWDATE:
				return COLUMN_TYPE_DATE;

			case MYSQLI_TYPE_VAR_STRING:
			case MYSQLI_TYPE_STRING:
			case MYSQLI_TYPE_CHAR:
				return COLUMN_TYPE_CHAR;
	
			case MYSQLI_TYPE_INTERVAL:
			case MYSQLI_TYPE_SET:
			case MYSQLI_TYPE_GEOMETRY:
			case MYSQLI_TYPE_TINY_BLOB:
			case MYSQLI_TYPE_MEDIUM_BLOB:
			case MYSQLI_TYPE_LONG_BLOB:
			case MYSQLI_TYPE_BLOB:
			default:
				trigger_error("invalid type: $field_type");
				return COLUMN_TYPE_CHAR;
		}
	}
	
    function &Table(string $sql, $params=null)
	{
		$stmt = mysqli_prepare($this->m_link, $sql) or die('error table prepare '.mysqli_error($this->m_link));

		if (gettype($params) == 'array')
		{
			$types = '';
			for ($i=0;$i<count($params);$i++)
			{
				$type = gettype($params[$i]);
				if ($type == 'string')
					$types .= 's';
				elseif ($type == 'integer')
					$types .= 'i';
				elseif ($type == 'double')
					$types .= 'd';
				else
					die("error table type bind_param $type");
 			}
			
			// ...argument unpacking 
			mysqli_stmt_bind_param($stmt, $types, ...$params);
		}
		
		// Execution
		mysqli_stmt_execute($stmt) or die('error table execute '.mysqli_error($this->m_link));

		// Récupération du result
		$result = mysqli_stmt_get_result($stmt) or die('error table result '.mysqli_error($this->m_link));
		
		$fields = mysqli_fetch_fields($result);
		$rows = mysqli_fetch_all($result, MYSQLI_NUM);

		// Nettoyage
		mysqli_stmt_close($stmt);
		
		// Création de la table ...
		$columns = [];
		for ($i=0;$i<count($fields);$i++)
		{
			$column = [];
			array_pad($column, COLUMN_INDEX_JSON, null);
			$column[COLUMN_INDEX_NAME] = $fields[$i]->name;
			$column[COLUMN_INDEX_LABEL] = $fields[$i]->orgname;
			$column[COLUMN_INDEX_FORMAT] = '';
			$column[COLUMN_INDEX_SIZE] = $fields[$i]->length;
			$column[COLUMN_INDEX_TYPE] = self::GetTypeColumn($fields[$i]->type);

			array_push($columns, $column);
		}

		return advTable::Create($columns, $rows);
	}
	
    // Query
	function Query($sql, $ignoreInjection=false, $maxLength=1500)
    {
		if (strpos($sql, ';') === false || $ignoreInjection)
		{
			if ($maxLength < 0 || strlen($sql) < $maxLength)
			{	
				if (strpos($sql, '**/') === false || $ignoreInjection)
				{
					$result = mysqli_query($this->m_link, $sql) or die ("Error Query : ".$sql);
					return $result;
				}
			}
		}

		date_default_timezone_set('Europe/Paris');
		error_log("Query blocked : ".date("Y-m-d H:i:s")." / ignoreInjection=$ignoreInjection, maxLength=$maxLength, lg=".strlen($sql).' : '.$sql."\r\n", 3, "/home/adv_log/logQueryIns.txt");
		die ("Error Injection SQL : ");
	}
	
	// MultiQuerySelect
	function &MultiQuerySelect($sql)
	{
		$record = array();
		
		$arrayRes = array();
		$result = mysqli_multi_query($this->m_link, $sql) or die ("Error Multi-Query : ".$sql);
		if ($result) 
		{
			do 
			{
				$result = mysqli_store_result($this->m_link);
				if ($result)
				{
					array_push($arrayRes, $result->fetch_row());
					$result->free();
				}

				if (!mysqli_more_results($this->m_link))
					break;
			} 
			while (mysqli_next_result($this->m_link));
	
			$nb = count($arrayRes);
			if ($nb > 0)
			{
				for ($i=0;$i<count($arrayRes[$nb-1]);$i++)
					array_push($record, $arrayRes[$nb-1][$i]);
			}
		}

		return $record;
	}		
	
    // NumRows
    function NumRows($result)
    {
        return mysqli_num_rows($result);
    }

    // FetchArray
    function FetchArray($result, $resulttype=MYSQLI_ASSOC)
    {
        return mysqli_fetch_array($result, $resulttype);
    }

    // FetchRow
    function FetchRow($result)
    {
        return mysqli_fetch_row($result);
    }
	
    // RealEscapeString
    function RealEscapeString($txt)
    {
        return mysqli_real_escape_string($this->m_link, $txt);
    }

    // GetLastAutoIncrement
    function GetLastAutoIncrement()
    {
        $result = $this->Query('Select LAST_INSERT_ID()');
        $row = $this->FetchRow($result);
        return intval($row[0]);
    }

    // ShowColumnsSQL
    function &ShowColumnsSQL($tableName)
    {
		$arrayColumns = array();
		
        $result = $this->Query("SHOW COLUMNS FROM $tableName");
        $num_results = $this->NumRows($result);
        for ($i=0;$i<$num_results;$i++)
        {
            array_push($arrayColumns, $this->FetchArray($result));
        }
        return $arrayColumns;
    }
	
   // GetIndexColumn
    function GetIndexColumn($tableName, $columnName)
    {
		$arrayColumns = $this->ShowColumnsSQL($tableName);
		for ($i=0;$i<count($arrayColumns);$i++)
		{
			if ($arrayColumns['Field'] == $columnName)
				return $i;
		}
        return -1;
    }
	
    // IsNullSQL
    function IsNullSQL($value)
    {
        $typeValue = gettype($value);
        if ($typeValue == 'NULL') return true;
        elseif (($typeValue == 'string') && ($value == '')) return true;
		else return false;
    }

    // ValueSQL
    function ValueSQL($value, $type, $null)
    {
        if ($this->IsNullSQL($value))
        {
            if ($null == 'YES') 
                return 'null';
            else 
                return "''";
        }

        $pos = strpos($type, 'int');
        if (($pos !== false) && ($pos == 0)) return $value;

        $pos = strpos($type, 'float');
        if (($pos !== false) && ($pos == 0)) return $value;

        $pos = strpos($type, 'double');
        if (($pos !== false) && ($pos == 0)) return $value;

        // On force le casting en string ...
        settype($value, "string");

        return "'".$this->RealEscapeString($value)."'";
    }

    // SetSQL
    function SetSQL($tableName, &$record, $bIgnoreNull=true, &$arrayColumns=null)
    {
        if ($arrayColumns == null)
        {
            $arrayColumns = $this->ShowColumnsSQL($tableName);
        }

        $sql = '';

        // Uniquement les colonnes présentes dans $record et $arrayColumns ...
        $count = 0;
        foreach($record as $key => $value)
        {
            if ($bIgnoreNull && $this->IsNullSQL($value))
                continue;

            for ($j=0;$j<count($arrayColumns);$j++)
            {
                if ($arrayColumns[$j]['Field'] == $key)
                {
                    if ($count == 0)
                        $sql .= 'Set ';
                    else
                        $sql .= ',';
                    ++$count;

                    $sql .= '`'.$key.'`=';
                    $sql .= $this->ValueSQL($value, $arrayColumns[$j]['Type'], $arrayColumns[$j]['Null']);

                    break;
                }				
            }
        }

        return $sql;
    }

    // InsertSQL
    function InsertSQL($tableName, &$record, $bIgnoreNull=true, &$arrayColumns=null)
    {
        return "Insert Into $tableName ".$this->SetSQL($tableName, $record, $bIgnoreNull, $arrayColumns);
    }

    function Insert($tableName, &$record, $bIgnoreNull=true, &$arrayColumns=null)
    {
        return $this->Query($this->InsertSQL($tableName, $record, $bIgnoreNull, $arrayColumns));
    }

    // UpdateSQL
    function UpdateSQL($tableName, &$record, $bIgnoreNull=false, &$arrayColumns=null)
    {
        return "Update $tableName ".$this->SetSQL($tableName, $record, $bIgnoreNull, $arrayColumns);
    }

    // ReplaceSQL
    function ReplaceSQL($tableName, &$record, $bIgnoreNull=false, &$arrayColumns=null)
    {
        return "Replace Into $tableName ".$this->SetSQL($tableName, $record, $bIgnoreNull, $arrayColumns);
    }
	
	function Replace($tableName, &$record, $bIgnoreNull=true, &$arrayColumns=null)
    {
        return $this->Query($this->ReplaceSQL($tableName, $record, $bIgnoreNull, $arrayColumns));
    }

    // InsertBlocSQL
    function InsertBlocSQL($tableName, &$tData, &$sql)
    {
        $sql = '';
        $nbData = count($tData);
        if ($nbData == 0) return;

        $arrayColumns = $this->ShowColumnsSQL($tableName);
        $nbColumns = count($arrayColumns);

        $sql .= "Insert Into $tableName (";
        for ($j=0;$j<$nbColumns;$j++)
        {
                if ($j >0) $sql .= ',';
                $sql .= $arrayColumns[$j]['Field'];
        }
        $sql .= ') Values ';

        for ($i=0;$i<$nbData;$i++)
        {
            $record = &$tData[$i];

            if ($i > 0) $sql .= ',';
            $sql .= '(';
            for ($j=0;$j<$nbColumns;$j++)
            {
                if ($j > 0) $sql .= ',';	

                $key = $arrayColumns[$j]['Field'];
                if (isset($record[$key]))
                    $sql .= $this->ValueSQL($record[$key], $arrayColumns[$j]['Type'], $arrayColumns[$j]['Null']);
                else
                    //					$sql .= $this->ValueSQL('', $arrayColumns[$j]['Type'], $arrayColumns[$j]['Null']);
                    $sql .= 'null';
            }
            $sql .= ')';
        }
    }
	
	// InsertBloc
	function InsertBloc($tableName, &$tData)
	{
		$sql = '';
		$this->InsertBlocSQL($tableName, $tData, $sql);
		return $this->Query($sql);
	}
	
    // ReplaceBlocSQL
    function &ReplaceBlocSQL($tableName, &$tData)
    {
        $sql = '';
        $nbData = count($tData);
        if ($nbData > 0) 
		{
			$arrayColumns = $this->ShowColumnsSQL($tableName);
			$nbColumns = count($arrayColumns);

			$sql .= "Replace Into $tableName (";
			for ($j=0;$j<$nbColumns;$j++)
			{
				if ($j >0) $sql .= ',';
					$sql .= $arrayColumns[$j]['Field'];
			}
			$sql .= ') Values ';

			for ($i=0;$i<$nbData;$i++)
			{
				$record = &$tData[$i];

				if ($i > 0) $sql .= ',';
				$sql .= '(';
				for ($j=0;$j<$nbColumns;$j++)
				{
					if ($j > 0) $sql .= ',';	

					$key = $arrayColumns[$j]['Field'];
					if (isset($record[$key]))
						$sql .= $this->ValueSQL($record[$key], $arrayColumns[$j]['Type'], $arrayColumns[$j]['Null']);
					else
						//					$sql .= $this->ValueSQL('', $arrayColumns[$j]['Type'], $arrayColumns[$j]['Null']);
						$sql .= 'null';
				}
				$sql .= ')';
			}
		}
		return $sql;
    }
	
	// ReplaceBloc
	function ReplaceBloc($tableName, &$tData)
	{
		$sql = $this->ReplaceBlocSQL($tableName, $tData);
		return $this->Query($sql);
	}
 	
	// Colonnes Partagées entre 2 Tables 
    function SharedColumnsSQL($tableName1, $tableName2)
    {
        $arrayColumns1 = $this->ShowColumnsSQL($tableName1);
		$arrayColumns2 = $this->ShowColumnsSQL($tableName2);

		$arrayColumns = array();
		for ($i=0;$i<count($arrayColumns1);$i++)
		{
			$column = $arrayColumns1[$i]['Field'];
			for ($j=0;$j<count($arrayColumns2);$j++)
			{
				if ($arrayColumns2[$j]['Field'] == $column )
				{
					array_push($arrayColumns, $column);
 					break;
				}
			}
		}
		
        $sql = '';
        for ($j=0;$j<count($arrayColumns);$j++)
        {
            if ($sql != '')
                $sql .= ',';
            $sql .= $arrayColumns[$j];
        }
        return $sql;
    }

    // ColumnsSQL
    function ColumnsSQL($tableName, &$arrayColumns=null)
    {
        if ($arrayColumns == null)
        {
            $arrayColumns = $this->ShowColumnsSQL($tableName);
        }

        $sql = '';
        for ($j=0;$j<count($arrayColumns);$j++)
        {
            if ($sql != '')
                $sql .= ',';

            $sql .= $arrayColumns[$j]['Field'];
        }
        return $sql;
    }
	
	// ColumnsNames
	function ColumnsNames($tableName, &$arrayNames)
	{
		$arrayColumns = $this->ShowColumnsSQL($tableName);

		$arrayNames = array();
		for ($j=0;$j<count($arrayColumns);$j++)
		{
			array_push($arrayNames, $arrayColumns[$j]['Field']);
		}
	}

    // ColumnsRecordSQL
    function ColumnsRecordSQL(&$record, $bIgnoreNull=false)
    {
        $sql = '';
        foreach($record as $key => $value)
        {
            if ($bIgnoreNull && $this->IsNullSQL($value))
                continue;

            if ($sql != '')
                $sql .= ',';

            $sql .= $key;
        }

        return $sql;
    }

    // LoadTable
    function &LoadTable($sql, $resulttype=MYSQLI_ASSOC)
    {
        $result = $this->Query($sql);
        $num_results = $this->NumRows($result);

        $table = array();
        for ($i=0;$i<$num_results;$i++)
        {
            array_push($table, $this->FetchArray($result, $resulttype));
        }
		return $table;
    }
	
    // LoadTableFields
	function LoadTableFields($sql, &$arrayData, &$arrayFields, $resulttype=MYSQLI_NUM)
	{
		$result = $this->Query($sql);
		$num_results = $this->NumRows($result);
		
		$arrayFields = &mysqli_fetch_fields($result);
		
		$arrayData = array();
		for ($i=0;$i<$num_results;$i++)
		{
			array_push($arrayData, $this->FetchArray($result, $resulttype));
		}
	}

    // LoadRecord
	function &LoadRecord($sql, $resulttype=MYSQLI_ASSOC)
	{
		$result = $this->Query($sql);
		if ($this->NumRows($result) >= 1)
			$record = $this->FetchArray($result, $resulttype);
		else
			$record = array();

		return $record;
	}

	function SelectString($sql, $defautValue='')
	{
		$result = $this->Query($sql);
		if ($this->NumRows($result) > 0)
		{
			$row = $this->FetchArray($result);	
			$values = array_values($row);

			if (count($values) > 0 && $values[0] != NULL)
				return $values[0];
		}

		return $defautValue;
	}

	function SelectInt($sql, $defautValue=0)
	{
		$value = $this->SelectString($sql);
		if ($value == '')
			return $defautValue;
		else
			return intval($value);
	}

	function SelectDouble($sql, $defautValue=0)
	{
		$value = $this->SelectString($sql);
		if ($value == '')
			return $defautValue;
		else
			return floatval($value);
	}
	
	// Chargement Table via node XML
	public static function ReadXML(&$tables, &$node)
	{
		assert(gettype($tables) == 'array');
		assert(gettype($node) == 'object');
		
		if ($node->nodeName == 'table')
		{
			if ($node->attributes->GetNamedItem('name') != NULL)
			{
				$name = $node->attributes->GetNamedItem('name')->nodeValue;
				if (!isset($tables[$name]))
					$tables[$name] = array();

				$count = $node->childNodes->length;
				for ($i=0;$i<$count;$i++)
				{
					$nodeRow = $node->childNodes->item($i);
					if ($nodeRow != null && $nodeRow->nodeType == XML_ELEMENT_NODE && $nodeRow->nodeName == 'row')
					{
						$row = array();
						$countRow = $nodeRow->childNodes->length;
						for ($j=0;$j<$countRow;$j++)
						{
							$nodeCell = $nodeRow->childNodes->item($j);
							if ($nodeCell != null && $nodeCell->nodeType == XML_ELEMENT_NODE && strlen($nodeCell->nodeName) > 0)
								$row[$nodeCell->nodeName] = $nodeCell->nodeValue;
						}
						array_push($tables[$name], $row);
					}
				}
				return true;
			}
		}
		return false;
	}
	
	// Transformation des valeurs "null" d'un record en une chaine vide ou une valeur string par défaut
	public static function ReplaceFieldNull(&$record, $nullValue='')
	{
		foreach ($record as $key => $value) 
		{
			if ($value == null)
				$record[$key] = $nullValue;
		}
	}
	
	// Transformation des valeurs "null" d'une table en une chaine vide ou une valeur string par défaut
	public static function ReplaceCellNull(&$table, $nullValue='')
	{
		for ($i=0;$i<count($table);$i++)
		{
			$record = &$table[$i];
			foreach ($record as $key => $value) 
			{
				if ($value == null)
					$record[$key] = $nullValue;
			}
		}
	}
	
	// Transformation des colonnes d'un record en integer 
	public static function CastIntegerFields(&$record, $columns)
	{
		$arrayColumns = explode(',', $columns);
		for ($j=0;$j<count($arrayColumns);$j++)
		{
			$colName = trim($arrayColumns[$j]);
			$record[$colName] = (int) $record[$colName];
		}
	}

	// Transformation des colonnes d'une table en integer 
	public static function CastIntegerColumns(&$table, $columns)
	{
		$arrayColumns = explode(',', $columns);
		for ($i=0;$i<count($table);$i++)
		{
			$record = &$table[$i];
			for ($j=0;$j<count($arrayColumns);$j++)
			{
				$colName = trim($arrayColumns[$j]);
				$record[$colName] = (int) $record[$colName];
			}
		}
	}
	
	function AddDay($date_current, $add)
	{
		$cmd = "Select DATE_ADD('$date_current', INTERVAL $add DAY) Date_add";
		$rDate = $this->LoadRecord($cmd);
		return adv::GetKey($rDate, 'Date_add');
	}
}
?>

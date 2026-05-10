<?php
// advTable  

define("COLUMN_INDEX_NAME", 0);				// Nom de la Colonne
define("COLUMN_INDEX_LABEL", 1);			// Label de la Colonne
define("COLUMN_INDEX_FORMAT", 2);			// Format de la Colonne
define("COLUMN_INDEX_STYLE", 3);			// Style : Primary, Foreign, Visible, Input, ReadOnly, Automatic, ...
define("COLUMN_INDEX_TYPENAME", 4);			// Nom du Type (voir virtual wxString wxGridTableBase::GetTypeName(int row, int col);
define("COLUMN_INDEX_TYPE", 5);				// SQL Type 
define("COLUMN_INDEX_SIZE", 6);				// Storage Size
define("COLUMN_INDEX_WIDTH_DEFAULT", 7);	// Largeur par défaut
define("COLUMN_INDEX_WIDTH_ACTIVE", 8);		// Largeur active
define("COLUMN_INDEX_ALIGNMENT", 9);		// Alignement
define("COLUMN_INDEX_JSON", 10);			// Donnée JSON associé à la Colonne

define("COLUMN_TYPE_NULL", 0);
define("COLUMN_TYPE_CHAR", 1);
define("COLUMN_TYPE_VARCHAR", 2);
define("COLUMN_TYPE_TEXT", 3);
define("COLUMN_TYPE_SHORT", 4);
define("COLUMN_TYPE_LONG", 5);
define("COLUMN_TYPE_DOUBLE", 6);
define("COLUMN_TYPE_CHRONO", 7);
define("COLUMN_TYPE_CHRONO_INV", 8);
define("COLUMN_TYPE_RANKING", 9);
define("COLUMN_TYPE_DATE", 10);
define("COLUMN_TYPE_SMALLDATETIME", 11);
define("COLUMN_TYPE_DATETIME", 12);

class advTable
{
	protected array|null $m_t;
	
	public function __construct()
	{
		$this->m_t = null;
    }

	public static function &Create(array &$columns, array &$rows): static
	{
		$instance = new self();
		$instance->m_t = ['columns' => &$columns, 'rows' => &$rows];
		return $instance;
	}
	
    public static function JSON_TableUnique(string $jsonData, string $name): static
	{
        $instance = new self();

		$arrayJson = json_decode($jsonData, true);
		if (isset($arrayJson[$name.'<sqlTable>']))
		{
			$instance->m_t = $arrayJson[$name.'<sqlTable>'];
			$instance->m_t['name'] = $name;
		}
		
       return $instance;
    }
	
	public function IsOk(): bool
	{
		if (is_array($this->m_t))
		{
			if (is_array($this->m_t['rows']))
				return true;
		}
		return false;
	}
	
	public function GetNbRows(): int
	{
		if (is_array($this->m_t))
		{
			if (is_array($this->m_t['rows']))
				return count($this->m_t['rows']);
		}
		return 0;
	}
	
	public function GetNbColumns(): int
	{
		if (is_array($this->m_t))
		{
			if (is_array($this->m_t['columns']))
				return count($this->m_t['columns']);
		}
		return 0;
	}

	public function GetIndexColumn(int|string $col): int
	{
		if (is_int($col))
			return $col;
		else
		{
			for ($c=0;$c<$this->GetNbColumns();$c++)
			{
				if ($this->m_t['columns'][$c][COLUMN_INDEX_NAME] == $col)
					return $c;
			}
			return -1;
		}
	}

	public function GetColumnName(int|string $col, string $valDefault='') : string
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			return $this->m_t['columns'][$c][COLUMN_INDEX_NAME];
		else
			return $valDefault;
	}
	
	public function SetColumnName(int|string $col, string $name): void
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			$this->m_t['columns'][$c][COLUMN_INDEX_NAME] = $name;
	}

	public function GetColumnLabel(int|string $col, string $valDefault=''): string
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			return $this->m_t['columns'][$c][COLUMN_INDEX_LABEL];
		else
			return $valDefault;
	}

	public function SetColumnLabel(int|string $col, string $label): void
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			$this->m_t['columns'][$c][COLUMN_INDEX_LABEL] = $label;
	}

	public function GetColumnFormat(int|string $col, string $valDefault=''): string
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			return $this->m_t['columns'][$c][COLUMN_INDEX_FORMAT];
		else
			return $valDefault;
	}

	public function SetColumnFormat(int|string $col, string $fmt): void
	{
		$c = $this->GetIndexColumn($col);
		if ($c >= 0 && $c < $this->GetNbColumns())
			$this->m_t['columns'][$c][COLUMN_INDEX_FORMAT] = $fmt;
	}
	
	public function GetCell(int|string $col, int $row, int|float|string $valDefault='')
	{
		if ($this->GetNbRows() > $row)
		{
			$c = $this->GetIndexColumn($col);
			if ($c >= 0 && $c < $this->GetNbColumns())
				return $this->m_t['rows'][$row][$c];
		}
		return $valDefault;
	}

	public function GetCellInt(int|string $col, int $row, int $valDefault=0): int
	{
		$value = $this->GetCell($col, $row);
		if ($value == '')
			return $valDefault;
		elseif (is_int($value))
			return $value;
		else
			return intval($value);
	}

	public function GetCellDouble(int|string $col, int $row, float $valDefault=0.0): float
	{
		$value = $this->GetCell($col, $row);
		if ($value == '')
			return $valDefault;
		elseif (is_float($value))
			return $value;
		else
			return floatval($value);
	}
	
	public function GetCellFormatDouble(int|string $col, int $row, string $fmt='', string $valDefault=''): string
	{
		$value = $this->GetCell($col, $row);
		if ($value == '')
		{
			return $valDefault;
		}
		else
		{
			if ($fmt == '')
				return strval($value);
			else
				return sprintf($fmt, floatval($value));
		}
	}

	public function GetCellDate(int|string $col, int $row, string $fmt='YYYYMMDD', string $valDefault=''): string
	{
		$value = $this->GetCell($col, $row);
		if (strlen($value) == 10)
		{
			// YYYY/MM/DD
			if ($fmt == 'DDMMYYYY')
				return adv::GetDay($value).'/'.adv::GetMonth($value).'/'.adv::GetYear($value);
			elseif ($fmt == 'DDMMYY')
				return adv::GetDay($value).'/'.adv.GetMonth($value).'/'.substr(adv::GetYear($value),2,2);
			elseif ($fmt == 'YYMMDD')
				return substr(adv::GetYear($value),2,2).'/'.adv::GetMonth($value).'/'.adv::GetDay($value);
			else
				return $value;
		}
		return $valDefault;
	}

	public function GetCellChrono(int|string $col, int $row, string $fmt='HHMMSSCC'): string
	{
		return adv.GetChrono($this->GetCellInt($col, $row), $fmt);
	}

	public function GetCellChronoDiff(int|string $col, int $row, string $fmt='MMSSCC', string $valDefault=''): string
	{
		$value = $this->GetCell($col, $row);
		if ($value == '')
			return $valDefault;
		else
			return adv.GetChronoDiff(intval($value), $fmt);
	}
	
	public function GetCellRank(int|string $col, int $row, string $fmt='', string $valDefault=''): string
	{
		$value = $this->GetCell($col, $row);
		if ($value == '' || intval($value) <= 0)
		{
			return $valDefault;
		}
		else
		{
			if ($fmt == '')
				return strval($value);
			else
				return sprintf($fmt, intval($value));
		}
	}

	public function GetCellFormat(int|string $col, int $row, string $format='', string $valDefault=''): string
	{
		if ($this->GetNbRows() > $row)
		{
			$c = $this->GetIndexColumn($col);
			if ($c >= 0 && $c < $this->GetNbColumns())
			{
				$value = $this->m_t['rows'][$row][$c];
				$fmt = $format == '' ? $this->m_t['columns'][$c][COLUMN_INDEX_FORMAT] : $format;
				$type = $this->m_t['columns'][$c][COLUMN_INDEX_TYPE];
				
				switch($type)
				{
					case COLUMN_TYPE_CHRONO:
					case COLUMN_TYPE_CHRONO_INV:
					if (substr($fmt,0,6) == '[DIFF]')
						return $this->GetCellChronoDiff($c, $row, substr($fmt,0,6), $valDefault);
					else
						return $this->GetCellChrono($c, $row, $fmt);

					case COLUMN_TYPE_DATE:
					return $this->GetCellDate($c, $row, $fmt, $valDefault);

					case COLUMN_TYPE_RANKING:
					return $this->GetCellRank($c, $row, $valDefault);
					
					case COLUMN_TYPE_DOUBLE:
					return this.GetCellFormatDouble(c, row, fmt, $valDefault);
				
					default:
					return $this->GetCell($c, $row, $valDefault);
				}
			}
		}
		return $valDefault;
	}
	
	public function SetVisibleColumns(array $columns)
	{
		$this->m_t['visible_columns'] = [];
		for ($j=0;$j<count($columns);$j++)
		{
			if (is_int($columns[$j]))
			{
				if ($columns[$j] >= 0 && $columns[$j] < $this->GetNbColumns(	))
					array_push($this->m_t['visible_columns'], $j);
			}
			else
			{
				$index_col = $this->GetIndexColumn($columns[$j]);
				if ($index_col >= 0 && $index_col < $this->GetNbColumns())
					array_push($this->m_t['visible_columns'], $index_col);
			}
		}	
	}
	
	public function GetVisibleColumns(): array
	{
		if (isset($this->m_t['visible_columns']) && is_array($this->m_t['visible_columns']))
		{
			return $this->m_t['visible_columns'];
		}
		else
		{
			$visible_columns = [];
			for ($j=0;$j<$this->GetNbColumns();$j++)
				array_push($visible_columns, $j);
			return $visible_columns;
		}
	}
	
	public function GetNbVisibleColumns(): int
	{
		if (isset($this->m_t['visible_columns']) && is_array($this->m_t['visible_columns']))
			return count($this->m_t['visible_columns']);
		else
			return 0;
	}
	
	public function SetDOM(string $key, $value): void
	{
		if (!isset($this->m_t['dom']))
			$this->m_t['dom'] = [];
		
		$this->m_t['dom'][$key] = $value;
	}

	public function GetDOM(string $key, $defautValue='')
	{
		if (isset($this->m_t['dom']) && isset($this->m_t['dom'][$key]))
			return $this->m_t['dom'][$key];
		else
			return $defautValue;
	}

	public function AddRow(int $count=1): int
	{
		for ($i=0;$i<$count;$i++)
		{
			$row = array();
			for ($c=0;$c<$this->GetNbColumns();$c++)
				array_push($row, '');

			array_push($this->m_t['rows'], $row);
		}
		return $this.GetNbRows()-1;
	}
}
?>

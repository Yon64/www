const nom_long = {
  INVK: "Invité Kayak",
  INVC: "Invité Canoe",
  INVB: "Invité Biplace",
  INV:  "Invité",
  C1D:  "Canoë Dame",
  K1D:  "Kayak Dame",
  K1H:  "Kayak Homme",
  C1H:	"Canoë Homme",
  
  FOR:  "Forunner's",
  FORMK:  "Forunner Men's kayak",
  FORWK:  "Forunner Women's kayak",
  FORMC:  "Forunner Men's Canoe",
  FORWC:  "Forunner Women's Canoe",
  
  MK1:  "Men's Kayak",
  WK1:  "Women's Kayak",
  MC1:  "Men's Canoe",
  WC1:  "Women's Canoe",
  
  FORMXI1:  "Forunner Men's",	
  FORWXI1:	"Forunner Women's",
  MXI1:		"Men's Kayak Cross",
  WXI1:		"Women's Kayak Cross",
    
};

function Categorie_name(code) {
  return nom_long[code] ?? code;
}

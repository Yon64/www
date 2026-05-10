<?php
// advEmail : Class de Base pour l'envoi d'Email ...
include_once('adv.php');

require adv::GetPathComposer().'/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class advEmail
{
	protected string $m_subject;
	protected string $m_altBody;
	protected string $m_msgHTML;
	protected string $m_addAddress;
	protected string $m_fromAddress;
	protected string $m_fromName;
	protected array $m_cc;
	protected array $m_bcc;
	protected array $m_attachment;
	protected string $m_errorInfo;
	protected bool $m_usePHPMailer;
	
	// Constructeur 
	function __construct()
	{
		$this->m_subject = '';
		$this->m_altBody = '';
		$this->m_msgHTML = '';
		$this->m_addAddress = '';
		$this->m_fromAddress = '';
		$this->m_fromName = '';
	
		$this->m_cc = array();
		$this->m_bcc = array();
		$this->m_attachment = array();
		
		$this->m_errorInfo = '';
		$this->m_usePHPMailer = true;
	}

	function Subject(string $sujet)
	{
		$this->m_subject = $sujet;
	}
	
	function MsgHTML(string $msgHTML)
	{
		$this->m_msgHTML = $msgHTML;
	}

	function AltBody(string $altBody)
	{
		$this->m_altBody = $altBody;
	}

	function AddAddress(string $to)
	{
		$this->m_addAddress = $to;
	}

	function SetFrom(string $address, string $name)
	{
		$this->m_fromAddress = $address;
		$this->m_fromName = $name;
	}

	function AddCC(string $address, string $name)
	{
		array_push($this->m_cc, array('address' => $address, 'name' => $name));
	}

	function AddBCC(string $address, string $name)
	{
		array_push($this->m_bcc, array('address' => $address, 'name' => $name));
	}

	function AddAttachment(string $path, string $name='')
	{
		array_push($this->m_attachment, array('path' => $path, 'name' => $name));
	}

	function Test()
	{
		// Corps du Message ...
		$this->AltBody("Pour Voir le message, merci d'utiliser un email compatible HTML !"); // optional, comment out and test
		$this->MsgHTML('<h2>Test adv_email</h2>');
		
		// Sujet 
		$this->Subject('Test adv_email ...');
		
		// Adresse ...	
		$this->AddAddress('pierre@agil.fr');
		
		// From		
		$this->SetFrom('robot@agil.fr', 'robot@agil.fr');

		return $this->Send();
	}

	function Send()
	{
		$success = false;
		if ($this->m_usePHPMailer)
			$success = $this->SendBy_PhpMailer();
		else
			$success = $this->SendBy_PhpNative();
		
		if ($success)
			return ['success' => true];
		else
			return ['success' => false, 'error_info' => $this->m_errorInfo];
	}

	function SendBy_PhpMailer()
	{
//		return $this->SendPhpMailer_Infomaniak();
		return $this->SendPhpMailer_OVH();
	}

	function SendPhpMailer_OVH()
	{
		if ($this->m_msgHTML == '')
		{
			$this->m_errorInfo = "HTML Data Empty ...";
			return false;
		}
		
		if ($this->m_addAddress == '')
		{
			$this->m_errorInfo = "To Address Empty ...";
			return false;
		}
		
		if ($this->m_subject == '')
		{
			$this->m_errorInfo = "Subject Empty ...";
			return false;
		}
		
		$mail = new PHPMailer(true);
		$mail->setLanguage('fr');
		
		try {
			//Server settings
			$mail->setLanguage('fr');
			$mail->SMTPDebug = SMTP::DEBUG_OFF;		// DEBUG_SERVER =>Enable verbose debug output
													// DEBUG_OFF
			$mail->isSMTP();												//Send using SMTP
			$mail->Host       = 'pro3.mail.ovh.net';						//Set the SMTP server to send through
			$mail->SMTPAuth   = true;                                   	//Enable SMTP authentication
			$mail->Username   = 'tQA200387785.002@agilinformatique.com';	//SMTP username
			$mail->Password   = 'zebulon8908956lT';							//SMTP password
			$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;				//Enable implicit TLS encryption
			$mail->Port       = 587;										//TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

			// Configurer l'encodage UTF-8
			$mail->CharSet = 'UTF-8';
			$mail->Encoding = 'base64';  // Encodage de contenu pour supporter UTF-8

			//Recipients
			$mail->setFrom('tQA200387785.002@agilinformatique.com', 'technique.esf.net');
			$mail->addAddress($this->m_addAddress);
	
			// CC
			for ($k=0;$k<count($this->m_cc);$k++)
			{
				$mail->addCC($this->m_cc[$k]['address']);
			}

			// BCC
			for ($k=0;$k<count($this->m_bcc);$k++)
			{
				$mail->addBCC($this->m_bcc[$k]['address']);
			}
		
			// Reply
			$mail->addReplyTo('technique@snmsf.com', 'technique@snmsf.com');
			
			//Attachments
			//    $mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments

			//Content
			$mail->isHTML(true);                                  //Set email format to HTML
			$mail->Subject = $this->m_subject;
			$mail->Body    = $this->m_msgHTML;
			$mail->AltBody = $this->m_altBody;

			return $mail->send();
			
		} catch (Exception $e) {
			$this->m_errorInfo = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
			return false;
		}
	}

	function SendPhpMailer_Infomaniak()
	{
		if ($this->m_msgHTML == '')
		{
			$this->m_errorInfo = "HTML Data Empty ...";
			return false;
		}
		
		if ($this->m_addAddress == '')
		{
			$this->m_errorInfo = "To Address Empty ...";
			return false;
		}
		
		if ($this->m_subject == '')
		{
			$this->m_errorInfo = "Subject Empty ...";
			return false;
		}
		
		$mail = new PHPMailer(true);
		$mail->setLanguage('fr');
		
		try {
			//Server settings
			$mail->SMTPDebug = SMTP::DEBUG_OFF;		// DEBUG_SERVER =>Enable verbose debug output
													// DEBUG_OFF
			$mail->isSMTP();                                            //Send using SMTP
			$mail->Host       = 'mail.infomaniak.ch';                   //Set the SMTP server to send through
			$mail->SMTPAuth   = true;                                   //Enable SMTP authentication
			$mail->Username   = 'course@agil.fr';     	    	        //SMTP username
			$mail->Password   = 'agil74940';            	            //SMTP password
			$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         //Enable implicit TLS encryption
			$mail->Port       = 587;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

			// Configurer l'encodage UTF-8
			$mail->CharSet = 'UTF-8';
			$mail->Encoding = 'base64';  // Encodage de contenu pour supporter UTF-8

			//Recipients
			$mail->setFrom('course@agil.fr', 'technique.esf.net');
			$mail->addAddress($this->m_addAddress);
	
			// CC
			for ($k=0;$k<count($this->m_cc);$k++)
			{
				$mail->addCC($this->m_cc[$k]['address']);
			}

			// BCC
			for ($k=0;$k<count($this->m_bcc);$k++)
			{
				$mail->addBCC($this->m_bcc[$k]['address']);
			}
		
			// Reply
			$mail->addReplyTo('technique@snmsf.com', 'technique@snmsf.com');
			
			//Attachments
			//    $mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments

			//Content
			$mail->isHTML(true);                                  //Set email format to HTML
			$mail->Subject = $this->m_subject;
			$mail->Body    = $this->m_msgHTML;
			$mail->AltBody = $this->m_altBody;

			return $mail->send();
		} catch (Exception $e) {
			$this->m_errorInfo = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
			return false;
		}
	}

	function SendBy_PhpNative()
	{
		if ($this->m_msgHTML == '')
		{
			$this->m_errorInfo = "HTML Data Empty ...";
			return false;
		}
		
		if ($this->m_addAddress == '')
		{
			$this->m_errorInfo = "To Address Empty ...";
			return false;
		}
		
		if ($this->m_subject == '')
		{
			$this->m_errorInfo = "Subject Empty ...";
			return false;
		}
	
		// Boudary ...
		$boundary = "-----=".md5(rand());
		
		$headers  = "MIME-Version: 1.0\n";
//		$headers .= "Content-type: text/html; charset=iso-8859-1 \n";
		$headers .= "Content-Type: multipart/mixed; \n boundary=\"$boundary\"\n";
		$headers .= "From: $this->m_fromAddress \n";
		$headers .= "Disposition-Notification-To: $this->m_fromAddress  \n";
		
		// Message de Priorite haute
		// -------------------------
		$headers .= "X-Priority: 1  \n";
		$headers .= "X-MSMail-Priority: High \n";
	
		$mail_Data = "\n--".$boundary."\n";
/*		
//		$mail_Data.= "Content-Type: multipart/alternative;\n boundary=\"$boundary_alt\"\n";
		$mail_Data.= "\n--".$boundary_alt."\n";
		//=====Ajout du message au format texte.
		$mail_Data.= "Content-Type: text/plain; charset=\"ISO-8859-1\"\n";
		$mail_Data.= "Content-Transfer-Encoding: 8bit\n";
		$mail_Data.= "\n ...\n";
		//==========
		$mail_Data.= "\n--".$boundary_alt."\n";
*/
		//=====Ajout du message au format HTML.
		$mail_Data.= "Content-Type: text/html; charset=\"ISO-8859-1\"\n";
		$mail_Data.= "Content-Transfer-Encoding: 8bit\n";
		$mail_Data.= "\n";
		$mail_Data .= "<html>\n";
		$mail_Data .= "<head>\n";
		$mail_Data .= "<title>Club ESF</title> \n";
		$mail_Data .= "</head>\n";
		$mail_Data .= "<body>\n";
		$mail_Data .= $this->m_msgHTML;
		$mail_Data .= "</body>\n";
		$mail_Data .= "</HTML>\n";
		$mail_Data.= "\n";
		
		//===== Ajout des pieces jointes
		for ($i=0;$i<count($this->m_attachment);$i++)
		{
			$mail_Data.= "\n--".$boundary."\n";
			$this->SendAttachment($mail_Data, $this->m_attachment[$i]['path']);
		}
		
		// Fermeture Boundary ...
		$mail_Data .= "\n--".$boundary."--\n";
		
		return mail($this->m_addAddress, $this->m_subject, $mail_Data, $headers, '-ftechnique@esf.net');
	}
	
	function SendAttachment(&$mail_Data, $pathfile)
	{
		$ext = pathinfo($pathfile, PATHINFO_EXTENSION);
		$basename = pathinfo($pathfile, PATHINFO_BASENAME);
		
//		echo "=> Piece Jointe $pathfile ext = $ext basename = $basename <BR> ";
		
		// Lecture et mise en forme de la pièce jointe 
		$fichier = fopen($pathfile, "r");
		$attachement = fread($fichier, filesize($pathfile));
		$attachement = chunk_split(base64_encode($attachement));
		fclose($fichier);
		
		$mail_Data .= "Content-Type: image/$ext; name=\"$basename\" \n";
		$mail_Data .= "Content-Transfer-Encoding: base64\n";
		$mail_Data .= "Content-Disposition: attachment; filename=\"$basename\"\n";
		$mail_Data .= "\n".$attachement."\n\n";
	}
	
	function GetErrorInfo()
	{
		return $this->m_errorInfo;
	}
}
?>

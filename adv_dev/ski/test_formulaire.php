<?php
include_once('../adv/adv.php');
include_once('../adv/advPage.php');

function test()
{
?>
<form class="row g-3 needs-validation" novalidate>
  <div class="col-md-4">
    <label for="validationCustom01" class="form-label">First name</label>
    <input type="text" class="form-control" id="validationCustom01" value="Mark" required>
    <div class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustom02" class="form-label">Last name</label>
    <input type="text" class="form-control" id="validationCustom02" value="Otto" required>
    <div class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustomUsername" class="form-label">Username</label>
    <div class="input-group has-validation">
      <span class="input-group-text" id="inputGroupPrepend">@</span>
      <input type="text" class="form-control" id="validationCustomUsername" aria-describedby="inputGroupPrepend" required>
      <div class="invalid-feedback">
        Please choose a username.
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <label for="validationCustom03" class="form-label">City</label>
    <input type="text" class="form-control" id="validationCustom03" required>
    <div class="invalid-feedback">
      Please provide a valid city.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom04" class="form-label">State</label>
    <select class="form-select" id="validationCustom04" required>
      <option selected disabled value="">Choose...</option>
      <option>...</option>
    </select>
    <div class="invalid-feedback">
      Please select a valid state.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom05" class="form-label">Zip</label>
    <input type="text" class="form-control" id="validationCustom05" required>
    <div class="invalid-feedback">
      Please provide a valid zip.
    </div>
  </div>
  <div class="col-12">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
      <label class="form-check-label" for="invalidCheck">
        Agree to terms and conditions
      </label>
      <div class="invalid-feedback">
        You must agree before submitting.
      </div>
    </div>
  </div>
  <div class="col-12">
    <button class="btn btn-primary" type="submit">Submit form</button>
  </div>
</form>
<?php
}
function test_menu()
{
?>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">MonSite</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#">Accueil</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Services
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                            <li><h6 class="dropdown-header">Nos Services</h6></li>
                            <li><a class="dropdown-item" href="#">Consultation</a></li>
                            <li><a class="dropdown-item" href="#">Développement</a></li>
                            <li><a class="dropdown-item" href="#">Design</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="dropdown-submenu">
                                <a class="dropdown-item dropdown-toggle" href="#">Plus de services</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Formation</a></li>
                                    <li><a class="dropdown-item" href="#">Support</a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">À propos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
<?php
}


function test_menu2()
{
?>
 <style>
        /* Custom styles for the navbar */
        .navbar-nav .nav-link {
            color: #fff; /* White text */
        }

        .navbar-nav .nav-link:hover,
        .navbar-nav .nav-link:focus {
            color: #ffc107; /* Gold color on hover */
        }

        .dropdown-menu {
            background-color: #343a40; /* Dark background for dropdown */
            border-color: #4b4e53;
        }

        .dropdown-item {
            color: #fff; /* White text for dropdown items */
        }

        .dropdown-item:hover,
        .dropdown-item:focus {
            background-color: #495057; /* Darker background on hover */
        }

        .dropdown-menu .dropdown-submenu {
            position: relative;
        }

        .dropdown-menu .dropdown-submenu .dropdown-menu {
            top: 0;
            left: 100%;
            margin-top: -1px;
        }
    </style>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Brand</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#">Home</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Features
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                            <li><a class="dropdown-item" href="#">Feature 1</a></li>
                            <li><a class="dropdown-item" href="#">Feature 2</a></li>
                            <li class="dropdown-submenu">
                                <a class="dropdown-item dropdown-toggle" href="#">More Features</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Feature 3.1</a></li>
                                    <li><a class="dropdown-item" href="#">Feature 3.2</a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
<?php
}

function test_select_multi()
{
?>	
	<body>
		<header id="header" class="page-header">
			<h3 id="title">&nbsp;</h3>
			<h4 id="sub_title">&nbsp;</h4>
		</header>

	<div class="container-fluid">
		<div class="row">
			<div class="col">
			  Col1
			</div>
			<div class="col">
			  Col2
			</div>
			<div class="col">
			  Col3
			</div>
		</div>

		<div class="row">
			<div class="col-6">
			  Col1
			</div>
			<div class="col">
			  Col2
			</div>
			<div class="col">
			  Col3
			</div>
		</div>

	</div>
		
	<div class="container-fluid">
	<form>
		<div class="mb-3">
		<label for="exampleInputEmail1" class="form-label">Email address</label>
			<input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
			<div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
		</div>
		<div class="mb-3">
			<label for="exampleInputPassword1" class="form-label">Password</label>
			<input type="password" class="form-control" id="exampleInputPassword1">
		</div>
		<div class="mb-3 form-check">
			<input type="checkbox" class="form-check-input" id="exampleCheck1">
			<label class="form-check-label" for="exampleCheck1">Check me out</label>
		</div>
		
		<div class="mb-3">
			<label for="choix" class="form-label">Choix Multiple</label>
			<select id="choix"
					class="form-control"
					data-trigger
					name="choix"
					placeholder="This is a placeholder"
					multiple
			>
				<option value="1">One</option>
				<option value="2">Two</option>
				<option value="3">Three</option>
				<option value="4">Four</option>
				<option value="5">Five</option>
				<option value="6">Six</option>
				<option value="7">Seven</option>
			</select>
		</div>
		
		
		<button type="submit" class="btn btn-primary">Submit</button>
	</form>		
	</div>
<?php
}
?>

<?php
function test2()
{
	?>
	<div class='container well'>
		<h2 class="text-center ">Connexion Membre Club ESF</h2>
		
		<form name='connect_form' id='connect_form' class="row needs-validation" novalidate">
		
		<div class="form-group control-group">
			<label for="username2" class="form-label" >Email2</label>
			<input type="text" class="form-control" id="username2" name="username2" required>
			<div class="valid-feedback">Looks good!</div>
		</div>

		<div class="form-group control-group">
			<label for="password" class="form-label" >Mot de Passe</label>
			<input type="password" class="form-control" id="password" name="password" required>
		</div>

		<button class="btn btn-primary" type="submit">Submit form</button>

		</form>
	</div>
<?php
}

function test4()
{
?>
	<div class="container">
		<div class="mb-1">
		  <label for="exampleFormControlInput1" class="form-label">Email address</label>
		  <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
		</div>
		<div class="mb-5">
		  <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
		  <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
		</div>
		<div class="mb-3">
		  <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
		  <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
		</div>
	</div>
<?php
}

function test_form1()
{
?>
<div class="container-fluid"><form><div class="card">
		
		<div class="card-header">
            Formulaire de Saisie
        </div>	
		<div class="card-body">
	
 	<div class="row">
		<select class="col col-lg-8 offset-lg-2 mb-1" aria-label="Forme 1">
		  <option selected>Open this select menu</option>
		  <option value="1">One</option>
		  <option value="2">Two</option>
		  <option value="3">Three</option>
		</select>
	</div>

	<div class="row">
		<div class="input-group mb-3">
			<input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2">
			<span class="input-group-text" id="basic-addon2">@example.com</span>
		</div>
	</div>

	<div class="row">
		<div class="col col-lg6 form-check">
			<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
			<label class="form-check-label" for="flexCheckDefault">
				Default checkbox
			</label>
		</div>
		<div class="col col-lg6 form-check">
			<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>
			<label class="form-check-label" for="flexCheckChecked">
				Checked checkbox
			</label>
		</div>	
	</div>
	</div>
	</div>
</form></div>
<?php
}

function test_card()
{
?>
   <div class="container mt-4">
        <div class="row">
            <!-- Groupe Principal -->
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        Groupe Principal
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <!-- Sous-groupe 1 -->
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        Sous-groupe 1
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">Contenu du sous-groupe 1.</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Sous-groupe 2 -->
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        Sous-groupe 2
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">Contenu du sous-groupe 2.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Sous-groupe 3 -->
                        <div class="row">
                            <div class="col-md-12">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        Sous-groupe 3
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">Contenu du sous-groupe 3.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> <!-- Fin de la card-body du groupe principal -->
                </div>
            </div> <!-- Fin du col-md-12 -->
        </div> <!-- Fin de la row principale -->
    </div> <!-- Fin du container -->
<?php
}

class MyTest extends advPage
{
	function Title()
	{
		?>
		<title>Live</title>
		<?php
	}

	function Head()
	{
		parent::Head();
		
		?>
		<link rel="shortcut icon" href="./16x16_agil.png" />
		<link rel="icon" href="./16x16_agil.png"/>
		<?php
    }

	function Header()
	{
		?>
		<header id="header" class="page-header">
		</header>
		<?php
	}

	function Main()
	{
//		test_select_multi();
//		test4();
//		test_form1();
		test_menu();
//		test_card();
	}
	
	function Script()
    {
//		parent::Script();
		?>
		<script src="../bootstrap/v<?php echo $this->m_bootstrap_version;?>/js/bootstrap.bundle.min.js"></script>
		<script src="./js/test_formulaire.js?v1"></script>
		<script>document.addEventListener('DOMContentLoaded', function() {Init();})</script>
		<?php
	}
}

new MyTest($_GET);
?>

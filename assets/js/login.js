/* ========================================================================
   SISTEMA DE LOGIN E CADASTRO
   ======================================================================== */

/**
 * Inicialização do Sistema de Login
 */
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistemaLogin();
});


/**
 * Configuração principal do sistema
 */
function inicializarSistemaLogin() {
    // Verificar se está na página de login
    const formularioLogin = document.getElementById('formulario-login');
    const botaoCadastro = document.querySelector('.botao-cadastro-novo');
    const botaoMostrarSenha = document.querySelector('.botao-mostrar-senha');
    
    if (formularioLogin) {
        // Evento de submit do formulário de login
        formularioLogin.addEventListener('submit', handleLogin);
        
        // Botão de cadastro
        if (botaoCadastro) {
            botaoCadastro.addEventListener('click', abrirModalCadastro);
        }
        
        // Botão mostrar/ocultar senha
        if (botaoMostrarSenha) {
            botaoMostrarSenha.addEventListener('click', toggleMostrarSenha);
        }
    }
    
    // Criar modal de cadastro
    criarModalCadastro();
}


/**
 * Handle do Login
 */
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-login').value.trim();
    const senha = document.getElementById('senha-login').value;
    const lembrar = document.getElementById('lembrar-login').checked;
    
    // Validar campos
    if (!email || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
        return;
    }
    
    // Buscar usuários cadastrados
    const usuarios = obterUsuarios();
    
    // Verificar credenciais
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        // Login bem-sucedido
        const dadosSessao = {
            nome: usuario.nome,
            email: usuario.email,
            dataLogin: new Date().toISOString()
        };
        
        // Salvar sessão
        if (lembrar) {
            localStorage.setItem('sessao-cod3x', JSON.stringify(dadosSessao));
        } else {
            sessionStorage.setItem('sessao-cod3x', JSON.stringify(dadosSessao));
        }
        
        mostrarMensagem('Login realizado com sucesso! Redirecionando...', 'sucesso');
        
        // Redirecionar para o painel
        setTimeout(() => {
            window.location.href = './painel.html';
        }, 1500);
    } else {
        mostrarMensagem('E-mail ou senha incorretos!', 'erro');
    }
}


/**
 * Criar modal de cadastro
 */
function criarModalCadastro() {
    const modalHTML = `
        <div id="modal-cadastro" class="modal-overlay" style="display: none;">
            <div class="modal-container">
                <button class="modal-fechar" aria-label="Fechar modal">
                    <i class="fa-solid fa-times"></i>
                </button>
                
                <div class="modal-header">
                    <div class="modal-icone">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <h2>Criar Nova Conta</h2>
                    <p>Preencha os dados abaixo para se cadastrar</p>
                </div>
                
                <form id="formulario-cadastro" class="modal-form">
                    <div class="grupo-campo-modal">
                        <label for="nome-cadastro">
                            <i class="fa-solid fa-user"></i>
                            Nome Completo
                        </label>
                        <input 
                            type="text" 
                            id="nome-cadastro" 
                            name="nome-cadastro"
                            placeholder="Digite seu nome completo"
                            required
                            minlength="3"
                        >
                    </div>
                    
                    <div class="grupo-campo-modal">
                        <label for="email-cadastro">
                            <i class="fa-solid fa-envelope"></i>
                            E-mail
                        </label>
                        <input 
                            type="email" 
                            id="email-cadastro" 
                            name="email-cadastro"
                            placeholder="Digite seu e-mail"
                            required
                        >
                    </div>
                    
                    <div class="grupo-campo-modal">
                        <label for="senha-cadastro">
                            <i class="fa-solid fa-lock"></i>
                            Senha
                        </label>
                        <div class="container-senha-modal">
                            <input 
                                type="password" 
                                id="senha-cadastro" 
                                name="senha-cadastro"
                                placeholder="Digite sua senha (mín. 8 caracteres)"
                                required
                                minlength="8"
                            >
                            <button type="button" class="botao-mostrar-senha-modal" aria-label="Mostrar senha">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="grupo-campo-modal">
                        <label for="confirmar-senha-cadastro">
                            <i class="fa-solid fa-lock"></i>
                            Confirmar Senha
                        </label>
                        <div class="container-senha-modal">
                            <input 
                                type="password" 
                                id="confirmar-senha-cadastro" 
                                name="confirmar-senha-cadastro"
                                placeholder="Confirme sua senha"
                                required
                                minlength="8"
                            >
                            <button type="button" class="botao-mostrar-senha-modal" aria-label="Mostrar senha">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" class="botao-cadastrar-modal">
                        <i class="fa-solid fa-user-plus"></i>
                        Criar Conta
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar eventos ao modal
    const modal = document.getElementById('modal-cadastro');
    const btnFechar = modal.querySelector('.modal-fechar');
    const formCadastro = document.getElementById('formulario-cadastro');
    const btnsMostrarSenha = modal.querySelectorAll('.botao-mostrar-senha-modal');
    
    btnFechar.addEventListener('click', fecharModalCadastro);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModalCadastro();
    });
    
    formCadastro.addEventListener('submit', handleCadastro);
    
    // Botões mostrar senha no modal
    btnsMostrarSenha.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}


/**
 * Abrir modal de cadastro
 */
function abrirModalCadastro(event) {
    event.preventDefault();
    const modal = document.getElementById('modal-cadastro');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('nome-cadastro').focus();
    }, 100);
}


/**
 * Fechar modal de cadastro
 */
function fecharModalCadastro() {
    const modal = document.getElementById('modal-cadastro');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Limpar formulário
    document.getElementById('formulario-cadastro').reset();
}


/**
 * Handle do Cadastro
 */
function handleCadastro(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome-cadastro').value.trim();
    const email = document.getElementById('email-cadastro').value.trim();
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha-cadastro').value;
    
    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
        return;
    }
    
    if (nome.length < 3) {
        mostrarMensagem('Nome deve ter no mínimo 3 caracteres!', 'erro');
        return;
    }
    
    if (senha.length < 8) {
        mostrarMensagem('Senha deve ter no mínimo 8 caracteres!', 'erro');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem!', 'erro');
        return;
    }
    
    // Verificar se o e-mail já existe
    const usuarios = obterUsuarios();
    const emailExiste = usuarios.some(u => u.email === email);
    
    if (emailExiste) {
        mostrarMensagem('Este e-mail já está cadastrado!', 'erro');
        return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
        id: Date.now(),
        nome: nome,
        email: email,
        senha: senha,
        dataCadastro: new Date().toISOString()
    };
    
    // Adicionar aos usuários
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios-cod3x', JSON.stringify(usuarios));
    
    mostrarMensagem('Cadastro realizado com sucesso! Você já pode fazer login.', 'sucesso');
    
    // Fechar modal após 2 segundos
    setTimeout(() => {
        fecharModalCadastro();
        
        // Preencher o campo de email automaticamente
        document.getElementById('email-login').value = email;
        document.getElementById('senha-login').focus();
    }, 2000);
}


/**
 * Obter usuários cadastrados
 */
function obterUsuarios() {
    const usuarios = localStorage.getItem('usuarios-cod3x');
    return usuarios ? JSON.parse(usuarios) : [];
}


/**
 * Toggle mostrar/ocultar senha
 */
function toggleMostrarSenha() {
    const input = document.getElementById('senha-login');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        this.setAttribute('aria-pressed', 'true');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        this.setAttribute('aria-pressed', 'false');
    }
}


/**
 * Mostrar mensagem de feedback
 */
function mostrarMensagem(texto, tipo) {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem-feedback');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    // Criar nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-feedback mensagem-${tipo}`;
    mensagem.innerHTML = `
        <i class="fa-solid ${tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${texto}</span>
    `;
    
    // Adicionar ao formulário
    const form = document.getElementById('formulario-login') || document.getElementById('formulario-cadastro');
    form.insertBefore(mensagem, form.firstChild);
    
    // Animar entrada
    setTimeout(() => mensagem.classList.add('ativa'), 10);
    
    // Remover após 5 segundos
    setTimeout(() => {
        mensagem.classList.remove('ativa');
        setTimeout(() => mensagem.remove(), 300);
    }, 5000);
}


/**
 * Tecla ESC para fechar modal
 */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal-cadastro');
        if (modal && modal.style.display === 'flex') {
            fecharModalCadastro();
        }
    }
});

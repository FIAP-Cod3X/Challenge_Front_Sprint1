/* ========================================================================
   SISTEMA DE LOGIN E CADASTRO
   ======================================================================== */

// ========================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ========================================
const VALIDACAO_CONFIG = {
    nome: {
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        mensagens: {
            required: 'O nome é obrigatório',
            minLength: 'O nome deve ter no mínimo 3 caracteres',
            maxLength: 'O nome deve ter no máximo 100 caracteres',
            pattern: 'O nome deve conter apenas letras e espaços'
        }
    },
    email: {
        pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        mensagens: {
            required: 'O e-mail é obrigatório',
            pattern: 'Digite um e-mail válido (exemplo: usuario@email.com)'
        }
    },
    senha: {
        minLength: 8,
        maxLength: 50,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        mensagens: {
            required: 'A senha é obrigatória',
            minLength: 'A senha deve ter no mínimo 8 caracteres',
            maxLength: 'A senha deve ter no máximo 50 caracteres',
            pattern: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
            match: 'As senhas não coincidem'
        }
    }
};

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
    
    // Limpa mensagens de erro anteriores
    limparErrosValidacao();
    
    const email = document.getElementById('email-login').value.trim();
    const senha = document.getElementById('senha-login').value;
    const lembrar = document.getElementById('lembrar-login').checked;
    
    // Validações
    let valido = true;
    
    // Valida e-mail
    if (!validarCampo('email', email, 'email-login')) {
        valido = false;
    }
    
    // Valida senha (apenas obrigatório no login)
    if (!senha) {
        mostrarErroValidacao('senha-login', 'A senha é obrigatória');
        valido = false;
    }
    
    if (!valido) {
        mostrarMensagem('Por favor, corrija os erros no formulário', 'erro');
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
async function fecharModalCadastro() {
    const modal = document.getElementById('modal-cadastro');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Limpar formulário
    document.getElementById('formulario-cadastro').reset();
}


/**
 * Handle do Cadastro
 */
async function handleCadastro(event) {
    event.preventDefault();
    
    // Limpa mensagens de erro anteriores
    limparErrosValidacao();
    
    const nome = document.getElementById('nome-cadastro').value.trim();
    const email = document.getElementById('email-cadastro').value.trim();
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha-cadastro').value;
    
    // Validações
    let valido = true;
    
    // Valida nome
    if (!validarCampo('nome', nome, 'nome-cadastro')) {
        valido = false;
    }
    
    // Valida e-mail
    if (!validarCampo('email', email, 'email-cadastro')) {
        valido = false;
    }
    
    // Valida senha
    if (!validarCampo('senha', senha, 'senha-cadastro')) {
        valido = false;
    }
    
    // Valida confirmação de senha
    if (!confirmarSenha) {
        mostrarErroValidacao('confirmar-senha-cadastro', 'A confirmação de senha é obrigatória');
        valido = false;
    } else if (senha !== confirmarSenha) {
        mostrarErroValidacao('confirmar-senha-cadastro', VALIDACAO_CONFIG.senha.mensagens.match);
        valido = false;
    }
    
    if (!valido) {
        mostrarMensagem('Por favor, corrija os erros no formulário', 'erro');
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
    
        await fecharModalCadastro();
        
        // Preencher o campo de email automaticamente
        document.getElementById('email-login').value = email;
        document.getElementById('senha-login').focus();
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


// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

/**
 * Valida um campo específico
 * @param {string} tipo - Tipo do campo (nome, email, senha)
 * @param {string} valor - Valor do campo
 * @param {string} campoId - ID do elemento do campo
 * @returns {boolean} - true se válido
 */
function validarCampo(tipo, valor, campoId) {
    const config = VALIDACAO_CONFIG[tipo];
    
    // Verifica se é obrigatório
    if (!valor) {
        mostrarErroValidacao(campoId, config.mensagens.required);
        return false;
    }
    
    // Valida tamanho mínimo
    if (config.minLength && valor.length < config.minLength) {
        mostrarErroValidacao(campoId, config.mensagens.minLength);
        return false;
    }
    
    // Valida tamanho máximo
    if (config.maxLength && valor.length > config.maxLength) {
        mostrarErroValidacao(campoId, config.mensagens.maxLength);
        return false;
    }
    
    // Valida padrão (regex)
    if (config.pattern && !config.pattern.test(valor)) {
        mostrarErroValidacao(campoId, config.mensagens.pattern);
        return false;
    }
    
    // Remove erro se existir
    removerErroValidacao(campoId);
    return true;
}


/**
 * Mostra erro de validação em um campo
 * @param {string} campoId - ID do campo
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErroValidacao(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    // Adiciona classe de erro ao campo
    campo.classList.add('campo-erro');
    campo.setAttribute('aria-invalid', 'true');
    
    // Verifica se já existe mensagem de erro
    let mensagemErro = campo.parentElement.querySelector('.mensagem-erro-campo');
    
    if (!mensagemErro) {
        // Cria elemento de mensagem de erro
        mensagemErro = document.createElement('span');
        mensagemErro.className = 'mensagem-erro-campo';
        mensagemErro.setAttribute('role', 'alert');
        
        // Insere após o campo (ou após o container de senha se existir)
        const container = campo.closest('.container-senha, .container-senha-modal');
        if (container) {
            container.parentElement.appendChild(mensagemErro);
        } else {
            campo.parentElement.appendChild(mensagemErro);
        }
    }
    
    mensagemErro.textContent = mensagem;
    
    // Adiciona animação
    mensagemErro.style.animation = 'slideInDown 0.3s ease';
}


/**
 * Remove erro de validação de um campo
 * @param {string} campoId - ID do campo
 */
function removerErroValidacao(campoId) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    // Remove classe de erro
    campo.classList.remove('campo-erro');
    campo.removeAttribute('aria-invalid');
    
    // Remove mensagem de erro
    const container = campo.closest('.container-senha, .container-senha-modal');
    const parent = container ? container.parentElement : campo.parentElement;
    const mensagemErro = parent.querySelector('.mensagem-erro-campo');
    
    if (mensagemErro) {
        mensagemErro.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => mensagemErro.remove(), 300);
    }
}


/**
 * Limpa todos os erros de validação
 */
function limparErrosValidacao() {
    // Remove classes de erro
    document.querySelectorAll('.campo-erro').forEach(campo => {
        campo.classList.remove('campo-erro');
        campo.removeAttribute('aria-invalid');
    });
    
    // Remove mensagens de erro
    document.querySelectorAll('.mensagem-erro-campo').forEach(msg => {
        msg.remove();
    });
}


/**
 * Adiciona validação em tempo real aos campos
 */
function adicionarValidacaoTempoReal() {
    // E-mail login
    const emailLogin = document.getElementById('email-login');
    if (emailLogin) {
        emailLogin.addEventListener('blur', function() {
            if (this.value.trim()) {
                validarCampo('email', this.value.trim(), 'email-login');
            }
        });
        emailLogin.addEventListener('input', function() {
            if (this.classList.contains('campo-erro')) {
                removerErroValidacao('email-login');
            }
        });
    }
    
    // Campos do modal de cadastro (serão adicionados quando o modal for criado)
    document.addEventListener('focus', function(e) {
        if (e.target.matches('#nome-cadastro, #email-cadastro, #senha-cadastro, #confirmar-senha-cadastro')) {
            e.target.addEventListener('blur', validarCampoTempoReal, { once: true });
            e.target.addEventListener('input', removerErroTempoReal);
        }
    }, true);
}


/**
 * Valida campo em tempo real (no blur)
 */
function validarCampoTempoReal(event) {
    const campo = event.target;
    const valor = campo.value.trim();
    
    if (!valor) return; // Não valida campo vazio no blur
    
    if (campo.id === 'nome-cadastro') {
        validarCampo('nome', valor, 'nome-cadastro');
    } else if (campo.id === 'email-cadastro') {
        validarCampo('email', valor, 'email-cadastro');
    } else if (campo.id === 'senha-cadastro') {
        validarCampo('senha', valor, 'senha-cadastro');
    } else if (campo.id === 'confirmar-senha-cadastro') {
        const senha = document.getElementById('senha-cadastro').value;
        if (valor !== senha) {
            mostrarErroValidacao('confirmar-senha-cadastro', VALIDACAO_CONFIG.senha.mensagens.match);
        }
    }
}


/**
 * Remove erro em tempo real (no input)
 */
function removerErroTempoReal(event) {
    const campo = event.target;
    if (campo.classList.contains('campo-erro')) {
        removerErroValidacao(campo.id);
    }
}


// Adiciona validação em tempo real quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    adicionarValidacaoTempoReal();
});

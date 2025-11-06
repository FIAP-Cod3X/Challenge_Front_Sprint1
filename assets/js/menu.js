/* ========================================================================
   NAVBAR - MENU HAMBURGUER RESPONSIVO
   ======================================================================== */

/**
 * Inicialização do Menu Hamburguer
 * Executa quando o DOM estiver completamente carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    inicializarMenuHamburguer();
});


/**
 * Configuração principal do menu hamburguer
 */
function inicializarMenuHamburguer() {
    // Criar botão hamburguer
    criarBotaoHamburguer();
    
    // Criar overlay de fundo
    criarOverlay();
    
    // Configurar event listeners
    configurarEventos();
    
    // Configurar acessibilidade
    configurarAcessibilidade();
}


/**
 * Cria o botão hamburguer e adiciona ao cabeçalho
 */
function criarBotaoHamburguer() {
    const cabecalho = document.querySelector('.secao-navegacao');
    const menuNavegacao = document.querySelector('.menu-navegacao');
    const botoesAutenticacao = document.querySelector('.botoes-autenticacao');
    
    if (!cabecalho || !menuNavegacao) return;
    
    // Verifica se o botão já existe
    if (document.querySelector('.botao-menu-hamburguer')) return;
    
    // Criar estrutura do botão
    const botao = document.createElement('button');
    botao.className = 'botao-menu-hamburguer';
    botao.setAttribute('aria-label', 'Abrir menu de navegação');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'menu-principal');
    
    // Adicionar as 3 linhas do hamburguer
    for (let i = 0; i < 3; i++) {
        const linha = document.createElement('span');
        linha.className = 'linha-hamburguer';
        linha.setAttribute('aria-hidden', 'true');
        botao.appendChild(linha);
    }
    
    // Adicionar ID ao menu para acessibilidade
    menuNavegacao.setAttribute('id', 'menu-principal');
    
    // Inserir botão DEPOIS dos botões de autenticação (no final do nav)
    if (botoesAutenticacao) {
        // Insere depois do elemento de autenticação
        botoesAutenticacao.insertAdjacentElement('afterend', botao);
    } else {
        // Fallback: insere no final do nav
        cabecalho.appendChild(botao);
    }
}


/**
 * Cria o overlay de fundo escuro
 */
function criarOverlay() {
    // Verifica se o overlay já existe
    if (document.querySelector('.overlay-menu')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay-menu';
    overlay.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(overlay);
}


/**
 * Configura todos os event listeners necessários
 */
function configurarEventos() {
    const botao = document.querySelector('.botao-menu-hamburguer');
    const overlay = document.querySelector('.overlay-menu');
    const menu = document.querySelector('.menu-navegacao');
    
    if (!botao || !overlay || !menu) return;
    
    // Click no botão hamburguer
    botao.addEventListener('click', toggleMenu);
    
    // Click no overlay para fechar
    overlay.addEventListener('click', fecharMenu);
    
    // Click nos links do menu para fechar
    const links = menu.querySelectorAll('.links-navegacao');
    links.forEach(link => {
        link.addEventListener('click', fecharMenu);
    });
    
    // Tecla ESC para fechar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharMenu();
        }
    });
    
    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1300) {
            fecharMenu();
        }
    });
}


/**
 * Alterna entre abrir e fechar o menu
 */
function toggleMenu() {
    const botao = document.querySelector('.botao-menu-hamburguer');
    const menu = document.querySelector('.menu-navegacao');
    const overlay = document.querySelector('.overlay-menu');
    
    const estaAberto = botao.classList.contains('ativo');
    
    if (estaAberto) {
        fecharMenu();
    } else {
        abrirMenu();
    }
}


/**
 * Abre o menu mobile
 */
function abrirMenu() {
    const botao = document.querySelector('.botao-menu-hamburguer');
    const menu = document.querySelector('.menu-navegacao');
    const overlay = document.querySelector('.overlay-menu');
    
    // Adicionar classes ativas
    botao.classList.add('ativo');
    menu.classList.add('mobile-ativo');
    overlay.classList.add('ativo');
    document.body.classList.add('menu-aberto');
    
    // Atualizar atributos de acessibilidade
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu de navegação');
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
    
    // Focar no primeiro link do menu
    setTimeout(() => {
        const primeiroLink = menu.querySelector('.links-navegacao');
        if (primeiroLink) {
            primeiroLink.focus();
        }
    }, 100);
}


/**
 * Fecha o menu mobile
 */
function fecharMenu() {
    const botao = document.querySelector('.botao-menu-hamburguer');
    const menu = document.querySelector('.menu-navegacao');
    const overlay = document.querySelector('.overlay-menu');
    
    if (!botao || !menu || !overlay) return;
    
    // Remover classes ativas
    botao.classList.remove('ativo');
    menu.classList.remove('mobile-ativo');
    overlay.classList.remove('ativo');
    document.body.classList.remove('menu-aberto');
    
    // Atualizar atributos de acessibilidade
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu de navegação');
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
    
    // Retornar foco ao botão
    botao.focus();
}


/**
 * Configura navegação por teclado e outras funcionalidades de acessibilidade
 */
function configurarAcessibilidade() {
    const menu = document.querySelector('.menu-navegacao');
    
    if (!menu) return;
    
    // Navegação por TAB dentro do menu
    menu.addEventListener('keydown', function(e) {
        const links = Array.from(menu.querySelectorAll('.links-navegacao'));
        const primeiroLink = links[0];
        const ultimoLink = links[links.length - 1];
        
        // Se TAB no último link, volta para o primeiro
        if (e.key === 'Tab' && !e.shiftKey && document.activeElement === ultimoLink) {
            e.preventDefault();
            primeiroLink.focus();
        }
        
        // Se SHIFT+TAB no primeiro link, vai para o último
        if (e.key === 'Tab' && e.shiftKey && document.activeElement === primeiroLink) {
            e.preventDefault();
            ultimoLink.focus();
        }
    });
}


/**
 * Utilitário: Verifica se o dispositivo é mobile/tablet
 */
function isMobile() {
    return window.innerWidth < 1300;
}
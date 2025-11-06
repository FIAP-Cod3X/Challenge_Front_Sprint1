/**
 * ============================================================================
 * POPUP DE PESQUISA EM DESENVOLVIMENTO
 * ============================================================================
 * Sistema de notificação para funcionalidade de pesquisa em desenvolvimento
 * Exibe popup responsivo com animações suaves e identidade visual do site
 */

(function() {
    'use strict';

    /**
     * Cria e injeta o HTML do popup no DOM
     */
    function criarPopup() {
        const popupHTML = `
            <div class="popup-overlay" id="popup-pesquisa" role="dialog" aria-labelledby="popup-titulo" aria-modal="true">
                <div class="popup-container">
                    <button class="popup-fechar" id="fechar-popup" aria-label="Fechar popup">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                    
                    <div class="popup-icone">
                        <i class="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i>
                    </div>
                    
                    <h2 id="popup-titulo" class="popup-titulo">Funcionalidade em Desenvolvimento</h2>
                    
                    <p class="popup-texto">
                        Estamos trabalhando duro para trazer a melhor experiência de pesquisa para você! 
                        Em breve, você poderá buscar por conteúdos, dentistas voluntários, FAQs e muito mais.
                    </p>
                    
                    <div class="popup-detalhes">
                        <div class="detalhe-item">
                            <i class="fa-solid fa-rocket" aria-hidden="true"></i>
                            <span>Lançamento em breve</span>
                        </div>
                        <div class="detalhe-item">
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <span>Busca inteligente</span>
                        </div>
                        <div class="detalhe-item">
                            <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                            <span>Resultados rápidos</span>
                        </div>
                    </div>
                    
                    <button class="popup-botao" id="popup-entendido">
                        Entendido!
                    </button>
                </div>
            </div>
        `;

        // Injeta o popup no final do body
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    /**
     * Abre o popup com animação
     */
    function abrirPopup() {
        const popup = document.getElementById('popup-pesquisa');
        if (!popup) return;

        popup.classList.add('ativo');
        document.body.style.overflow = 'hidden'; // Previne scroll da página

        // Foca no botão de fechar para acessibilidade
        setTimeout(() => {
            const botaoFechar = document.getElementById('fechar-popup');
            if (botaoFechar) botaoFechar.focus();
        }, 100);

        // Adiciona evento de ESC para fechar
        document.addEventListener('keydown', handleEscKey);
    }

    /**
     * Fecha o popup com animação
     */
    function fecharPopup() {
        const popup = document.getElementById('popup-pesquisa');
        if (!popup) return;

        popup.classList.remove('ativo');
        document.body.style.overflow = ''; // Restaura scroll da página

        // Remove evento de ESC
        document.removeEventListener('keydown', handleEscKey);

        // Retorna foco para o input de busca
        const inputBusca = document.getElementById('input-busca');
        if (inputBusca) {
            setTimeout(() => inputBusca.focus(), 300);
        }
    }

    /**
     * Handler para tecla ESC
     */
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            fecharPopup();
        }
    }

    /**
     * Configura os event listeners do popup
     */
    function configurarEventListeners() {
        // Botão de fechar (X)
        const botaoFechar = document.getElementById('fechar-popup');
        if (botaoFechar) {
            botaoFechar.addEventListener('click', fecharPopup);
        }

        // Botão "Entendido"
        const botaoEntendido = document.getElementById('popup-entendido');
        if (botaoEntendido) {
            botaoEntendido.addEventListener('click', fecharPopup);
        }

        // Clique no overlay (fora do popup)
        const overlay = document.getElementById('popup-pesquisa');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    fecharPopup();
                }
            });
        }

        // Trap do foco dentro do popup para acessibilidade
        configurarFocusTrap();
    }

    /**
     * Configura trap de foco para acessibilidade
     */
    function configurarFocusTrap() {
        const popup = document.getElementById('popup-pesquisa');
        if (!popup) return;

        popup.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;

            const focusableElements = popup.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Shift + Tab no primeiro elemento -> vai para o último
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
            // Tab no último elemento -> vai para o primeiro
            else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });
    }

    /**
     * Inicializa o sistema de popup de pesquisa
     */
    function inicializar() {
        const formularioPesquisa = document.querySelector('.barra-pesquisa');
        const inputPesquisa = document.getElementById('input-busca');

        if (!formularioPesquisa || !inputPesquisa) {
            console.warn('Elementos de pesquisa não encontrados');
            return;
        }

        // Cria o popup no DOM
        criarPopup();

        // Configura os event listeners do popup
        configurarEventListeners();

        // Evento de submit do formulário
        formularioPesquisa.addEventListener('submit', function(e) {
            e.preventDefault(); // Previne o envio do formulário
            abrirPopup();
        });

        // Evento adicional: Enter no input de pesquisa
        inputPesquisa.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                abrirPopup();
            }
        });

        // Evento do botão de lupa (clique direto)
        const botaoPesquisa = formularioPesquisa.querySelector('button[type="submit"]');
        if (botaoPesquisa) {
            botaoPesquisa.addEventListener('click', function(e) {
                e.preventDefault();
                abrirPopup();
            });
        }
    }

    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();

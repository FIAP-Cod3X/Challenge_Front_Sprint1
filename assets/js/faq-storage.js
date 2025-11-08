/* ========================================================================
   FAQ STORAGE - LOCAL STORAGE MANAGER
   Gerencia o salvamento de perguntas do FAQ no localStorage
   ======================================================================== */

(function() {
    'use strict';

    // ========================================
    // CONFIGURAÇÕES
    // ========================================
    const STORAGE_KEY = 'cod3x_faq_perguntas';
    const MAX_PERGUNTAS = 100; // Limite de perguntas armazenadas


    // ========================================
    // FUNÇÕES DE STORAGE
    // ========================================

    /**
     * Obtém todas as perguntas do localStorage
     * @returns {Array} Array de objetos com as perguntas
     */
    function obterPerguntas() {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            return dados ? JSON.parse(dados) : [];
        } catch (error) {
            console.error('Erro ao obter perguntas do localStorage:', error);
            return [];
        }
    }


    /**
     * Salva uma nova pergunta no localStorage
     * @param {Object} pergunta - Objeto com os dados da pergunta
     * @returns {boolean} - true se salvou com sucesso
     */
    function salvarPergunta(pergunta) {
        try {
            const perguntas = obterPerguntas();
            
            // Adiciona ID único e timestamp
            pergunta.id = gerarId();
            pergunta.dataEnvio = new Date().toISOString();
            pergunta.status = 'pendente'; // pendente, respondida, arquivada
            
            // Adiciona no início do array (mais recente primeiro)
            perguntas.unshift(pergunta);
            
            // Limita o número de perguntas armazenadas
            if (perguntas.length > MAX_PERGUNTAS) {
                perguntas.pop(); // Remove a mais antiga
            }
            
            // Salva no localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(perguntas));
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar pergunta:', error);
            
            // Se erro de quota excedida
            if (error.name === 'QuotaExceededError') {
                alert('Limite de armazenamento atingido. Algumas perguntas antigas serão removidas.');
                limparPerguntasAntigas();
                return salvarPergunta(pergunta); // Tenta novamente
            }
            
            return false;
        }
    }


    /**
     * Gera um ID único para a pergunta
     * @returns {string} ID único
     */
    function gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }


    /**
     * Remove as 10 perguntas mais antigas
     */
    function limparPerguntasAntigas() {
        try {
            const perguntas = obterPerguntas();
            const perguntasRecentes = perguntas.slice(0, -10);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(perguntasRecentes));
        } catch (error) {
            console.error('Erro ao limpar perguntas antigas:', error);
        }
    }


    /**
     * Limpa todas as perguntas do localStorage
     */
    function limparTodasPerguntas() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Erro ao limpar perguntas:', error);
            return false;
        }
    }


    /**
     * Exporta perguntas para JSON (download)
     */
    function exportarPerguntas() {
        try {
            const perguntas = obterPerguntas();
            const dataStr = JSON.stringify(perguntas, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cod3x-faq-perguntas-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar perguntas:', error);
            return false;
        }
    }


    // ========================================
    // INICIALIZAÇÃO DO FORMULÁRIO
    // ========================================

    function inicializarFormulario() {
        console.log('FAQ Storage: Inicializando...');
        const formulario = document.getElementById('formulario-duvidas');
        
        if (!formulario) {
            console.log('FAQ Storage: Formulário não encontrado');
            return; // Não está na página do FAQ
        }

        console.log('FAQ Storage: Formulário encontrado, adicionando listener');

        // Intercepta o envio do formulário
        formulario.addEventListener('submit', function(evento) {
            console.log('FAQ Storage: Formulário enviado!');
            evento.preventDefault(); // Previne envio padrão
            
            // Coleta os dados do formulário
            const dados = {
                nome: document.getElementById('nome-completo').value.trim(),
                email: document.getElementById('email').value.trim(),
                categoria: document.getElementById('categoria-duvida').value,
                assunto: document.getElementById('assunto').value.trim(),
                mensagem: document.getElementById('mensagem').value.trim(),
                receberNovidades: document.getElementById('receber-novidades').checked
            };
            
            // Validação básica
            if (!dados.nome || !dados.email || !dados.categoria || !dados.assunto || !dados.mensagem) {
                mostrarNotificacao('Por favor, preencha todos os campos obrigatórios.', 'erro');
                return;
            }
            
            // Salva no localStorage
            const sucesso = salvarPergunta(dados);
            
            if (sucesso) {
                mostrarNotificacao('Sua dúvida foi salva com sucesso! Você pode visualizá-la na página de Relatórios.', 'sucesso');
                
                // Limpa o formulário
                formulario.reset();
                
                // Atualiza o badge de contador imediatamente
                atualizarContadorPerguntas();
                
                // Opcional: Redireciona para página de relatório após 2 segundos
                setTimeout(() => {
                    if (confirm('Deseja visualizar o relatório de perguntas agora?')) {
                        window.location.href = './relatorio-faq.html';
                    }
                }, 1500);
            } else {
                mostrarNotificacao('Erro ao salvar sua dúvida. Tente novamente.', 'erro');
            }
        });
        
        // Adiciona contador de perguntas salvas
        exibirContadorPerguntas();
    }


    /**
     * Exibe notificação para o usuário
     */
    function mostrarNotificacao(mensagem, tipo = 'info') {
        // Cria o elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-faq notificacao-${tipo}`;
        notificacao.innerHTML = `
            <i class="fa-solid fa-${tipo === 'sucesso' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        // Adiciona estilos inline (responsividade via CSS)
        notificacao.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            left: auto;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: ${tipo === 'sucesso' ? '#28a745' : '#dc3545'};
            color: white;
            font-family: 'Open Sans', Arial, sans-serif;
            font-size: 0.95rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            animation: slideInRight 0.3s ease;
            max-width: 90vw;
        `;
        
        // Ajuste responsivo para mobile
        if (window.innerWidth <= 425) {
            notificacao.style.cssText += `
                top: 1rem;
                right: 1rem;
                left: 1rem;
                padding: 0.8rem 1rem;
                font-size: 0.85rem;
                gap: 0.6rem;
                max-width: calc(100vw - 2rem);
            `;
        }
        
        document.body.appendChild(notificacao);
        
        // Remove após 5 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }, 5000);
    }


    /**
     * Exibe contador de perguntas salvas
     */
    function exibirContadorPerguntas() {
        const perguntas = obterPerguntas();
        const contador = perguntas.length;
        
        if (contador === 0) return;
        
        // Cria badge de contador
        const badge = document.createElement('div');
        badge.className = 'badge-contador-faq';
        badge.id = 'badge-contador-faq'; // Adiciona ID para fácil referência
        badge.innerHTML = `
            <i class="fa-solid fa-question-circle"></i>
            <span>${contador} pergunta${contador !== 1 ? 's' : ''} salva${contador !== 1 ? 's' : ''}</span>
            <a href="./relatorio-faq.html" class="link-visualizar">Ver Relatório →</a>
        `;
        
        badge.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            left: auto;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: linear-gradient(135deg, #96ac3f, #7a8f35);
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            box-shadow: 0 4px 15px rgba(150, 172, 63, 0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex-wrap: wrap;
            max-width: 90vw;
            animation: slideInUp 0.4s ease;
        `;
        
        // Ajuste responsivo para mobile
        if (window.innerWidth <= 425) {
            badge.style.cssText += `
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
                padding: 0.8rem 1rem;
                font-size: 0.85rem;
                gap: 0.5rem;
                justify-content: center;
                text-align: center;
                max-width: calc(100vw - 2rem);
            `;
        }
        
        const linkVisualizar = badge.querySelector('.link-visualizar');
        linkVisualizar.style.cssText = `
            color: white;
            text-decoration: underline;
            font-weight: 600;
            margin-left: 0.5rem;
        `;
        
        // Ajuste do link no mobile
        if (window.innerWidth <= 425) {
            linkVisualizar.style.cssText += `
                margin-left: 0;
                width: 100%;
                text-align: center;
                font-size: 0.85rem;
            `;
        }
        
        document.body.appendChild(badge);
    }


    /**
     * Atualiza o contador de perguntas dinamicamente
     */
    function atualizarContadorPerguntas() {
        console.log('FAQ Storage: Atualizando contador de perguntas...');
        const perguntas = obterPerguntas();
        const contador = perguntas.length;
        console.log(`FAQ Storage: Total de perguntas: ${contador}`);
        
        // Remove badge antigo se existir
        const badgeAntigo = document.getElementById('badge-contador-faq');
        if (badgeAntigo) {
            console.log('FAQ Storage: Removendo badge antigo...');
            // Animação de saída suave
            badgeAntigo.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => badgeAntigo.remove(), 300);
        }
        
        // Se não há perguntas, não mostra o badge
        if (contador === 0) return;
        
        // Aguarda a animação de saída antes de criar novo badge
        setTimeout(() => {
            // Cria novo badge com contador atualizado
            exibirContadorPerguntas();
            
            // Adiciona efeito de destaque no novo badge
            const novoBadge = document.getElementById('badge-contador-faq');
            if (novoBadge) {
                novoBadge.style.animation = 'slideInUp 0.4s ease, pulseAttention 0.6s ease 0.5s';
            }
        }, badgeAntigo ? 300 : 0);
    }


    // ========================================
    // EXPOR FUNÇÕES GLOBALMENTE
    // ========================================
    window.FAQStorage = {
        obterPerguntas,
        salvarPergunta,
        limparTodasPerguntas,
        exportarPerguntas
    };


    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    document.addEventListener('DOMContentLoaded', inicializarFormulario);

})();

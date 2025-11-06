/* ========================================================================
   RELATÓRIO FAQ - GERENCIAMENTO E VISUALIZAÇÃO
   Carrega e exibe as perguntas salvas no localStorage
   ======================================================================== */

(function() {
    'use strict';

    // ========================================
    // VARIÁVEIS GLOBAIS
    // ========================================
    let perguntasOriginais = [];
    let perguntasFiltradas = [];


    // ========================================
    // FUNÇÕES DE EXIBIÇÃO
    // ========================================

    /**
     * Carrega e exibe as perguntas
     */
    function carregarPerguntas() {
        console.log('Relatório FAQ: Iniciando carregamento...');
        
        // Obtém perguntas do localStorage via FAQStorage
        if (typeof window.FAQStorage === 'undefined') {
            console.error('FAQStorage não está disponível');
            exibirMensagemVazia();
            return;
        }

        perguntasOriginais = window.FAQStorage.obterPerguntas();
        console.log('Perguntas carregadas:', perguntasOriginais.length);
        perguntasFiltradas = [...perguntasOriginais];

        atualizarContadorTotal();
        exibirPerguntas();
    }


    /**
     * Atualiza o contador total de perguntas
     */
    function atualizarContadorTotal() {
        const totalElement = document.querySelector('.total-perguntas');
        const total = perguntasFiltradas.length;
        
        if (totalElement) {
            totalElement.textContent = `${total} pergunta${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}`;
        }
    }


    /**
     * Exibe as perguntas na página
     */
    function exibirPerguntas() {
        const container = document.getElementById('lista-perguntas');
        const mensagemVazia = document.getElementById('mensagem-vazia');

        if (perguntasFiltradas.length === 0) {
            container.style.display = 'none';
            mensagemVazia.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        mensagemVazia.style.display = 'none';

        // Limpa o container
        container.innerHTML = '';

        // Cria um card para cada pergunta
        perguntasFiltradas.forEach((pergunta, index) => {
            const card = criarCardPergunta(pergunta, index);
            container.appendChild(card);
        });
    }


    /**
     * Cria um card HTML para uma pergunta
     */
    function criarCardPergunta(pergunta, index) {
        const card = document.createElement('article');
        card.className = 'card-pergunta';
        card.setAttribute('aria-label', `Pergunta ${index + 1}`);

        // Formata a data
        const dataFormatada = formatarData(pergunta.dataEnvio);

        // Cria o HTML do card
        card.innerHTML = `
            <div class="card-cabecalho">
                <div class="info-usuario">
                    <h3 class="nome-usuario">${escapeHtml(pergunta.nome)}</h3>
                    <p class="email-usuario">
                        <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                        ${escapeHtml(pergunta.email)}
                    </p>
                </div>
                <span class="badge-categoria">${formatarCategoria(pergunta.categoria)}</span>
            </div>

            <div class="card-corpo">
                <h4 class="assunto-pergunta">
                    <i class="fa-solid fa-comment-dots" aria-hidden="true"></i>
                    ${escapeHtml(pergunta.assunto)}
                </h4>
                <p class="mensagem-pergunta">${escapeHtml(pergunta.mensagem)}</p>
            </div>

            <div class="card-rodape">
                <span class="data-envio">
                    <i class="fa-solid fa-clock" aria-hidden="true"></i>
                    ${dataFormatada}
                </span>
                ${pergunta.receberNovidades ? `
                    <span class="badge-novidades">
                        <i class="fa-solid fa-bell" aria-hidden="true"></i>
                        Quer receber novidades
                    </span>
                ` : ''}
            </div>
        `;

        return card;
    }


    /**
     * Exibe mensagem quando não há perguntas
     */
    function exibirMensagemVazia() {
        const container = document.getElementById('lista-perguntas');
        const mensagemVazia = document.getElementById('mensagem-vazia');

        container.style.display = 'none';
        mensagemVazia.style.display = 'block';
    }


    // ========================================
    // FUNÇÕES DE FILTRO
    // ========================================

    /**
     * Aplica filtros nas perguntas
     */
    function aplicarFiltros() {
        const categoria = document.getElementById('filtro-categoria').value;
        const busca = document.getElementById('filtro-busca').value.toLowerCase();

        perguntasFiltradas = perguntasOriginais.filter(pergunta => {
            // Filtro por categoria
            const matchCategoria = !categoria || pergunta.categoria === categoria;

            // Filtro por busca (nome, email ou assunto)
            const matchBusca = !busca || 
                pergunta.nome.toLowerCase().includes(busca) ||
                pergunta.email.toLowerCase().includes(busca) ||
                pergunta.assunto.toLowerCase().includes(busca) ||
                pergunta.mensagem.toLowerCase().includes(busca);

            return matchCategoria && matchBusca;
        });

        atualizarContadorTotal();
        exibirPerguntas();
    }


    // ========================================
    // FUNÇÕES DE AÇÕES
    // ========================================

    /**
     * Exporta perguntas para JSON
     */
    function exportarPerguntas() {
        if (perguntasOriginais.length === 0) {
            mostrarNotificacao('Não há perguntas para exportar.', 'aviso');
            return;
        }

        const sucesso = window.FAQStorage.exportarPerguntas();
        
        if (sucesso) {
            mostrarNotificacao('Perguntas exportadas com sucesso!', 'sucesso');
        } else {
            mostrarNotificacao('Erro ao exportar perguntas.', 'erro');
        }
    }


    /**
     * Limpa todas as perguntas
     */
    function limparPerguntas() {
        if (perguntasOriginais.length === 0) {
            mostrarNotificacao('Não há perguntas para limpar.', 'aviso');
            return;
        }

        const confirmacao = confirm(
            `Tem certeza que deseja excluir todas as ${perguntasOriginais.length} perguntas?\n\n` +
            'Esta ação não pode ser desfeita!'
        );

        if (!confirmacao) return;

        const sucesso = window.FAQStorage.limparTodasPerguntas();

        if (sucesso) {
            mostrarNotificacao('Todas as perguntas foram removidas.', 'sucesso');
            perguntasOriginais = [];
            perguntasFiltradas = [];
            carregarPerguntas();
        } else {
            mostrarNotificacao('Erro ao limpar perguntas.', 'erro');
        }
    }


    // ========================================
    // FUNÇÕES UTILITÁRIAS
    // ========================================

    /**
     * Formata a data para exibição
     */
    function formatarData(isoString) {
        const data = new Date(isoString);
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');

        return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    }


    /**
     * Formata o nome da categoria
     */
    function formatarCategoria(categoria) {
        const categorias = {
            'funcionalidades': 'Funcionalidades',
            'tecnologia': 'Tecnologias',
            'projeto': 'Projeto',
            'equipe': 'Equipe',
            'turma-bem': 'Turma do Bem',
            'outros': 'Outros'
        };

        return categorias[categoria] || categoria;
    }


    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    /**
     * Exibe notificação para o usuário
     */
    function mostrarNotificacao(mensagem, tipo = 'info') {
        // Remove notificações antigas
        const notificacoesAntigas = document.querySelectorAll('.notificacao-relatorio');
        notificacoesAntigas.forEach(n => n.remove());

        const cores = {
            'sucesso': '#28a745',
            'erro': '#dc3545',
            'aviso': '#e88407',
            'info': '#3a506b'
        };

        const icones = {
            'sucesso': 'check-circle',
            'erro': 'exclamation-circle',
            'aviso': 'exclamation-triangle',
            'info': 'info-circle'
        };

        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao-relatorio';
        notificacao.innerHTML = `
            <i class="fa-solid fa-${icones[tipo]}" aria-hidden="true"></i>
            <span>${mensagem}</span>
        `;
        
        notificacao.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            left: auto;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: ${cores[tipo]};
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
        
        setTimeout(() => {
            notificacao.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }, 4000);
    }


    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    function inicializar() {
        console.log('Relatório FAQ: Inicializando página...');
        
        // Carrega as perguntas
        carregarPerguntas();

        // Configura eventos dos botões
        const btnExportar = document.getElementById('btn-exportar');
        const btnLimpar = document.getElementById('btn-limpar');
        const filtroCategoria = document.getElementById('filtro-categoria');
        const filtroBusca = document.getElementById('filtro-busca');

        console.log('Botões encontrados:', {
            exportar: !!btnExportar,
            limpar: !!btnLimpar,
            filtroCategoria: !!filtroCategoria,
            filtroBusca: !!filtroBusca
        });

        if (btnExportar) {
            btnExportar.addEventListener('click', exportarPerguntas);
        }

        if (btnLimpar) {
            btnLimpar.addEventListener('click', limparPerguntas);
        }

        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', aplicarFiltros);
        }

        if (filtroBusca) {
            filtroBusca.addEventListener('input', aplicarFiltros);
        }
    }

    // Executa quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', inicializar);

})();

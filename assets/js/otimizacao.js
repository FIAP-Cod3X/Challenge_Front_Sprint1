/* ========================================================================
   OTIMIZAÇÕES GLOBAIS DO SITE
   Arquivo carregado em todas as páginas para melhorar performance e UX
   ======================================================================== */

(function() {
    'use strict';

    // ========================================
    // 1. LAZY LOADING DE IMAGENS
    // ========================================
    
    /**
     * Implementa lazy loading para imagens que ainda não têm loading="lazy"
     */
    function inicializarLazyLoading() {
        // Verifica se o navegador suporta Intersection Observer
        if ('IntersectionObserver' in window) {
            const imagens = document.querySelectorAll('img:not([loading="lazy"])');
            
            const observadorImagens = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Se tem data-src, carrega a imagem
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px' // Começa a carregar 50px antes de entrar na viewport
            });
            
            imagens.forEach(img => observadorImagens.observe(img));
        }
    }


    // ========================================
    // 2. DEBOUNCE PARA EVENTOS DE SCROLL E RESIZE
    // ========================================
    
    /**
     * Função debounce para otimizar eventos que disparam muitas vezes
     */
    function debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }


    // ========================================
    // 3. SMOOTH SCROLL PARA LINKS INTERNOS
    // ========================================
    
    /**
     * Adiciona scroll suave para links âncora
     */
    function inicializarSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Ignora # vazio
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Atualiza URL sem recarregar
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }


    // ========================================
    // 4. PRELOAD DE LINKS NO HOVER
    // ========================================
    
    /**
     * Pré-carrega páginas quando o usuário passa o mouse sobre links
     */
    function inicializarPreloadLinks() {
        const linksPrecarregados = new Set();
        
        document.querySelectorAll('a[href]').forEach(link => {
            // Apenas links internos
            if (link.hostname === window.location.hostname) {
                link.addEventListener('mouseenter', function() {
                    const href = this.href;
                    
                    // Não precarrega se já foi feito
                    if (linksPrecarregados.has(href)) return;
                    
                    // Cria link de preload
                    const preload = document.createElement('link');
                    preload.rel = 'prefetch';
                    preload.href = href;
                    document.head.appendChild(preload);
                    
                    linksPrecarregados.add(href);
                }, { once: true });
            }
        });
    }


    // ========================================
    // 5. CACHE DE FORMULÁRIOS NO localStorage
    // ========================================
    
    /**
     * Salva automaticamente dados de formulários no localStorage
     */
    function inicializarCacheFormularios() {
        const formularios = document.querySelectorAll('form[data-cache="true"]');
        
        formularios.forEach(form => {
            const formId = form.id || form.getAttribute('name');
            if (!formId) return;
            
            const cacheKey = `form_cache_${formId}`;
            
            // Restaura dados salvos
            const dadosSalvos = localStorage.getItem(cacheKey);
            if (dadosSalvos) {
                try {
                    const dados = JSON.parse(dadosSalvos);
                    Object.keys(dados).forEach(name => {
                        const campo = form.querySelector(`[name="${name}"]`);
                        if (campo) {
                            if (campo.type === 'checkbox' || campo.type === 'radio') {
                                campo.checked = dados[name];
                            } else {
                                campo.value = dados[name];
                            }
                        }
                    });
                } catch (e) {
                    console.error('Erro ao restaurar formulário:', e);
                }
            }
            
            // Salva dados ao digitar (com debounce)
            const salvarFormulario = debounce(() => {
                const formData = new FormData(form);
                const dados = {};
                
                for (let [name, value] of formData.entries()) {
                    const campo = form.querySelector(`[name="${name}"]`);
                    if (campo && (campo.type === 'checkbox' || campo.type === 'radio')) {
                        dados[name] = campo.checked;
                    } else {
                        dados[name] = value;
                    }
                }
                
                localStorage.setItem(cacheKey, JSON.stringify(dados));
            }, 500);
            
            form.addEventListener('input', salvarFormulario);
            form.addEventListener('change', salvarFormulario);
            
            // Limpa cache ao enviar com sucesso
            form.addEventListener('submit', () => {
                setTimeout(() => {
                    localStorage.removeItem(cacheKey);
                }, 100);
            });
        });
    }


    // ========================================
    // 6. DETECÇÃO DE CONEXÃO LENTA
    // ========================================
    
    /**
     * Detecta conexão lenta e aplica otimizações
     */
    function inicializarDeteccaoConexao() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                const tiposLentos = ['slow-2g', '2g', '3g'];
                
                if (tiposLentos.includes(connection.effectiveType)) {
                    // Adiciona classe ao body para CSS condicional
                    document.body.classList.add('conexao-lenta');
                    
                    // Desabilita animações pesadas
                    document.querySelectorAll('[data-animation]').forEach(el => {
                        el.style.animation = 'none';
                    });
                    
                    console.log('Conexão lenta detectada. Otimizações aplicadas.');
                }
            }
        }
    }


    // ========================================
    // 7. PREFETCH DE RECURSOS CRÍTICOS
    // ========================================
    
    /**
     * Pré-carrega fontes e recursos críticos
     */
    function inicializarPrefetchRecursos() {
        // Apenas se a página não estiver em background
        if (document.visibilityState === 'visible') {
            // Pré-carrega fontes do Google Fonts se não estiverem carregadas
            if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
                const preconnect = document.createElement('link');
                preconnect.rel = 'preconnect';
                preconnect.href = 'https://fonts.googleapis.com';
                document.head.appendChild(preconnect);
            }
        }
    }


    // ========================================
    // 8. OTIMIZAÇÃO DE SCROLL
    // ========================================
    
    /**
     * Adiciona classe 'scrolling' durante scroll para otimizações CSS
     */
    function inicializarOtimizacaoScroll() {
        let scrolling = false;
        let scrollTimeout;
        
        const handleScroll = () => {
            if (!scrolling) {
                document.body.classList.add('scrolling');
                scrolling = true;
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
                scrolling = false;
            }, 150);
        };
        
        window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });
    }


    // ========================================
    // 9. BACK TO TOP BUTTON
    // ========================================
    
    /**
     * Adiciona botão "Voltar ao topo" automaticamente
     */
    function inicializarBotaoVoltarTopo() {
        // Verifica se já existe
        if (document.querySelector('.btn-back-to-top')) return;
        
        // Cria o botão
        const botao = document.createElement('button');
        botao.className = 'btn-back-to-top';
        botao.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        botao.setAttribute('aria-label', 'Voltar ao topo');
        botao.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #96ac3f;
            color: white;
            border: none;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 12px #96ac3f33;
        `;
        
        document.body.appendChild(botao);
        
        // Mostra/esconde baseado no scroll
        const toggleBotao = debounce(() => {
            if (window.scrollY > 300) {
                botao.style.opacity = '1';
                botao.style.visibility = 'visible';
            } else {
                botao.style.opacity = '0';
                botao.style.visibility = 'hidden';
            }
        }, 100);
        
        window.addEventListener('scroll', toggleBotao, { passive: true });
        
        // Ação do botão
        botao.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Hover effect
        botao.addEventListener('mouseenter', () => {
            botao.style.transform = 'translateY(-5px)';
            botao.style.boxShadow = '0 6px 20px #96ac3f33';
        });
        
        botao.addEventListener('mouseleave', () => {
            botao.style.transform = 'translateY(0)';
            botao.style.boxShadow = '0 4px 12px #96ac3f33';
        });
        
        // Responsivo
        if (window.innerWidth <= 768) {
            botao.style.bottom = '1rem';
            botao.style.right = '1rem';
            botao.style.width = '45px';
            botao.style.height = '45px';
        }
    }


    // ========================================
    // 10. PREVENÇÃO DE CLIQUES DUPLOS EM BOTÕES
    // ========================================
    
    /**
     * Previne cliques duplos em botões de envio
     */
    function inicializarPrevencaoCliquesDuplos() {
        document.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(botao => {
            const form = botao.closest('form');
            
            if (form) {
                form.addEventListener('submit', function(e) {
                    if (this.classList.contains('submitting')) {
                        e.preventDefault();
                        return false;
                    }
                    
                    this.classList.add('submitting');
                    
                    // Reabilita após 3 segundos como fallback
                    setTimeout(() => {
                        this.classList.remove('submitting');
                    }, 3000);
                }, { once: false });
            }
        });
    }


    // ========================================
    // 11. ANÁLISE DE PERFORMANCE
    // ========================================
    
    /**
     * Registra métricas de performance no console (apenas em desenvolvimento)
     */
    function registrarPerformance() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if ('performance' in window && 'getEntriesByType' in performance) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        
                        console.group('📊 Métricas de Performance');
                        console.log('⏱️ Tempo de carregamento:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
                        console.log('🌐 Tempo de DNS:', Math.round(perfData.domainLookupEnd - perfData.domainLookupStart), 'ms');
                        console.log('🔌 Tempo de conexão:', Math.round(perfData.connectEnd - perfData.connectStart), 'ms');
                        console.log('📄 Tempo de resposta:', Math.round(perfData.responseEnd - perfData.requestStart), 'ms');
                        console.log('🎨 Tempo de DOM:', Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart), 'ms');
                        console.groupEnd();
                    }, 0);
                });
            }
        }
    }


    // ========================================
    // 12. INICIALIZAÇÃO GLOBAL
    // ========================================
    
    /**
     * Inicializa todas as otimizações quando o DOM estiver pronto
     */
    function inicializar() {
        console.log('🚀 Otimizações globais iniciadas');
        
        // Otimizações imediatas
        inicializarDeteccaoConexao();
        inicializarPrefetchRecursos();
        
        // Otimizações após DOM carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                inicializarLazyLoading();
                inicializarSmoothScroll();
                inicializarPreloadLinks();
                inicializarCacheFormularios();
                inicializarOtimizacaoScroll();
                inicializarBotaoVoltarTopo();
                inicializarPrevencaoCliquesDuplos();
            });
        } else {
            // DOM já carregado
            inicializarLazyLoading();
            inicializarSmoothScroll();
            inicializarPreloadLinks();
            inicializarCacheFormularios();
            inicializarOtimizacaoScroll();
            inicializarBotaoVoltarTopo();
            inicializarPrevencaoCliquesDuplos();
        }
        
        // Análise de performance
        registrarPerformance();
    }
    
    // Inicia as otimizações
    inicializar();


    // ========================================
    // 13. EXPOR FUNÇÕES ÚTEIS GLOBALMENTE
    // ========================================
    
    window.Otimizacao = {
        debounce,
        limparCacheFormulario: (formId) => {
            localStorage.removeItem(`form_cache_${formId}`);
        }
    };

})();
